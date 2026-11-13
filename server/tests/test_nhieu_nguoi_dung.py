"""Test T32: mã tạo thiệp, quyền upload, hạn mức, verify-key, IP thật."""
SLUG = "dam-cuoi-a"
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


def put_new(client, slug=SLUG, code=None):
    h = {"X-Create-Code": code} if code is not None else {}
    return client.put(f"/api/cards/{slug}", json={"title": "T"}, headers=h)


def upload(client, headers=None):
    return client.post("/api/upload", files={"file": ("a.png", PNG, "image/png")}, headers=headers or {})


# ---- Mã tạo thiệp ----
def test_codes_off_no_header_needed(make_client):
    c = make_client(create_codes="")
    assert c.get("/api/health").json() == {"ok": True, "needCreateCode": False}
    assert put_new(c).status_code == 200


def test_codes_on_create(make_client):
    c = make_client(create_codes=" abc, xyz ,,")
    assert c.get("/api/health").json() == {"ok": True, "needCreateCode": True}
    assert put_new(c).status_code == 403
    assert put_new(c, code="sai").status_code == 403
    assert not (c.get(f"/api/cards/{SLUG}").status_code == 200)
    r = put_new(c, code="abc")
    assert r.status_code == 200 and len(r.json()["editKey"]) >= 20
    r2 = put_new(c, slug="dam-cuoi-b", code="xyz")
    assert r2.status_code == 200 and "editKey" in r2.json()
    # cập nhật bằng khoá, không cần mã
    r3 = c.put(f"/api/cards/{SLUG}", json={"a": 1}, headers={"X-Edit-Key": r.json()["editKey"]})
    assert r3.status_code == 200 and r3.json() == {"ok": True}


def test_create_rate_limit_and_update_not_counted(make_client):
    c = make_client()
    keys = []
    for i in range(5):
        r = put_new(c, slug=f"thiep-{i}")
        assert r.status_code == 200
        keys.append(r.json()["editKey"])
    for _ in range(10):  # cập nhật không bị tính
        assert c.put("/api/cards/thiep-0", json={"a": 1}, headers={"X-Edit-Key": keys[0]}).status_code == 200
    assert put_new(c, slug="thiep-9").status_code == 429


# ---- Upload ----
def test_upload_permission_when_codes_on(make_client):
    c = make_client(create_codes="abc")
    assert upload(c).status_code == 403
    assert upload(c, {"X-Create-Code": "sai"}).status_code == 403
    assert upload(c, {"X-Create-Code": "abc"}).status_code == 200
    key = put_new(c, code="abc").json()["editKey"]
    assert upload(c, {"X-Card-Slug": SLUG, "X-Edit-Key": key}).status_code == 200
    assert upload(c, {"X-Card-Slug": SLUG, "X-Edit-Key": "sai"}).status_code == 403
    assert upload(c, {"X-Card-Slug": "khong-co", "X-Edit-Key": key}).status_code == 403
    assert upload(c, {"X-Card-Slug": "A!", "X-Edit-Key": key}).status_code == 403


def test_upload_open_when_codes_off(make_client):
    assert upload(make_client(create_codes="")).status_code == 200


def test_upload_quota_507(make_client, data_dir):
    c = make_client(upload_quota_mb=1)
    up = data_dir / "uploads"
    up.mkdir(exist_ok=True)
    (up / "big.bin").write_bytes(b"\0" * (1024 * 1024))
    r = upload(c)
    assert r.status_code == 507
    assert "dung lượng" in r.json()["detail"]
    # bật mã vẫn kiểm hạn mức
    c2 = make_client(upload_quota_mb=1, create_codes="abc")
    assert upload(c2, {"X-Create-Code": "abc"}).status_code == 507


def test_upload_under_quota_ok(make_client):
    assert upload(make_client(upload_quota_mb=1)).status_code == 200


# ---- verify-key ----
def test_verify_key(make_client):
    c = make_client()
    key = put_new(c).json()["editKey"]
    url = f"/api/cards/{SLUG}/verify-key"
    r = c.post(url, headers={"X-Edit-Key": key})
    assert r.status_code == 200 and r.json() == {"ok": True}
    assert c.post(url, headers={"X-Edit-Key": "sai"}).status_code == 403
    assert c.post(url).status_code == 403
    assert c.post("/api/cards/khong-co/verify-key", headers={"X-Edit-Key": key}).status_code == 404
    assert c.post("/api/cards/AB/verify-key", headers={"X-Edit-Key": key}).status_code == 400


def test_verify_key_rate_limit(make_client):
    c = make_client()
    key = put_new(c).json()["editKey"]
    url = f"/api/cards/{SLUG}/verify-key"
    for _ in range(10):
        assert c.post(url, headers={"X-Edit-Key": key}).status_code == 200
    assert c.post(url, headers={"X-Edit-Key": key}).status_code == 429


# ---- IP thật ----
def _hammer(c, ip, n):
    last = None
    for _ in range(n):
        last = c.post("/api/cards/khong-co/verify-key", headers={"CF-Connecting-IP": ip})
    return last.status_code


def test_trust_cf_separate_counters(make_client):
    c = make_client(trust_cf=True)
    assert _hammer(c, "1.1.1.1", 10) == 404
    assert _hammer(c, "1.1.1.1", 1) == 429
    assert _hammer(c, "2.2.2.2", 1) == 404


def test_trust_cf_garbage_header_falls_back(make_client):
    c = make_client(trust_cf=True)
    assert _hammer(c, "khong-phai-ip", 10) == 404
    # header rác dùng chung bộ đếm với IP kết nối (không header)
    assert c.post("/api/cards/khong-co/verify-key").status_code == 429


# ---- T32.2 ----
def test_create_code_guess_rate_limited(make_client):
    c = make_client(create_codes="abc")
    for i in range(10):
        assert put_new(c, slug=f"thiep-{i}", code="sai").status_code == 403
    assert put_new(c, slug="thiep-x", code="sai").status_code == 429
    # đúng mã cũng bị chặn trong lúc bị giới hạn dò mã
    assert put_new(c, slug="thiep-y", code="abc").status_code == 429


def test_edit_rate_limit(make_client):
    c = make_client()
    key = put_new(c).json()["editKey"]
    for _ in range(30):
        assert c.put(f"/api/cards/{SLUG}", json={"a": 1}, headers={"X-Edit-Key": key}).status_code == 200
    assert c.put(f"/api/cards/{SLUG}", json={"a": 1}, headers={"X-Edit-Key": key}).status_code == 429


def test_check_key_non_ascii_header_no_500(make_client):
    c = make_client()
    put_new(c)
    r = c.post(f"/api/cards/{SLUG}/verify-key", headers={"X-Edit-Key": "khoá-é".encode("utf-8")})
    assert r.status_code == 403


def test_no_trust_cf_ignores_header(make_client):
    c = make_client(trust_cf=False)
    assert _hammer(c, "1.1.1.1", 10) == 404
    assert _hammer(c, "2.2.2.2", 1) == 429
