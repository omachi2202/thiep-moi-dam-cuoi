# T24 — Nút "Xem lại hiệu ứng mở" + header không vỡ khi có banner nháp

- **Sub-agent**: `frontend-ui` · **Đợt**: 10 · **Review**: không
- **Tệp được sửa**: `js/editor.js` (chỉ `setPreviewMode` + hàm mới), `index.html` (header), `js/store.js` (chỉ phần dựng banner nháp)

## Việc
1. `index.html` + `editor.js`: trong nhóm nút "Thiết kế / Xem thực tế", thêm nút icon "Xem lại hiệu ứng mở" (`fa-envelope-open-text`, title đầy đủ), chỉ hiện khi đang preview; bấm gọi `CardRuntime.replayIntro && CardRuntime.replayIntro()`. `setPreviewMode` bật/ẩn nút này.
2. Header không vỡ dòng ở 1440px kể cả khi có banner nháp (ảnh tham chiếu: banner "Bản nháp trước … Khôi phục/Bỏ qua" làm chữ logo và nút "Thiết kế (Canva Mode)" xuống 2–3 dòng):
   - Nút chế độ: "Thiết kế" / "Xem thực tế" (bỏ "(Canva Mode)"), `whitespace-nowrap`.
   - Nhãn "CANVA WEDDING BUILDER" ẩn dưới `xl`.
   - `store.js` banner nháp: dạng gọn — icon `fa-clock-rotate-left` + "Có bản nháp" + 2 nút "Khôi phục"/"Bỏ qua"; giờ lưu đưa vào `title`; `whitespace-nowrap`, `max-w` hợp lý. Giữ nguyên logic khôi phục/giữ prev (T6.1).
3. Không sửa runtime.js/render.js/css (T23 làm song song).

## Tiêu chí đạt
CDP 1440px có banner nháp: header một dòng, không chữ nào xuống dòng; nút "Xem lại hiệu ứng mở" chỉ hiện khi preview.
