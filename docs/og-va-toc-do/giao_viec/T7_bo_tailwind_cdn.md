# T7 — Bỏ Tailwind CDN

**Sub-agent**: frontend-ui · **Đợt** 3 · **Review**: có

## Tệp được sửa (danh sách đóng)
`index.html`, `invite.html`, `js/editor.js` (chuỗi export), `tools/build_export_bundle.py` (thêm `css/tailwind.css` vào nguồn bundle).

## Tiêu chí đạt
Không còn `cdn.tailwindcss.com` trong repo (trừ tài liệu); editor, trang khách, export (http và `file://`) hiển thị giống trước (so ảnh chụp 390px + desktop).

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_frontend.md`, `docs/quyet_dinh.md` (AD-003, AD-005), đặc tả §5.
