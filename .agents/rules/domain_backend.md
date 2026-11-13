# Luật Backend (`server/`)

## 1. Công nghệ
FastAPI + uvicorn + openpyxl + python-multipart. Chạy từ gốc repo:
```bash
py -m pip install -r server/requirements.txt
py -m uvicorn server.app:app --reload --port 8000
```
(`python` trên máy này trỏ sang Microsoft Store — dùng `py`.)

## 2. Bố cục
| Tệp | Nội dung |
|---|---|
| `server/app.py` | App FastAPI, route, validate, phục vụ tĩnh. Không chứa logic openpyxl. |
| `server/excel_store.py` | Toàn bộ đọc/ghi `.xlsx`, khoá luồng, tạo tệp + header. |
| `server/tests/test_api.py` | pytest + `fastapi.testclient`, dùng thư mục `data/` tạm (`tmp_path`, biến môi trường `THIEP_DATA_DIR`). |

Thư mục dữ liệu lấy từ `THIEP_DATA_DIR` (mặc định `<gốc repo>/data`).

## 3. Route
| Method | Đường dẫn | Ghi chú |
|---|---|---|
| GET | `/api/health` | `{"ok": true, "needCreateCode": <bool>}` — front-end dùng để biết có backend và có cần mã tạo thiệp |
| GET | `/api/cards/{slug}` | Trả state JSON (không kèm edit key). 404 nếu chưa có |
| PUT | `/api/cards/{slug}` | Body = state. Lần đầu: tạo, trả `{"editKey": "..."}`; khi bật mã tạo thiệp cần `X-Create-Code` đúng (sai/thiếu → 403) và tính vào giới hạn tạo 5 lần/3600 giây/IP (429). Sau đó cần `X-Edit-Key` (không cần mã, không tính giới hạn tạo) |
| POST | `/api/cards/{slug}/verify-key` | Header `X-Edit-Key`; giới hạn 10 lần/60 giây/IP (kind `verify`). Slug sai 400, không có thiệp 404, khoá thiếu/sai 403, đúng → `{"ok": true}` |
| POST | `/api/upload` | multipart `file` → `{"url": "/uploads/<tên>"}`. Khi bật mã: cần `X-Create-Code` đúng, hoặc `X-Card-Slug` + `X-Edit-Key` của thiệp có thật (nếu không → 403). Luôn kiểm hạn mức `uploads/` (vượt → 507) |
| POST | `/api/cards/{slug}/rsvp` | `{ten, sdt, so_nguoi, tham_du, ben, loi_nhan}` |
| POST | `/api/cards/{slug}/wishes` | `{ten, loi_chuc}` |
| GET | `/api/cards/{slug}/wishes` | Danh sách `{ten, loi_chuc, thoi_gian}` có `hien_thi` = TRUE, mới nhất trước, tối đa 200 |
| GET | `/api/cards/{slug}/export.xlsx` | Cần `X-Edit-Key` (hoặc `?key=`); tải RSVP + lời chúc của slug |
| GET | `/c/{slug}` | Trả `invite.html` |
| GET | `/uploads/*`, `/` và tệp tĩnh | Phục vụ tĩnh; **không** phục vụ `data/`, `server/`, `.agents/`, `.claude/`, `.git/` |

- Header tuỳ chỉnh: `X-Create-Code`, `X-Edit-Key`, `X-Card-Slug`.
- Lỗi trả `{"detail": "<thông điệp tiếng Việt>"}` với mã HTTP đúng (400, 403, 404, 413, 422, 429 quá tần suất, 507 hết hạn mức lưu trữ).
- IP client lấy qua hàm `client_ip(request)` dùng chung cho mọi giới hạn; `rate_check` nhận tham số cửa sổ `window` tuỳ chọn (3600 giây cho `create`).

### Cấu hình
`create_app(data_dir=None, rate_limit=10, rate_window=60.0, create_codes=None, upload_quota_mb=None, trust_cf=None)`; tham số `None` thì đọc biến môi trường:

| Biến | Ý nghĩa | Mặc định |
|---|---|---|
| `THIEP_DATA_DIR` | Thư mục dữ liệu | `<gốc repo>/data` |
| `THIEP_CREATE_CODES` | Danh sách mã tạo thiệp, ngăn bởi dấu phẩy, bỏ khoảng trắng/chuỗi rỗng | rỗng = tắt yêu cầu mã |
| `THIEP_UPLOAD_QUOTA_MB` | Hạn mức tổng dung lượng `uploads/` (MB, số nguyên > 0) | 2048 |
| `THIEP_TRUST_CF` | `1` = IP lấy từ header `CF-Connecting-IP` (strip, ≤ 64 ký tự, rỗng thì về `request.client.host`) | tắt |
- Pydantic model cho mọi body; giới hạn độ dài trường (tên ≤ 80, lời nhắn ≤ 500, SĐT ≤ 20, `so_nguoi` 1–20, `tham_du` bool, `ben ∈ {"nha_trai","nha_gai",""}`).
- State thiệp ≤ 2MB.

## 4. Excel (`data/guests.xlsx`)
| Sheet | Cột (thứ tự cố định) |
|---|---|
| `RSVP` | thoi_gian, slug, ten, sdt, so_nguoi, tham_du, ben, loi_nhan |
| `LoiChuc` | thoi_gian, slug, ten, loi_chuc, hien_thi |
| `KhachMoi` | slug, ten, sdt, ben, ghi_chu, link |

- `thoi_gian`: ISO 8601 giờ `Asia/Ho_Chi_Minh`.
- Một `threading.Lock` cấp module bọc trọn mỗi chu trình load → sửa → save; save ra tệp tạm rồi `os.replace`.
- Tệp/sheet chưa có thì tạo kèm header. Chỉ thêm cột vào cuối (Hiến pháp Điều 6).
- Ô bắt đầu bằng `= + - @` được thêm tiền tố `'` để chống công thức độc (CSV/Excel injection).
