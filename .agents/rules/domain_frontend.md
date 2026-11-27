# Luật Front-end (editor `index.html`)

## 1. Bố cục tệp
| Tệp | Nội dung |
|---|---|
| `index.html` | Markup editor 3 cột + modal + thẻ `<script>`/`<link>`. Không chứa logic. |
| `css/app.css` | Style editor + thiệp (dùng chung với trang khách). |
| `css/invite.css` | Chỉ style riêng trang khách (phong bì, rèm). |
| `js/state.js` | `DEFAULT_STATE`, `FONT_OPTIONS`, `THEME_PRESETS`, `SECTION_TYPES`, `registerSection`, `migrate`, `escapeHtml`. |
| `js/render.js` | `renderAll`, `renderSectionListSidebar`, `renderWeddingCanvas`, `renderRightInspector` — lặp qua registry. |
| `js/runtime.js` | Hành vi tương tác của thiệp (xem `domain_runtime_invite.md`). |
| `js/editor.js` | Mutator, sự kiện editor, upload, export. |
| `js/store.js` | `commitState`, undo/redo, autosave, nhập/xuất JSON. |
| `js/section_ops.js` | Thêm/nhân bản/xoá/di chuyển/ẩn section, áp preset. |
| `js/api.js` | `window.api` — mọi lời gọi HTTP tới backend. |
| `js/sections/*.js` | Mỗi loại section một tệp. |

Thứ tự nạp: `state.js` → `api.js` → `runtime.js` → `sections/*.js` → `render.js` → `store.js` → `section_ops.js` → `editor.js`.

## 2. Quy ước mã
- Script thường, không `import/export`. Hàm public gắn `window.<ten>`; hàm nội bộ bọc trong IIFE.
- HTML sinh bằng template string; giá trị người dùng qua `escapeHtml()`.
- Mutator: `updateSectionField`, `updateSectionStyle`, `updateGlobalStyle`, `updateBankInfo` và các hàm trong `section_ops.js` — đều gọi `commitState(label)`.
- `fromInspector=true`: không render lại inspector để ô đang gõ giữ focus.
- Không dùng `alert/confirm/prompt`; thông báo bằng `showToast`, xác nhận bằng modal trong trang.
- `localStorage` luôn bọc `try/catch`.

## 3. Giao diện
- Tailwind + Font Awesome 6.5.1 + Google Fonts. Tailwind dùng `css/tailwind.css` dựng sẵn (AD-005, không dùng Play CDN; chạy `py tools/build_tailwind.py` sau khi sửa lớp Tailwind trong HTML/JS, không sửa tay). Font mới phải thêm vào `FONT_OPTIONS`, `GOOGLE_FONT_SPECS` và link Google Fonts đầy đủ của editor + export (xem dưới).
- Phông mới chỉ lấy phông Google Fonts có subset `vietnamese` (kiểm trước khi thêm). Editor (`index.html`) và export (chuỗi trong `js/editor.js`) dùng link Google Fonts đầy đủ, giống hệt từng ký tự. Trang khách (`invite.html`) không có link cố định mà dùng `cardFontsUrl(state)` (`js/state.js`, chỉ các họ phông thiệp dùng + `CARD_BASE_FONTS`). Phông mới phải thêm vào cả link đầy đủ lẫn `GOOGLE_FONT_SPECS`; họ phông viết cứng trong CSS/JS phải có trong `CARD_BASE_FONTS`. Giá trị `FONT_OPTIONS` dạng `'<Tên>', <generic>` (vd `'Lora', serif`) để `safeFont` nhận.
- Canvas thiệp rộng như điện thoại (≈ 390–430px); trang khách responsive, kiểm ở 390px.
- Vùng chạm ≥ 44px trên mobile; tương phản chữ/nền đủ đọc.
- Chữ giao diện tiếng Việt, có dấu đầy đủ.

### Nền toàn thiệp
- Thứ tự chồng lớp, dưới → trên: màu nền (`globalStyle.bgColor`), ảnh nền (`globalStyle.bgImage`), lớp phủ trắng (`bgImageOverlay`), texture `tex-*`, nền riêng của section (`style.bgColor/bgImage` trên `.wedding-section`).
- Nền khung `#weddingCardFrame` chỉ được áp qua `cardBgVars(g)` / `cardBgStyleText(g)` (`js/state.js`) ở cả editor, `invite.html` và export; không tự ghép `url()` ở nơi khác.
- Cấm chèn `url()` vào CSS khi chưa qua `safeCssImageUrl`.
- Ô ảnh (nhập URL) trong inspector luôn kèm nút "Tải ảnh từ máy tính" dùng `uploadOrDataUrl`.

## 4. Chạy không backend
`window.api.available === false` (mở `file://` hoặc server không phản hồi `/api/health`): ẩn/khoá nút Xuất bản, upload dùng base64, form RSVP/lời chúc hiện toast "Chỉ hoạt động trên thiệp đã xuất bản".

## 5. Export HTML tĩnh
Export = 1 tệp HTML tự chứa: inline `css/app.css`, `js/state.js`, `js/api.js`, `js/runtime.js`, `js/sections/*.js`, `js/render.js` (đọc bằng `fetch` khi chạy qua server; khi `file://` hoặc fetch lỗi thì lấy từ `window.__EXPORT_SOURCES` do `js/export_bundle.js` cung cấp — AD-003; thiếu cả hai mới báo toast) + `window.__CARD_STATE__` JSON, render với `mode: 'export'`. Chuỗi `</script>` trong nội dung inline phải được thoát.
