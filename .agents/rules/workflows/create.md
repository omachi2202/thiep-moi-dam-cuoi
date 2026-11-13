# Workflow [CREATE] — tạo mới section, tính năng, endpoint, trang

## 1. Trình tự
1. Đọc Hiến pháp, `giao_viec.md`, rules theo phạm vi (xem §2 của skill `/dieu-phoi`).
2. Soát luật còn thiếu (§2), hỏi rõ yêu cầu (§3).
3. Khảo sát mã: registry hiện có (`js/sections/`), mutator trong `js/editor.js`, API trong `server/app.py`.
4. Lập kế hoạch, chờ duyệt, tạo nhánh (§4), lập hồ sơ, giao phiếu.

## 2. Soát luật
- Có loại section/trường state mới? → cần `defaults` + `migrate()` (Hiến pháp Điều 6) và có trong `domain_sections.md` chưa?
- Có hành vi tương tác mới? → đặt ở `runtime.js` hay `mount()` (Điều 4), có trong `domain_runtime_invite.md` chưa?
- Có endpoint/tệp lưu trữ/cột Excel mới? → có trong `domain_backend.md`, `domain_security_storage.md` chưa?
- Cần backend? → hành vi khi chạy `file://` (Điều 7).
- Thư viện CDN mới? → phiên bản cố định, lý do.

## 3. Điểm cần rõ trước khi lập kế hoạch
- Section xuất hiện mặc định trong thiệp mẫu hay chỉ thêm qua "+ Thêm section"?
- Trường nào sửa inline trên canvas, trường nào chỉ trong inspector?
- Hiển thị khác nhau giữa editor / trang khách / export tĩnh không?
- Dữ liệu khách nào được lưu, ai xem được, có cần duyệt trước khi hiển thị?
- Văn bản mặc định (tiếng Việt) và placeholder `{khach}`.

## 4. Nhánh
`feat/<tên-ngắn>`.

## 5. Nội dung bắt buộc của kế hoạch
- Danh sách tệp tạo mới, chữ ký `registerSection` hoặc schema request/response.
- Giá trị `defaults` và thay đổi `migrate()` (nếu có).
- Kịch bản kiểm thử: `node --check`, pytest (nếu backend), kiểm tay editor + `/c/<slug>` + mobile 390px + `file://`.
