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
| GET | `/api/health` | `{"ok": true}` — front-end dùng để biết có backend |
| GET | `/api/cards/{slug}` | Trả state JSON (không kèm edit key). 404 nếu chưa có |
| PUT | `/api/cards/{slug}` | Body = state. Lần đầu: tạo, trả `{"editKey": "..."}`. Sau đó cần `X-Edit-Key` |
| POST | `/api/upload` | multipart `file` → `{"url": "/uploads/<tên>"}` |
| POST | `/api/cards/{slug}/rsvp` | `{ten, sdt, so_nguoi, tham_du, ben, loi_nhan}` |
| POST | `/api/cards/{slug}/wishes` | `{ten, loi_chuc}` |
| GET | `/api/cards/{slug}/wishes` | Danh sách `{ten, loi_chuc, thoi_gian}` có `hien_thi` = TRUE, mới nhất trước, tối đa 200 |
| GET | `/api/cards/{slug}/export.xlsx` | Cần `X-Edit-Key` (hoặc `?key=`); tải RSVP + lời chúc của slug |
| GET | `/c/{slug}` | Trả `invite.html` |
| GET | `/uploads/*`, `/` và tệp tĩnh | Phục vụ tĩnh; **không** phục vụ `data/`, `server/`, `.agents/`, `.claude/`, `.git/` |

- Lỗi trả `{"detail": "<thông điệp tiếng Việt>"}` với mã HTTP đúng (400, 403, 404, 413, 422).
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
