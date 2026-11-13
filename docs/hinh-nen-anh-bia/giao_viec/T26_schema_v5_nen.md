# T26 — Schema v5: hình nền toàn thiệp, helper `cardBgVars`, preset Xanh rêu & vàng

- **Sub-agent**: `frontend-ui` · **Đợt**: 1 · **Review**: có
- **Tệp được sửa (đóng)**: `js/state.js`
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md` §3, `docs/hinh-nen-anh-bia/dac_ta_hinh_nen_anh_bia.md` G1, G2

## Việc
Làm đúng G1 và G2 của đặc tả:
1. `SCHEMA_VERSION` và `DEFAULT_STATE.schemaVersion` = 5.
2. `DEFAULT_STATE.globalStyle`: thêm `bgImage: ''`, `bgImageOverlay: 0`, `bgImageFit: 'cover'`.
3. `G5_OPTIONS.bgImageFit = ['cover', 'repeat']`.
4. `migrate()`: chuẩn hoá `bgImage` (chuỗi), `bgImageOverlay` (số hữu hạn, kẹp 0–0.9). Idempotent.
5. Thêm `THEME_PRESETS.moss` theo G1.
6. Chuyển `safeCssImageUrl` vào `state.js` (thân giống bản ở `js/render.js:186`), gắn `window`. KHÔNG sửa `render.js` (T28 làm).
7. Thêm `cardBgVars(g)` và `cardBgStyleText(g)` theo G2, gắn `window`; comment tiếng Việt.

## Tiêu chí đạt
- `node --check js/state.js` OK.
- Chạy thử trong node (nạp state.js với stub `window`/`document` tối thiểu, hoặc mô tả kiểm tương đương): `migrate` state v4 không có trường mới → có đủ 3 trường mặc định, `schemaVersion` 5; `bgImageOverlay: 'abc'` → 0, `5` → 0.9; `bgImageFit: 'x'` → `'cover'`; migrate 2 lần cho cùng JSON.
- `cardBgVars({bgImage:'javascript:alert(1)'})['--card-bg-image'] === 'none'`; URL có `"` hoặc `)` → `'none'`; URL https hợp lệ → `url("https://…")`; không ảnh → veil `rgba(255,255,255,0)`.
- Preset moss không chứa khoá `bgImage`, `bgImageOverlay`, `bgImageFit`, `layout`.

## Lệnh tự kiểm
Sub-agent không chạy lệnh: ghi rõ trong báo cáo các trường hợp đã soát bằng đọc mã; phiên chính/autotest chạy `node --check`.

## Không được làm
Sửa tệp khác; đổi hành vi các trường cũ; thêm thư viện.
