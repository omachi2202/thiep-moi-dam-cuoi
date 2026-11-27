"""Header cache: /js,/css revalidate; trang HTML no-cache; /uploads immutable."""
import re


def test_js_css_no_cache(client):
    for url in ("/js/state.js", "/css/app.css"):
        r = client.get(url)
        assert r.status_code == 200
        assert r.headers["cache-control"] == "no-cache"
        assert r.headers["x-content-type-options"] == "nosniff"
        assert r.headers.get("etag")


def _v_of(html, path):
    m = re.search(re.escape(path) + r"\?v=([0-9a-f]{8})\b", html)
    assert m, f"thiếu ?v= cho {path}"
    return m.group(1)


def test_v_dung_immutable_sai_no_cache(client):
    v = _v_of(client.get("/c/abc-test").text, "/js/state.js")
    r = client.get(f"/js/state.js?v={v}")
    assert r.headers["cache-control"] == "public, max-age=31536000, immutable"
    assert r.headers["x-content-type-options"] == "nosniff"
    assert client.get("/js/state.js?v=00000000").headers["cache-control"] == "no-cache"
    assert client.get("/js/state.js").headers["cache-control"] == "no-cache"
    vc = _v_of(client.get("/c/abc-test").text, "/css/app.css")
    assert client.get(f"/css/app.css?v={vc}").headers["cache-control"].endswith("immutable")
    assert client.get("/css/app.css?v=zzzz").headers["cache-control"] == "no-cache"


def test_trang_chua_v(client):
    inv = client.get("/c/abc-test").text
    assert re.search(r"/js/state\.js\?v=[0-9a-f]{8}\"", inv)
    assert re.search(r"/css/app\.css\?v=[0-9a-f]{8}\"", inv)
    idx = client.get("/").text
    # index.html dùng đường dẫn tương đối (js/...) nên không có '/' đầu
    assert re.search(r"js/state\.js\?v=[0-9a-f]{8}\"", idx)


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
