# T41 — Luật khung ảnh, thời lượng hiệu ứng, hiệu ứng lặp; backlog đợt 2

**Sub-agent**: memoryer · **Đợt** 1 · **Review**: không

## Mục tiêu
Bổ sung luật đã được người dùng duyệt vào `domain_sections.md` và ghi các việc đợt 2 vào backlog.

## Tệp được sửa
- `.agents/rules/domain_sections.md`
- `docs/backlog.md`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_sections.md`, `docs/section-moi-tuy-bien/dac_ta_section_moi.md`.

## Nội dung
1. `domain_sections.md` §2: cập nhật ví dụ `style` thêm `animDuration: ''`; thêm mục con "Hiệu ứng, khung ảnh, trang trí" gồm:
   - `style.animation` / `globalStyle.revealAnimation` nhận thêm `fade|flip|pop`; `style.animDuration ∈ ''|fast|slow`; whitelist ở `render.js` và `G5_OPTIONS` (`state.js`) phải khớp nhau.
   - Khung ảnh: trường `data.imageShape` của từng section, lớp lấy qua `imageShapeClass()` (`state.js`), danh sách `IMAGE_SHAPES`; `migrate` riêng đưa giá trị lạ về `''`.
   - Hiệu ứng lặp chỉ dùng lớp `loop-swing|loop-pulse|loop-heartbeat` của `css/app.css`; tắt khi `prefers-reduced-motion`.
   - Hoạ tiết SVG trang trí viết sẵn trong tệp section, tô `currentColor`, không tải nguồn ngoài, không nhận SVG do người dùng nhập.
   - Section nhiều ảnh dùng chung `data.photos` có thể dùng lại `updateAlbumPhoto` / `handleAlbumFileUpload` của editor.
2. `docs/backlog.md`: thêm mục "## Đợt 2: tuỳ biến (sau T41–T46)" với 3 dòng (font chữ ký hỗ trợ tiếng Việt — thêm vào `FONT_OPTIONS` + link Google Fonts ở editor/invite/export; phong bì tuỳ màu nắp/ảnh tem/chữ "Chạm để mở"; bố cục mới cho Gia đình, Lịch trình, Album, Cảm ơn theo mẫu `HERO_LAYOUTS`) — ưu tiên Trung bình; và các ý ngoài phạm vi ghi nhận từ m-invite: nút liên kết, QR thiệp tuỳ màu, chữ hiệu ứng gõ (typewriter) — Thấp.

## Tiêu chí đạt
- Hai tệp có nội dung trên, tiếng Việt, không sửa AD đã chốt, không đụng tệp khác.

## Không được làm
Không sửa mã, không sửa `docs/quyet_dinh.md`.
