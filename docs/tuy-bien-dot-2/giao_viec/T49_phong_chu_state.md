# T49 — Phông chữ + state phong bì (schema 7) + editor

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
`dac_ta_tuy_bien_dot_2.md` §1 (phần state/invite/export) và §2 (phần state + editor).

## Tệp được sửa (danh sách đóng)
- `js/state.js`: 19 mục `FONT_OPTIONS` mới; 7 khoá `globalStyle` phong bì trong `DEFAULT_STATE`; `migrate` chuẩn hoá các khoá này; `SCHEMA_VERSION` = 7, `DEFAULT_STATE.schemaVersion` = 7. Không đổi hành vi khác của `migrate`.
- `invite.html`: thay link Google Fonts bằng link trong đặc tả (giống hệt từng ký tự).
- `js/editor.js` — CHỈ 3 chỗ: (a) link Google Fonts trong chuỗi export (khoảng dòng 670) thay bằng link đặc tả; (b) thêm `handleGlobalImageUpload(event, key, label)` cạnh `handleGlobalBgUpload`, chỉ nhận key trong `['envCardImage']`, luôn reset `event.target.value`; (c) `syncLeftControlsWithState()` đặt giá trị các ô `#env_flapColor, #env_bodyColor, #env_cardImage, #env_seal, #env_monogram, #intro_toText, #intro_btnText` (bỏ qua nếu không có phần tử; ô màu rỗng hiển thị `primaryColor`). Ô do T50 viết song song trong `index.html`.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_frontend.md`, `domain_sections.md` §3, `docs/tuy-bien-dot-2/dac_ta_tuy_bien_dot_2.md`.

## Tiêu chí đạt
- State schema 6 (thiếu khoá mới) qua `migrate` → schema 7, giá trị mặc định, idempotent; khoá kiểu sai/chuỗi quá dài/màu độc (`red;background:url(x)`) bị chuẩn hoá.
- `FONT_OPTIONS` mới được `safeFont` chấp nhận.
- Không rẽ nhánh theo `sec.type` trong `editor.js`.

## Lệnh tự kiểm (phiên chính chạy)
`node --check js/state.js js/editor.js`; `py tools/build_export_bundle.py`; `py -m pytest server/tests -q`.

## Không được làm
Không sửa `index.html`, `runtime.js`, `css/`, các tệp section; không sửa chỗ khác trong `editor.js`.
