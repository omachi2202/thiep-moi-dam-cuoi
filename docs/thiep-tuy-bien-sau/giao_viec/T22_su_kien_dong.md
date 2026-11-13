# T22 — Thêm/xoá sự kiện trong section Lịch trình

- **Sub-agent**: `frontend-ui` · **Đợt**: 9 · **Review**: có (đổi schema)
- **Tệp được sửa**: `js/sections/events.js`, `js/state.js` (CHỈ: dữ liệu mặc định của section events trong DEFAULT_STATE và `SCHEMA_VERSION` 3 → 4 cùng `DEFAULT_STATE.schemaVersion`)

## Schema mới
`data = { items: [ { title, time, date, lunar, venue, mapUrl } ] }` — 0..10 sự kiện.
- `defaults()` và DEFAULT_STATE: 2 sự kiện như hiện tại (cùng nội dung).
- `migrate(data)` riêng của events: nếu `items` không phải mảng → dựng từ `event1*`, `event2*` (bỏ sự kiện mà mọi trường đều rỗng), rồi XOÁ các khoá `event1*`/`event2*`; nếu đã có `items` → chỉ chuẩn hoá mỗi phần tử thành object đủ 6 trường chuỗi, cắt tối đa 10. Idempotent. Thiệp cũ (schema 3, `data/cards/*.json`, JSON nhập, nháp) hiển thị y như trước.
- `calendarEvent(sec)`: lấy `items[0]` (title, venue, iso null); không có item → null.

## UI
- Canvas: lặp `items` (giữ markup một khối như hiện tại cho mỗi item; nút chỉ đường chỉ http(s)). `items` rỗng: editor hiện khung gợi ý "Chưa có sự kiện — thêm ở cột phải"; invite/export không render khối nào.
- Sửa inline trên canvas (chỉ mode editor): thuộc tính `data-ev-field="<i>.<field>"` + `contenteditable` (KHÔNG dùng `data-field`, vì handler chung chỉ ghi khoá cấp 1). `mount(el, sec, ctx)` chỉ khi `ctx.mode === 'editor'`: `focusin` lưu giá trị gốc, `focusout` chỉ ghi khi đổi → `eventsUpdateItem(secId, i, field, value, true)`; đọc bằng `textContent` (chuẩn hoá `<br>`/khối → `\n`, trim như render.js); bỏ qua khi `appState.isPreviewMode`; trả hàm dọn listener.
- Inspector: mỗi sự kiện một khối 6 ô như hiện tại + nút lên/xuống/xoá; cuối có "+ Thêm sự kiện" (tối đa 10, sự kiện mới có tiêu đề "SỰ KIỆN MỚI"). Xoá hai bước trong cùng nút (bấm "Xoá" → "Chắc chắn?" 3 giây), không confirm().
- Hàm toàn cục: `eventsAddItem(secId)`, `eventsRemoveItem(secId, i)`, `eventsMoveItem(secId, i, dir)`, `eventsUpdateItem(secId, i, field, value, skipInspector)` — sửa bản sao `items` rồi `updateSectionField(secId, 'items', arr, skipInspector)` (đi qua commitState, undo được).
- An toàn: text qua `escapeHtml`, URL qua `safeUrl` + chỉ http(s) cho nút, style qua `sectionVars`; `i` là số nguyên, `field` thuộc whitelist 6 trường — kiểm cả khi đọc `data-ev-field`.

## Tiêu chí đạt
vm: state schema 3 có event1/event2 → migrate → 2 items đúng nội dung, không còn khoá event1*; migrate 2 lần giống nhau; fuzz injection sạch; CDP: thêm/xoá/sắp xếp + undo đúng; lịch Google vẫn lấy items[0].
