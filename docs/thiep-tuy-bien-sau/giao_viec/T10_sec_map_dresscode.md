# T10 — Section map + dresscode

- **Sub-agent**: `frontend-ui` · **Đợt**: 5 · **Phụ thuộc**: T7 · **Review**: không
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/sections/map.js`, `js/sections/dresscode.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `.agents/rules/domain_security_storage.md`

## Việc cần làm
- `map`: tiêu đề, địa chỉ, iframe `https://www.google.com/maps?q=<địa chỉ>&output=embed` (hoặc URL embed người dùng dán, chỉ domain cho phép), nút "Chỉ đường" mở Google Maps.
- `dresscode`: tiêu đề, ghi chú, danh sách màu swatch (color picker, thêm/xoá).

## Tiêu chí đạt
- Như T9.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
