# T44 — Section Trang trí / ngăn cách

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
Tạo section `divider` theo `dac_ta_section_moi.md` §3.3.

## Tệp được sửa (danh sách đóng)
- `js/sections/divider.js` (tạo mới). Thẻ script do T42 thêm; lớp `loop-*` do T45 định nghĩa trong `css/app.css`.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_sections.md`, `domain_frontend.md`, `docs/section-moi-tuy-bien/dac_ta_section_moi.md`.
Tham khảo: `js/sections/thanks.js`, `js/sections/hero.js` (lưới chọn bố cục trong inspector).

## Tiêu chí đạt
- Đủ hook `type, label, icon, defaults, renderCanvas, renderInspector, migrate`.
- 4 hoạ tiết SVG tự vẽ (floral, leaf, heart, rings) gọn, cân đối, tô `currentColor`; `line`, `text`, `space` như đặc tả.
- `color` qua `safeColor` (rỗng → màu chủ đạo `v.pc`); `loop` → lớp `loop-<v>`; mọi giá trị khác whitelist → mặc định (cả trong render lẫn `migrate`).
- `text` sửa inline qua `fieldAttr(ctx, 'text')`, escape.
- Ở editor, `space` có viền chấm mờ để nhìn thấy; trang khách không có viền.

## Lệnh tự kiểm (phiên chính sẽ chạy)
`node --check js/sections/divider.js`.

## Không được làm
Không sửa tệp khác; không nhận SVG do người dùng nhập; không tải hoạ tiết từ ngoài.
