# Đặc tả: nhạc nền và hiệu ứng trên iPhone

Giao kèo chung cho T1–T3.

## 0. Nguyên nhân (2026-11-27, thiệp `du-va-mai`, iPhone qua Zalo/Safari)

| # | Nguyên nhân | Chỗ trong mã |
|---|---|---|
| 1 | `introStyle = 'none'` nên không có cú bấm "Mở thiệp"; iOS chặn `audio.play()` khi chưa có thao tác người dùng → nhạc im | `js/runtime.js` (`playAudio` chỉ gọi trong `setupIntro`/nút nhạc) |
| 2 | Lớp hoa rơi `#fallingContainer` là `sticky top-0 h-0` trong khung `overflow-hidden`, nhờ `overflow: visible !important` mới thấy trên Chrome; không ổn định trên WebKit và không theo màn hình khi cuộn | `invite.html:42`, `css/app.css` (dòng `#weddingCardFrame #fallingContainer`) |
| 3 | `prefers-reduced-motion: reduce` → ẩn hẳn `.petal` và bỏ reveal | `css/invite.css` §Giảm chuyển động, `setupReveal` |

## 1. Nhạc phát ở lần chạm đầu — T2
- Chỉ khi `mode === 'invite'` hoặc `mode === 'export'` (không `editor`, không `preview`) và có `audio.src`.
- Trong `init`, sau khi gán `audio.src`: gắn listener một lần trên `document` cho `touchend` và `click` (`{ capture: true, passive: true }`).
- Handler: nếu sự kiện nằm trong `#floatingMusicBtn` (dùng `closest`) → bỏ qua lần này (nút tự xử lý bật/tắt) nhưng gỡ listener; nếu nằm trong intro overlay → bỏ qua (intro tự phát nhạc). Nếu `audio.paused` → `playAudio(true)`. Gọi `play()` đồng bộ trong handler (iOS yêu cầu).
- Gỡ listener ngay sau lần gọi `play()` thành công; nếu `play()` bị từ chối thì giữ listener cho lần chạm sau. Khi `destroy()` luôn gỡ (đẩy hàm gỡ vào `_cleanups`).
- Không toast khi lỗi (silent).

## 2. Lớp hoa rơi cố định — T2 + T3
- T2: trong `init`, khi `mode` là `invite` hoặc `export`, thêm lớp `fall-layer-fixed` vào `#fallingContainer`. Mode khác: gỡ lớp này.
- T3 (`css/app.css`, vì export chỉ inline app.css):
  ```css
  #fallingContainer.fall-layer-fixed {
      position: fixed; top: 0; bottom: 0; left: 50%;
      width: 100%; max-width: 430px; height: auto;
      transform: translateX(-50%);
      overflow: hidden !important; pointer-events: none; z-index: 40;
  }
  ```
  Cánh hoa `.petal` giữ keyframes `fall` (theo `vh`) — trong lớp cố định chúng rơi suốt chiều cao màn hình và không bị cuộn trôi đi. Quy tắc `#weddingCardFrame #fallingContainer { overflow: visible !important; }` giữ cho editor nhưng không được thắng `.fall-layer-fixed` (selector `#weddingCardFrame #fallingContainer.fall-layer-fixed` nếu cần độ ưu tiên).

## 3. Giảm chuyển động: chạy nhẹ — T2 + T3
- T2: `const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches` (bọc kiểm `typeof window.matchMedia`).
  - `buildFalling`: khi `reduce` → 6 cánh, `animationDuration` 12–18 giây; ngược lại như cũ (12 cánh, 6–13 giây).
  - `setupReveal`: khi `reduce` vẫn dùng IntersectionObserver như thường, thêm lớp `reveal-soft` vào `root`. Chỉ khi không có `IntersectionObserver` mới hiện ngay.
- T3:
  - `css/invite.css`: bỏ quy tắc `.petal { display: none; }` trong media reduced-motion.
  - `css/app.css`: thay khối reduced-motion của reveal bằng: dưới `@media (prefers-reduced-motion: reduce)`, các phần tử reveal chưa hiện chỉ `opacity: 0`, `transform: none`; transition chỉ `opacity 0.8s ease`. Áp cho `.reveal-soft` và giữ được khi media không khớp (lớp chỉ được thêm khi reduce). Hiệu ứng lặp `loop-*` vẫn tắt như cũ.

## 4. Không đổi
Schema state, API, Excel, editor (mode `editor`/`preview` giữ hành vi cũ), markup `invite.html`/`index.html`/chuỗi export.
