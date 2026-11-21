# Tuỳ biến đợt 2: phông chữ, phong bì, bố cục section cũ

Nhánh `feat/tuy-bien-dot-2`. Tiếp nối `docs/section-moi-tuy-bien/` (đợt 1). Người dùng chọn (2026-11-22): cả 3 bộ phông
(viết tay mềm, viết tay hiện đại, có chân — 19 phông, đều có dấu tiếng Việt), phong bì (màu nắp + thân, ảnh/tem, chữ màn mở),
bố cục mới cho Gia đình, Lịch trình, Album, Cảm ơn (mỗi section thêm 2 kiểu, giữ kiểu hiện tại làm mặc định).

Giao kèo chung: `dac_ta_tuy_bien_dot_2.md`.

## Bảng task

| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| T48 | Luật phông chữ / trường phong bì / bố cục section | `.agents/rules/domain_frontend.md`, `domain_runtime_invite.md`, `domain_sections.md` | memoryer | 1 | không | không | Đạt |
| T49 | FONT_OPTIONS + state phong bì + migrate (schema 7); link phông invite + export; `handleGlobalImageUpload`; đồng bộ ô | `js/state.js`, `invite.html`, `js/editor.js` | frontend-ui | 1 | không | có | Đạt |
| T50 | Phong bì trong runtime + CSS; ô điều khiển + link phông ở index.html | `js/runtime.js`, `css/app.css`, `index.html` | frontend-ui | 1 | không | có | Đạt |
| T51 | Bố cục Gia đình (split, traditional) + Lịch trình (timeline, carousel) | `js/sections/family.js`, `js/sections/events.js` | frontend-ui | 1 | không | có | Đạt |
| T52 | Bố cục Album (masonry, feature) + xem ảnh phóng to; Cảm ơn (overlay, curved) | `js/sections/album.js`, `js/sections/thanks.js` | frontend-ui | 1 | không | có | Đạt |

## Nhật ký nghiệm thu

- 2026-11-22 — T48 Đạt (memoryer). T49–T52 xong lần đầu; `node --check` qua; link Google Fonts khớp từng ký tự ở 3 nơi + đặc tả.
- reviewer-code: ĐẠT, không chặn; nên sửa → T52.1 (lightbox preview nằm gọn trong khung bằng `absolute`, không khoá cuộn body ở preview, truy cập bàn phím/focus, bỏ ảnh URL rỗng, ẩn ô khung ảnh ở thanks overlay/curved), T51.1 (nút "Xem chỉ đường" `min-h-[44px]`, carousel `tabindex/role/aria-label`, `this.onerror=null`). Đã sửa. Ghi nhận không sửa: `filter: brightness` trên nắp/thân phong bì làm màu hiển thị lệch nhẹ so với ô chọn màu.
- autotest: ĐẠT (registry 16 loại × 4 mode, mọi bố cục, giá trị độc, migrate 6→7 idempotent và chuẩn hoá đúng §2, 19 phông ở FONT_OPTIONS và 3 select, id ô điều khiển, bundle --check, pytest 64 passed).
  Lệch đặc tả §3 "bố cục mặc định y hệt" — CHẤP NHẬN (phiên chính): family classic thêm `this.onerror=null`; events cards nút bản đồ thêm `min-h-[44px]`; album grid thêm `data-album`/`data-album-idx`/`tabindex`/`role` cho lightbox. Đều do phiếu sửa review, không đổi bố cục nhìn thấy ngoài chiều cao tối thiểu của nút.
- Kiểm tay (localhost): family split + events timeline; phông Bonheur Royale tải được, có dấu tiếng Việt; phong bì nắp đỏ đô, tem monogram "T&N", chữ "Kính gửi"; album feature/masonry lightbox ở preview nằm trong khung (absolute), Enter mở, Esc đóng, trả focus; carousel/curved/traditional không tràn ngang khung.
