# T9 — Section story + video

- **Sub-agent**: `frontend-ui` · **Đợt**: 5 · **Phụ thuộc**: T7 · **Review**: không
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/sections/story.js`, `js/sections/video.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `.agents/rules/domain_security_storage.md`

## Việc cần làm
- `story`: tiêu đề + danh sách mốc `{date, title, text, image}` (thêm/xoá/sắp xếp trong inspector), hiển thị timeline dọc.
- `video`: URL YouTube (chuyển về `youtube-nocookie.com/embed/<id>`) hoặc MP4; tỉ lệ 16:9; URL không hợp lệ hiện khung báo.

## Tiêu chí đạt
- Đăng ký hợp lệ; thêm qua sidebar hiển thị đúng ở editor và export.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
