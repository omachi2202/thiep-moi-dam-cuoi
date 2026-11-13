# T6 — commitState, undo/redo, autosave, JSON, upload

- **Sub-agent**: `frontend-ui` · **Đợt**: 4 · **Phụ thuộc**: T3, T4 · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/store.js`, `js/editor.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `.agents/rules/domain_security_storage.md`

## Việc cần làm
- `commitState(label, opts)`: snapshot JSON vào stack undo (tối đa 50, gộp các commit cùng `label`+section trong 800ms), xoá stack redo, autosave debounce 500ms (`thiep:draft`, `thiep:draft:savedAt`), rồi `renderAll` (`opts.skipInspector`).
- Mọi mutator trong `editor.js` gọi `commitState` thay `renderAll`. Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z (bỏ qua khi đang gõ trong input/contenteditable).
- Chèn vào `#editorToolbar`: Hoàn tác, Làm lại, Xuất JSON, Nhập JSON (`<input type=file accept=.json>` ẩn), và banner "Có bản nháp lúc HH:mm — Khôi phục / Bỏ qua" khi khởi động thấy nháp.
- Nhập JSON: parse an toàn, `migrate`, báo lỗi tiếng Việt nếu sai.
- Upload ảnh/nhạc: nếu `api.available` → `api.uploadFile`, lỗi thì fallback base64; không thì base64 như cũ.

- **Bổ sung sau T3 (Điều 3):** `editor.js` còn tra cứu cứng `s.id === 'countdown'` (`updateWeddingDateTime`), `s.id === 'album'` (`updateAlbumPhoto`), `s.id === 'hero'` (export title). Đổi `updateWeddingDateTime(secId, iso)` và `updateAlbumPhoto(secId, idx, url)` sang nhận `secId`; vì `renderInspector` của countdown.js/album.js gọi hai hàm này, được phép sửa đúng dòng gọi trong `js/sections/countdown.js` và `js/sections/album.js` (ngoại lệ có ghi nhận). Tiêu đề export lấy section đầu tiên có `type === 'hero'` qua helper chung, không theo id.
- `resetToDefault` và nhập JSON phải gọi `migrate`.
- `setPreviewMode` gọi `renderWeddingCanvas()` sau khi đổi cờ (để `fieldAttr` bỏ/bật contenteditable — phát hiện ở T3.2).

## Tiêu chí đạt
- Sửa 3 lần → Ctrl+Z 3 lần về trạng thái đầu; reload → banner khôi phục đúng.
- Xuất JSON rồi nhập lại → thiệp giống hệt.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
