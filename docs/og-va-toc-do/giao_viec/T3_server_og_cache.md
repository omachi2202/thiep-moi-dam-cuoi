# T3 — `/c/{slug}` server dựng (OG + state nhúng), `?v=` cho JS/CSS

**Sub-agent**: py-backend · **Đợt** 1 · **Review**: có

## Mục tiêu
Đặc tả §2 và §2b.

## Tệp được sửa (danh sách đóng)
- `server/app.py`: route `/c/{slug}` và `/` theo đặc tả; `create_app(..., public_url=None)` + env `THIEP_PUBLIC_URL`; static `/js`, `/css` chọn `Cache-Control` theo `v`.
- `server/tests/test_invite_page.py` (mới): OG đủ thẻ khi có `share`; fallback khi không có `share` / ảnh `data:` / ảnh `javascript:`; chuỗi độc `"><script>alert(1)</script>` trong title/description bị escape; state nhúng chứa `</script>` không phá thẻ và `json.loads` lại được; slug không tồn tại → 200 không chèn; slug sai → 400 như cũ; `THIEP_PUBLIC_URL` → `og:image` tuyệt đối đúng; thiếu biến → dùng base_url.
- `server/tests/test_cache_headers.py`: `?v` đúng → `immutable`; sai/thiếu → `no-cache`; `index.html` và `/c/<slug>` chứa `/js/state.js?v=` + 8 hex.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_backend.md`, `domain_security_storage.md`, `domain_workflow_testing.md`, `docs/og-va-toc-do/dac_ta_og_va_toc_do.md`.

## Giao kèo
T4 sửa `invite.html` song song: server KHÔNG dựa vào chỗ đánh dấu nào, chỉ chèn trước `</head>` đầu tiên và thay `<title>`. Test dùng `invite.html` thật của repo, chỉ giả định có `<title>` và `</head>`.

## Tiêu chí đạt
Đủ đặc tả §2/§2b; không thêm gói mới; mọi test cũ vẫn qua.

## Lệnh tự kiểm (phiên chính chạy)
`py -m py_compile server/app.py`; `py -m pytest server/tests -q`.

## Không được làm
Không sửa front-end, `excel_store.py`, route khác.
