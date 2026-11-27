# T3 — CSS: lớp hoa rơi cố định, reveal chỉ mờ, bỏ ẩn hoa

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: không

## Mục tiêu
Đặc tả §2 (phần T3), §3 (phần T3).

## Tệp được sửa (danh sách đóng)
- `css/app.css`: thêm quy tắc `#fallingContainer.fall-layer-fixed` (đặc tả §2; phải thắng `#weddingCardFrame #fallingContainer { overflow: visible !important; }`); thay khối reduced-motion của reveal: phần tử reveal chưa hiện chỉ `opacity: 0; transform: none`, transition chỉ opacity — áp qua lớp `.reveal-soft` trên gốc (`.reveal-on.reveal-soft …`), trong `@media (prefers-reduced-motion: reduce)`.
- `css/invite.css`: bỏ `.petal { display: none; }` trong khối reduced-motion (xoá cả khối nếu rỗng, giữ comment hợp lý).

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_frontend.md`, `domain_sections.md` (mục hiệu ứng lặp), `docs/hieu-ung-iphone/dac_ta_hieu_ung_iphone.md`.

## Tiêu chí đạt
- Lớp cố định: `position: fixed`, rộng 100% tối đa 430px canh giữa, phủ chiều cao màn hình, `overflow: hidden`, `pointer-events: none`, `z-index: 40`.
- Editor (không có lớp `fall-layer-fixed`) hiển thị như cũ.
- Hiệu ứng lặp `loop-*` vẫn tắt khi reduced-motion.

## Lệnh tự kiểm (phiên chính chạy)
`py tools/build_export_bundle.py`; `py -m pytest server/tests -q`.

## Không được làm
Không sửa tệp khác, không sửa lớp Tailwind.
