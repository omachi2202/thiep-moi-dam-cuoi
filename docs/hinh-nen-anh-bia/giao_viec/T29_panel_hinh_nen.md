# T29 — Panel "Hình nền thiệp", handler tải ảnh nền, nền khung bản export

- **Sub-agent**: `frontend-ui` · **Đợt**: 2 · **Review**: có
- **Tệp được sửa (đóng)**: `index.html`, `js/editor.js`
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `docs/hinh-nen-anh-bia/dac_ta_hinh_nen_anh_bia.md` G1, G2, G4
- **Phụ thuộc**: T26

## Việc
1. `index.html`, tab Giao diện, khối "Trang Trí Thiệp": thêm mục "Hình nền thiệp" ngay trên "Hoạ tiết nền":
   - ô link `id="inputBgImage"` (`onchange="updateGlobalStyle('bgImage', this.value.trim())"`),
   - nút "Tải ảnh từ máy tính" (label + input file ẩn, `onchange="handleGlobalBgUpload(event)"`), nút "Bỏ hình nền" (`updateGlobalStyle('bgImage','')`),
   - thanh trượt lớp phủ `id="inputBgImageOverlay"` 0–0.9 bước 0.05 (`onchange="updateGlobalStyle('bgImageOverlay', parseFloat(this.value))"`) có nhãn %,
   - select `id="select_bgImageFit"`: `cover` "Phủ kín", `repeat` "Lặp hoạ tiết".
   Vùng chạm ≥ 44px, chữ tiếng Việt.
2. `js/editor.js`:
   - `syncLeftControlsWithState`: đồng bộ 3 điều khiển mới (thêm `bgImageFit` vào danh sách `select_`).
   - `handleGlobalBgUpload(event)`, `handleSectionBgUpload(event, secId)` theo G4, gắn `window`.
   - Export HTML: thẻ `#weddingCardFrame` trong chuỗi export thêm `cardBgStyleText(g)` vào thuộc tính `style` (qua `_exportEsc`/`escapeHtml`) và các lớp `cardDecorClasses(g)` nếu chưa có — để bản export có cùng nền + texture như trang khách.
   - `updateGlobalStyle` không cần đổi (G5_OPTIONS đã khoá `bgImageFit`); `bgImageOverlay` kẹp khi render.

## Giao kèo
T28 (song song) sửa `js/render.js`, `invite.html`, `css/app.css` và gọi `handleSectionBgUpload(event, secId)` từ inspector section. T29 không đụng ba tệp đó.

## Tiêu chí đạt
- `node --check js/editor.js` OK.
- Đặt/bỏ hình nền, kéo lớp phủ, đổi phủ/lặp đều undo được (qua `commitState`).
- Mở `file://`: tải ảnh nhỏ → base64; ảnh > 1,5MB → toast từ chối, state không đổi.
- Bản export hiện đúng hình nền + lớp phủ + texture.

## Không được làm
Sửa tệp ngoài danh sách; gán `appState` trực tiếp ngoài mutator.
