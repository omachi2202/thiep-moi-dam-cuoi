# T5 — Ảnh lười tải

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: không

## Mục tiêu
Đặc tả §4: ảnh dưới màn hình chỉ tải khi khách cuộn tới.

## Tệp được sửa (danh sách đóng)
`js/sections/album.js`, `js/sections/family.js`, `js/sections/thanks.js`, `js/sections/slideshow.js` — chỉ thêm `loading="lazy" decoding="async"` vào thẻ `<img>` hiển thị ảnh người dùng (slideshow: ảnh đầu `loading="eager"`). `<img>` lightbox dựng động thì không cần.

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_sections.md`, `docs/og-va-toc-do/dac_ta_og_va_toc_do.md`.

## Tiêu chí đạt
Mọi `<img>` ảnh người dùng trong 4 tệp có lazy (trừ ảnh đầu slideshow); bố cục, `onerror`, lightbox không đổi.

## Lệnh tự kiểm (phiên chính chạy)
`node --check` 4 tệp; `py tools/build_export_bundle.py`; pytest.

## Không được làm
Không sửa tệp khác; không đổi lớp CSS/bố cục.
