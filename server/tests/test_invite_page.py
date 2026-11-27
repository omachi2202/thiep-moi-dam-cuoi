"""Trang /c/<slug> do server dựng: OG + state nhúng."""
import json
import re

EVIL = '"><script>alert(1)</script>'


def put(client, slug, state):
    r = client.put(f"/api/cards/{slug}", json=state)
    assert r.status_code == 200, r.text


def embedded(html):
    m = re.search(r'<script id="cardState" type="application/json">(.*?)</script>', html, re.S)
    assert m
    return m.group(1)


def test_og_day_du(client):
    put(client, "abc-og", {"share": {"title": "Tiêu đề", "description": "Mô tả",
                                     "image": "/uploads/a_1234abcd.jpg"}, "sections": []})
    r = client.get("/c/abc-og")
    assert r.status_code == 200 and r.headers["cache-control"] == "no-cache"
    h = r.text
    assert '<meta property="og:title" content="Tiêu đề">' in h
    assert '<meta property="og:description" content="Mô tả">' in h
    assert '<meta property="og:url" content="http://testserver/c/abc-og">' in h
    assert '<meta property="og:image" content="http://testserver/uploads/a_1234abcd.jpg">' in h
    assert 'og:image:alt' in h and 'summary_large_image' in h
    assert '<link rel="preload" as="image" href="/uploads/a_1234abcd.jpg"' in h
    assert "<title>Tiêu đề</title>" in h
    assert h.index('id="cardState"') < h.index("</head>")


def test_fallback_khong_share(client):
    put(client, "abc-ns", {"sections": []})
    h = client.get("/c/abc-ns").text
    assert 'og:title" content="THƯ MỜI TIỆC CƯỚI"' in h
    assert "Trân trọng kính mời" in h
    assert "og:image" not in h and 'rel="preload" as="image"' not in h
    assert 'twitter:card" content="summary"' in h


def test_anh_data_va_javascript_bi_bo(client):
    for i, img in enumerate(("data:image/png;base64,AAAA", "javascript:alert(1)",
                             "http://x.com/a.jpg", "/uploads/../x.jpg")):
        slug = f"abc-bad{i}"
        put(client, slug, {"share": {"title": "T", "image": img}})
        h = client.get(f"/c/{slug}").text
        assert "og:image" not in h
        assert 'twitter:card" content="summary"' in h


def test_chuoi_doc_bi_escape(client):
    put(client, "abc-xss", {"share": {"title": EVIL, "description": EVIL, "image": ""}})
    h = client.get("/c/abc-xss").text
    assert EVIL not in h
    assert "&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;" in h
    assert "<title>&quot;&gt;&lt;script&gt;" in h


def test_state_nhung_an_toan(client):
    state = {"share": {}, "x": "</script><script>alert(1)</script> & <!--  "}
    put(client, "abc-st", state)
    h = client.get("/c/abc-st").text
    raw = embedded(h)
    assert "<" not in raw and ">" not in raw and " " not in raw
    assert json.loads(raw)["x"] == state["x"]
    assert h.count("<script>alert(1)") == 0


def test_slug_khong_ton_tai_va_sai(client):
    r = client.get("/c/khong-co")
    assert r.status_code == 200
    assert 'id="cardState"' not in r.text and "og:title" not in r.text
    assert "<title>" in r.text
    assert client.get("/c/AB").status_code == 400


def test_anh_https_giu_nguyen_url(client):
    put(client, "abc-ht", {"share": {"image": "https://cdn.example.com/a.jpg"}})
    h = client.get("/c/abc-ht").text
    assert 'og:image" content="https://cdn.example.com/a.jpg"' in h
    assert 'rel="preload" as="image" href="https://cdn.example.com/a.jpg"' in h


def test_cache_phan_chen_cap_nhat_khi_put_lai(client):
    put_key = client.put("/api/cards/abc-cc", json={"share": {"title": "Một"}}).json()["editKey"]
    assert "<title>Một</title>" in client.get("/c/abc-cc").text
    r = client.put("/api/cards/abc-cc", json={"share": {"title": "Hai hai hai"}},
                   headers={"X-Edit-Key": put_key})
    assert r.status_code == 200
    assert "<title>Hai hai hai</title>" in client.get("/c/abc-cc").text


def test_json_hong_nhu_khong_ton_tai(client, data_dir):
    (data_dir / "cards" / "abc-hong.json").write_text("{khong", encoding="utf-8")
    r = client.get("/c/abc-hong")
    assert r.status_code == 200 and 'id="cardState"' not in r.text


def test_public_url_env(make_client, monkeypatch):
    monkeypatch.setenv("THIEP_PUBLIC_URL", "https://khanhdu.store/")
    c = make_client()
    put(c, "abc-pu", {"share": {"image": "/uploads/a_1234abcd.jpg"}})
    h = c.get("/c/abc-pu").text
    assert 'og:image" content="https://khanhdu.store/uploads/a_1234abcd.jpg"' in h
    assert 'og:url" content="https://khanhdu.store/c/abc-pu"' in h


def test_public_url_tham_so_va_sai_dinh_dang(make_client):
    c = make_client(public_url="https://a.example:8443")
    put(c, "abc-pp", {"share": {"image": "/uploads/a_1234abcd.jpg"}})
    assert 'content="https://a.example:8443/uploads/' in c.get("/c/abc-pp").text
    c2 = make_client(public_url='javascript:"x')
    assert 'og:url" content="http://testserver/c/abc-pp"' in c2.get("/c/abc-pp").text


def test_thieu_bien_dung_base_url_va_proto_cf(make_client):
    c = make_client(trust_cf=True)
    put(c, "abc-cf", {"share": {}})
    h = c.get("/c/abc-cf", headers={"X-Forwarded-Proto": "https"}).text
    assert 'og:url" content="https://testserver/c/abc-cf"' in h
    c2 = make_client()
    h2 = c2.get("/c/abc-cf", headers={"X-Forwarded-Proto": "https"}).text
    assert 'og:url" content="http://testserver/c/abc-cf"' in h2
