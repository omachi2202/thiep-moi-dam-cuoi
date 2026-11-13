# T12 — Section thanks + nâng cấp RSVP

- **Sub-agent**: `frontend-ui` · **Đợt**: 5 · **Phụ thuộc**: T7, T8 · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/sections/thanks.js`, `js/sections/rsvp.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `.agents/rules/domain_runtime_invite.md`, `.agents/rules/domain_security_storage.md`

## Việc cần làm
- `thanks`: ảnh + lời cảm ơn + chữ ký.
- `rsvp`: form tên, SĐT (tuỳ chọn), tham dự có/không, số người 1–20 (ẩn khi không), bên nhà trai/gái, ghi chú; `mount` gửi `api.postRsvp` khi có slug, không thì toast; tự điền tên từ `ctx.guestName`. Giữ nguyên các nút mừng cưới cũ và dữ liệu cũ (`migrate` riêng thêm trường thiếu).

## Tiêu chí đạt
- Gửi RSVP → có dòng mới trong `data/guests.xlsx` sheet RSVP.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
