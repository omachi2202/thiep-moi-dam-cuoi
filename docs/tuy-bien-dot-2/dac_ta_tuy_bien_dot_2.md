# Đặc tả chung — tuỳ biến đợt 2 (phông chữ, phong bì, bố cục section cũ)

Giao kèo dùng chung cho T48–T52. Không phiếu nào được đổi giao kèo; cần đổi thì dừng và báo.

## 1. Phông chữ

Link Google Fonts DUY NHẤT, dùng giống hệt (từng ký tự) ở `index.html` (T50), `invite.html` (T49) và chuỗi export trong `js/editor.js` (T49).
Đã kiểm: trả 200, mọi phông mới đều có subset `vietnamese`.

```
https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Dancing+Script:wght@500;700&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Open+Sans:wght@400;600;700&family=Oswald:wght@400;600&family=Philosopher:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto+Slab:wght@400;600&family=Tinos:ital,wght@0,400;0,700;1,400&family=Alex+Brush&family=Allura&family=Beau+Rivage&family=Bonheur+Royale&family=Charm:wght@400;700&family=Corinthia:wght@400;700&family=Ephesis&family=Hurricane&family=Imperial+Script&family=Lobster&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Moon+Dance&family=Pacifico&family=Patrick+Hand&family=Pinyon+Script&family=Playball&family=Prata&family=Rokkitt:wght@400;600;700&family=Spectral:ital,wght@0,400;0,600;0,700;1,400&display=swap
```

`FONT_OPTIONS` (T49, `js/state.js`) thêm sau các mục cũ, theo nhóm (nhãn tiếng Việt có mô tả ngắn trong ngoặc):
- Viết tay mềm: `'Bonheur Royale', cursive`, `'Imperial Script', cursive`, `'Ephesis', cursive`, `'Alex Brush', cursive`, `'Allura', cursive`, `'Pinyon Script', cursive`, `'Corinthia', cursive`, `'Moon Dance', cursive`.
- Viết tay hiện đại: `'Playball', cursive`, `'Lobster', cursive`, `'Pacifico', cursive`, `'Charm', cursive`, `'Patrick Hand', cursive`, `'Beau Rivage', cursive`, `'Hurricane', cursive`.
- Có chân: `'Lora', serif`, `'Prata', serif`, `'Spectral', serif`, `'Rokkitt', serif`.
Giá trị đúng định dạng `'<Tên>', <generic>` như mục cũ (để `safeFont` nhận). Ô chọn phông toàn thiệp trong `index.html` nếu là danh sách tĩnh thì T50 thêm cùng giá trị; nếu sinh từ `FONT_OPTIONS` thì không cần.

## 2. Phong bì / màn mở (globalStyle)

| Khoá | Mặc định | Hợp lệ | Ý nghĩa |
|---|---|---|---|
| `envFlapColor` | `''` | `safeColor` hoặc `''` | màu nắp; rỗng = `primaryColor` |
| `envBodyColor` | `''` | `safeColor` hoặc `''` | màu thân/mặt trước; rỗng = `primaryColor` |
| `envCardImage` | `''` | `safeUrl` hoặc `''` | ảnh nhỏ trên tấm thiệp nhô ra khỏi phong bì |
| `envSeal` | `'heart'` | `heart|rings|monogram` | kiểu tem |
| `envMonogram` | `''` | chuỗi, cắt 4 ký tự | chữ trên tem khi `monogram`; rỗng → hiện tim |
| `introToText` | `''` | chuỗi, cắt 40 ký tự | rỗng = "Thiệp mời dành cho" |
| `introBtnText` | `''` | chuỗi, cắt 24 ký tự | rỗng = "Mở thiệp" |

- T49: thêm vào `DEFAULT_STATE.globalStyle`; `migrate` chuẩn hoá (kiểu sai → mặc định, cắt độ dài, `envSeal` qua `G5_OPTIONS` hoặc kiểm riêng); `SCHEMA_VERSION` = 7 và `DEFAULT_STATE.schemaVersion` = 7.
- T50 (`runtime.js` `setupIntro`): đặt biến CSS `--env-flap`, `--env-body` (đã qua `safeColor`, fallback màu chủ đạo); ảnh thiệp bằng `<img>` với `src = safeUrl(...)` (bỏ qua nếu rỗng) trong `.intro-env-card`; tem `heart` (FA `fa-heart`), `rings` (FA `fa-ring`), `monogram` (span chữ, `textContent`); chữ "dành cho" và nút qua `textContent`. Áp cho cả kiểu rèm phần chữ (`introToText`, `introBtnText`). `css/app.css`: nắp/thân dùng `var(--env-flap, var(--intro-color))` / `var(--env-body, var(--intro-color))`.
- Ô điều khiển (T50 viết trong `index.html`, cạnh `#select_introStyle`, chỉ cần hiện khi phong bì nhưng hiện luôn cũng được): `#env_flapColor`, `#env_bodyColor` (input color + nút "Theo màu chủ đạo" đặt `''`), `#env_cardImage` (ô URL + nút tải ảnh gọi `handleGlobalImageUpload(event, 'envCardImage', 'phong-bi')`), `#env_seal` (select), `#env_monogram` (maxlength 4), `#intro_toText` (maxlength 40), `#intro_btnText` (maxlength 24). Mọi ô gọi `updateGlobalStyle(key, value)`.
- T49 (`editor.js`): `async function handleGlobalImageUpload(event, key, label)` — như `handleGlobalBgUpload` nhưng ghi `updateGlobalStyle(key, url)` và chỉ nhận key trong danh sách cho phép `['envCardImage']`; `syncLeftControlsWithState()` đặt giá trị các ô trên (bỏ qua nếu phần tử không tồn tại; ô màu rỗng hiện `primaryColor`).

## 3. Bố cục section cũ (T51, T52)

Mỗi section khai báo danh sách bố cục trong chính tệp (mẫu `HERO_LAYOUTS` trong `hero.js`), `data.layout` mặc định = bố cục hiện tại, `migrate` riêng đưa giá trị lạ về mặc định, inspector có lưới chọn bố cục như hero. Bố cục mặc định phải render y hệt bản hiện tại.

| Section | Bố cục (key: nhãn) |
|---|---|
| family | `classic`: Cổ điển (hiện tại) · `split`: Tách đôi — ảnh chú rể & cô dâu hai bên, tên dưới mỗi ảnh, thêm `data.groomPhoto`, `data.bridePhoto` (mặc định ảnh unsplash, có ô URL + tải ảnh `handleLocalImageUpload(event, id, key)`; khung ảnh dùng `imageShapeClass(d.imageShape)` nếu có) · `traditional`: Thiệp in truyền thống — không ảnh, khung viền đôi, chữ căn giữa, chữ "Song Hỷ" hoặc biểu tượng nhẫn |
| events | `cards`: Thẻ (hiện tại) · `timeline`: Dòng thời gian dọc — đường dọc màu chủ đạo, chấm tròn có icon FA mỗi mốc · `carousel`: Thẻ lướt ngang — `overflow-x:auto; scroll-snap-type:x mandatory`, mỗi thẻ ~80% bề ngang; chỉ CSS, không JS |
| album | `grid`: Lưới (hiện tại) · `masonry`: So le — CSS `columns:2`, ảnh giữ tỉ lệ gốc · `feature`: 1 ảnh lớn + lưới nhỏ 3 cột |
| thanks | `classic`: Cổ điển (hiện tại) · `overlay`: Ảnh tràn nền, chữ đè trên lớp tối · `curved`: Ảnh mép cong dưới (border-radius elip lớn) + chữ ký |

Album thêm `mount(root, sec, ctx)`: khi `ctx.mode !== 'editor'`, bấm ảnh mở lớp xem phóng to (overlay tạo bằng DOM API, style inline, gắn trong `root`'s gần nhất là `root` hoặc `document.body` khi mode invite/export — preview gắn trong `root.closest('#weddingCardFrame') || root`); nút đóng (≥44px), bấm nền hoặc Esc để đóng, nút trước/sau; hàm dọn gỡ overlay + listener. Ảnh qua `safeUrl`.

## 4. Không được làm
- Không rẽ nhánh theo `sec.type`/`sec.id` ngoài tệp section. Không thêm thư viện. Không sửa `js/export_bundle.js` bằng tay.
- Ngoài phạm vi tệp của phiếu: dừng và báo.
