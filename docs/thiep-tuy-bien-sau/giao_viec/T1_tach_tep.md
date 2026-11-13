# T1 — Tách index.html thành css/js (không đổi hành vi)

- **Sub-agent**: `frontend-ui` · **Đợt**: 2 · **Phụ thuộc**: không · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`index.html`, `css/app.css`, `css/invite.css` (stub), toàn bộ `js/*.js` và `js/sections/*.js` theo G1 (phần lớn là stub)

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`

## Việc cần làm
- Chuyển nguyên văn `<style>` (index.html:19–112) sang `css/app.css`.
- Chuyển script (index.html:543–1690) sang các tệp theo G2: dữ liệu → `state.js`; render* + `generateCalendarHtml` + `selectSection`/`switchLeftTab` → `render.js`; countdown/nhạc/hiệu ứng rơi/gift modal/copy STK/`handleRsvpSubmit`/`showToast` → `runtime.js`; `moveSection`, `toggleSectionVisibility`, `applyThemePreset` → `section_ops.js`; mutator, upload, `setPreviewMode`, `resetToDefault`, export, `syncLeftControlsWithState`, `window.onload` → `editor.js`.
- Tạo stub: `api.js` (`window.api={available:false,...}` các hàm `Promise.reject(new Error('Chưa có backend'))`), `store.js` (`window.commitState=(label,opts={})=>renderAll()` — chưa thay lời gọi), 13 tệp `js/sections/*.js` chỉ có comment `// TODO T<n>`, `css/invite.css` rỗng có comment.
- `index.html` chỉ còn markup + CDN + `<link href="css/app.css">` + thẻ script theo đúng thứ tự G1; thêm `<div id="editorToolbar"></div>` rỗng ở thanh trên cùng (chỗ T6 chèn nút) mà không làm lệch bố cục.
- Export (openExportModal) giữ nguyên hành vi hiện tại (T4 sẽ thay).
- Chuỗi template export có `<\/script>` phải giữ escape.

## Tiêu chí đạt
- Mở `index.html` (http và file://) giao diện, chỉnh sửa inline, inspector, preset, nhạc, countdown, export hoạt động y như trước.
- Không còn `<style>`/`<script>` nội dung trong `index.html` (trừ CDN Tailwind config nếu có).
- Không thay đổi logic — chỉ di chuyển (diff nội dung hàm = 0 trừ chỗ bắt buộc).

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
