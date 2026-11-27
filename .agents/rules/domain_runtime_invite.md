# Luật Runtime dùng chung & trang khách (`invite.html`)

## 1. `js/runtime.js`
- Xuất `window.CardRuntime = { init(rootEl, state, ctx), destroy() }`.
- `init` gắn: countdown, nút nhạc, hiệu ứng rơi (`hearts|petals|snow|stars|none`), modal mừng cưới + copy STK, intro phong bì/rèm, scroll-reveal, nút thêm vào lịch, rồi gọi `mount()` của từng section.
- `destroy` gỡ interval, observer, listener — editor gọi trước mỗi lần `init` lại để không rò rỉ timer.
- Trong `mode: 'editor'`: không chạy intro, không scroll-reveal (hiện đủ nội dung để chỉnh), không tự phát nhạc.
- `mode: 'preview'` (editor bật "Xem thực tế", `appState.isPreviewMode`): chạy như `invite` — intro phong bì/rèm, scroll-reveal, hiệu ứng rơi, thay `{khach}` bằng "Quý khách" — nhưng intro nằm GỌN TRONG khung điện thoại `#weddingCardFrame` (position absolute, không gắn vào body, không khoá cuộn body), nhạc chỉ phát sau khi bấm mở. `CardRuntime.replayIntro()` dựng lại intro (nút "Xem lại hiệu ứng mở"). Không có slug → form RSVP/lời chúc chỉ toast như export.
- Hoa rơi: ở `mode` `invite`/`export`, `init` thêm lớp `fall-layer-fixed` vào `#fallingContainer` (CSS trong `css/app.css`: `position: fixed`, rộng tối đa 430px, căn giữa, `overflow: hidden`) để cánh hoa theo màn hình khi cuộn, ổn định trên WebKit/iOS; mode khác gỡ lớp này.
- Giảm chuyển động (`prefers-reduced-motion: reduce`, kiểm `typeof window.matchMedia`): chạy nhẹ chứ không tắt — hoa rơi 6 cánh, `animationDuration` 12–18 giây; scroll-reveal vẫn dùng IntersectionObserver, thêm lớp `reveal-soft` vào `root` để chỉ mờ dần (không dịch chuyển); hiệu ứng lặp `loop-*` vẫn tắt.
- Không đọc DOM editor (sidebar, inspector); chỉ làm việc trong `rootEl`.

## 2. Trang khách
- URL: `/c/<slug>?khach=<tên>`. `invite.html` lấy slug từ path. Boot: nếu có `<script id="cardState" type="application/json">` (server chèn, xem `domain_backend.md` §3) thì `JSON.parse(textContent)` (lỗi coi như không có) và dùng luôn, **không** `fetch`; không có thì `GET /api/cards/<slug>` như cũ. Sau đó `migrate()`, render `mode: 'invite'`.
- Không chờ `checkHealth()` trước khi render: gọi song song. `window.api` giữ promise health; `postRsvp/postWish/getWishes` và form submit phải **đợi** promise này trước khi kết luận "không có backend" (khách bấm gửi sớm không bị lỗi).
- Phông trang khách: không có `<link>` Google Fonts cố định; boot chèn `<link rel="stylesheet" href="cardFontsUrl(state)">` vào `<head>` **trước** khi render (chỉ các họ phông thiệp dùng + `CARD_BASE_FONTS`). Giữ 2 `preconnect`.
- Nhạc: `<audio id="weddingAudio" loop preload="none">` (cả `invite.html` và chuỗi export) để không tranh băng thông với ảnh bìa; chỉ tải khi khách bấm mở/phát.
- Chia sẻ link: `appState.share = {title, description, image}` (schema 8) là dữ liệu suy ra; editor gán `cardShareInfo(appState)` (`js/runtime.js`) vào **bản sao** gửi đi khi xuất bản (không `commitState`, không tạo bước undo). `cardShareInfo` lấy ảnh từ hook tuỳ chọn `shareImage(sec)` của section hiển thị đầu tiên trả URL hợp lệ, không phải `data:` (hero trả `data.heroImage`); `title`/`description` không escape ở đây, server escape khi chèn HTML.
- Không tìm thấy thiệp: hiện trang báo lỗi thân thiện tiếng Việt, không lộ chi tiết server.
- Tên khách: `decodeURIComponent`, cắt tối đa 60 ký tự, `escapeHtml`; thay `{khach}` trong mọi trường văn bản; mặc định "Quý khách". Tự điền vào ô tên RSVP/lời chúc.
- Intro (`globalStyle.introStyle`: `none|envelope|curtain`): bấm mở → ẩn intro + phát nhạc (để vượt chặn autoplay).
- Nhạc khi không có phong bì/rèm (`introStyle = 'none'`): chỉ ở `mode` `invite`/`export` và có `audio.src`, nhạc phát ở lần chạm/bấm đầu tiên (`touchend` + `click` trên `document`, `{capture: true, passive: true}`; gọi `play()` đồng bộ trong handler). Chạm vào `#floatingMusicBtn` hoặc intro overlay thì bỏ qua lần đó (nút/intro tự xử lý). Gỡ listener sau khi `play()` thành công (bị từ chối thì giữ cho lần chạm sau) và khi `destroy()`; lỗi thì im lặng, không toast.
- Màn mở đọc thêm `globalStyle.envFlapColor`/`envBodyColor` (qua `safeColor`, rỗng = màu chủ đạo), `envCardImage` (qua `safeUrl`, dựng bằng `<img>`, rỗng thì bỏ qua), `envSeal` (`heart|rings|monogram`), `envMonogram` (≤4 ký tự), `introToText` (≤40), `introBtnText` (≤24). Mọi chữ chèn bằng `textContent`; áp cho cả phong bì và rèm.

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
