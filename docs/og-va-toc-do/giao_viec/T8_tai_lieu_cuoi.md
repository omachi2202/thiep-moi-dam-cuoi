# T8 — Tài liệu cuối đợt (sau T7)

**Sub-agent**: memoryer · **Đợt** 4 · **Review**: không

## Mục tiêu
Đưa tài liệu về trạng thái đã xong: Tailwind dựng sẵn đã thay CDN (T7, commit e0f985e), schema 8 chính thức, hook `shareImage`.

## Tệp được sửa (danh sách đóng)
- `CLAUDE.md`: bỏ các ghi chú "after T7", "once T2"; mục Running ghi Tailwind dựng sẵn `css/tailwind.css` (AD-005): sửa lớp Tailwind trong `index.html`/`invite.html`/`js/**` thì chạy `py tools/build_tailwind.py` (CLI v3.4.17 ở `tools/bin/`, git-ignore; `test_tailwind_fresh` báo nếu cũ), không sửa tay; schema 8; danh sách tệp cần chạy lại `build_export_bundle.py` thêm `css/tailwind.css`; hook tuỳ chọn `shareImage(sec)` cạnh `pageTitle`/`calendarEvent`.
- `.agents/rules/hard_constitution.md` Điều 2: thêm ngoại lệ AD-005 cạnh AD-003 (một gạch đầu dòng, không đổi các điều khác).
- `.agents/rules/domain_sections.md`: hook tuỳ chọn `shareImage(sec)` (hero trả `data.heroImage`), dùng qua `cardShareInfo(state)`.
- `.agents/rules/domain_workflow_testing.md`: lệnh `py tools/build_tailwind.py [--check]`, test `test_tailwind.py`, `test_fonts.py`, `test_invite_page.py`.
- `docs/backlog.md`: xoá mục "Tailwind Play CDN chưa ghim"; mục CSP: bỏ phần "cân nhắc build Tailwind tĩnh" (đã làm); thêm: link phông trang khách chèn bằng JS sau migrate (có thể nháy phông, cân nhắc server chèn sẵn), thử tay nhạc `preload="none"` trên iOS Safari.

## Không được làm
Không sửa mã; không sửa AD đã chốt.
