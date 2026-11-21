# T52 — Bố cục Album (+ xem ảnh phóng to) + Lời cảm ơn

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
`dac_ta_tuy_bien_dot_2.md` §3 cho album (`grid|masonry|feature` + `mount` xem phóng to) và thanks (`classic|overlay|curved`).

## Tệp được sửa (danh sách đóng)
- `js/sections/album.js`
- `js/sections/thanks.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_sections.md`, `domain_frontend.md`, `domain_runtime_invite.md`, `docs/tuy-bien-dot-2/dac_ta_tuy_bien_dot_2.md`. Mẫu: `hero.js` (lưới chọn bố cục), `slideshow.js` (mount trả hàm dọn).

## Tiêu chí đạt
- Bố cục mặc định render y hệt hiện tại. `migrate` riêng: layout lạ → mặc định; giữ `imageShape` (thanks, đợt 1) và giữ quy tắc `photos` của album. Idempotent.
- Lightbox: không chạy khi `ctx.mode === 'editor'`; Esc/bấm nền/nút đóng; trước/sau; khoá cuộn trang khi mở (khôi phục khi đóng/dọn); hàm dọn gỡ overlay + listener (editor re-init không rò). Không đọc DOM ngoài `root` trừ khi gắn overlay như đặc tả.
- thanks `overlay`: chữ đủ tương phản trên ảnh (lớp tối); `curved`: không cuộn ngang 390px.
- Ảnh qua `safeUrl` + `escapeHtml`.

## Lệnh tự kiểm (phiên chính chạy)
`node --check js/sections/album.js js/sections/thanks.js`.

## Không được làm
Không sửa tệp khác.
