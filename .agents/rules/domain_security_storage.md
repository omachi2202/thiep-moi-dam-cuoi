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
