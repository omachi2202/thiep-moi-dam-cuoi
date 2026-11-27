# Nhạc nền và hiệu ứng trên iPhone

Nhánh `fix/hieu-ung-iphone`. Đặc tả: `dac_ta_hieu_ung_iphone.md`.

Nhiệm vụ: trên iPhone (Zalo/Safari) thiệp phải có nhạc nền (phát ở lần chạm đầu khi không có phong bì), hoa rơi theo màn hình khi cuộn, và hiệu ứng nhẹ khi máy bật Giảm chuyển động.

| Mã | Việc | Sub-agent | Đợt | Review | Trạng thái |
|---|---|---|---|---|---|
| T1 | Luật runtime + backlog | memoryer | 1 | không | Đạt |
| T2 | Runtime: nhạc lần chạm đầu, lớp hoa rơi cố định, chế độ nhẹ | frontend-ui | 1 | có | Đạt |
| T3 | CSS: lớp hoa rơi cố định, reveal chỉ mờ, bỏ ẩn hoa | frontend-ui | 1 | không | Đạt |

Sau đợt: `py tools/build_export_bundle.py`, autotest, reviewer-code (T2), inspector.

## Biên bản

### 2026-11-27 — Đợt 1 (T1–T3)
- `node --check js/runtime.js` OK; `py tools/build_tailwind.py` (chỉ đổi hash nguồn vì runtime.js thuộc phạm vi băm; CSS không đổi) và `py tools/build_export_bundle.py` chạy lại; `py -m pytest server/tests -q`: 84 passed.
- Kiểm CDP (Chrome, 390×844, mobile + touch, autoplay cần thao tác người dùng), thiệp `du-va-mai`:

| Trường hợp | Bản cũ (khanhdu.store) | Bản mới |
|---|---|---|
| Lớp hoa rơi | `sticky`, cao 0 | `fixed`, 390×844 |
| Cánh hoa thấy được sau khi cuộn 1800px | 0/12 | 12/12 |
| Nhạc sau lần chạm đầu (không phong bì) | không phát | phát |
| Giảm chuyển động | 0 cánh hiện, reveal tắt | 6 cánh 12–18 giây, `reveal-soft` (chỉ mờ dần) |

- reviewer-code (T2): ĐẠT, không mục chặn. Gợi ý không chặn: gỡ listener ở `click` thay vì `touchend` khi chạm nút nhạc; trong editor khi máy bật Giảm chuyển động cũng thấy 6 cánh (đúng đặc tả §3).
- inspector: mã đạt 10 Điều; yêu cầu bổ sung biên bản này và không commit tệp ảnh chụp ở gốc repo — đã làm.
- Còn lại: kiểm tay trên iPhone thật sau deploy (`docs/backlog.md`).
