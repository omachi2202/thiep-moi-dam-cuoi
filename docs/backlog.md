# Backlog

Mỗi dòng: việc — lý do — ưu tiên (Cao / Trung bình / Thấp).

- Thêm CSP cho `/c/` và chuyển script/handler inline (boot của `invite.html`, `onclick`/`onerror` trong các section) sang `addEventListener`; triển khai Report-Only trước; cân nhắc build Tailwind tĩnh để bỏ CDN cho trang khách — giảm rủi ro XSS, review T15 N6 — Cao.
- Tách origin trang khách khỏi editor (hoặc không giữ editKey trong localStorage cùng origin) — một XSS bất kỳ trên `/c/` đọc được mọi editKey — Cao.
- Thêm ô nhập edit key thủ công cho slug đã tồn tại (đổi máy/mất localStorage) — hiện không sửa lại được thiệp đã xuất bản, review T8 G3 — Trung bình.
- Thay URL nhạc mặc định (hotlink vocaroo) bằng tệp trong dự án — phụ thuộc dịch vụ ngoài, có thể chết link — Trung bình.
- Kiểm thử `handleAlbumFileUpload` và upload nhạc trên trình duyệt thật — chưa kiểm tay — Trung bình.
- Kiểm tay toàn bộ trên trình duyệt thật (Chrome extension bị chặn localhost trong phiên làm); danh sách kiểm ở `PLAN_THUC_HIEN.md` mục Kiểm thử — chưa có xác nhận hành vi thực tế — Cao.
- Thêm test DOM tự động (CDP/Playwright) cho mount RSVP/wishes, intro, undo — hiện chỉ có test API, phần front-end chưa được kiểm tự động — Trung bình.
