# T46 — Khung ảnh theo hình (hero / family / thanks), schema 6

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
Cho phép chọn hình khung ảnh; nâng schema lên 6 và đồng bộ whitelist hiệu ứng mới (`dac_ta_section_moi.md` §2).

## Tệp được sửa (danh sách đóng — ngoại lệ 4 tệp đã duyệt)
- `js/state.js`: `SCHEMA_VERSION = 6`, `DEFAULT_STATE.schemaVersion = 6`; `G5_OPTIONS.revealAnimation` thêm `fade, flip, pop`;
  style mặc định của section thêm `animDuration: ''`; thêm `IMAGE_SHAPES`, `imageShapeClass(v)` gắn `window`.
- `js/sections/hero.js`: `data.imageShape` (mặc định `''`), áp lớp lên ảnh ở bố cục `classic`; inspector hiện ô "Khung ảnh" chỉ khi layout là `classic`; `migrate` chuẩn hoá.
- `js/sections/family.js`: áp lên `coupleAvatar`; inspector + `defaults` + `migrate` (thêm `migrate` nếu chưa có).
- `js/sections/thanks.js`: áp lên `image`; inspector + `defaults` + `migrate`.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_sections.md`, `domain_frontend.md`, `docs/section-moi-tuy-bien/dac_ta_section_moi.md`.

## Tiêu chí đạt
- State schema 5 cũ (thiếu `imageShape`, `animDuration`) qua `migrate` mở được, hiển thị y như trước; `migrate` idempotent.
- Giá trị lạ (`imageShape: 'x" onload=…'`) → `''`, không vào HTML.
- Khi chọn hình có tỉ lệ 1:1, ảnh không méo (lớp CSS của T45 lo `object-fit`; section bỏ các lớp chiều cao cố định xung đột như `h-64` khi có khung, hoặc ghi rõ trong báo cáo cách xử lý).
- Ô chọn là `<select>` từ `IMAGE_SHAPES`, đổi qua `updateSectionField(id,'imageShape',v,false)`.

## Lệnh tự kiểm (phiên chính sẽ chạy)
`node --check js/state.js js/sections/hero.js js/sections/family.js js/sections/thanks.js`; `py tools/build_export_bundle.py`; `py -m pytest server/tests -q`.

## Không được làm
Không sửa `render.js`, `css/app.css` (T45), `editor.js`; không đổi `migrate()` chung ngoài việc ghi version.
