# T4 — CardRuntime dùng chung + export không nhân đôi

- **Sub-agent**: `frontend-ui` · **Đợt**: 3 · **Phụ thuộc**: T1 · **Review**: không
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/runtime.js`, `js/editor.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `.agents/rules/domain_runtime_invite.md`

## Việc cần làm
- Đóng gói runtime thành `CardRuntime.init/destroy` (domain_runtime_invite §1), giữ các hàm toàn cục G2 làm wrapper. Mode editor: không intro, không reveal, không tự phát nhạc.
- `init` lặp `SECTION_TYPES` (nếu có) gọi `mount(el, sec, ctx)` cho phần tử `[data-section-id]`.
- `openExportModal`: bỏ toàn bộ runtime viết tay trong chuỗi; sinh HTML tự chứa = CDN + inline `css/app.css` + `js/state.js` + `js/runtime.js` + `js/sections/*.js` + `js/render.js` (lấy bằng `fetch` khi chạy http; khi `file://` fetch lỗi thì báo toast "Hãy mở qua server (py -m uvicorn ...) để export" và không export) + `window.__CARD_STATE__` + bootstrap gọi `renderCardHtml(state,{mode:'export'})` rồi `CardRuntime.init`.
- Thoát `</script>` trong nội dung inline.

## Tiêu chí đạt
- Export từ http mở độc lập: countdown, nhạc, gift modal, RSVP toast chạy.
- Không còn định nghĩa trùng `updateCountdown`/`toggleAudioPlayback` trong chuỗi template.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
