# T27 — Trang bìa: 3 kiểu ảnh to (fade, arch, fullscreen) + inspector chọn kiểu

- **Sub-agent**: `frontend-ui` · **Đợt**: 1 · **Review**: có
- **Tệp được sửa (đóng)**: `js/sections/hero.js`, `css/app.css` (chỉ THÊM khối mới ở cuối tệp)
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `docs/hinh-nen-anh-bia/dac_ta_hinh_nen_anh_bia.md` G5
- **Tham khảo hình**: README hồ sơ (mẫu Aline & Marcelo cho `fade`, mẫu Sophia & Daniel cho `arch`)

## Việc
Làm đúng G5:
1. `defaults()` thêm `layout` + 6 trường mới; thêm `migrate(data)` khoá whitelist `layout`.
2. `renderCanvas`: hằng `HERO_LAYOUTS` trong tệp; `classic` giữ HTML hiện tại y nguyên; thêm `fade`, `arch`, `fullscreen`. Không có `contenteditable` ngoài `fieldAttr`. Dùng `sectionVars(sec, ctx)` cho font/màu.
3. `renderInspector`: lưới 2×2 chọn kiểu (sơ đồ CSS thu nhỏ, tên tiếng Việt, ô chọn viền violet, vùng chạm ≥ 44px) + các ô nhập theo kiểu (G5). Ô ảnh giữ nút tải ảnh hiện có.
4. CSS: khối `/* ===== Trang bìa: layout (T27) ===== */` ở CUỐI `css/app.css`, mọi lớp tiền tố `.hero-`; `-webkit-mask-image` kèm `mask-image`; `#canvasScrollArea .hero-full { height: 760px; }`.

## Giao kèo
- T26 (song song) sửa `js/state.js` — không đụng. T28 (đợt 2) sẽ sửa khối CSS trang trí toàn thiệp trong `app.css`; T27 không sửa khối CSS nào có sẵn.
- `fade` phải để lộ nền khung (không tô nền đặc dưới vùng mờ) để hình nền tổng thể hiện ra.

## Tiêu chí đạt
- `node --check js/sections/hero.js` OK.
- Thiệp cũ (không có `layout`) render y như trước.
- 4 kiểu render đúng ở mode editor/preview/invite/export; 390px không tràn ngang; chữ đè ảnh đọc được.
- Mọi giá trị người dùng qua `escapeHtml`/`safeUrl`.

## Không được làm
Sửa `render.js`, `editor.js`, `state.js`, tệp section khác; rẽ nhánh `sec.type` ngoài tệp; sửa CSS có sẵn.
