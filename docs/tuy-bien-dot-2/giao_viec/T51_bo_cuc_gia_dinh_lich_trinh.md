# T51 — Bố cục Gia đình + Lịch trình

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
`dac_ta_tuy_bien_dot_2.md` §3 cho family (`classic|split|traditional`) và events (`cards|timeline|carousel`).

## Tệp được sửa (danh sách đóng)
- `js/sections/family.js`
- `js/sections/events.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_sections.md` (mục biến thể bố cục), `domain_frontend.md`, `docs/tuy-bien-dot-2/dac_ta_tuy_bien_dot_2.md`. Mẫu: `HERO_LAYOUTS` + lưới chọn trong `js/sections/hero.js`.

## Tiêu chí đạt
- `layout` mặc định render y hệt bản hiện tại (so chuỗi HTML trước/sau với state mặc định nếu được).
- `migrate` riêng: layout lạ → mặc định; family thêm `groomPhoto`, `bridePhoto` (chuỗi; sai kiểu → mặc định); giữ `imageShape` của đợt 1. Idempotent.
- Ảnh qua `safeUrl` + `escapeHtml`; sửa inline qua `fieldAttr`; carousel chỉ CSS; timeline đẹp ở 390px.
- Calendar hook `calendarEvent` của events giữ nguyên hành vi.

## Lệnh tự kiểm (phiên chính chạy)
`node --check js/sections/family.js js/sections/events.js`.

## Không được làm
Không sửa tệp khác (CSS dùng Tailwind/inline trong tệp section).
