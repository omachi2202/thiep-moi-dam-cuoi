# Luật An toàn & Lưu trữ

## 1. Thiệp (`data/cards/`)
- `data/cards/<slug>.json`: state đã xuất bản. `data/cards/<slug>.key`: edit key (hash SHA-256, không lưu bản rõ).
- Slug khớp `^[a-z0-9-]{3,50}$`; đường dẫn tệp dựng bằng `Path(data_dir) / "cards" / f"{slug}.json"` sau khi validate, rồi kiểm `resolve()` vẫn nằm trong `data_dir`.
- Edit key: `secrets.token_urlsafe(24)`, trả một lần khi tạo. So sánh hash bằng `secrets.compare_digest`.
- Front-end lưu edit key trong `localStorage` theo khoá `thiep:editKey:<slug>`; hiện cho người dùng sao lưu khi xuất bản lần đầu.

## 2. Upload (`data/uploads/`)
- ≤ 10MB (đọc theo khối, dừng khi vượt → 413).
- Chỉ nhận `image/jpeg|png|webp|gif` và `audio/mpeg|mp4|ogg|wav`; kiểm cả phần mở rộng lẫn chữ ký đầu tệp (magic bytes). Không nhận SVG/HTML.
- Tên tệp do server sinh: `<uuid4 hex>.<ext>`. Phục vụ với `X-Content-Type-Options: nosniff`.
- Quyền upload (khi bật mã tạo thiệp): `X-Create-Code` đúng, hoặc `X-Card-Slug` hợp lệ + thiệp tồn tại + `X-Edit-Key` đúng; ngược lại 403. Không có quyền thì front-end dùng base64 ≤ 1,5MB.
- Hạn mức: tổng kích thước `uploads/` + tệp mới > `THIEP_UPLOAD_QUOTA_MB` (mặc định 2048) → 507. Kiểm cả khi tắt mã.

## 2b. Mã tạo thiệp và IP thật
- Mã tạo thiệp (`THIEP_CREATE_CODES`): so bằng `secrets.compare_digest` với từng mã (không dừng sớm theo nội dung); không ghi log, không trả về trong response/lỗi, không commit. Trống = tắt yêu cầu mã (chỉ dành cho dev/test).
- Giới hạn tần suất theo IP trong bộ nhớ: tạo thiệp mới 5 lần/giờ/IP, `verify-key` 10 lần/phút/IP (không phụ thuộc slug).
- `THIEP_TRUST_CF=1` (IP lấy từ `CF-Connecting-IP`) chỉ được bật khi server thật sự nằm sau Cloudflare/Tunnel; nếu không, client tự đặt header để giả IP và vượt giới hạn. Mọi giới hạn dùng chung `client_ip(request)`.
- Mất edit key: chỉ quản trị cấp lại: sinh khoá mới bằng `secrets.token_urlsafe(24)`, ghi hash SHA-256 hex của nó vào `data/cards/<slug>.key` (lệnh mẫu ở `docs/deploy.md`), gửi khoá cho chủ thiệp qua kênh riêng. Không xoá `.key` (thiếu `.key` thì PUT trả 403); không có API khôi phục.

## 3. Dữ liệu khách
- RSVP/lời chúc chứa thông tin cá nhân: không ghi log nội dung, không commit `data/`.
- Endpoint công khai (`rsvp`, `wishes`) giới hạn tần suất đơn giản theo IP trong bộ nhớ (vd 10 lần/phút/slug).
- `export.xlsx` chỉ trả dữ liệu của đúng slug, cần edit key.

## 4. Front-end
- `escapeHtml` cho mọi dữ liệu người dùng/khách trước khi chèn HTML; URL người dùng nhập (ảnh, map, video) chỉ chấp nhận `http(s):`, `data:image/`, `/uploads/` — chặn `javascript:`.
- Iframe nhúng (map, YouTube) chỉ từ `www.google.com/maps`, `maps.google.com`, `www.youtube.com/embed`, `www.youtube-nocookie.com`.
- Không đưa edit key vào URL chia sẻ hoặc state thiệp.

## 5. Bản nháp trình duyệt
- Khoá `thiep:draft` (state) và `thiep:draft:savedAt`; chỉ ghi khi state hợp lệ, bọc try/catch, bỏ qua lỗi hết quota (báo toast một lần).
