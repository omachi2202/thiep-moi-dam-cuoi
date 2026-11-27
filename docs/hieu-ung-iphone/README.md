# Nhạc nền và hiệu ứng trên iPhone

Nhánh `fix/hieu-ung-iphone`. Đặc tả: `dac_ta_hieu_ung_iphone.md`.

Nhiệm vụ: trên iPhone (Zalo/Safari) thiệp phải có nhạc nền (phát ở lần chạm đầu khi không có phong bì), hoa rơi theo màn hình khi cuộn, và hiệu ứng nhẹ khi máy bật Giảm chuyển động.

| Mã | Việc | Sub-agent | Đợt | Review | Trạng thái |
|---|---|---|---|---|---|
| T1 | Luật runtime + backlog | memoryer | 1 | không | Đang làm |
| T2 | Runtime: nhạc lần chạm đầu, lớp hoa rơi cố định, chế độ nhẹ | frontend-ui | 1 | có | Đang làm |
| T3 | CSS: lớp hoa rơi cố định, reveal chỉ mờ, bỏ ẩn hoa | frontend-ui | 1 | không | Đang làm |

Sau đợt: `py tools/build_export_bundle.py`, autotest, reviewer-code (T2), inspector.

## Biên bản
