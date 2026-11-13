# Luật Runtime dùng chung & trang khách (`invite.html`)

## 1. `js/runtime.js`
- Xuất `window.CardRuntime = { init(rootEl, state, ctx), destroy() }`.
- `init` gắn: countdown, nút nhạc, hiệu ứng rơi (`hearts|petals|snow|stars|none`), modal mừng cưới + copy STK, intro phong bì/rèm, scroll-reveal, nút thêm vào lịch, rồi gọi `mount()` của từng section.
- `destroy` gỡ interval, observer, listener — editor gọi trước mỗi lần `init` lại để không rò rỉ timer.
- Trong `mode: 'editor'`: không chạy intro, không scroll-reveal (hiện đủ nội dung để chỉnh), không tự phát nhạc.
- Không đọc DOM editor (sidebar, inspector); chỉ làm việc trong `rootEl`.

## 2. Trang khách
- URL: `/c/<slug>?khach=<tên>`. `invite.html` lấy slug từ path, `GET /api/cards/<slug>`, `migrate()`, render `mode: 'invite'`.
- Không tìm thấy thiệp: hiện trang báo lỗi thân thiện tiếng Việt, không lộ chi tiết server.
- Tên khách: `decodeURIComponent`, cắt tối đa 60 ký tự, `escapeHtml`; thay `{khach}` trong mọi trường văn bản; mặc định "Quý khách". Tự điền vào ô tên RSVP/lời chúc.
- Intro (`globalStyle.introStyle`: `none|envelope|curtain`): bấm mở → ẩn intro + phát nhạc (để vượt chặn autoplay).

## 3. Lịch
- Google Calendar: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=<UTC>/<UTC>&location=…`.
- `.ics`: sinh bằng Blob phía client, `DTSTART/DTEND` theo UTC (giờ gốc là `Asia/Ho_Chi_Minh`), thời lượng mặc định 3 giờ, tên tệp `thiep-cuoi.ics`.

## 4. Gửi dữ liệu khách
- Chỉ qua `window.api.postRsvp/postWish/getWishes`.
- Chặn gửi lặp: khoá nút khi đang gửi; nhớ đã gửi trong `localStorage` (try/catch).
- Kiểm tra phía client: tên bắt buộc (≤ 80 ký tự), lời nhắn ≤ 500 ký tự, số người 1–20. Server vẫn kiểm lại.
- Hiển thị lời chúc: chỉ text đã escape, không HTML.

## 5. QR mừng cưới
VietQR: `https://img.vietqr.io/image/<bankBin|bankCode>-<acc>-compact2.png?accountName=<owner>`. Không gửi số tiền mặc định. Luôn có nút copy STK làm phương án dự phòng khi ảnh QR không tải được.
