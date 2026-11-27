# Ảnh xem trước khi chia sẻ link + tăng tốc trang khách

Nhánh `feat/og-va-toc-do`. Người dùng duyệt 2026-11-27:
- Dán link `/c/<slug>` vào Zalo/Messenger/Facebook hiện khung xem trước: ảnh bìa trang 1, tiêu đề "THƯ MỜI TIỆC CƯỚI · <tên cặp đôi>", mô tả giờ · ngày · địa điểm (mẫu: ziuwedding.site/mm03).
- Trang khách tải chậm: sửa dứt điểm theo nguyên nhân đo được (đặc tả §0), gồm AD-005 (Tailwind dựng sẵn).

Giao kèo chung: `dac_ta_og_va_toc_do.md`.

## Bảng task

| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| T1 | Luật + AD-005 + tài liệu deploy | `.agents/rules/domain_backend.md`, `domain_runtime_invite.md`, `domain_frontend.md`, `docs/quyet_dinh.md`, `CLAUDE.md`, `docs/deploy.md` (ngoại lệ: phiếu tài liệu) | memoryer | 1 | không | không | Chờ |
| T2 | `share` (schema 8), hook `shareImage`, `cardShareInfo`, `cardFontsUrl`, ảnh bìa ưu tiên | `js/state.js`, `js/runtime.js`, `js/sections/hero.js` | frontend-ui | 1 | không | có | Chờ |
| T3 | `/c/{slug}` server dựng (OG + state nhúng + preload), `?v=` cho JS/CSS | `server/app.py`, `server/tests/test_invite_page.py`, `server/tests/test_cache_headers.py` | py-backend | 1 | giao kèo | có | Chờ |
| T4 | Boot đọc state nhúng, health không chặn, phông theo thiệp, nhạc `preload=none`, editor gửi `share` | `invite.html`, `js/api.js`, `js/editor.js` | frontend-ui | 1 | giao kèo | có | Chờ |
| T5 | Ảnh lười tải | `js/sections/album.js`, `family.js`, `thanks.js`, `slideshow.js` (ngoại lệ 4 tệp, mỗi tệp 1–3 dòng) | frontend-ui | 1 | không | không | Chờ |
| T6 | Công cụ dựng Tailwind + `css/tailwind.css` + test độ mới | `tools/build_tailwind.py`, `tools/tailwind.config.js`, `css/tailwind.css`, `server/tests/test_tailwind.py`, `.gitignore` | frontend-ui + phiên chính chạy CLI | 2 | T1; **điểm dừng: tải CLI** | có | Chờ |
| T7 | Bỏ Tailwind CDN ở editor, trang khách, export | `index.html`, `invite.html`, `js/editor.js`, `tools/build_export_bundle.py` | frontend-ui | 3 | T4, T6 | có | Chờ |

Sau mỗi đợt: `autotest` (sinh lại bundle, `node --check`, pytest, đo trước/sau). Cuối: `inspector`.

## Nhật ký nghiệm thu
