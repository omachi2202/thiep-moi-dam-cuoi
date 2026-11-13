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
