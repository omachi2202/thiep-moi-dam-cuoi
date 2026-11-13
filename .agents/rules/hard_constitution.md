# Hiến pháp dự án Thiệp cưới online

Luật cứng, áp dụng cho mọi phiên và mọi sub-agent. Trái Hiến pháp thì dừng và báo, không tự lách.

## Điều 1. Ngôn ngữ
Chữ hiển thị trên giao diện, comment trong mã, tài liệu và báo cáo: tiếng Việt. Tên biến, hàm, khoá JSON: tiếng Anh hoặc tiếng Việt không dấu (giữ nhất quán với mã xung quanh).

## Điều 2. Không bước build
- Không npm, không bundler, không TypeScript, không ES module cần build. Mã front-end là `<script>` thường, gắn hàm/biến dùng chung vào `window`.
- Thư viện ngoài chỉ nạp qua CDN, ghi **phiên bản cố định** (vd `qrcode@1.5.3`). Không thêm thư viện khi tự viết được dưới ~50 dòng.
- Backend chỉ dùng các gói trong `server/requirements.txt`. Thêm gói mới phải được duyệt trong kế hoạch.

## Điều 3. Registry section
- Mỗi loại section là đúng 1 tệp `js/sections/<type>.js`, tự đăng ký bằng `registerSection({...})`.
- Cấm rẽ nhánh theo `sec.id` hoặc `sec.type` trong `render.js`, `editor.js`, `runtime.js`. Hành vi riêng của một loại nằm trong tệp của loại đó.
- `sec.id` là duy nhất (`<type>-<n>`), `sec.type` là khoá registry.

## Điều 4. Runtime dùng chung
Hành vi tương tác của thiệp (countdown, nhạc, hiệu ứng rơi, phong bì, modal mừng cưới, RSVP, lời chúc, scroll-reveal, lịch) chỉ viết một lần trong `js/runtime.js` (và `mount()` của section). Editor, `invite.html` và bản export HTML tĩnh đều dùng lại nó. Cấm sao chép logic vào chuỗi template.

## Điều 5. Thay đổi state
Mọi thay đổi `appState` đi qua mutator và kết thúc bằng `commitState(label)` (chụp snapshot undo, autosave, render). Không gán trực tiếp `appState` từ UI.

## Điều 6. Tương thích dữ liệu
- Đổi/thêm trường state phải cập nhật `DEFAULT_STATE`/`defaults` của section **và** `migrate()`, để JSON đã xuất, bản nháp localStorage và `data/cards/*.json` cũ vẫn mở được.
- Không đổi tên, không xoá cột/sheet trong `data/guests.xlsx`; chỉ thêm cột vào cuối.

## Điều 7. Chạy không cần backend
Mở `index.html` bằng `file://` vẫn chỉnh sửa và export được. Tính năng cần backend (xuất bản, upload, gửi RSVP/lời chúc) phải kiểm `window.api.available` và tắt/thay thế êm (ảnh dùng base64, form hiện toast).

## Điều 8. Toàn vẹn dữ liệu khách
- Mọi đọc/ghi `.xlsx` qua `server/excel_store.py`, bọc `threading.Lock`. Chỉ nối thêm dòng, không ghi đè dữ liệu RSVP/lời chúc.
- Ghi `data/cards/<slug>.json` theo kiểu ghi tệp tạm rồi `os.replace`.

## Điều 9. An toàn
- Slug khớp `^[a-z0-9-]{3,50}$`; chặn path traversal ở mọi đường dẫn tệp.
- API ghi/xuất thiệp yêu cầu `X-Edit-Key` đúng (so sánh bằng `secrets.compare_digest`).
- Upload ≤ 10MB, chỉ ảnh/audio, tên tệp do server sinh.
- Dữ liệu người dùng chèn vào HTML phải escape (`escapeHtml`) — đặc biệt tên khách `?khach=`, lời chúc, RSVP.
- Không commit `data/`, edit key, thông tin cá nhân của khách.

## Điều 10. Phạm vi và quyền
- Chỉ sửa tệp ghi trong phiếu được giao. Việc ngoài phiếu: dừng và báo.
- Không push, không merge vào `master`, không deploy khi người dùng chưa ra lệnh.
- Phiên chính chỉ điều phối, không sửa `index.html`, `invite.html`, `js/`, `css/`, `server/`.
