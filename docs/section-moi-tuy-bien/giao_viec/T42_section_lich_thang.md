# T42 — Section Lịch tháng + thẻ script cho 3 section mới

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
Tạo section `calendar` theo `dac_ta_section_moi.md` §3.1, và thêm thẻ script cho cả 3 section mới.

## Tệp được sửa (danh sách đóng)
- `js/sections/calendar.js` (tạo mới)
- `index.html`, `invite.html`: thêm `<script src="js/sections/calendar.js">`, `slideshow.js`, `divider.js` ngay sau các script section hiện có (cùng thứ tự ở cả hai tệp; các tệp slideshow/divider do T43/T44 tạo song song).

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_sections.md`, `domain_frontend.md`, `docs/section-moi-tuy-bien/dac_ta_section_moi.md`.
Tham khảo phong cách: `js/sections/countdown.js`, `js/sections/thanks.js`.

## Tiêu chí đạt
- `registerSection` đủ `type, label, icon, defaults, renderCanvas, renderInspector, migrate`.
- Lịch đúng số ngày, ngày bắt đầu đúng thứ (tính UTC); ngày cưới được đánh dấu theo `mark`; ngày sai → mặc định, không lỗi.
- `migrate` chuẩn hoá `date/weekStart/mark` về whitelist/mặc định; idempotent.
- Không `contenteditable` ngoài editor (dùng `fieldAttr`). Mọi chuỗi qua `escapeHtml`.
- Đẹp ở bề ngang 390px; chữ tiếng Việt có dấu.

## Lệnh tự kiểm (phiên chính sẽ chạy)
`node --check js/sections/calendar.js`.

## Không được làm
Không sửa tệp khác; không rẽ nhánh theo type ngoài tệp section; không thêm thư viện.
