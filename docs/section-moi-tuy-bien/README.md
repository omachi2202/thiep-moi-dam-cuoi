# Section mới + tăng độ phong phú tuỳ biến (đợt 1/2)

Nhánh `feat/section-moi-tuy-bien`. Yêu cầu người dùng (2026-11-22): tham khảo https://m-invite.com/templates/thiep-cuoi
để thêm section mới và làm phong phú phần tuỳ biến. Người dùng chọn: Lịch tháng + Slideshow, Trang trí / ngăn cách;
tuỳ biến: hiệu ứng xuất hiện, khung ảnh theo hình, thêm font + phong bì, bố cục cho section cũ; chia 2 đợt.

Đợt 1 (hồ sơ này): 3 section mới + hiệu ứng xuất hiện/lặp + khung ảnh theo hình.
Đợt 2 (ghi backlog): font chữ ký hỗ trợ tiếng Việt, phong bì tuỳ màu/ảnh/chữ, bố cục mới cho Gia đình / Lịch trình / Album / Cảm ơn.

Ghi nhận từ m-invite (đọc dữ liệu 3 mẫu Starlit Garden, Modern Ceremony, Enduring Grace): thiệp dạng canvas tự do;
widget `calendar`, `slideshow`, `photo_album`, `countdown`, `map`, `rsvp`, `qr`, `button`, `envelope`, `svg` (đổi màu), `line`
(solid/dotted); hiệu ứng vào `scaleIn|slideUp|flipIn|fade` + thời lượng; hiệu ứng lặp `swing|pulse|heartbeat`;
chữ `typewriter`; ảnh `maskShape`.

Giao kèo chung: `dac_ta_section_moi.md`.

## Bảng task

| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| T41 | Luật khung ảnh / thời lượng / hiệu ứng lặp; backlog đợt 2 | `.agents/rules/domain_sections.md`, `docs/backlog.md` | memoryer | 1 | không | không | Chờ |
| T42 | Section Lịch tháng + thẻ script 3 section mới | `js/sections/calendar.js`, `index.html`, `invite.html` | frontend-ui | 1 | không | có | Chờ |
| T43 | Section Trình chiếu ảnh | `js/sections/slideshow.js` | frontend-ui | 1 | không | có | Chờ |
| T44 | Section Trang trí / ngăn cách | `js/sections/divider.js` | frontend-ui | 1 | không | có | Chờ |
| T45 | Hiệu ứng xuất hiện mới + thời lượng; CSS loop-* và img-shape-* | `js/render.js`, `js/runtime.js`, `css/app.css` | frontend-ui | 1 | không | có | Chờ |
| T46 | Khung ảnh theo hình (hero/family/thanks), schema 6 | `js/state.js`, `js/sections/hero.js`, `js/sections/family.js`, `js/sections/thanks.js` | frontend-ui | 1 | không | có | Chờ |

T46 sửa 4 tệp (ngoại lệ đã duyệt): ba section dùng chung helper mới ở `state.js`.

## Nhật ký nghiệm thu

(chưa có)
