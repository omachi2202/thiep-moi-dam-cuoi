# Luật Registry section & schema state

## 1. Hợp đồng `registerSection`
Mỗi tệp `js/sections/<type>.js` gọi đúng một lần:

```js
registerSection({
  type: 'story',                 // khoá registry, [a-z]+, trùng tên tệp
  label: 'Chuyện tình yêu',      // tên hiển thị khi "+ Thêm section"
  icon: 'fa-book-heart',         // Font Awesome 6.5.1
  defaults: () => ({ ... }),     // trả object `data` mặc định MỚI mỗi lần gọi
  renderCanvas(sec, ctx) { return '<html string>' },
  renderInspector(sec) { return '<html string>' },
  mount(rootEl, sec, ctx) {},    // tuỳ chọn: gắn sự kiện, fetch API; chạy sau mỗi lần render
  migrate(data) { return data }, // tuỳ chọn: chuẩn hoá data cũ của riêng loại này
  pageTitle(sec) { return '' },  // tuỳ chọn: tiêu đề trang / export / gợi ý slug (hero)
  calendarEvent(sec) { return { title, location, iso } } // tuỳ chọn: dữ liệu nút lịch (events, countdown)
});
```

- Code ngoài tệp section cần thông tin "của một loại cụ thể" phải đọc qua hook và helper chung `cardPageTitle(state)` / `cardCalendarEvent(state)` (runtime.js), KHÔNG so sánh `sec.type`/`sec.id` (Hiến pháp Điều 3). Thêm nhu cầu mới thì thêm hook tuỳ chọn mới ở đây.

- `ctx = { appState, mode, guestName, slug }`, `mode ∈ 'editor' | 'preview' | 'invite' | 'export'` ('preview' = editor bật "Xem thực tế": hiển thị như khách, không sửa inline; section nên so sánh `mode === 'editor'` thay vì liệt kê các mode khác).
- `renderCanvas` thuần (không side-effect, không fetch). Trong `mode !== 'editor'` không sinh `contenteditable`, `onblur`, badge.
- Trường sửa inline dùng `data-field="<key>"` + handler chung của `render.js`; không viết `onblur` riêng lẻ trong section mới.
- Mọi giá trị người dùng chèn vào HTML qua `escapeHtml()` (trừ trường được phép HTML, phải ghi chú rõ).
- Section chỉ đọc `sec`, `ctx`, `appState.globalStyle`, `appState.bankInfo`; không sửa state ngoài mutator.

## 2. Cấu trúc một section trong state
```js
{ id: 'story-1', type: 'story', name: '…', icon: '…', visible: true,
  customFont: '', customTitleSize: '24', customTextColor: '',
  style: { bgColor: '', bgImage: '', bgOverlayOpacity: 0, paddingY: '', align: '', animation: '', ornament: '' },
  data: { ... } }
```
- `id` duy nhất. Section cũ giữ id cũ (`hero`, `family`…); section thêm mới có id `<type>-<n>` với n nhỏ nhất chưa dùng.
- `name` hiển thị ở sidebar, sửa được; không đánh số cứng ("1. …") cho section mới.

## 3. `migrate(state)` (trong `js/state.js`)
- Gọi ở mọi điểm nạp state: khởi động, khôi phục nháp, nhập JSON, `invite.html` tải từ API.
- Idempotent: gọi nhiều lần cho cùng kết quả.
- Gán `type = id` cho section thiếu `type`; bổ sung trường thiếu từ `defaults()` và `DEFAULT_STATE.globalStyle` (không ghi đè giá trị đã có); gọi `migrate` riêng của từng loại.
- Section có `type` không có trong registry: giữ nguyên trong state, không render, sidebar hiện cảnh báo.
- Ghi `state.schemaVersion` (số nguyên, tăng khi đổi schema).

## 4. Thêm loại section mới
1. Tạo `js/sections/<type>.js` theo §1.
2. Thêm `<script src="js/sections/<type>.js">` vào `index.html`, `invite.html` (và danh sách inline của export).
3. Không sửa `render.js`/`editor.js`. Cần mở rộng hợp đồng §1 thì là việc riêng, phải được duyệt.
