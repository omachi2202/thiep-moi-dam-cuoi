# T50 — Phong bì tuỳ biến (runtime + CSS + ô điều khiển)

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
`dac_ta_tuy_bien_dot_2.md` §2 (phần runtime, CSS, ô điều khiển) và §1 (link phông + ô chọn phông tĩnh trong `index.html`).

## Tệp được sửa (danh sách đóng)
- `js/runtime.js`: `setupIntro` đọc 7 khoá mới (đặt biến CSS `--env-flap`, `--env-body`; ảnh thiệp `<img>`; tem heart/rings/monogram; chữ `introToText`/`introBtnText` qua `textContent`, rỗng → chữ mặc định hiện tại). Tự chuẩn hoá lại (không tin state): màu qua `safeColor`, URL qua `safeUrl`, cắt độ dài.
- `css/app.css`: nắp/thân phong bì dùng biến mới có fallback `--intro-color`; style ảnh trên `.intro-env-card` (object-fit cover, bo góc) và tem monogram (font script, chữ trắng/vàng nhạt dễ đọc).
- `index.html`: (a) thay link Google Fonts bằng link đặc tả (giống hệt); (b) nếu ô chọn phông toàn thiệp là danh sách tĩnh, thêm 19 phông mới cùng giá trị như `FONT_OPTIONS` đặc tả; (c) thêm các ô điều khiển phong bì/màn mở với đúng id trong đặc tả, đặt dưới `#select_introStyle`, tiêu đề nhóm "Tuỳ chỉnh phong bì & màn mở".

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_frontend.md`, `domain_runtime_invite.md`, `docs/tuy-bien-dot-2/dac_ta_tuy_bien_dot_2.md`.
Hàm `handleGlobalImageUpload` và đồng bộ ô do T49 viết trong `editor.js` song song.

## Tiêu chí đạt
- State cũ (không có khoá mới) → phong bì y như hiện tại.
- Không chèn chuỗi người dùng bằng innerHTML. Ảnh lỗi tải → ẩn ảnh, không vỡ phong bì.
- Ô điều khiển vùng chạm đủ, nhãn tiếng Việt; ô màu có nút "Theo màu chủ đạo" (`updateGlobalStyle(key, '')`).

## Lệnh tự kiểm (phiên chính chạy)
`node --check js/runtime.js`; `py tools/build_export_bundle.py`.

## Không được làm
Không sửa `state.js`, `editor.js`, `invite.html`, tệp section.
