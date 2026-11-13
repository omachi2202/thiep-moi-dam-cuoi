# T3 — Registry section + chuyển 6 loại cũ + migrate

- **Sub-agent**: `frontend-ui` · **Đợt**: 3 · **Phụ thuộc**: T1 · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/render.js`, `js/state.js`, `js/sections/{hero,family,events,countdown,rsvp,album}.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`

## Việc cần làm
- `state.js`: `SECTION_TYPES`, `registerSection`, `migrate`, `escapeHtml`, `safeUrl` (G2); `DEFAULT_STATE` thêm `schemaVersion: 2`, mỗi section thêm `type` và `style: {}` theo domain_sections §2.
- Chuyển từng nhánh `if (sec.id === ...)` của `renderWeddingCanvas`/`renderRightInspector` vào `renderCanvas`/`renderInspector` của tệp section tương ứng, giữ markup y hệt; khi `ctx.mode !== 'editor'` bỏ contenteditable/onblur/badge.
- `render.js`: lặp `SECTION_TYPES[sec.type]`; thêm `renderCardHtml(state, ctx)`; listener `focusout` chung cho `[data-field]` (G4); sau render gọi `CardRuntime.destroy?.(); CardRuntime.init?.(viewport, appState, ctx)` nếu đã có (T4 cung cấp) — còn không thì giữ lời gọi cũ.
- Countdown section có slot G4.
- Khởi động editor gọi `appState = migrate(appState)`.

## Tiêu chí đạt
- Không còn `sec.id ===` / `sec.type ===` trong render.js.
- Canvas mặc định trông như mốc trước T1.
- `migrate(JSON cũ không có type)` → mọi section có `type`, chạy 2 lần cho cùng kết quả.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
