# Luật Kiểm thử

## 1. Kiểm nhanh (autotest, sau mỗi phiếu/đợt)
Chỉ chạy phần bị ảnh hưởng:

| Phạm vi | Lệnh | Đạt khi |
|---|---|---|
| JS | `node --check <tệp>` cho từng tệp `js/**/*.js` đã sửa | Không lỗi |
| JS registry | `node -e` nạp `js/state.js` + `js/sections/*.js` trong sandbox `vm` với `window` giả, kiểm mỗi loại có `type, defaults, renderCanvas, renderInspector` và `renderCanvas(defaults)` trả chuỗi | Không lỗi |
| Python | `py -m py_compile server/app.py server/excel_store.py` | Không lỗi |
| API | `py -m pytest server/tests -q` | Pass hết |
| Tailwind | `py tools/build_tailwind.py` (sinh lại) hoặc `py tools/build_tailwind.py --check` (chỉ báo lệch) | Khớp; sau khi sinh lại thì chạy `py tools/build_export_bundle.py` |
| Test theo đợt OG/tốc độ | `py -m pytest server/tests/test_tailwind.py server/tests/test_fonts.py server/tests/test_invite_page.py -q` | Pass hết |
| HTML | Mọi `<script src>`/`<link href>` cục bộ trong `index.html`, `invite.html` trỏ tới tệp có thật | Không thiếu |

- Không sửa mã khi kiểm. Lỗi thì báo lệnh, output rút gọn, tệp:dòng.
- Không chạy server nền quá thời gian kiểm; dừng tiến trình sau khi xong.

## 2. Kiểm tay (phiên chính hoặc người dùng)
- `py -m uvicorn server.app:app --port 8000` → `http://localhost:8000/`: editor render đúng, không lỗi console.
- Trang khách `/c/<slug>?khach=Anh%20Nam`, cỡ 390px và desktop.
- `file://.../index.html`: editor chạy, nút xuất bản bị khoá.
- Export HTML mở độc lập.

## 3. Mốc so sánh
Refactor không đổi hành vi: chụp screenshot canvas trước và sau (cùng state mặc định) và so sánh; lưu vào `docs/<slug>/moc/` (không commit ảnh > 500KB).

## 4. Test backend
- Mỗi test dùng `THIEP_DATA_DIR` tạm (`tmp_path`, `monkeypatch`), không đụng `data/` thật.
- Bắt buộc có ca: slug sai, thiếu/sai edit key, upload quá cỡ/sai loại, ghi đồng thời ≥ 20 request (thread pool) → xlsx mở được và đủ dòng, chống formula injection, wishes ẩn khi `hien_thi` FALSE.
