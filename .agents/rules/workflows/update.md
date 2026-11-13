# Workflow [UPDATE] — sửa, tối ưu, refactor, sửa lỗi

## 1. Trình tự
1. Đọc Hiến pháp, `giao_viec.md`, rules theo phạm vi.
2. Tái hiện vấn đề hoặc chụp trạng thái trước khi sửa (screenshot editor/trang khách, output test) làm mốc so sánh.
3. Soát luật (§2), hỏi rõ (§3), lập kế hoạch Minimal Diff, chờ duyệt.

## 2. Soát luật
- Thay đổi có đổi schema state, API, cột Excel? → Điều 6, cần `migrate()` hoặc giữ tương thích ngược.
- Refactor có giữ nguyên hành vi? → nêu cách chứng minh (so sánh screenshot, test).
- Có làm lặp lại runtime (Điều 4) hoặc thêm nhánh theo `sec.type` (Điều 3)?

## 3. Điểm cần rõ
- Hành vi mong muốn chính xác là gì (trước/sau)?
- Có cần giữ tương thích với thiệp đã xuất bản (`data/cards/*.json`) và JSON đã export?
- Phạm vi: chỉ editor, chỉ trang khách, hay cả export tĩnh?

## 4. Nhánh
`fix/<tên-ngắn>` (sửa lỗi) hoặc `refactor/<tên-ngắn>`.

## 5. Nội dung bắt buộc của kế hoạch
- Nguyên nhân (với lỗi) hoặc lý do (với refactor).
- Mốc so sánh trước/sau và lệnh kiểm.
- Danh sách tệp, xác nhận không đổi hành vi ngoài phạm vi.
