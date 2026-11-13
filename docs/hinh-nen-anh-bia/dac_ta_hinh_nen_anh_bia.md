# Đặc tả & giao kèo: Hình nền tổng thể + style ảnh bìa

## G1 — Schema v5 (`js/state.js`, T26)
- `SCHEMA_VERSION = 5`, `DEFAULT_STATE.schemaVersion = 5`.
- `DEFAULT_STATE.globalStyle` thêm: `bgImage: ''`, `bgImageOverlay: 0`, `bgImageFit: 'cover'`.
- `G5_OPTIONS.bgImageFit = ['cover', 'repeat']` (để `migrate` và `updateGlobalStyle` tự khoá whitelist).
- `migrate()`: `bgImage` không phải chuỗi → `''`; `bgImageOverlay` → số, không hữu hạn → 0, kẹp [0, 0.9]. Idempotent.
- `THEME_PRESETS.moss`: label `'Xanh rêu & vàng'`, desc `'Sang trọng & Cổ điển'`, scriptFont `"'Great Vibes', cursive"`, headingFont `"'Cormorant Garamond', serif"`, bodyFont `"'Cormorant Garamond', serif"`, primaryColor `'#1f3d2b'`, bgColor `'#f5f0e6'`, textColor `'#2a2f27'`, fallingEffect `'none'`, bgTexture `'paper'`, frameStyle `'none'`, cornerOrnament `'leaf'`. Không có khoá `bgImage*`/`layout`.
- `safeCssImageUrl(u)` chuyển từ `render.js` sang `state.js` (giữ nguyên thân hàm, gắn `window.safeCssImageUrl`). T28 xoá bản cũ trong `render.js`. (Trong lúc chờ T28, khai báo hàm trùng tên ở hai tệp script thường vẫn chạy: bản nạp sau thắng, thân giống nhau.)

## G2 — Helper nền khung (`js/state.js`, T26)
```js
// Trả object biến CSS cho #weddingCardFrame; mọi giá trị đã sạch
cardBgVars(g) -> {
  '--card-bg-image':  'url("<safeCssImageUrl(g.bgImage)>")' | 'none',
  '--card-bg-veil':   'rgba(255,255,255,<op>)',   // op = kẹp(g.bgImageOverlay, 0, 0.9); không có ảnh → 0
  '--card-bg-size':   'cover' | 'auto',           // bgImageFit 'repeat' → 'auto'
  '--card-bg-repeat': 'no-repeat' | 'repeat'
}
cardBgStyleText(g) -> '--card-bg-image:…;--card-bg-veil:…;--card-bg-size:…;--card-bg-repeat:…'
// dùng cho thuộc tính style= trong chuỗi HTML; người gọi vẫn escapeHtml
```
Cả hai gắn `window`. `g` thiếu/sai kiểu → dùng `DEFAULT_STATE.globalStyle`. Áp lên phần tử bằng `el.style.setProperty(k, v)`.

## G3 — CSS chồng lớp (`css/app.css`, T28)
- `#weddingCardFrame`: `background-image: linear-gradient(var(--card-bg-veil, transparent), var(--card-bg-veil, transparent)), var(--card-bg-image, none); background-size: auto, var(--card-bg-size, cover); background-repeat: no-repeat, var(--card-bg-repeat, no-repeat); background-position: center top;` Màu nền vẫn là `background-color` inline.
- Mỗi `#weddingCardFrame.tex-*`: lớp texture TRƯỚC (trên cùng), rồi lớp veil, rồi `var(--card-bg-image)`; khai báo đủ `background-size`/`background-repeat` cho từng lớp (số lớp cố định).
- Section có `style.bgColor/bgImage` (inline trên `.wedding-section`) tự che nền khung — không cần đổi.

## G4 — Hàm editor (`js/editor.js`, T29)
- `handleGlobalBgUpload(event)`: `uploadOrDataUrl(file)` → `updateGlobalStyle('bgImage', url)` → toast "Đã đặt hình nền thiệp!"; lỗi có `err.handled` thì không toast thêm, lỗi khác toast "Không tải được ảnh, vui lòng thử lại.".
- `handleSectionBgUpload(event, secId)`: `uploadOrDataUrl(file)` → `setSectionDecor(secId, 'bgImage', url)` → toast "Đã đặt ảnh nền cho phần này!". Gắn `window`.
- T28 gọi trong `render.js` (khối "Nền & Trang trí", dưới ô link ảnh nền): `<label>` nút "Tải ảnh từ máy tính" (cùng kiểu nút ở inspector hero) chứa `<input type="file" accept="image/*" class="hidden" onchange="handleSectionBgUpload(event, '${sid}')">`.

## G5 — Hero `layout` (`js/sections/hero.js` + cuối `css/app.css`, T27)
- `defaults()` thêm: `layout: 'classic'`, `monogram: 'T & N'`, `inviteLine: 'Trân trọng kính mời bạn đến chung vui cùng gia đình chúng mình'`, `weekday: 'Thứ Bảy'`, `timeText: '17:00'`, `venueText: 'Tư gia nhà gái · Cẩm Lý, Lục Nam, Bắc Giang'`, `closingNote: 'Sự hiện diện của bạn là niềm vinh hạnh của chúng mình!'`.
- `migrate(data)`: `layout` ngoài `['classic','fade','arch','fullscreen']` → `'classic'`. Trường khác do migrate chung bù từ defaults.
- Danh sách kiểu khai báo trong `hero.js` (`HERO_LAYOUTS`), không ở `render.js`/`editor.js`.
- `classic`: HTML hiện tại, không đổi.
- `fade` (mẫu Aline): ảnh tràn viền tỉ lệ 4:5, `mask-image` + `-webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent)` để mờ vào nền khung (thấy cả ảnh nền tổng thể). Phần trên ảnh (đè lên ảnh, chữ màu `secColor`, text-shadow sáng nhẹ để đọc được): `inviteLine`, `tagline`, `coupleShortName` font thư pháp cỡ lớn. Dưới ảnh: khối 3 cột ngăn bằng vạch mảnh màu `pc`: (1) `weekday` + `dateDisplay`, (2) `timeText` + `venueText`, (3) `closingNote` font thư pháp nhỏ. Dưới cùng `subNote`.
- `arch` (mẫu Sophia): khối trên nền `pc`, chữ kem vàng `#efe3c4`: `monogram` (viền tròn/vạch mảnh), `tagline` chữ hoa giãn, `coupleShortName`, vạch + `dateDisplay`, `weekday`; ngay dưới là ảnh tỉ lệ 3:4, mép trên cong elip (vd `border-radius: 50% 50% 0 0 / 14% 14% 0 0`), viền chỉ 1px `#c9a96e`; khối `pc` liền sau ảnh chứa `subNote`.
- `fullscreen`: ảnh phủ `height: 100svh` (min 560px, max 900px), gradient tối, chữ trắng căn giữa dọc: `tagline`, `coupleShortName`, `dateDisplay`, `subNote`; mũi tên cuộn nhỏ ở đáy. Trong khung editor (`#canvasScrollArea .hero-full`) cố định `height: 760px` bằng CSS — không rẽ nhánh mode trong JS.
- Lớp CSS mới đều có tiền tố `.hero-`, thêm ở CUỐI `css/app.css` dưới chú thích `/* ===== Trang bìa: layout (T27) ===== */`. Không sửa khối CSS khác.
- Mọi trường văn bản dùng `fieldAttr(ctx, key)` + `escapeHtml`; ảnh qua `safeUrl`, giữ `onerror` placeholder như cũ. Mobile 390px không tràn ngang; chữ đè ảnh đủ tương phản.
- Inspector: lưới 2×2 ô (cao ≥ 44px), mỗi ô là sơ đồ CSS thu nhỏ + tên tiếng Việt (Cổ điển / Mờ dần / Vòm cong / Toàn màn hình), ô đang chọn có viền violet; bấm gọi `updateSectionField(id, 'layout', key, false)` (render lại inspector). Trường hiện theo kiểu: classic {tên, thông điệp, ngày, ảnh, subNote}; fade {+ inviteLine, weekday, timeText, venueText, closingNote}; arch {+ monogram, weekday}; fullscreen {như classic}.

## Ngoài phạm vi (ghi backlog, T25)
Trình phát nhạc dạng thẻ, timeline có icon, ảnh mép cong ở section cảm ơn, ô màu dress code, chế độ nền `fixed`.
