# T1 — Luật, AD-005, tài liệu

**Sub-agent**: memoryer · **Đợt** 1 · **Review**: không

## Mục tiêu
Ghi vào luật mọi quy ước mới của `docs/og-va-toc-do/dac_ta_og_va_toc_do.md`.

## Tệp được sửa (danh sách đóng)
- `.agents/rules/domain_backend.md` §3: dòng `GET /c/{slug}` → server dựng từ `invite.html`, chèn OG + `<script id="cardState" type="application/json">` + preload ảnh trước `</head>` (đặc tả §2); biến `THIEP_PUBLIC_URL` trong bảng cấu hình, tham số `public_url` của `create_app`; chính sách `?v=` (đặc tả §2b).
- `.agents/rules/domain_runtime_invite.md` §2: boot đọc state nhúng, fallback fetch; health không chặn render; phông theo `cardFontsUrl(state)`; nhạc `preload="none"`; `state.share` + `cardShareInfo` + hook `shareImage`.
- `.agents/rules/domain_frontend.md`: thay quy tắc "cùng một link Google Fonts ở 3 nơi" bằng: editor + export dùng link đầy đủ (giống nhau từng ký tự), trang khách dùng `cardFontsUrl(state)`; phông mới phải thêm vào cả link đầy đủ lẫn `GOOGLE_FONT_SPECS`. Nếu `domain_sections.md` cần ghi hook `shareImage` thì báo trong Đề xuất (không sửa).
- `docs/quyet_dinh.md`: thêm **AD-005 — Tailwind CSS dựng sẵn**: bối cảnh (đặc tả §0 mục 1), quyết định (đặc tả §5: CLI standalone v3.4.17, không npm, `tools/build_tailwind.py`, `css/tailwind.css` commit, test so hash, KHÔNG sửa tay), hệ quả (mở rộng ngoại lệ Điều 2 cùng kiểu AD-003; sửa lớp Tailwind trong HTML/JS thì phải chạy lại tool). Không sửa AD đã chốt.
- `CLAUDE.md`: mục Running (Tailwind sẽ dựng sẵn theo AD-005 — ghi chú "sau T7"), quy tắc phông, Guest page (`/c/` do server dựng, OG, `share`, schema 8), Backend (`THIEP_PUBLIC_URL`).
- `docs/deploy.md`: thêm biến `THIEP_PUBLIC_URL=https://<tên miền>` vào phần biến môi trường/compose; mục "Làm mới ảnh xem trước" (Facebook Sharing Debugger; Zalo nhớ cache, có thể thêm `?v=2` vào link khi gửi lại).

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, các tệp trên, đặc tả.

## Tiêu chí đạt
Mọi quy ước của đặc tả §1–§5 có chỗ ghi trong luật; không còn câu "cùng một link Google Fonts ở 3 nơi" mâu thuẫn; AD-005 đủ bối cảnh/quyết định/hệ quả. Tiếng Việt.

## Không được làm
Không sửa mã; không sửa AD-001..004; không sửa `hard_constitution.md` (ghi đề xuất nếu thấy cần).
