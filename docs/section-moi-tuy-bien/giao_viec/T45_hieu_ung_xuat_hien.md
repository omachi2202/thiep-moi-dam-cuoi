# T45 — Hiệu ứng xuất hiện mới + thời lượng; CSS loop-* và img-shape-*

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
Thêm hiệu ứng `fade|flip|pop` và chọn thời lượng cho section/toàn thiệp; định nghĩa toàn bộ CSS dùng chung của đợt (`dac_ta_section_moi.md` §1, §2).

## Tệp được sửa (danh sách đóng)
- `js/render.js`: `G5_WL.revealAnimation` và `SEC_STYLE_WL.animation` thêm `fade, flip, pop`; `SEC_STYLE_WL.animDuration = ['', 'fast', 'slow']`;
  `sectionDecor` thêm lớp `reveal-dur-<v>` khi có và hiệu ứng ≠ `none`; inspector "Trang trí section" thêm 3 lựa chọn (nhãn: "Mờ dần", "Lật", "Bật nảy") + ô "Tốc độ hiệu ứng" (Mặc định / Nhanh / Chậm).
  Nếu ô chọn hiệu ứng toàn thiệp (`revealAnimation`) được sinh trong `render.js` thì thêm 3 lựa chọn ở đó; nếu nằm ở `index.html` thì KHÔNG sửa, ghi vào báo cáo để phiên chính xử lý.
- `js/runtime.js`: `REVEAL_SEL` gồm `.reveal-fade, .reveal-flip, .reveal-pop`.
- `css/app.css`: lớp reveal mới (cùng cơ chế `.reveal-on … :not(.is-visible)`), `reveal-dur-fast|slow`, `loop-swing|pulse|heartbeat` (+ keyframes), `img-shape-*` (5 hình), khối `prefers-reduced-motion` tắt reveal mới và loop.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_frontend.md`, `domain_runtime_invite.md`, `domain_sections.md`, `docs/section-moi-tuy-bien/dac_ta_section_moi.md`.

## Tiêu chí đạt
- Thiệp cũ (không có giá trị mới) hiển thị như trước. Editor không có `.reveal-on` nên vẫn hiện đủ nội dung.
- `flip` dùng `perspective`/`backface-visibility` không làm lệch layout; `pop` không tràn khung ngang (không gây cuộn ngang ở 390px).
- `img-shape-heart` có `-webkit-mask` để chạy Safari iOS; `circle/heart/hexagon` ép tỉ lệ 1:1 và `object-fit: cover`.
- Không rẽ nhánh theo `sec.type`.

## Lệnh tự kiểm (phiên chính sẽ chạy)
`node --check js/render.js js/runtime.js`; `py tools/build_export_bundle.py`.

## Không được làm
Không sửa `js/state.js` (T46 làm `G5_OPTIONS` và style mặc định), `index.html`, `editor.js`.
