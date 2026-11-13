# T8 — Client API + modal Xuất bản

- **Sub-agent**: `frontend-ui` · **Đợt**: 4 · **Phụ thuộc**: T2, T3 · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/api.js`, `index.html`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `.agents/rules/domain_security_storage.md`

## Việc cần làm
- `api.js` đầy đủ G2: `checkHealth()` gọi `/api/health` timeout 2s khi `location.protocol` là http(s), đặt `available`; chỉ phát sự kiện `api:ready`.
- `index.html`: nút "Xuất bản" (ẩn/khoá khi `!api.available`), modal: ô slug (gợi ý từ tên cô dâu chú rể, bỏ dấu, `^[a-z0-9-]{3,50}$`), nút xuất bản → `publishCard`; lần đầu hiện edit key + nhắc lưu lại; hiện link `/c/<slug>`, QR (`qrcodejs` qua cdnjs phiên bản cố định 1.0.0), ô "Tạo link cho khách" nhập tên → link `?khach=`, mẫu tin nhắn mời có nút copy.
- Logic modal đặt trong `api.js` (hàm `openPublishModal`) — không sửa editor.js.

## Tiêu chí đạt
- Có backend: xuất bản, mở link thấy đúng thiệp (sau T15). Sửa rồi xuất bản lại cùng slug dùng edit key lưu sẵn.
- file://: nút khoá, có tooltip giải thích.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
