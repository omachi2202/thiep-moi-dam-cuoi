# Đặc tả: ảnh xem trước khi chia sẻ link (Open Graph) + tăng tốc trang khách

Giao kèo chung cho các phiếu T1–T8. Phiếu nào lệch giao kèo phải ghi rõ trong báo cáo.

## 0. Nguyên nhân chậm (đo 2026-11-27 trên khanhdu.store, thiệp `du-va-mai`)

| # | Nguyên nhân | Số đo | Phiếu |
|---|---|---|---|
| 1 | Tailwind Play CDN: 302 + ~123KB JS (br), dịch CSS trên máy khách, chặn hiển thị | 302 + 123KB | T6, T7 |
| 2 | Google Fonts 30 họ phông: CSS 137KB / 308 `@font-face`, chặn hiển thị; thiệp chỉ dùng 4 | 137KB | T2, T4 |
| 3 | 20 JS + 2 CSS `Cache-Control: no-cache` → 22 lượt hỏi lại qua Tunnel mỗi lần mở | ~0,2 s/lượt | T3 |
| 4 | Chuỗi chờ: script → `GET /api/cards` → **chờ** `/api/health` → render → mới tải ảnh bìa | +2 lượt | T3, T4 |
| 5 | Nhạc 4,3MB `preload="auto"` tải ngay, giành băng thông | 5,5 s riêng nó | T4 |
| 6 | Ảnh dưới màn hình không `loading="lazy"` | 9 ảnh | T5 |

## 1. State: `appState.share` (schema 8) — T2

```js
share: { title: '', description: '', image: '' }   // DEFAULT_STATE; dữ liệu suy ra, editor tính lại mỗi lần xuất bản
```
- `SCHEMA_VERSION` = 8. `migrate`: `share` không phải object → `{title:'',description:'',image:''}`; mỗi khoá không phải chuỗi → `''`; cắt `title` ≤ 120, `description` ≤ 200, `image` ≤ 500 ký tự. Idempotent.
- Hook section mới (tuỳ chọn): `shareImage(sec)` → chuỗi URL ảnh hoặc `''`. `hero.js` trả `data.heroImage`.
- `js/runtime.js` thêm và gắn `window`:
  - `cardShareInfo(state)` → `{title, description, image}`:
    - `title` = `'THƯ MỜI TIỆC CƯỚI'` + (`cardPageTitle(state)` khác rỗng ? `' · ' + cardPageTitle(state)` : `''`).
    - `description` = các phần khác rỗng nối bằng `' · '`: giờ `HH:mm` và ngày `dd/MM/yyyy` từ `cardCalendarEvent(state).iso` (bỏ nếu iso rỗng/không hợp lệ), rồi `location`. Rỗng hết → `'Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi'`.
    - `image` = section hiển thị đầu tiên có `shareImage` trả URL mà `safeUrl` chấp nhận và **không** bắt đầu bằng `data:` (crawler không đọc được base64); không có → `''`.
    - Không chuỗi nào được escape ở đây (server escape khi chèn HTML). Cắt độ dài như migrate.
- `js/state.js` thêm và gắn `window`: `GOOGLE_FONT_SPECS` (map tên họ phông → spec, lấy đúng từ link Google Fonts hiện tại, vd `'Cormorant Garamond': 'Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400'`) và `cardFontsUrl(state)` → URL `https://fonts.googleapis.com/css2?family=…&family=…&display=swap` gồm: mọi họ phông xuất hiện dạng `'<Tên>'` trong `JSON.stringify(state)` **cộng** `CARD_BASE_FONTS` (họ phông viết cứng trong `css/app.css`, `css/invite.css`, `js/sections/*.js`, `js/runtime.js`, `invite.html` — phải grep đủ; tối thiểu có `Montserrat`). Thứ tự theo thứ tự khoá của `GOOGLE_FONT_SPECS`. Không có họ nào → vẫn trả URL với `CARD_BASE_FONTS`.

## 2. Trang `/c/{slug}` do server dựng — T3

Server đọc `invite.html` (cache theo mtime), đọc `data/cards/<slug>.json`:
- Thiệp không tồn tại → vẫn trả `invite.html` không chèn gì (trang tự báo "Không tìm thấy thiệp" như cũ), mã 200 như cũ. JSON hỏng → như thiệp không tồn tại.
- Chèn **ngay trước `</head>`** (chỉ lần xuất hiện đầu tiên):
  ```html
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Thiệp cưới online">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:url" content="{base}/c/{slug}">
  <meta property="og:image" content="{imageAbs}">          <!-- chỉ khi có ảnh -->
  <meta property="og:image:alt" content="{title}">         <!-- chỉ khi có ảnh -->
  <meta name="twitter:card" content="summary_large_image"> <!-- 'summary' khi không có ảnh -->
  <meta name="description" content="{description}">
  <link rel="preload" as="image" href="{imageAbs}" fetchpriority="high">   <!-- chỉ khi có ảnh -->
  <script id="cardState" type="application/json">{stateJson}</script>
  ```
- Thay nội dung `<title>…</title>` bằng `{title}` (đã escape).
- `title`/`description` lấy từ `state.share` (chuỗi, strip, cắt 120/200); rỗng → `'THƯ MỜI TIỆC CƯỚI'` / `'Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi'`. Escape bằng `html.escape(..., quote=True)`.
- `image`: chỉ nhận `^/uploads/[A-Za-z0-9_.-]{1,200}$` (→ `{base}` + đường dẫn) hoặc `https://` hợp lệ (≤ 500, không khoảng trắng, không `"<>`); khác → bỏ ảnh.
- `{base}`: biến môi trường `THIEP_PUBLIC_URL` (vd `https://khanhdu.store`, bỏ `/` cuối; chỉ nhận `http(s)://host[:port]`), tham số `create_app(public_url=None)`. Không đặt → `str(request.base_url)` bỏ `/` cuối; khi `trust_cf` bật và header `X-Forwarded-Proto: https` thì ép scheme `https`.
- `stateJson` = `json.dumps(state, ensure_ascii=False, separators=(',',':'))` rồi thay `<` → `<`, `>` → `>`, `&` → `&`, ` `/` ` → dạng escape. Không bao giờ chèn chuỗi thô.
- `Cache-Control: no-cache` cho trang (như cũ).

### 2b. Đánh phiên bản JS/CSS — T3
- Khi trả `index.html` và `/c/{slug}`: mọi `src="/js/<path>"` và `href="/css/<path>"` (không có `?`) được thêm `?v=<8 ký tự hex đầu của sha256 nội dung tệp>`; tệp không tồn tại thì để nguyên. Hash cache theo (đường dẫn, mtime, size).
- `/js`, `/css`: request có `v` **trùng** hash hiện tại → `Cache-Control: public, max-age=31536000, immutable`; không có `v` hoặc lệch → `no-cache` (như cũ). Giữ `X-Content-Type-Options: nosniff`.

## 3. `invite.html` + api + editor — T4
- Boot: nếu có `#cardState` → `JSON.parse(textContent)` (lỗi → coi như không có) và dùng luôn, **không** `fetch`; không có → `fetch('/api/cards/<slug>')` như cũ.
- Không chờ `checkHealth()` trước khi render: gọi song song. `window.api` (trong `js/api.js`) giữ promise health; `postRsvp/postWish/getWishes` và form submit phải **đợi** promise này trước khi kết luận "không có backend" (không còn lỗi khi khách bấm gửi quá sớm).
- Phông: bỏ `<link>` Google Fonts 30 họ trong `invite.html`; boot chèn `<link rel="stylesheet" href="cardFontsUrl(state)">` vào `<head>` **trước** khi render. Giữ 2 `preconnect`.
- `<audio id="weddingAudio" loop preload="none">` trong `invite.html` và trong chuỗi export ở `js/editor.js`.
- `document.title`: giữ logic cũ (server đã đặt tiêu đề OG, boot ghi đè bằng `'Thiệp Cưới ' + pageName` như cũ là chấp nhận được).
- Editor, khi xuất bản: trước khi gọi `api.publishCard`, gán `share` bằng `cardShareInfo(appState)` vào **bản sao** gửi đi (không dùng `commitState`, không tạo bước undo; Hiến pháp Điều 5 không áp dụng vì không đổi `appState` UI). Cách làm: `publishCard` trong `api.js` nhận state; editor truyền `Object.assign({}, appState, { share: cardShareInfo(appState) })`.
- Editor và export giữ link Google Fonts đầy đủ như cũ.

## 4. Ảnh lười tải — T5
- `<img>` trong album, family, thanks, slideshow: thêm `loading="lazy" decoding="async"`. Slideshow: ảnh đầu tiên giữ `loading="eager"`.
- Ảnh bìa hero (T2): thêm `fetchpriority="high" decoding="async"`, không lazy.

## 5. Tailwind dựng sẵn — T6, T7 (đợt 2, AD-005)
- Tailwind standalone CLI **v3.4.17** (khớp bản Play CDN đang chạy), tệp chạy đặt ngoài repo hoặc trong `tools/bin/` (git-ignore), không npm.
- `tools/build_tailwind.py` (thư viện chuẩn): gọi CLI với `tools/tailwind.config.js` (content: `index.html`, `invite.html`, `js/**/*.js`; safelist các lớp dựng động nếu có), sinh `css/tailwind.css` (minify) có dòng đầu ghi hash nguồn; `--check` báo lệch.
- pytest `test_tailwind_fresh`: hash nguồn trong `css/tailwind.css` khớp nội dung hiện tại (giống `test_export_bundle_fresh`); bỏ qua nếu không có CLI thì KHÔNG được — test chỉ so hash, không cần CLI.
- T7: `index.html`, `invite.html` thay `<script src="https://cdn.tailwindcss.com">` bằng `<link rel="stylesheet" href="/css/tailwind.css">`; export inline `css/tailwind.css` qua bundle (`tools/build_export_bundle.py` thêm tệp vào danh sách) thay cho CDN trong chuỗi export.
