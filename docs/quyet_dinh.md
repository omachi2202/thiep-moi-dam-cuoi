# Quyết định kiến trúc (AD)

## AD-001 — Registry section + runtime dùng chung, không bước build
- **Bối cảnh**: `index.html` 1 tệp, renderer rẽ nhánh theo `sec.id`, runtime bị nhân đôi trong chuỗi export.
- **Quyết định**: tách `css/`, `js/` thành script thường gắn `window`; mỗi loại section 1 tệp `js/sections/<type>.js` đăng ký qua `registerSection`; hành vi tương tác chỉ ở `js/runtime.js`, dùng chung cho editor, `invite.html`, export tĩnh. Giữ mô hình dựa trên section (không kéo-thả tự do).
- **Hệ quả**: thêm loại section = thêm 1 tệp + 1 thẻ script; state có `type`, `schemaVersion`, cần `migrate()`.

## AD-002 — Backend FastAPI, dữ liệu khách lưu Excel
- **Bối cảnh**: cần xuất bản thiệp theo link riêng, nhận RSVP/lời chúc, người dùng muốn mở dữ liệu bằng Excel.
- **Quyết định**: FastAPI phục vụ tĩnh + API; thiệp lưu `data/cards/<slug>.json`; khách lưu `data/guests.xlsx` (sheet RSVP, LoiChuc, KhachMoi) qua openpyxl dưới `threading.Lock`; quyền sửa thiệp bằng edit key.
- **Hệ quả**: chỉ chạy 1 tiến trình (khoá trong bộ nhớ); không phù hợp tải lớn — chuyển SQLite nếu cần mở rộng (AD mới).

## AD-003 — Bundle nguồn để export chạy ở file://
- **Bối cảnh**: Điều 7 yêu cầu export chạy khi mở `index.html` bằng `file://`; trình duyệt không cho JS đọc nguồn `.js/.css` ở `file://`, mà export cần nhúng nguyên văn chúng. Inspector REJECT điểm này; người dùng chọn phương án "cho phép script sinh tệp" (2026-11-13).
- **Quyết định**: `tools/build_export_bundle.py` (thư viện chuẩn Python) sinh `js/export_bundle.js` = `window.__EXPORT_SOURCES = { "<đường dẫn>": "<nội dung>" }` cho `css/app.css`, `js/state.js`, `js/api.js`, `js/runtime.js`, `js/sections/*.js`, `js/render.js`; `index.html` nạp nó. Export ưu tiên `fetch` (http), dùng bundle khi `file://`/fetch lỗi. Tệp sinh ra được commit, không sửa tay; pytest kiểm bundle khớp nguồn.
- **Hệ quả**: Điều 2 có một ngoại lệ có tên; sau mỗi lần sửa các tệp nguồn trên phải chạy `py tools/build_export_bundle.py`. Chạy lệnh sinh tệp không bị coi là sửa tay `js/` (Điều 10).

## AD-004 — Triển khai nhiều người dùng sau Cloudflare Tunnel
- **Bối cảnh**: ứng dụng cần mở cho nhiều người dùng thật qua Internet, trong khi máy chủ chạy trên máy cá nhân sau Cloudflare Tunnel. Trước đó `POST /api/upload` không cần khoá (nguy cơ đầy đĩa), ai cũng tạo được thiệp, IP client luôn là IP của Tunnel (rate limit vô nghĩa), và mất `localStorage` là mất quyền sửa thiệp (2026-11-14).
- **Quyết định**:
  - Chạy trong 1 container Docker, 1 worker uvicorn (khoá luồng chỉ có hiệu lực trong 1 tiến trình, AD-002). Host/subdomain riêng trỏ thẳng container qua Tunnel (không đặt dưới đường dẫn con vì ứng dụng dùng đường dẫn tuyệt đối). Dữ liệu gắn volume ở `C:/dev/thiep_data`, ngoài OneDrive.
  - Mã tạo thiệp `THIEP_CREATE_CODES` (danh sách, so bằng `secrets.compare_digest`, không log, không trả về); trống = tắt yêu cầu mã (dev/test). Tạo thiệp mới giới hạn 5 lần/giờ/IP.
  - Quyền upload: cần `X-Create-Code` hợp lệ, hoặc `X-Card-Slug` + `X-Edit-Key` của thiệp có thật (khi bật mã). Chưa có quyền thì editor dùng base64 nhỏ + toast hướng dẫn.
  - Hạn mức tổng `uploads/` bằng `THIEP_UPLOAD_QUOTA_MB` (mặc định 2048), vượt thì 507, kiểm cả khi tắt mã.
  - `THIEP_TRUST_CF=1` thì IP client lấy từ `CF-Connecting-IP`; chỉ bật khi thực sự đứng sau Cloudflare. Mọi giới hạn tần suất dùng chung hàm `client_ip(request)`.
  - Thêm `POST /api/cards/{slug}/verify-key` (10 lần/phút/IP) để editor "Mở thiệp đã xuất bản để sửa". Mất khoá chỉnh sửa: chỉ quản trị cấp lại: sinh khoá mới bằng `secrets.token_urlsafe(24)`, ghi hash SHA-256 hex của nó vào `data/cards/<slug>.key` (lệnh mẫu ở `docs/deploy.md`), gửi khoá cho chủ thiệp qua kênh riêng. Không xoá `.key` (thiếu `.key` thì PUT trả 403, không tạo khoá mới); không có luồng tự khôi phục.
- **Hệ quả**: giữ nguyên định dạng Excel và `data/cards/*.json|.key` (Điều 6). Vẫn một worker, không mở rộng ngang. Mã tạo thiệp đổi bằng biến môi trường + khởi động lại container. Ảnh upload chưa được dọn khi thiệp không còn dùng (xem backlog). Bật `THIEP_TRUST_CF` ngoài Cloudflare cho phép giả mạo IP, vượt giới hạn tần suất.

## AD-005 — Tailwind CSS dựng sẵn
- **Bối cảnh**: đo ngày 2026-11-27 trên trang khách, Tailwind Play CDN (`cdn.tailwindcss.com`) gây 302 + ~123KB JS, dịch CSS trên máy khách và chặn hiển thị; đồng thời chưa ghim phiên bản/SRI (xem backlog). Đây là nguyên nhân chậm số 1 trong `docs/og-va-toc-do/dac_ta_og_va_toc_do.md` §0.
- **Quyết định**: dùng Tailwind CLI standalone **v3.4.17** (khớp bản Play CDN đang chạy), không npm. `tools/build_tailwind.py` (thư viện chuẩn Python) gọi CLI với `tools/tailwind.config.js` (content: `index.html`, `invite.html`, `js/**/*.js`) sinh `css/tailwind.css` (minify, dòng đầu ghi hash nguồn); `--check` báo lệch. Tệp CLI đặt ngoài repo hoặc `tools/bin/` (git-ignore). `css/tailwind.css` được commit và KHÔNG sửa tay; pytest `test_tailwind_fresh` chỉ so hash nguồn (không cần CLI). `index.html`, `invite.html` nạp bằng `<link rel="stylesheet" href="/css/tailwind.css">`; export inline tệp này qua bundle (AD-003).
- **Hệ quả**: mở rộng ngoại lệ Điều 2 cùng kiểu AD-003 (có tên, một tool sinh tệp, tệp sinh được commit). Sửa lớp Tailwind trong HTML/JS thì phải chạy lại `py tools/build_tailwind.py`, nếu không pytest báo lệch. Lớp Tailwind dựng động phải nằm trong safelist. Bỏ phụ thuộc CDN Tailwind: trang khách nhanh hơn và chạy được khi CDN lỗi.
