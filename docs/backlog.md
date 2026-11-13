# Backlog

Mỗi dòng: việc — lý do — ưu tiên (Cao / Trung bình / Thấp).

- Thêm CSP cho `/c/` và chuyển script/handler inline (boot của `invite.html`, `onclick`/`onerror` trong các section) sang `addEventListener`; triển khai Report-Only trước; cân nhắc build Tailwind tĩnh để bỏ CDN cho trang khách — giảm rủi ro XSS, review T15 N6 — Cao.
- Tách origin trang khách khỏi editor (hoặc không giữ editKey trong localStorage cùng origin) — một XSS bất kỳ trên `/c/` đọc được mọi editKey — Cao.
- Thêm ô nhập edit key thủ công cho slug đã tồn tại (đổi máy/mất localStorage) — hiện không sửa lại được thiệp đã xuất bản, review T8 G3 — Trung bình.
- Thay URL nhạc mặc định (hotlink vocaroo) bằng tệp trong dự án — phụ thuộc dịch vụ ngoài, có thể chết link — Trung bình.
- Kiểm thử `handleAlbumFileUpload` và upload nhạc trên trình duyệt thật — chưa kiểm tay — Trung bình.
- Kiểm tay toàn bộ trên trình duyệt thật (Chrome extension bị chặn localhost trong phiên làm); danh sách kiểm ở `PLAN_THUC_HIEN.md` mục Kiểm thử — chưa có xác nhận hành vi thực tế — Cao.
- Thêm test DOM tự động (CDP/Playwright) cho mount RSVP/wishes, intro, undo — hiện chỉ có test API, phần front-end chưa được kiểm tự động — Trung bình.
- ~~Export HTML khi mở bằng file://~~ — ĐÃ XONG (AD-003, T20–T21, 2026-11-13).
- Section Lịch trình: thao tác thêm/xoá/di chuyển sự kiện dùng chung nhãn undo `field:items` nên bị gộp nếu cách nhau < 800ms — cân nhắc `noMerge` cho thao tác cấu trúc trong section — Thấp.
- `getExportSectionFiles` chỉ nhận type `/^[a-z]+$/`; type có số/gạch dưới sẽ bị bỏ khỏi export (đúng quy ước domain_sections nhưng không báo) — Thấp.
- Hộp "Mẹo sử dụng nhanh" tĩnh ở `index.html`:~106 — thêm nút đóng + nhớ trạng thái — Thấp.
- `POST /api/upload` không cần edit key (chỉ rate limit) — cân nhắc yêu cầu key/slug để tránh làm đầy đĩa — Trung bình.
- `GET export.xlsx?key=` — key lọt vào log/lịch sử trình duyệt; chỉ nhận header, front-end tải bằng fetch + blob — Trung bình.
- Tailwind Play CDN chưa ghim phiên bản (Điều 2) — ghim hoặc build CSS tĩnh (gộp với mục CSP ở trên) — Trung bình.
- Markup khung/modal mừng cưới lặp ở `invite.html` và chuỗi export trong `editor.js` — gộp thành một nguồn — Trung bình.
- `CLAUDE.md` viết tiếng Anh trong khi Điều 1 yêu cầu tài liệu tiếng Việt — quyết định giữ hay dịch — Thấp.

## Ý ngoài phạm vi: hình nền & ảnh bìa (T25)

- Trình phát nhạc dạng thẻ — ngoài phạm vi đợt hình nền/ảnh bìa — Thấp.
- Timeline có icon (section Lịch trình) — ngoài phạm vi đợt này — Thấp.
- Ảnh mép cong ở section cảm ơn — ngoài phạm vi đợt này — Thấp.
- Ô màu ở section dress code — ngoài phạm vi đợt này — Thấp.
- Chế độ nền `fixed` (ảnh nền đứng yên khi cuộn) — ngoài phạm vi đợt này, hay lỗi trên iOS — Thấp.
- Ảnh nền `cover` trên thiệp rất dài sẽ bị phóng to mạnh — cân nhắc chế độ "phủ theo bề ngang" — Trung bình.

## Tồn đọng khi tạm dừng (2026-11-13)

Trạng thái: `master` = `cb640f4` (đã push GitHub `omachi2202/thiep-moi-dam-cuoi`), nhánh `feat/thiep-tuy-bien-sau` và `feat/xem-thuc-te-hieu-ung` đã merge. pytest 34 passed, `py tools/build_export_bundle.py --check` khớp. Hồ sơ đầy đủ: `docs/thiep-tuy-bien-sau/README.md`.

- Người dùng đang kiểm tay "Xem thực tế" (phong bì/rèm trong khung, reveal, nút "Xem lại hiệu ứng mở") — chờ phản hồi — Cao.
- Hiệu ứng rơi (cánh hoa/tuyết/sao là emoji): ảnh chụp Chrome headless không thấy dù có 12 phần tử trong khung — xác nhận trên trình duyệt thật; nếu vẫn khó thấy thì đổi sang SVG/CSS thay emoji — Cao.
- Phát nhạc nền: URL vocaroo mặc định không phát được trong headless — kiểm trên trình duyệt thật, cân nhắc thay tệp trong dự án (xem mục nhạc ở trên) — Trung bình.
- Section lời chúc ở "Xem thực tế" (không có slug) ẩn tường lời chúc như bản export, không hiện lời chúc mẫu — cân nhắc hiện mẫu ở preview (sửa `js/sections/wishes.js`) — Thấp.
- Thao tác commitState/undo trong lúc "Xem thực tế" làm intro chạy lại và cuộn về đầu — chấp nhận được, ghi nhận — Thấp.
- Nhắc quy trình: sửa `css/app.css`, `js/state.js`, `js/api.js`, `js/runtime.js`, `js/render.js`, `js/sections/*.js` → chạy `py tools/build_export_bundle.py` trước khi commit (AD-003).
