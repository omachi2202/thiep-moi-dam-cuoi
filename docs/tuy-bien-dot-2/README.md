# Tuỳ biến đợt 2: phông chữ, phong bì, bố cục section cũ

Nhánh `feat/tuy-bien-dot-2`. Tiếp nối `docs/section-moi-tuy-bien/` (đợt 1). Người dùng chọn (2026-11-22): cả 3 bộ phông
(viết tay mềm, viết tay hiện đại, có chân — 19 phông, đều có dấu tiếng Việt), phong bì (màu nắp + thân, ảnh/tem, chữ màn mở),
bố cục mới cho Gia đình, Lịch trình, Album, Cảm ơn (mỗi section thêm 2 kiểu, giữ kiểu hiện tại làm mặc định).

Giao kèo chung: `dac_ta_tuy_bien_dot_2.md`.

## Bảng task

| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| T48 | Luật phông chữ / trường phong bì / bố cục section | `.agents/rules/domain_frontend.md`, `domain_runtime_invite.md`, `domain_sections.md` | memoryer | 1 | không | không | Chờ |
| T49 | FONT_OPTIONS + state phong bì + migrate (schema 7); link phông invite + export; `handleGlobalImageUpload`; đồng bộ ô | `js/state.js`, `invite.html`, `js/editor.js` | frontend-ui | 1 | không | có | Chờ |
| T50 | Phong bì trong runtime + CSS; ô điều khiển + link phông ở index.html | `js/runtime.js`, `css/app.css`, `index.html` | frontend-ui | 1 | không | có | Chờ |
| T51 | Bố cục Gia đình (split, traditional) + Lịch trình (timeline, carousel) | `js/sections/family.js`, `js/sections/events.js` | frontend-ui | 1 | không | có | Chờ |
| T52 | Bố cục Album (masonry, feature) + xem ảnh phóng to; Cảm ơn (overlay, curved) | `js/sections/album.js`, `js/sections/thanks.js` | frontend-ui | 1 | không | có | Chờ |

## Nhật ký nghiệm thu

(chưa có)
