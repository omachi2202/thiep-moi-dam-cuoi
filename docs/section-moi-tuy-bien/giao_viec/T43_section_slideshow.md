# T43 — Section Trình chiếu ảnh

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
Tạo section `slideshow` theo `dac_ta_section_moi.md` §3.2.

## Tệp được sửa (danh sách đóng)
- `js/sections/slideshow.js` (tạo mới). Thẻ script do T42 thêm.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_sections.md`, `domain_frontend.md`, `domain_runtime_invite.md`, `docs/section-moi-tuy-bien/dac_ta_section_moi.md`.
Tham khảo: `js/sections/album.js` (ảnh, inspector), `js/sections/story.js` (hàm toàn cục riêng của section), `mount` trả hàm dọn (`js/runtime.js` `_cleanups`), `updateAlbumPhoto` / `handleAlbumFileUpload` trong `js/editor.js` (chỉ đọc).

## Tiêu chí đạt
- Đủ hook `type, label, icon, defaults, renderCanvas, renderInspector, migrate, mount`.
- `mount`: nút trước/sau và vuốt chạy ở mọi mode; tự chạy chỉ khi `ctx.mode !== 'editor'`; dừng khi `document.hidden`; hàm dọn gỡ hết interval/listener (editor re-init nhiều lần không rò timer).
- Thêm/xoá ảnh (≤ 12) qua mutator có `commitState` (`updateSectionField`, `updateAlbumPhoto`); tải ảnh dùng `handleAlbumFileUpload(event, i, secId)`.
- `migrate` chuẩn hoá `photos/interval/effect/ratio/showDots`; idempotent. 0 ảnh → hiện khung trống thân thiện, không lỗi.
- Ảnh qua `safeUrl` + `escapeHtml`; có `onerror` placeholder như album. Vùng chạm nút ≥ 44px. `prefers-reduced-motion` → chuyển ảnh không chuyển động (inline style hoặc kiểm `matchMedia` trong mount).

## Lệnh tự kiểm (phiên chính sẽ chạy)
`node --check js/sections/slideshow.js`.

## Không được làm
Không sửa tệp khác (kể cả `css/app.css`, `editor.js`); không rẽ nhánh theo type ngoài tệp section.
