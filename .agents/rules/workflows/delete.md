# Workflow [DELETE] — xoá hàm, tệp, section, thư viện, dữ liệu

## 1. Trình tự
1. Đọc Hiến pháp, `giao_viec.md`, rules theo phạm vi.
2. Tìm mọi chỗ tham chiếu (grep tên hàm, `type` section, thẻ `<script>`, endpoint, cột Excel).
3. Soát luật (§2), hỏi rõ (§3), lập kế hoạch, chờ duyệt.

## 2. Soát luật
- Xoá loại section: thiệp cũ có section loại đó thì `migrate()` xử lý thế nào (bỏ, chuyển loại, giữ ẩn)?
- Xoá trường state/cột Excel: Điều 6 cấm xoá cột Excel; trường state cũ phải được `migrate()` bỏ qua êm.
- Xoá dữ liệu trong `data/`: thao tác không đảo ngược → điểm dừng bắt buộc, người dùng xác nhận riêng.

## 3. Điểm cần rõ
- Xoá hẳn hay ẩn/ngưng dùng?
- Dữ liệu đã lưu liên quan xử lý ra sao?
- Có cần sao lưu trước khi xoá?

## 4. Nhánh
`chore/<tên-ngắn>`.

## 5. Nội dung bắt buộc của kế hoạch
- Danh sách tham chiếu tìm được và cách gỡ từng chỗ.
- Ảnh hưởng tới thiệp đã xuất bản và JSON cũ.
- Lệnh kiểm chứng không còn tham chiếu (grep trả rỗng) + kiểm tra editor vẫn chạy.
