"""Test T39: nhãn tên tệp, giới hạn 30MB, chỉ mục ảnh theo thiệp, attach."""
import json
import re

from server.app import normalize_label

SLUG = "dam-cuoi-a"
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
NAME_RE = re.compile(r"^[a-z0-9-]{1,40}_[0-9a-f]{8}\.png$")


def make_card(client, slug=SLUG):
    r = client.put(f"/api/cards/{slug}", json={"title": "T"})
    assert r.status_code == 200, r.text
    return r.json()["editKey"]


def up(client, label=None, headers=None, blob=PNG, fname="a.png"):
    data = {"label": label} if label is not None else None
    return client.post("/api/upload", files={"file": (fname, blob, "image/png")},
                       data=data, headers=headers or {})


def hdr(key, slug=SLUG):
    return {"X-Card-Slug": slug, "X-Edit-Key": key}


def test_normalize_label():
    assert normalize_label("Hero-1") == "hero-1"
    assert normalize_label("  Ảnh  Đẹp!! ") == "nhp"
    assert normalize_label("a---b--") == "a-b"
    assert normalize_label("-x-") == "x"
    assert normalize_label("") == "anh"
    assert normalize_label(None) == "anh"
    assert normalize_label("../../etc") == "etc"
    assert len(normalize_label("a" * 100)) == 40


def test_upload_ten_theo_nhan(client):
    r = up(client, "Hero-1")
    assert r.status_code == 200
    j = r.json()
    assert j["name"].startswith("hero-1_") and NAME_RE.match(j["name"])
    assert j["url"] == "/uploads/" + j["name"]
    assert j["size"] == len(PNG)
    assert client.get(j["url"]).status_code == 200
    # không có nhãn -> "anh"
    assert up(client).json()["name"].startswith("anh_")
    assert up(client, "###").json()["name"].startswith("anh_")


def test_upload_30mb(client):
    blob = PNG + b"\x00" * (31 * 1024 * 1024)
    r = up(client, blob=blob)
    assert r.status_code == 413
    assert "30MB" in r.json()["detail"]
    # 12MB (trước đây bị chặn) nay được phép
    assert up(client, blob=PNG + b"\x00" * (12 * 1024 * 1024)).status_code == 200


def test_chi_muc_khi_khoa_dung(client, data_dir):
    key = make_card(client)
    n = up(client, "story-2", hdr(key)).json()["name"]
    idx = json.loads((data_dir / "cards" / f"{SLUG}.uploads.json").read_text(encoding="utf-8"))
    assert [x["name"] for x in idx] == [n]
    e = idx[0]
    assert e["url"] == "/uploads/" + n and e["size"] == len(PNG)
    assert e["type"] == "image/png" and e["label"] == "story-2" and e["createdAt"].endswith("Z")
    r = client.get(f"/api/cards/{SLUG}/uploads", headers={"X-Edit-Key": key})
    assert r.status_code == 200
    assert [x["name"] for x in r.json()["items"]] == [n]
    # mới nhất trước
    n2 = up(client, "hero-1", hdr(key)).json()["name"]
    items = client.get(f"/api/cards/{SLUG}/uploads", headers={"X-Edit-Key": key}).json()["items"]
    assert [x["name"] for x in items] == [n2, n]
    # tệp bị xoá -> bị bỏ khỏi danh sách
    (data_dir / "uploads" / n).unlink()
    items = client.get(f"/api/cards/{SLUG}/uploads", headers={"X-Edit-Key": key}).json()["items"]
    assert [x["name"] for x in items] == [n2]


def test_khong_ghi_khi_khoa_sai(client, data_dir):
    make_card(client)
    r = up(client, "hero-1", hdr("sai"))
    assert r.status_code == 200  # không bật mã tạo thiệp -> vẫn tải được
    assert not (data_dir / "cards" / f"{SLUG}.uploads.json").exists()
    # thiệp không tồn tại
    assert up(client, "x", hdr("k", "khong-co")).status_code == 200
    assert not (data_dir / "cards" / "khong-co.uploads.json").exists()


def test_co_ma_khoa_sai_van_upload_nhung_khong_ghi(make_client, data_dir):
    c = make_client(create_codes="abc")
    key = c.put(f"/api/cards/{SLUG}", json={"title": "T"}, headers={"X-Create-Code": "abc"}).json()["editKey"]
    h = {"X-Create-Code": "abc", **hdr("sai")}
    assert up(c, "x", h).status_code == 200
    assert not (data_dir / "cards" / f"{SLUG}.uploads.json").exists()
    h = {"X-Create-Code": "abc", **hdr(key)}
    assert up(c, "x", h).status_code == 200
    assert (data_dir / "cards" / f"{SLUG}.uploads.json").exists()


def test_get_can_khoa(client):
    key = make_card(client)
    assert client.get(f"/api/cards/{SLUG}/uploads").status_code == 403
    assert client.get(f"/api/cards/{SLUG}/uploads", headers={"X-Edit-Key": "sai"}).status_code == 403
    assert client.get("/api/cards/khong-co/uploads", headers={"X-Edit-Key": key}).status_code == 404
    r = client.get(f"/api/cards/{SLUG}/uploads", headers={"X-Edit-Key": key})
    assert r.json() == {"items": []}


def test_attach_loc_url(client, data_dir):
    key = make_card(client)
    h = {"X-Edit-Key": key}
    n_moi = up(client, "hero-1").json()["name"]
    old = "a" * 32 + ".png"
    (data_dir / "uploads" / old).write_bytes(PNG)
    urls = [
        f"/uploads/{n_moi}",
        f"/uploads/{old}",
        "/uploads/anh_deadbeef.png",           # không tồn tại
        "/uploads/../cards/x.png",             # path traversal
        "/uploads/..%2fcards%2fx_deadbeef.png",
        "/uploads/a/../b_deadbeef.png",
        "https://evil.com/uploads/" + n_moi,
        "/uploads/abc.html",
        "/uploads/hero_deadbeef.exe",
        "/uploads/HERO_deadbeef.png",
        "",
    ]
    r = client.post(f"/api/cards/{SLUG}/uploads/attach", json={"urls": urls}, headers=h)
    assert r.status_code == 200
    assert {x["name"] for x in r.json()["items"]} == {n_moi, old}
    # gọi lại không trùng mục
    r = client.post(f"/api/cards/{SLUG}/uploads/attach", json={"urls": [f"/uploads/{n_moi}"]}, headers=h)
    assert len(r.json()["items"]) == 2


def test_attach_can_khoa_va_gioi_han(client):
    key = make_card(client)
    p = f"/api/cards/{SLUG}/uploads/attach"
    assert client.post(p, json={"urls": []}).status_code == 403
    assert client.post(p, json={"urls": []}, headers={"X-Edit-Key": "sai"}).status_code == 403
    assert client.post(p, json={"urls": ["/uploads/a_deadbeef.png"] * 201},
                       headers={"X-Edit-Key": key}).status_code == 422
    assert client.post("/api/cards/khong-co/uploads/attach", json={"urls": []},
                       headers={"X-Edit-Key": key}).status_code == 404


def test_chi_muc_toi_da_500(client, data_dir):
    key = make_card(client)
    uploads = data_dir / "uploads"
    entries = []
    for i in range(505):
        n = f"anh_{i:08x}.png"
        entries.append({"name": n, "url": f"/uploads/{n}", "size": 1, "type": "image/png",
                        "label": "anh", "createdAt": "2026-01-01T00:00:00Z"})
        (uploads / n).write_bytes(PNG)
    (data_dir / "cards" / f"{SLUG}.uploads.json").write_text(json.dumps(entries), encoding="utf-8")
    up(client, "moi", hdr(key))
    idx = json.loads((data_dir / "cards" / f"{SLUG}.uploads.json").read_text(encoding="utf-8"))
    assert len(idx) == 500
    assert idx[-1]["label"] == "moi"
    assert idx[0]["name"] != "anh_00000000.png"
