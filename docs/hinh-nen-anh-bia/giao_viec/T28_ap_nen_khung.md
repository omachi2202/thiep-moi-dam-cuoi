# T28 — Áp hình nền toàn thiệp lên khung (editor + trang khách), CSS chồng lớp, nút tải ảnh nền section

- **Sub-agent**: `frontend-ui` · **Đợt**: 2 · **Review**: có
- **Tệp được sửa (đóng)**: `js/render.js`, `invite.html`, `css/app.css`
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md` (mục Nền toàn thiệp do T25 thêm), `.agents/rules/domain_runtime_invite.md`, `docs/hinh-nen-anh-bia/dac_ta_hinh_nen_anh_bia.md` G2, G3, G4
- **Phụ thuộc**: T26 (helper trong `state.js`), T27 (khối CSS hero ở cuối `app.css`)

## Việc
1. `render.js`:
   - Xoá bản `safeCssImageUrl` cũ (đã chuyển sang `state.js`), các chỗ gọi giữ nguyên.
   - `renderWeddingCanvas`: sau khi đặt `backgroundColor`, áp các biến của `cardBgVars(g)` lên `#weddingCardFrame` bằng `style.setProperty`.
   - `renderDecorInspectorHtml`: dưới ô link ảnh nền, thêm nút "Tải ảnh từ máy tính" gọi `handleSectionBgUpload(event, '${sid}')` (G4); sửa nhãn thành "Ảnh nền (dán link hoặc tải ảnh)". Có nút nhỏ "Bỏ ảnh" khi đang có ảnh (`setSectionDecor(sid,'bgImage','')`).
2. `invite.html`: sau dòng đặt `frame.style.backgroundColor`, áp `cardBgVars(g)` tương tự.
3. `css/app.css` khối trang trí toàn thiệp (G3): quy tắc nền cho `#weddingCardFrame` và viết lại `.tex-paper/.tex-floral/.tex-silk` khi nằm trên khung để texture chồng lên veil + ảnh, đủ `background-size`/`background-repeat` từng lớp. Không đụng khối `.hero-` của T27.

## Giao kèo
T29 (song song) sửa `index.html`, `js/editor.js` (viết `handleSectionBgUpload`, `handleGlobalBgUpload`, nền khung bản export bằng `cardBgStyleText`). T28 không đụng hai tệp đó.

## Tiêu chí đạt
- `node --check js/render.js` OK; script inline của `invite.html` không lỗi cú pháp.
- Không ảnh nền: giao diện y như trước (cả 3 texture).
- Có ảnh + texture giấy: thấy cả ảnh lẫn texture; lớp phủ 50% làm sáng ảnh; `repeat` lặp ảnh.
- Section có nền riêng che ảnh nền toàn thiệp.
- Không rẽ nhánh theo `sec.type`.

## Không được làm
Sửa tệp ngoài danh sách; tự ghép `url()` không qua `cardBgVars`.
