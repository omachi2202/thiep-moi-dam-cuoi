# T18 — Gỡ rẽ nhánh theo type (inspector REJECT, Điều 3)

- **Sub-agent**: `frontend-ui` · **Đợt**: 8 · **Review**: có
- **Tệp được sửa**: `js/runtime.js`, `js/editor.js`, `invite.html`, `js/api.js`, `js/sections/hero.js`, `js/sections/events.js`, `js/sections/countdown.js`

## Việc
1. Mở rộng hợp đồng section bằng 2 hook TUỲ CHỌN:
   - `pageTitle(sec) → string` — hero.js trả `coupleShortName`.
   - `calendarEvent(sec) → { title, location, iso } | null` — events.js trả tiêu đề/địa điểm sự kiện 1 (iso có thể null); countdown.js trả `{ title: quoteTitle, iso: weddingIsoDate }`.
2. Thêm helper chung trong runtime.js (gắn window): `cardPageTitle(state)` — section hiển thị đầu tiên có `pageTitle` trả chuỗi khác rỗng; `cardCalendarEvent(state)` — gộp: iso từ section đầu tiên có iso, title/location từ section đầu tiên có giá trị đó. Tra registry bằng `getSectionDef`.
3. Thay: `runtime.js` (`s.type === 'events'` ~366 và mọi tra cứu countdown cho lịch) → `cardCalendarEvent`; `editor.js` `getFirstSectionOfType(...,'hero')` ~306 → `cardPageTitle` (xoá helper nếu không còn dùng); `invite.html` ~183 → `cardPageTitle`; `api.js` ~125 (gợi ý slug) → `cardPageTitle` (fallback rỗng).
4. `editor.js` `EXPORT_SECTION_FILES` (~247): suy từ `Object.keys(SECTION_TYPES)` → `js/sections/<type>.js` (type đã là [a-z]+).
5. Sau khi sửa, grep `=== '` trong runtime/editor/api/render/store/section_ops/invite.html không còn so sánh với tên loại section.

## Tiêu chí đạt
E2E CDP: lịch Google vẫn `20261024T090000Z/…120000Z`, title "TIỆC MỪNG CƯỚI", tiêu đề trang = tên cặp đôi; export qua server vẫn chạy; gợi ý slug vẫn `tung-ngoc`.
