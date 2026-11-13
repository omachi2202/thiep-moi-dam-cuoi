# Quyết định kiến trúc (AD)

## AD-001 — Registry section + runtime dùng chung, không bước build
- **Bối cảnh**: `index.html` 1 tệp, renderer rẽ nhánh theo `sec.id`, runtime bị nhân đôi trong chuỗi export.
- **Quyết định**: tách `css/`, `js/` thành script thường gắn `window`; mỗi loại section 1 tệp `js/sections/<type>.js` đăng ký qua `registerSection`; hành vi tương tác chỉ ở `js/runtime.js`, dùng chung cho editor, `invite.html`, export tĩnh. Giữ mô hình dựa trên section (không kéo-thả tự do).
- **Hệ quả**: thêm loại section = thêm 1 tệp + 1 thẻ script; state có `type`, `schemaVersion`, cần `migrate()`.

## AD-002 — Backend FastAPI, dữ liệu khách lưu Excel
- **Bối cảnh**: cần xuất bản thiệp theo link riêng, nhận RSVP/lời chúc, người dùng muốn mở dữ liệu bằng Excel.
- **Quyết định**: FastAPI phục vụ tĩnh + API; thiệp lưu `data/cards/<slug>.json`; khách lưu `data/guests.xlsx` (sheet RSVP, LoiChuc, KhachMoi) qua openpyxl dưới `threading.Lock`; quyền sửa thiệp bằng edit key.
- **Hệ quả**: chỉ chạy 1 tiến trình (khoá trong bộ nhớ); không phù hợp tải lớn — chuyển SQLite nếu cần mở rộng (AD mới).
