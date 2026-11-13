# Đặc tả & giao kèo: triển khai nhiều người dùng

## G1 — API (server ↔ front-end)

### Cấu hình (`create_app` + biến môi trường)
`create_app(data_dir=None, rate_limit=10, rate_window=60.0, create_codes=None, upload_quota_mb=None, trust_cf=None)`; tham số `None` → đọc env:
| Env | Ý nghĩa | Mặc định |
|---|---|---|
| `THIEP_CREATE_CODES` | Danh sách mã tạo thiệp, ngăn bởi dấu phẩy, bỏ khoảng trắng/chuỗi rỗng | rỗng = TẮT yêu cầu mã (hành vi như cũ) |
| `THIEP_UPLOAD_QUOTA_MB` | Hạn mức tổng dung lượng `uploads/` (MB, số nguyên > 0) | 2048 |
| `THIEP_TRUST_CF` | `1` → IP client lấy từ header `CF-Connecting-IP` (strip, ≤ 64 ký tự, rỗng thì về `request.client.host`) | tắt |

Không ghi log/không trả về mã tạo thiệp. So mã bằng `secrets.compare_digest` với từng mã (không dừng sớm theo nội dung).

### Header
`X-Create-Code`, `X-Edit-Key`, `X-Card-Slug`.

### Route
| Route | Thay đổi |
|---|---|
| `GET /api/health` | `{"ok": true, "needCreateCode": <bool>}` (`ok` giữ nguyên) |
| `PUT /api/cards/{slug}` (tạo mới — thiệp chưa tồn tại) | Nếu bật mã: thiếu/sai `X-Create-Code` → 403 `"Cần mã tạo thiệp hợp lệ."`. Giới hạn tạo mới 5 lần / 3600 giây / IP (kind `create`) → 429. Cập nhật thiệp có sẵn: như cũ (cần `X-Edit-Key`), không cần mã, không tính vào giới hạn tạo. |
| `POST /api/upload` | Nếu bật mã: hợp lệ khi (a) `X-Create-Code` đúng, hoặc (b) `X-Card-Slug` hợp lệ, thiệp tồn tại và `X-Edit-Key` đúng; ngược lại 403 `"Cần mã tạo thiệp hoặc khoá chỉnh sửa để tải tệp lên."`. Luôn (kể cả khi tắt mã) kiểm hạn mức: tổng kích thước tệp trong `uploads/` + tệp mới > quota → 507 `"Máy chủ đã hết dung lượng lưu tệp, vui lòng liên hệ quản trị."`. |
| `POST /api/cards/{slug}/verify-key` (mới) | Header `X-Edit-Key`. Giới hạn 10 / 60 giây / IP (kind `verify`, không phụ thuộc slug). Slug sai 400, thiệp không có 404, khoá thiếu/sai 403, đúng → 200 `{"ok": true}`. |

- `rate_check` nhận thêm tham số cửa sổ tuỳ chọn (`window`) để dùng 3600 giây cho `create`; IP lấy qua hàm `client_ip(request)` dùng chung cho mọi giới hạn.
- Mọi lỗi giữ dạng `{"detail": "<tiếng Việt>"}`.
- Không đổi Excel, không đổi định dạng `data/cards/*.json|.key`.

## G2 — Front-end
- localStorage: `thiep:createCode` (mã tạo thiệp người dùng nhập), `thiep:editKey:<slug>` (như cũ). Luôn try/catch.
- `api.needCreateCode` (bool) đọc từ `/api/health` khi khởi động.
- `request()` đã ném Error có `.status` — giữ nguyên.
- `api.publishCard(slug, state)`: gửi `X-Edit-Key` nếu có khoá; nếu không có khoá và có mã → gửi `X-Create-Code`.
- `api.uploadFile(file)`: gửi `X-Create-Code` nếu có; nếu không có mã nhưng có slug gần nhất (`thiep:lastSlug` hoặc khoá hiện tại đã lưu) kèm khoá → gửi `X-Card-Slug` + `X-Edit-Key`.
- Mới: `api.verifyKey(slug, key)` → `true` | ném Error (`.status`); `api.getCard(slug)` → state JSON.
- Modal Xuất bản (`index.html` + phần modal trong `js/api.js`):
  - Ô "Mã tạo thiệp" hiện khi `api.needCreateCode` và slug đang nhập chưa có khoá trong máy; lưu vào `thiep:createCode` khi xuất bản thành công lần đầu (hoặc khi nhập).
  - Khối mới "Mở thiệp đã xuất bản để sửa": ô slug + ô khoá chỉnh sửa + nút "Mở để sửa". Luồng: validate slug → `verifyKey` → `getCard` → `window.replaceState(state)` (đã có trong `js/store.js`, KHÔNG sửa store.js) → lưu khoá → điền slug vào ô xuất bản → toast "Đã mở thiệp <slug> để chỉnh sửa." → đóng modal. Lỗi 403 → "Khoá chỉnh sửa không đúng.", 404 → "Không tìm thấy thiệp.", 429 → thông điệp server. Nút khoá khi đang chạy, vùng chạm ≥ 44px, chữ tiếng Việt.
  - Không đưa khoá/mã vào URL.
- `js/editor.js` `uploadOrDataUrl`: lỗi có `status === 403` → nếu tệp ≤ 1,5MB dùng base64 + toast "Chưa có quyền tải lên máy chủ: nhập Mã tạo thiệp trong mục Xuất bản. Tạm nhúng ảnh vào thiệp."; > 1,5MB → toast từ chối như hiện có. `status === 507` → toast thông điệp server, dùng base64 nếu đủ nhỏ.
- Chạy `file://`: không có gì thay đổi (api.available = false).

## G3 — Docker
- `Dockerfile`: `python:3.12-slim`; `pip install --no-cache-dir -r server/requirements.txt`; COPY `server/`, `js/`, `css/`, `index.html`, `invite.html` (không copy `data/`, `docs/`, `.agents/`, `.claude/`, `.git/`, `tools/`, `server/tests/`); user không phải root; `ENV THIEP_DATA_DIR=/app/data`; `EXPOSE 8000`; `CMD ["uvicorn","server.app:app","--host","0.0.0.0","--port","8000","--workers","1"]`; HEALTHCHECK bằng python urllib gọi `/api/health`.
- `/app/data` phải ghi được bởi user trong container (tạo thư mục + chown).
- `.dockerignore` khớp danh sách trên + `__pycache__`, `.pytest_cache`, `*.pyc`, `.venv`.
- `docs/deploy.md` (tiếng Việt): build/run thử; đoạn service mẫu cho `portal/docker-compose.yml` (`build.context: ../personal/thiep_moi_dam_cuoi`, `ports: "127.0.0.1:8095:8000"`, `volumes: C:/dev/thiep_data:/app/data`, env `THIEP_CREATE_CODES`, `THIEP_TRUST_CF=1`, `THIEP_UPLOAD_QUOTA_MB`, `restart: unless-stopped`, healthcheck); dòng ingress Tunnel `hostname: <ten-mien> → http://127.0.0.1:8095` đặt TRƯỚC rule 404; lệnh `cloudflared tunnel route dns <tunnel> <ten-mien>`; cảnh báo: 1 worker, không bật `THIEP_TRUST_CF` khi không qua Cloudflare, sao lưu `C:/dev/thiep_data`, cấp lại khoá bằng xoá `.key`.
