# Đặc tả chung — section mới + tuỳ biến (đợt 1)

Giao kèo dùng chung cho T41–T46. Không phiếu nào được đổi giao kèo này; cần đổi thì dừng và báo.

## 1. Tên lớp CSS (định nghĩa ở `css/app.css` — T45; các phiếu khác chỉ dùng tên)

| Nhóm | Lớp | Ý nghĩa |
|---|---|---|
| Hiệu ứng xuất hiện | `reveal-fade` | chỉ mờ → rõ (không dịch chuyển) |
| | `reveal-flip` | lật quanh trục X (perspective), từ ~70° về 0 |
| | `reveal-pop` | phóng từ 0.7 lên 1, hơi nảy (cubic-bezier) |
| | (đã có) `reveal-fade-up`, `reveal-zoom`, `reveal-slide` | giữ nguyên |
| Thời lượng | `reveal-dur-fast` (~0.45s), `reveal-dur-slow` (~1.4s) | mặc định giữ thời lượng hiện tại |
| Hiệu ứng lặp | `loop-swing` (đung đưa ±6°, gốc trên giữa), `loop-pulse` (phập phồng 1→1.06), `loop-heartbeat` (nhịp tim 2 nhịp) | chạy ở mọi mode (cả editor); tắt khi `prefers-reduced-motion: reduce` |
| Khung ảnh | `img-shape-circle`, `img-shape-arch`, `img-shape-heart`, `img-shape-hexagon`, `img-shape-rounded` | đặt trực tiếp lên thẻ `<img>` (hoặc khung bọc ảnh); `circle/heart/hexagon` ép `aspect-ratio:1/1` + `object-fit:cover`; `arch` = bo tròn nửa trên (border-radius lớn trên, nhỏ dưới); `rounded` = bo 28px; `heart` dùng `mask-image` SVG data URI (kèm `-webkit-mask-*`), `hexagon` dùng `clip-path: polygon(...)` |

Các lớp reveal mới phải chịu cùng cơ chế với lớp cũ: chỉ ẩn khi gốc có `.reveal-on` (`.reveal-on .reveal-flip:not(.is-visible)`…), runtime thêm `.is-visible`. `prefers-reduced-motion`: hiện ngay.

## 2. State

- `SCHEMA_VERSION` = 6 (T46, `js/state.js`). `DEFAULT_STATE.schemaVersion` = 6.
- `sec.style` thêm khoá `animDuration` ∈ `'' | 'fast' | 'slow'`; mặc định `''` trong hàm style mặc định ở `state.js` (T46).
  `render.js` (T45) đưa vào `SEC_STYLE_WL`, sinh lớp `reveal-dur-<v>` khi khác `''` và hiệu ứng khác `none`.
- Giá trị hiệu ứng: `style.animation` ∈ `'' | none | fade-up | zoom | slide | fade | flip | pop`;
  `globalStyle.revealAnimation` ∈ `none | fade-up | zoom | slide | fade | flip | pop`.
  Danh sách cho phép phải khớp ở cả `G5_OPTIONS` (`state.js`, T46) và `G5_WL` / `SEC_STYLE_WL` (`render.js`, T45).
  `runtime.js` (T45): `REVEAL_SEL` gồm cả 3 lớp mới.
- Khung ảnh: `state.js` (T46) xuất
  ```js
  const IMAGE_SHAPES = [['', 'Mặc định'], ['circle', 'Tròn'], ['arch', 'Vòm'], ['heart', 'Trái tim'], ['hexagon', 'Lục giác'], ['rounded', 'Bo góc lớn']];
  function imageShapeClass(v) // → '' nếu v không thuộc danh sách hoặc ''; ngược lại 'img-shape-' + v
  window.IMAGE_SHAPES, window.imageShapeClass
  ```
  Trường `data.imageShape` (mặc định `''`) ở hero (chỉ áp cho bố cục `classic`), family (`coupleAvatar`), thanks (`image`);
  `migrate` riêng từng section đưa giá trị lạ về `''`.
- Ba section mới chỉ thêm qua "+ Thêm section", không thêm vào `DEFAULT_STATE.sections`.

## 3. Section mới

Hợp đồng `registerSection` theo `domain_sections.md` §1. Mọi giá trị người dùng: `escapeHtml`, màu `safeColor`, URL `safeUrl`.
Dùng `sectionVars(sec, ctx)` cho màu/font; `fieldAttr(ctx, key)` cho trường sửa inline.

### 3.1 `calendar` — Lịch tháng (T42)
- `label: 'Lịch tháng cưới'`, `icon: 'fa-calendar-days'`.
- `defaults`: `{ title: 'Tháng 10 / 2026', subtitle: 'SAVE THE DATE', date: '2026-10-24', weekStart: 'mon', mark: 'heart', note: 'Thứ Bảy, ngày 24 tháng 10 năm 2026' }`.
- `date` dạng `YYYY-MM-DD`; sai → dùng mặc định. `weekStart ∈ mon|sun` (nhãn T2…CN / CN…T7). `mark ∈ heart|circle`.
- Lưới 7 cột, ngày cưới được khoanh (tim dùng icon FA `fa-heart` phía sau số, hoặc vòng tròn viền màu chủ đạo), có hiệu ứng `loop-heartbeat` cho dấu tim.
- Inspector: tiêu đề, phụ đề, `<input type="date">`, chọn tuần bắt đầu, kiểu đánh dấu, ghi chú. Nút "Lấy theo tiêu đề tháng" không cần.
- `renderCanvas` thuần, tính lịch bằng `Date` UTC để không lệch múi giờ.

### 3.2 `slideshow` — Trình chiếu ảnh (T43)
- `label: 'Trình chiếu ảnh'`, `icon: 'fa-film'`.
- `defaults`: `{ title: 'KHOẢNH KHẮC', subtitle: 'OUR MOMENTS', photos: [3–5 URL unsplash như album], interval: 4, effect: 'fade', ratio: '3/4', showDots: true }`.
- `interval` 2–10 (giây), `effect ∈ fade|slide`, `ratio ∈ 3/4|1/1|4/3`.
- `renderCanvas`: hiện slide 0, các slide còn lại xếp chồng (fade) hoặc dải ngang (slide); nút trước/sau (vùng chạm ≥ 44px), chấm chỉ số.
- `mount(root, sec, ctx)`: gắn nút + vuốt (touch/pointer, ngưỡng ~40px); tự chạy chỉ khi `ctx.mode !== 'editor'`
  và tạm dừng khi tab ẩn (`document.hidden`); trả hàm dọn (clearInterval + gỡ listener). Không đọc DOM ngoài `root`.
- Inspector: tiêu đề/phụ đề, danh sách ảnh dùng lại `updateAlbumPhoto(secId, i, url)` và `handleAlbumFileUpload(event, i, secId)`
  của editor (đã chạy chung trên `sec.data.photos`); thêm/xoá ảnh qua `updateSectionField(id, 'photos', mảngMới, false)`
  (tối đa 12 ảnh); chọn `interval`, `effect`, `ratio`, `showDots`.
- `migrate`: `photos` không phải mảng → `[]`; chuẩn hoá các giá trị về whitelist.

### 3.3 `divider` — Trang trí / ngăn cách (T44)
- `label: 'Trang trí / Ngăn cách'`, `icon: 'fa-seedling'`.
- `defaults`: `{ kind: 'floral', text: 'Love', lineStyle: 'solid', size: 'md', color: '', loop: 'none' }`.
- `kind ∈ floral | leaf | heart | rings | line | text | space`:
  `floral/leaf/heart/rings` = SVG viết sẵn trong tệp (fill/stroke `currentColor`), `line` = đường kẻ, `text` = chữ giữa hai đường kẻ (font script), `space` = khoảng trống.
- `lineStyle ∈ solid|dotted|dashed`, `size ∈ sm|md|lg` (chiều cao / độ rộng hoạ tiết), `color` hợp lệ qua `safeColor` (rỗng = màu chủ đạo),
  `loop ∈ none|swing|pulse|heartbeat` → thêm lớp `loop-<v>` lên hoạ tiết.
- Padding dọc nhỏ (section mỏng). Ở editor, `space` hiện đường viền chấm mờ để thấy được.
- Inspector: lưới chọn kiểu (nút có hình nhỏ), các ô chọn còn lại, ô màu.

## 4. Không được làm
- Không sửa `editor.js`, `store.js`, `section_ops.js`, `server/`. Không rẽ nhánh theo `sec.type`/`sec.id` ngoài tệp section.
- Không thêm thư viện / font CDN mới (đợt 2).
- Không sửa `js/export_bundle.js` bằng tay (phiên chính chạy `py tools/build_export_bundle.py`).
