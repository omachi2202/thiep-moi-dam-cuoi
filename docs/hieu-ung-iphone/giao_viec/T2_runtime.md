# T2 — Runtime: nhạc lần chạm đầu, lớp hoa rơi cố định, chế độ nhẹ

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có (reviewer-code)

## Mục tiêu
Đặc tả §1, §2 (phần T2), §3 (phần T2).

## Tệp được sửa (danh sách đóng)
`js/runtime.js` — chỉ trong `buildFalling`, `setupReveal`, `init` (nhánh `mode !== 'editor'`), và hàm nội bộ mới cho việc bắt lần chạm đầu.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_runtime_invite.md`, `domain_frontend.md`, `docs/hieu-ung-iphone/dac_ta_hieu_ung_iphone.md`.

## Tiêu chí đạt
- invite/export: `#fallingContainer` có lớp `fall-layer-fixed`; editor/preview không có.
- Không có intro: chạm/bấm đầu tiên ngoài nút nhạc phát nhạc (gọi `play()` đồng bộ trong handler); bấm nút nhạc giữ hành vi bật/tắt cũ, không bị phát 2 lần rồi tắt. Listener gỡ sau khi phát thành công và trong `destroy`.
- Có intro: không đổi hành vi (chạm trong overlay bị bỏ qua).
- Reduced motion: 6 cánh, 12–18 giây; reveal vẫn chạy qua IntersectionObserver và root có lớp `reveal-soft`.
- Mode editor: không đổi gì. Không rẽ nhánh theo `sec.type`. Script thường, không cú pháp `?.`/`??`.

## Lệnh tự kiểm (phiên chính chạy)
`node --check js/runtime.js`; `py tools/build_export_bundle.py`; `py -m pytest server/tests -q`.

## Không được làm
Không sửa tệp khác, không đổi markup HTML, không thêm toast.
