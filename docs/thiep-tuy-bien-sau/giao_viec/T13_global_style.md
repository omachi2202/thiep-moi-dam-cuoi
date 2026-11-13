# T13 — Style toàn thiệp mới: state + điều khiển

- **Sub-agent**: `frontend-ui` · **Đợt**: 6 · **Phụ thuộc**: đợt 5 · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/state.js`, `index.html`, `js/editor.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`

## Việc cần làm
- Thêm khoá G5 vào `DEFAULT_STATE.globalStyle` + `migrate` (schemaVersion 3); thêm vào preset đã có.
- Sidebar trái: select cho bgTexture, frameStyle, cornerOrnament, revealAnimation, introStyle; fallingEffect thêm petals/snow/stars. `syncLeftControlsWithState` cập nhật.

- **Bổ sung sau T7**: `applyThemePreset` (`js/section_ops.js`) whitelist `fallingEffect` chỉ có hearts/sparkles/none, cần mở rộng theo G5 (petals/snow/stars) và nhận các khoá G5 mới. Được phép sửa đúng hàm này trong section_ops.js. Cần dọn 4 nút preset tĩnh trong index.html vì lưới preset giờ do `renderThemePresetGrid` vẽ.

## Tiêu chí đạt
- Đổi từng điều khiển → state đổi, undo được, reload còn.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
