# T48 — Luật phông chữ, trường phong bì, bố cục section

**Sub-agent**: memoryer · **Đợt** 1 · **Review**: không

## Tệp được sửa
- `.agents/rules/domain_frontend.md` §3: phông mới chỉ lấy phông Google Fonts có subset `vietnamese`; link phông phải giống hệt ở `index.html`, `invite.html` và chuỗi export trong `js/editor.js`; giá trị `FONT_OPTIONS` dạng `'<Tên>', <generic>`.
- `.agents/rules/domain_runtime_invite.md` §2: màn mở đọc thêm `globalStyle.envFlapColor/envBodyColor` (qua `safeColor`, rỗng = màu chủ đạo), `envCardImage` (qua `safeUrl`, `<img>`), `envSeal` (`heart|rings|monogram`), `envMonogram` (≤4 ký tự), `introToText` (≤40), `introBtnText` (≤24); mọi chữ chèn bằng `textContent`.
- `.agents/rules/domain_sections.md` §2 mục "Biến thể bố cục": liệt kê bố cục hiện có — hero `classic|fade|arch|fullscreen`, family `classic|split|traditional`, events `cards|timeline|carousel`, album `grid|masonry|feature`, thanks `classic|overlay|curved`; bố cục mặc định phải render như bản trước khi có `layout`.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `docs/tuy-bien-dot-2/dac_ta_tuy_bien_dot_2.md`.

## Tiêu chí đạt
Ba tệp có nội dung trên bằng tiếng Việt, ngắn gọn; không sửa tệp khác, không sửa AD.
