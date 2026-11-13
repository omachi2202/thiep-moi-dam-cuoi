"""Test API thiệp cưới (hành vi sau T2.1)."""
import io
from concurrent.futures import ThreadPoolExecutor

from openpyxl import load_workbook

from server.app import REPO_ROOT

SLUG = "dam-cuoi-a"
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


def make_card(client, slug=SLUG, state=None):
    r = client.put(f"/api/cards/{slug}", json=state or {"title": "Thiệp"})
    assert r.status_code == 200, r.text
    return r.json()["editKey"]


def rows(data_dir, sheet):
    wb = load_workbook(data_dir / "guests.xlsx")
    return list(wb[sheet].iter_rows(min_row=2, values_only=True))


# ---- Thiệp: tạo / sửa / đọc ----
def test_health(client):
    assert client.get("/api/health").json() == {"ok": True}


def test_create_returns_edit_key(client):
    r = client.put(f"/api/cards/{SLUG}", json={"title": "A"})
    assert r.status_code == 200
    assert len(r.json()["editKey"]) >= 20


def test_get_card_does_not_leak_key(client):
    key = make_card(client, state={"title": "A"})
    r = client.get(f"/api/cards/{SLUG}")
    assert r.status_code == 200
    assert r.json()["title"] == "A"
    assert key not in r.text
    assert "editKey" not in r.text


def test_get_missing_card_404(client):
    assert client.get("/api/cards/khong-co-thiep").status_code == 404


def test_put_second_time_requires_key(client):
    key = make_card(client)
    assert client.put(f"/api/cards/{SLUG}", json={"a": 1}).status_code == 403
    assert client.put(f"/api/cards/{SLUG}", json={"a": 1}, headers={"X-Edit-Key": "sai"}).status_code == 403
    r = client.put(f"/api/cards/{SLUG}", json={"a": 2}, headers={"X-Edit-Key": key})
    assert r.status_code == 200 and r.json() == {"ok": True}
    assert client.get(f"/api/cards/{SLUG}").json()["a"] == 2


def test_invalid_slugs(client):
    for bad in ("AB", "ab", "Abc-def", "a_b_c", "x" * 51, "abc.def"):
        assert client.get(f"/api/cards/{bad}").status_code == 400, bad
        assert client.put(f"/api/cards/{bad}", json={}).status_code == 400, bad
    assert client.get("/c/Sai_Slug").status_code == 400


def test_path_traversal_slug_not_served(client):
    r = client.get("/api/cards/..%2F..%2Fguests")
    assert r.status_code in (400, 404)


def test_put_too_large_413(client):
    big = b'{"x": "' + b"a" * (2 * 1024 * 1024 + 10) + b'"}'
    r = client.put(f"/api/cards/{SLUG}", content=big, headers={"Content-Type": "application/json"})
    assert r.status_code == 413


def test_put_deeply_nested_422(client):
    n = 100000
    body = ('{"a":' * n + "1" + "}" * n).encode()
    r = client.put(f"/api/cards/{SLUG}", content=body, headers={"Content-Type": "application/json"})
    assert r.status_code == 422


def test_put_nan_422(client):
    for body in (b'{"a": NaN}', b'{"a": Infinity}', b'{"a": -Infinity}'):
        r = client.put(f"/api/cards/{SLUG}", content=body, headers={"Content-Type": "application/json"})
        assert r.status_code == 422, body


def test_put_not_json_or_not_object_422(client):
    h = {"Content-Type": "application/json"}
    assert client.put(f"/api/cards/{SLUG}", content=b"khong phai json", headers=h).status_code == 422
    assert client.put(f"/api/cards/{SLUG}", content=b"[1,2]", headers=h).status_code == 422


# ---- Trang & docs ----
def test_invite_page(client):
    r = client.get("/c/dam-cuoi-a")
    if (REPO_ROOT / "invite.html").is_file():
        assert r.status_code == 200
        assert "text/html" in r.headers["content-type"]
    else:
        assert r.status_code == 404


def test_docs_disabled_by_default(client):
    for p in ("/docs", "/redoc", "/openapi.json"):
        assert client.get(p).status_code == 404, p


# ---- RSVP / wishes ----
def test_rsvp_and_wish_require_existing_card(client):
    r = client.post("/api/cards/chua-co-thiep/rsvp", json={"ten": "An"})
    assert r.status_code == 404
    r = client.post("/api/cards/chua-co-thiep/wishes", json={"ten": "An", "loi_chuc": "Hi"})
    assert r.status_code == 404
    assert client.get("/api/cards/chua-co-thiep/wishes").status_code == 404
    assert client.get("/api/cards/chua-co-thiep/export.xlsx").status_code == 404


def test_rsvp_saved(client, data_dir):
    make_card(client)
    r = client.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "An", "so_nguoi": 2, "ben": "nha_trai"})
    assert r.status_code == 200
    rs = rows(data_dir, "RSVP")
    assert len(rs) == 1
    assert rs[0][1] == SLUG and rs[0][2] == "An" and rs[0][4] == 2


def test_rsvp_validation_422(client):
    make_card(client)
    assert client.post(f"/api/cards/{SLUG}/rsvp", json={"ten": ""}).status_code == 422
    assert client.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "a", "so_nguoi": 99}).status_code == 422
    assert client.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "a", "ben": "xxx"}).status_code == 422
    assert client.post(f"/api/cards/{SLUG}/wishes", json={"ten": "a", "loi_chuc": "x" * 501}).status_code == 422


def test_wish_flow(client):
    make_card(client)
    assert client.post(f"/api/cards/{SLUG}/wishes", json={"ten": "An", "loi_chuc": "Chúc mừng"}).status_code == 200
    lst = client.get(f"/api/cards/{SLUG}/wishes").json()
    assert len(lst) == 1
    assert lst[0]["ten"] == "An" and lst[0]["loi_chuc"] == "Chúc mừng"


def test_formula_injection_escaped(client, data_dir):
    make_card(client)
    client.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "=cmd", "loi_nhan": "@SUM(1)"})
    client.post(f"/api/cards/{SLUG}/wishes", json={"ten": "+x", "loi_chuc": "=cmd"})
    rs = rows(data_dir, "RSVP")[0]
    assert rs[2] == "'=cmd"
    assert rs[7] == "'@SUM(1)"
    ws = rows(data_dir, "LoiChuc")[0]
    assert ws[2] == "'+x" and ws[3] == "'=cmd"
    # API trả lại giá trị gốc
    lst = client.get(f"/api/cards/{SLUG}/wishes").json()
    assert lst[0]["loi_chuc"] == "=cmd"


def test_control_char_in_name_ok(client, data_dir):
    make_card(client)
    r = client.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "A\x01B"})
    assert r.status_code == 200
    rs = rows(data_dir, "RSVP")
    assert len(rs) == 1
    assert "\x01" not in rs[0][2]


def test_wish_hidden_when_hien_thi_false(client, data_dir):
    make_card(client)
    client.post(f"/api/cards/{SLUG}/wishes", json={"ten": "An", "loi_chuc": "một"})
    client.post(f"/api/cards/{SLUG}/wishes", json={"ten": "Binh", "loi_chuc": "hai"})
    path = data_dir / "guests.xlsx"
    wb = load_workbook(path)
    ws = wb["LoiChuc"]
    for r in range(2, ws.max_row + 1):
        if ws.cell(r, 3).value == "An":
            ws.cell(r, 5).value = False
    wb.save(path)
    lst = client.get(f"/api/cards/{SLUG}/wishes").json()
    assert [w["ten"] for w in lst] == ["Binh"]


# ---- Rate limit ----
def test_rsvp_rate_limit_429(make_client):
    c = make_client(rate_limit=3, rate_window=60.0)
    make_card(c)
    codes = [c.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "An"}).status_code for _ in range(5)]
    assert codes[:3] == [200, 200, 200]
    assert codes[3:] == [429, 429]


# ---- Ghi đồng thời ----
def test_concurrent_writes_20(client, data_dir):
    make_card(client)

    def send(i):
        return client.post(f"/api/cards/{SLUG}/rsvp", json={"ten": f"khach{i}"}).status_code

    with ThreadPoolExecutor(max_workers=20) as ex:
        codes = list(ex.map(send, range(20)))
    assert codes == [200] * 20
    rs = rows(data_dir, "RSVP")
    assert len(rs) == 20
    assert {r[2] for r in rs} == {f"khach{i}" for i in range(20)}


# ---- xlsx hỏng ----
def test_corrupt_xlsx_recovers(data_dir):
    from fastapi.testclient import TestClient
    from server.app import create_app

    (data_dir / "guests.xlsx").write_bytes(b"day khong phai xlsx")
    app = create_app(data_dir, rate_limit=1000)
    with TestClient(app) as c:
        assert c.get("/api/health").status_code == 200
        make_card(c)
        assert c.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "An"}).status_code == 200
    assert list(data_dir.glob("guests.corrupt-*.xlsx"))
    assert len(rows(data_dir, "RSVP")) == 1


def test_oserror_on_load_does_not_quarantine_good_file(data_dir, monkeypatch):
    from fastapi.testclient import TestClient
    from server import excel_store
    from server.app import create_app

    app = create_app(data_dir, rate_limit=1000)
    with TestClient(app) as c:
        make_card(c)
        assert c.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "An"}).status_code == 200

        def boom(*a, **k):
            raise OSError("loi I/O thoang qua")

        monkeypatch.setattr(excel_store, "load_workbook", boom)
        r = c.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "Binh"})
        assert r.status_code == 503
        monkeypatch.undo()
        # tệp gốc còn nguyên, không bị đổi tên, dữ liệu cũ vẫn đọc được
        assert (data_dir / "guests.xlsx").exists()
        assert not list(data_dir.glob("guests.corrupt-*.xlsx"))
        assert len(rows(data_dir, "RSVP")) == 1
        assert c.post(f"/api/cards/{SLUG}/rsvp", json={"ten": "Binh"}).status_code == 200
        assert len(rows(data_dir, "RSVP")) == 2


def test_corrupt_quarantine_name_has_random_suffix(data_dir):
    import re
    from fastapi.testclient import TestClient
    from server.app import create_app

    (data_dir / "guests.xlsx").write_bytes(b"hong")
    with TestClient(create_app(data_dir, rate_limit=1000)):
        pass
    names = [p.name for p in data_dir.glob("guests.corrupt-*.xlsx")]
    assert len(names) == 1
    assert re.fullmatch(r"guests\.corrupt-\d{14}-[0-9a-f]{4}\.xlsx", names[0])


# ---- Export ----
def test_export_xlsx_slug_and_key(client):
    ka = make_card(client, "thiep-a")
    make_card(client, "thiep-b")
    for _ in range(2):
        client.post("/api/cards/thiep-a/rsvp", json={"ten": "An"})
    client.post("/api/cards/thiep-b/rsvp", json={"ten": "Binh"})
    client.post("/api/cards/thiep-a/wishes", json={"ten": "An", "loi_chuc": "hi"})

    assert client.get("/api/cards/thiep-a/export.xlsx").status_code == 403
    assert client.get("/api/cards/thiep-a/export.xlsx", headers={"X-Edit-Key": "sai"}).status_code == 403

    r = client.get("/api/cards/thiep-a/export.xlsx", headers={"X-Edit-Key": ka})
    assert r.status_code == 200
    assert "spreadsheetml" in r.headers["content-type"]
    assert "thiep-a.xlsx" in r.headers["content-disposition"]
    wb = load_workbook(io.BytesIO(r.content))
    rs = list(wb["RSVP"].iter_rows(min_row=2, values_only=True))
    assert len(rs) == 2 and all(x[1] == "thiep-a" for x in rs)
    ls = list(wb["LoiChuc"].iter_rows(min_row=2, values_only=True))
    assert len(ls) == 1

    # key qua query string
    r2 = client.get(f"/api/cards/thiep-a/export.xlsx?key={ka}")
    assert r2.status_code == 200


# ---- Upload ----
def test_upload_ok_and_served(client, data_dir):
    r = client.post("/api/upload", files={"file": ("a.png", PNG, "image/png")})
    assert r.status_code == 200
    url = r.json()["url"]
    assert url.startswith("/uploads/") and url.endswith(".png")
    g = client.get(url)
    assert g.status_code == 200
    assert g.headers.get("x-content-type-options") == "nosniff"


def test_upload_wrong_type(client):
    r = client.post("/api/upload", files={"file": ("a.html", b"<script>1</script>", "text/html")})
    assert r.status_code == 400
    r = client.post("/api/upload", files={"file": ("a.png", b"<script>1</script>", "image/png")})
    assert r.status_code == 400  # sai chữ ký
    r = client.post("/api/upload", files={"file": ("a.exe", PNG, "image/png")})
    assert r.status_code == 400  # sai đuôi


def test_upload_too_large_413(client):
    blob = PNG + b"\x00" * (11 * 1024 * 1024)
    r = client.post("/api/upload", files={"file": ("a.png", blob, "image/png")})
    assert r.status_code == 413
