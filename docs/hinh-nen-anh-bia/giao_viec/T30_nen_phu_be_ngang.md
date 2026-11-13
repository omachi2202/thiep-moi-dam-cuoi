# T30 — Hình nền "cover" → phủ theo bề ngang, lặp dọc

- **Sub-agent**: `frontend-ui` · **Review**: có
- **Tệp được sửa (đóng)**: `js/state.js`, `index.html`
- **Nguồn**: ảnh chụp 390px cho thấy `background-size: cover` trên thiệp cao ~6000px phóng ảnh quá mức, chỉ còn mảng màu. Người dùng chọn phương án A (2026-11-14).

## Việc
1. `js/state.js` `cardBgVars(g)`: với `bgImageFit === 'cover'` (giữ nguyên giá trị lưu để tương thích dữ liệu, KHÔNG đổi whitelist/migrate/schema) trả `--card-bg-size: '100% auto'`, `--card-bg-repeat: 'repeat-y'`. `repeat` giữ nguyên (`auto` / `repeat`). Cập nhật comment.
2. `index.html` select `select_bgImageFit`: nhãn option `cover` đổi thành "Phủ theo bề ngang (lặp dọc)"; `repeat` giữ "Lặp hoạ tiết".
3. Không đổi CSS (đã dùng biến `--card-bg-size/--card-bg-repeat`).

## Tiêu chí đạt
`node --check js/state.js` OK; `cardBgVars({bgImage:'https://x/a.jpg'})` → size `100% auto`, repeat `repeat-y`; dữ liệu cũ `bgImageFit:'cover'` vẫn hợp lệ.
