# T20 — Công cụ sinh bundle export (AD-003)

- **Sub-agent**: `py-backend` · **Đợt**: 9 · **Review**: có
- **Tệp được tạo**: `tools/build_export_bundle.py`, `server/tests/test_export_bundle.py`

## Giao kèo định dạng (T21 dùng song song — không đổi)
`js/export_bundle.js` có đúng dạng:
```
/* TỆP SINH TỰ ĐỘNG bởi tools/build_export_bundle.py — KHÔNG SỬA TAY. Chạy: py tools/build_export_bundle.py */
window.__EXPORT_SOURCES = {...JSON object: "đường dẫn" -> "nội dung"...};
```
- Khoá: `css/app.css`, `js/state.js`, `js/api.js`, `js/runtime.js`, `js/render.js` và mọi `js/sections/*.js` (sắp xếp theo tên), đường dẫn dùng `/`.
- Nội dung đọc UTF-8, chuẩn hoá xuống dòng thành `\n` (repo có thể CRLF trên Windows).
- JSON sinh bằng `json.dumps(..., ensure_ascii=False, sort_keys=True)` rồi thay `</` → `<\/`, U+2028/U+2029 → ` `/` `; đầu ra deterministic (chạy 2 lần cho cùng byte).
- Ghi tệp tạm rồi `os.replace`. Không đọc gì ngoài danh sách trên.

## Việc
1. `tools/build_export_bundle.py`: hàm `build_bundle(root: Path) -> str` và `main()` ghi `js/export_bundle.js`, in số tệp + kích thước; cờ `--check` trả mã 1 nếu tệp hiện có khác nội dung sinh ra.
2. `server/tests/test_export_bundle.py`: `test_export_bundle_fresh` (tệp trong repo == `build_bundle(repo)`, fail kèm hướng dẫn chạy lệnh), test deterministic, test escape `</script>` và U+2028 (thư mục tạm dựng cây tệp giả).

## Tiêu chí đạt
`py tools/build_export_bundle.py` chạy được; `py -m pytest server/tests -q` pass sau khi phiên chính sinh bundle.
