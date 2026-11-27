# T6 — Công cụ dựng Tailwind (AD-005)

**Sub-agent**: frontend-ui (viết tool/config/test) + phiên chính (tải CLI sau khi người dùng đồng ý, chạy tool) · **Đợt** 2 · **Review**: có

## Mục tiêu
Đặc tả §5 phần T6.

## Tệp được sửa (danh sách đóng)
`tools/build_tailwind.py`, `tools/tailwind.config.js`, `css/tailwind.css` (sinh ra), `server/tests/test_tailwind.py`, `.gitignore` (thêm `tools/bin/`).

## Tiêu chí đạt
- `py tools/build_tailwind.py` sinh `css/tailwind.css`; `--check` trả mã ≠ 0 khi nguồn đổi.
- Lớp Tailwind dùng trong `index.html`, `invite.html`, `js/**/*.js` (kể cả giá trị tuỳ ý `[...]`) có trong CSS; lớp dựng động được liệt kê ở safelist (báo cáo ghi các chỗ đã rà).
- Test so hash, không cần CLI.

## Không được làm
Không sửa HTML/JS ứng dụng (T7 làm).
