# Quy trình giao việc cho sub-agent

## 1. Vai trò
- **Phiên chính**: phân loại, lập kế hoạch, chờ duyệt, lập hồ sơ, giao phiếu, nghiệm thu, commit. Không sửa mã ứng dụng (Hiến pháp Điều 10).
- **Sub-agent**: làm đúng một phiếu, báo cáo theo mẫu §6. Không gọi được sub-agent khác: đề xuất gì thì ghi vào báo cáo.
- Danh sách sub-agent: `.agents/AGENTS.md`.

## 2. Chốt duyệt
Kế hoạch được duyệt một lần (Bước 4 của `/dieu-phoi`). Sau đó làm tới bàn giao, chỉ dừng ở các điểm dừng đã ghi trong kế hoạch hoặc §7.

## 3. Nhánh
- Tên `<loại>/<tên-ngắn>`: `feat/` (CREATE), `fix/` hoặc `refactor/` (UPDATE), `chore/` (DELETE).
- Tạo từ `master` sau khi duyệt. Có tệp **đã theo dõi đang sửa dở** thì hỏi người dùng trước (commit tạm, stash, hay bỏ). Tệp chưa theo dõi không liên quan: để yên.

## 4. Hồ sơ `docs/<slug>/`
- `README.md`: nhiệm vụ tổng, bảng task (Mã, Việc, Tệp, Sub-agent, Đợt, Phụ thuộc, Review, Trạng thái), nhật ký nghiệm thu.
- `dac_ta_<viec>.md`: giao kèo chung (chữ ký hàm, schema, API) mà nhiều phiếu dùng.
- `giao_viec/T<n>_<ten>.md`: mỗi phiếu gồm Mục tiêu, Tệp được sửa (danh sách đóng), Rules phải đọc, Giao kèo, Tiêu chí đạt (kiểm tra được), Lệnh tự kiểm, Không được làm.
- Commit hồ sơ trước khi giao đợt đầu.

## 5. Luật chia phiếu
- Một phiếu một mục tiêu, sửa 2–3 tệp. Vượt thì ghi rõ lý do ngoại lệ trong kế hoạch.
- Cùng đợt không trùng tệp. Xếp song song được thì không xếp tuần tự.
- Giao kèo giữa các phiếu cùng đợt phải chốt trong đặc tả trước khi giao.
- Phiếu tài liệu/luật ở đợt đầu. Việc chạy lâu (server, test nặng) là phiếu riêng, chạy nền.
- Phiếu chạm schema state, `migrate()`, API, lưu trữ Excel/JSON, edit key, upload, tiền/QR mừng cưới: Review = "có".

## 6. Giao và nghiệm thu
- Giao cả đợt trong một message (nhiều lời gọi Agent song song). Prompt chỉ cần: đường dẫn phiếu + nhắc đọc `CLAUDE.md`, Hiến pháp, rules ghi trong phiếu.
- Báo cáo sub-agent: `Kết quả` (ĐẠT/CHƯA ĐẠT), `Tệp đã sửa`, `Đã tự kiểm` (lệnh + kết quả), `Lệch phiếu/giả định`, `Đề xuất`.
- Sau mỗi đợt: `autotest` kiểm phạm vi hẹp. Phiếu Review = "có": `reviewer-code` ngay.
- Đạt: ghi biên bản vào `README.md`, commit riêng từng phiếu (`T<n>: <mô tả>`).
- Chưa đạt: lập phiếu sửa `T<n>.1` giao lại đúng sub-agent đã làm; tối đa 2 vòng, quá thì dừng báo người dùng.
- Cuối: `inspector` trên toàn bộ `git diff master...HEAD`.

## 7. Bắt buộc dừng
- Phát sinh ngoài kế hoạch đã duyệt, cần sửa tệp ngoài danh sách.
- Yêu cầu trái Hiến pháp hoặc AD.
- Lỗi lặp sau 2 vòng sửa.
- Thao tác không đảo ngược (xoá dữ liệu `data/`, đổi cột Excel, push, deploy).

## 8. Việc nhỏ
Việc ≤ 1 tệp, không chạm schema/API/lưu trữ: chỉ tạo nhánh, không lập hồ sơ; vẫn chạy `autotest` trước khi commit.
