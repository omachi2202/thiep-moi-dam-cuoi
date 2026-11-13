# T14 — Áp texture/khung/ornament/reveal + override nền section

- **Sub-agent**: `frontend-ui` · **Đợt**: 6 · **Phụ thuộc**: đợt 5 · **Review**: không
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/render.js`, `css/app.css`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`

## Việc cần làm
- Áp lớp G5 lên `#weddingCardFrame` (và gốc trang khách qua `renderCardHtml` bọc wrapper `.card-root`).
- Wrapper mỗi section áp `sec.style` (G5): nền màu/ảnh + overlay, padding, align, lớp reveal, ornament trên/dưới (SVG inline trong CSS, không tệp ảnh ngoài).
- Inspector: nhóm gập "Nền & Trang trí" chung cho mọi section (render.js, không trong tệp section).
- CSS: texture bằng gradient/SVG data URI; `reveal-*:not(.is-visible)` chỉ ẩn khi có lớp `.reveal-on` trên gốc (editor không có lớp này).

## Tiêu chí đạt
- Đổi texture/khung/nền section thấy ngay trên canvas; editor không bị ẩn nội dung.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
