# T2 — `share` schema 8, `cardShareInfo`, `cardFontsUrl`, ảnh bìa ưu tiên

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
Đặc tả §1 và dòng cuối §4 (ảnh bìa).

## Tệp được sửa (danh sách đóng)
- `js/state.js`: `DEFAULT_STATE.share`, `SCHEMA_VERSION` = 8 (và `DEFAULT_STATE.schemaVersion`), `migrate` chuẩn hoá `share`; `GOOGLE_FONT_SPECS`, `CARD_BASE_FONTS`, `cardFontsUrl(state)` gắn `window`. Spec mỗi họ phông lấy **đúng từng ký tự** từ link Google Fonts hiện tại trong `invite.html`.
- `js/runtime.js`: `cardShareInfo(state)` dùng `visibleDefs`, `cardPageTitle`, `cardCalendarEvent`; gắn `window.cardShareInfo`. Không rẽ nhánh theo `sec.type`.
- `js/sections/hero.js`: hook `shareImage(sec)` trả `data.heroImage` (chuỗi) hoặc `''`; mọi `<img>` ảnh bìa thêm `fetchpriority="high" decoding="async"`.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_frontend.md`, `domain_sections.md`, `domain_runtime_invite.md`, `docs/og-va-toc-do/dac_ta_og_va_toc_do.md`.

## Tiêu chí đạt
- State schema 7 (không có `share`) → migrate → schema 8, `share` rỗng; `share` sai kiểu/quá dài bị chuẩn hoá; idempotent.
- `cardShareInfo(DEFAULT_STATE)` → title bắt đầu `THƯ MỜI TIỆC CƯỚI · `, description dạng `16:00 · 24/10/2026 · …`, image = ảnh hero mặc định. Ảnh `data:` → `''`. Hero ẩn → bỏ qua.
- `cardFontsUrl` của thiệp dùng 4 phông trả URL chỉ ~4–6 họ; URL đúng cú pháp Google Fonts css2.
- `CARD_BASE_FONTS` liệt kê đủ họ phông viết cứng (báo cáo ghi các chỗ đã grep).

## Lệnh tự kiểm (phiên chính chạy)
`node --check js/state.js js/runtime.js js/sections/hero.js`; `py tools/build_export_bundle.py`; `py -m pytest server/tests -q`.

## Không được làm
Không sửa `invite.html`, `editor.js`, `api.js`, CSS, section khác. Không đổi hành vi khác của `migrate`.
