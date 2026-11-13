# T21 — Export dùng bundle khi file:// (AD-003)

- **Sub-agent**: `frontend-ui` · **Đợt**: 9 · **Review**: có
- **Tệp được sửa**: `js/editor.js` (chỉ phần export), `index.html` (một thẻ script)

## Việc
1. `index.html`: thêm `<script src="js/export_bundle.js"></script>` cuối danh sách script (sau editor.js). Tệp này do phiên chính sinh sau khi T20 xong — lúc bạn làm có thể chưa tồn tại.
2. `editor.js` export: hàm `getExportSource(path)`: nếu `location.protocol !== 'file:'` thử `fetch` như hiện tại; lỗi hoặc `file:` → `window.__EXPORT_SOURCES && window.__EXPORT_SOURCES[path]` (kiểm `typeof === 'string'`); thiếu cả hai → throw. Bỏ đoạn chặn file:// ở đầu `openExportModal`; chỉ báo toast "Thiếu js/export_bundle.js — chạy: py tools/build_export_bundle.py" khi không lấy được nguồn.
3. Khoá bundle: `css/app.css`, `js/state.js`, `js/api.js`, `js/runtime.js`, `js/render.js`, `js/sections/<type>.js` (danh sách section vẫn từ `getExportSectionFiles()`).
4. Không đổi phần còn lại (escape `</script>`, state JSON, bootstrap, title).

## Tiêu chí đạt
Mở `index.html` bằng file:// → "Xuất file HTML" ra đủ 13 section, tệp mở độc lập chạy được; qua http vẫn như cũ.
