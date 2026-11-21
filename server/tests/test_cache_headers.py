"""Header cache: /js,/css revalidate; trang HTML no-cache; /uploads immutable."""


def test_js_css_no_cache(client):
    for url in ("/js/state.js", "/css/app.css"):
        r = client.get(url)
        assert r.status_code == 200
        assert r.headers["cache-control"] == "no-cache"
        assert r.headers["x-content-type-options"] == "nosniff"
        assert r.headers.get("etag")


def test_js_304_van_no_cache(client):
    r = client.get("/js/state.js")
    r2 = client.get("/js/state.js", headers={"If-None-Match": r.headers["etag"]})
    assert r2.status_code == 304
    assert r2.headers["cache-control"] == "no-cache"


def test_trang_html_no_cache(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.headers["cache-control"] == "no-cache"
    r = client.get("/c/abc-test")
    assert r.status_code in (200, 404)
    if r.status_code == 200:
        assert r.headers["cache-control"] == "no-cache"


def test_uploads_immutable_va_404(client, data_dir):
    up = data_dir / "uploads"
    up.mkdir(parents=True, exist_ok=True)
    (up / "abc123.png").write_bytes(b"\x89PNG\r\n\x1a\n")
    r = client.get("/uploads/abc123.png")
    assert r.status_code == 200
    assert r.headers["cache-control"] == "public, max-age=31536000, immutable"
    assert r.headers["x-content-type-options"] == "nosniff"
    r404 = client.get("/uploads/khong-co.png")
    assert r404.status_code == 404
    assert "immutable" not in r404.headers.get("cache-control", "")


def test_api_khong_bi_dat_cache_control(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert "cache-control" not in r.headers
