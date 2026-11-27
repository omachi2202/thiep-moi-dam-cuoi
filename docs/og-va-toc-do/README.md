# Ảnh xem trước khi chia sẻ link + tăng tốc trang khách

Nhánh `feat/og-va-toc-do`. Người dùng duyệt 2026-11-27:
- Dán link `/c/<slug>` vào Zalo/Messenger/Facebook hiện khung xem trước: ảnh bìa trang 1, tiêu đề "THƯ MỜI TIỆC CƯỚI · <tên cặp đôi>", mô tả giờ · ngày · địa điểm (mẫu: ziuwedding.site/mm03).
- Trang khách tải chậm: sửa dứt điểm theo nguyên nhân đo được (đặc tả §0), gồm AD-005 (Tailwind dựng sẵn).

Giao kèo chung: `dac_ta_og_va_toc_do.md`.

## Bảng task

| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| T1 | Luật + AD-005 + tài liệu deploy | `.agents/rules/domain_backend.md`, `domain_runtime_invite.md`, `domain_frontend.md`, `docs/quyet_dinh.md`, `CLAUDE.md`, `docs/deploy.md` (ngoại lệ: phiếu tài liệu) | memoryer | 1 | không | không | Đạt |
| T2 | `share` (schema 8), hook `shareImage`, `cardShareInfo`, `cardFontsUrl`, ảnh bìa ưu tiên | `js/state.js`, `js/runtime.js`, `js/sections/hero.js` | frontend-ui | 1 | không | có | Đạt |
| T3 | `/c/{slug}` server dựng (OG + state nhúng + preload), `?v=` cho JS/CSS | `server/app.py`, `server/tests/test_invite_page.py`, `server/tests/test_cache_headers.py` | py-backend | 1 | giao kèo | có | Đạt |
| T4 | Boot đọc state nhúng, health không chặn, phông theo thiệp, nhạc `preload=none`, editor gửi `share` | `invite.html`, `js/api.js`, `js/editor.js` | frontend-ui | 1 | giao kèo | có | Đạt |
| T5 | Ảnh lười tải | `js/sections/album.js`, `family.js`, `thanks.js`, `slideshow.js` (ngoại lệ 4 tệp, mỗi tệp 1–3 dòng) | frontend-ui | 1 | không | không | Đạt |
| T6 | Công cụ dựng Tailwind + `css/tailwind.css` + test độ mới | `tools/build_tailwind.py`, `tools/tailwind.config.js`, `css/tailwind.css`, `server/tests/test_tailwind.py`, `.gitignore` | frontend-ui + phiên chính chạy CLI | 2 | T1; **điểm dừng: tải CLI** | có | Đạt |
| T7 | Bỏ Tailwind CDN ở editor, trang khách, export | `index.html`, `invite.html`, `js/editor.js`, `tools/build_export_bundle.py` | frontend-ui | 3 | T4, T6 | có | Đạt |
| T8 | Tài liệu cuối (CLAUDE.md, Điều 2 ghi AD-005, hook `shareImage`, lệnh test, backlog) | `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_sections.md`, `domain_workflow_testing.md`, `docs/backlog.md` | memoryer | 4 | T7 | không | Đạt |

Sau mỗi đợt: `autotest` (sinh lại bundle, `node --check`, pytest, đo trước/sau). Cuối: `inspector`.

## Nhật ký nghiệm thu

- 2026-11-27 — Đợt 1 (T1–T5) xong. T3.1: sửa 2 test kiểm nhầm chuỗi `cardState` (boot của invite.html cũng chứa chữ này) → kiểm `id="cardState"`.
- reviewer-code T2–T4: ĐẠT, không chặn. Nên sửa → T2.1 (URL ảnh > 500 ký tự bỏ hẳn, không cắt dở), T3.2 (preload ảnh dùng `/uploads/...` khớp `<img>`; cache phần chèn theo mtime/size, tối đa 256 mục; `test_fonts.py` ràng buộc FONT_OPTIONS/THEME_PRESETS ⊂ GOOGLE_FONT_SPECS ⊂ link đầy đủ), T4.1 (checkHealth dùng chung promise, request thử lại health một lần, cảnh báo khi xuất bản mà ảnh bìa chưa lên máy chủ). Đã sửa.
- Kiểm: `node --check` các tệp JS + script boot; bundle sinh lại; pytest 81 passed.
- Chạy thử cục bộ trên bản sao `du-va-mai` (THIEP_PUBLIC_URL=https://khanhdu.store), UA `facebookexternalhit/1.1`: og:title "THƯ MỜI TIỆC CƯỚI · Dư & Mai", og:description "11:30 · 20/12/2026 · SUNRISE CÀ NA", og:image ảnh bìa tuyệt đối; JS/CSS `?v=` → `immutable`; CSS phông 137KB → 47KB (30 → 7 họ); nhạc `preload="none"`. Thiệp cũ chưa có `share` → OG mặc định, không ảnh, tới khi xuất bản lại.
- Ghi nhận chưa sửa: link phông chèn bằng JS sau migrate (có thể nháy phông); thử tay nhạc trên iOS Safari.
- 2026-11-27 — T6: người dùng đồng ý tải CLI; `tailwindcss-windows-x64.exe` v3.4.17 (40.023.844 byte) từ GitHub releases tailwindlabs, sha256 `67f1c5e3…a346` khớp `sha256sums.txt`, đặt `tools/bin/` (git-ignore). `css/tailwind.css` 30.474 byte; đối chiếu 508 lớp trong `class="..."`: chỉ thiếu lớp CSS riêng của app.css (`animate-fadeIn` vốn chưa từng được định nghĩa). Safelist rỗng.
- T7: tailwind.css đặt SAU app.css/invite.css (giống Play CDN chèn `<style>` cuối head); export inline qua bundle. Chụp headless Chrome trước (worktree master) / sau: trang khách 390px và editor 1400px giống nhau (chỉ khác cánh hoa rơi ngẫu nhiên).
- reviewer-code T6–T7: ĐẠT; nên sửa → T6.1 (timeout CLI 120 giây, ghi chú hash không gồm phiên bản CLI). Đã sửa. T8 tài liệu Đạt.
- pytest 84 passed; `build_tailwind.py --check` OK; `git ls-files data tools/bin` rỗng.
- inspector: PASS (10 Điều đạt); 2 việc hồ sơ (trạng thái T6/T7, câu lỗi thời ở domain_frontend.md §3) đã sửa.

