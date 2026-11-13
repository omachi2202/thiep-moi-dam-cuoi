# T11 — Section wishes + gift (VietQR)

- **Sub-agent**: `frontend-ui` · **Đợt**: 5 · **Phụ thuộc**: T7, T8 · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/sections/wishes.js`, `js/sections/gift.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `.agents/rules/domain_runtime_invite.md`, `.agents/rules/domain_security_storage.md`

## Việc cần làm
- `wishes`: form (tên, lời chúc ≤ 500) + tường lời chúc; `mount` gọi `api.getWishes`/`api.postWish` khi `ctx.slug` và `api.available`, editor hiện 3 lời chúc mẫu; chống gửi lặp (domain_runtime_invite §4).
- `gift`: 2 thẻ nhà trai/nhà gái từ `appState.bankInfo`, ảnh VietQR (domain_runtime_invite §5), nút copy STK, ảnh lỗi thì ẩn QR giữ STK.

## Tiêu chí đạt
- Lời chúc gửi lên xuất hiện trên tường; nội dung có `<script>` hiển thị dạng chữ.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
