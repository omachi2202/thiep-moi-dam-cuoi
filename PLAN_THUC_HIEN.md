# Kế hoạch: Tuỳ biến sâu thiệp cưới online (editor + backend Python/Excel)

## Context
`index.html` hiện là editor 1 file, dựa trên section (hero, family, events, countdown, rsvp, album), không lưu trữ, RSVP chỉ hiện toast, logic runtime bị nhân đôi trong chuỗi export. Người dùng muốn tuỳ biến sâu hơn theo hướng ziuwedding.site / Canva.

Nghiên cứu (Chrome extension bị chặn site permissions → dùng web-fetch; Canva trả 403):
- **ziuwedding.site**: hero, save the date, cha mẹ, giờ/địa điểm, countdown, lịch tháng, map, album, quote, RSVP, mừng cưới, nhạc.
- **cinelove.me**: mở phong bì, hiệu ứng rèm/intro, tuyết/sao rơi, nền video, link riêng từng khách (tên khách trên thiệp), thêm vào Google/Outlook/ICS, RSVP có số người + dashboard, hộp lời chúc hiển thị trên thiệp, QR mừng cưới, kho template theo danh mục, xem trước.

Quyết định đã chốt với người dùng:
- Làm cả 4 nhóm: section mới, style sâu hơn, trải nghiệm khách, editor & lưu trữ.
- Giữ mô hình **dựa trên section** (không làm kéo-thả tự do kiểu Canva).
- **Backend Python, dữ liệu khách lưu Excel (.xlsx)**.
- Phát hành qua backend: `/c/<slug>?khach=<tên>`.
- **Tách JS/CSS ra file riêng**, vẫn không cần bước build.

## Cấu trúc thư mục mới
```
index.html                 # editor (chỉ còn markup + nạp script)
invite.html                # trang khách: nạp state từ /api/cards/<slug>, render chế độ chỉ đọc
css/app.css                # style editor + thiệp (animation, khung, hiệu ứng)
js/state.js                # DEFAULT_STATE, FONT_OPTIONS, THEME_PRESETS, SECTION_TYPES, migrate()
js/sections/*.js           # mỗi loại section 1 file: { type, label, icon, defaults, renderCanvas(sec, ctx), renderInspector(sec) }
js/render.js               # renderAll, renderSectionListSidebar, renderWeddingCanvas (lặp registry), renderRightInspector
js/runtime.js              # countdown, nhạc, hiệu ứng rơi, modal mừng cưới, RSVP/lời chúc fetch, scroll-reveal, phong bì — DÙNG CHUNG editor + invite.html
js/editor.js               # update* mutators, undo/redo, autosave, import/export JSON, publish
server/app.py              # FastAPI
server/excel_store.py      # đọc/ghi .xlsx bằng openpyxl, có threading.Lock
server/requirements.txt    # fastapi, uvicorn, openpyxl, python-multipart
data/cards/<slug>.json     # state thiệp đã publish
data/uploads/              # ảnh/nhạc upload (thay base64)
data/guests.xlsx           # sheet RSVP, sheet LoiChuc, sheet KhachMoi
```

## Bước 1 — Tái cấu trúc (không đổi hành vi)
1. Tách `<style>` → `css/app.css`, `<script>` → các file js như trên (script thường, gắn vào `window`, không cần module/build).
2. **Registry section**: thêm trường `type` tách khỏi `id` (id duy nhất kiểu `hero-1`), để cho phép thêm/nhân bản section cùng loại. `renderWeddingCanvas()` / `renderRightInspector()` (hiện `index.html:849`, `index.html:1107`) chuyển các nhánh `if (sec.id === ...)` thành `SECTION_TYPES[sec.type].renderCanvas/renderInspector`.
3. `migrate(state)` chuẩn hoá state cũ (gán `type = id`, thêm field mặc định mới).
4. Xoá runtime nhân đôi trong `openExportModal()` (`index.html:1563`–`1666`): export/invite đều nạp `js/runtime.js` + `js/sections/*`. Export HTML tĩnh vẫn giữ (nhúng state JSON + inline các file js/css lúc export) làm phương án dự phòng.

## Bước 2 — Editor & lưu trữ
- Autosave `localStorage` (debounce 500ms, try/catch) + nút "Khôi phục bản nháp".
- Undo/redo: stack snapshot JSON (tối đa 50) đẩy trong mọi mutator (`updateSectionField`, `updateSectionStyle`, `updateGlobalStyle`, `updateBankInfo`, move/toggle/add/delete); phím Ctrl+Z / Ctrl+Y.
- Xuất/nhập JSON thiệp.
- Sidebar: nút **+ Thêm section** (chọn loại từ registry), nhân bản, xoá (giữ `moveSection`, `toggleSectionVisibility`).
- **Template preset** toàn thiệp (mở rộng `applyThemePreset` `index.html:1376`): 4–6 mẫu = bộ màu + font + nền + khung + hiệu ứng + thứ tự section.
- Upload ảnh/nhạc lên `POST /api/upload` khi có backend; fallback base64 khi mở file trực tiếp.
- Nút **Xuất bản**: nhập slug → `PUT /api/cards/<slug>` → hiện link + QR (thư viện qrcode từ CDN) + mẫu tin nhắn mời copy được.

## Bước 3 — Section mới (mỗi loại 1 file trong `js/sections/`)
`story` (timeline chuyện tình: mốc thời gian, ảnh, mô tả — danh sách động), `video` (YouTube/MP4 nhúng), `map` (iframe Google Maps embed + nút chỉ đường), `dresscode` (bảng màu swatch + ghi chú), `wishes` (form gửi lời chúc + tường lời chúc lấy từ API), `gift` (QR VietQR tự sinh từ bankInfo qua `img.vietqr.io` + nút copy STK — tách khỏi rsvp), `thanks` (lời cảm ơn + ảnh). RSVP nâng cấp: tên, số người, tham dự/không, bên nhà trai/gái, ghi chú.

## Bước 4 — Style sâu hơn
- `globalStyle` thêm: `bgTexture` (none/giấy/hoa/lụa — SVG/CSS gradient nội tuyến), `frameStyle` (viền đơn/đôi/hoa góc), `cornerOrnament`, `revealAnimation` (none/fade-up/zoom/slide), `fallingEffect` thêm `snow`, `stars`, `petals`.
- Mỗi section thêm override: `bgColor`, `bgImage` + `bgOverlayOpacity`, `paddingY`, `align`, `animation`, `ornament` (sticker hoa trên/dưới). Inspector thêm nhóm "Nền & Trang trí".
- Scroll-reveal bằng `IntersectionObserver` trong `runtime.js` (tắt trong editor để dễ chỉnh).

## Bước 5 — Trải nghiệm khách (`invite.html` + `runtime.js`)
- Màn **mở phong bì** (`globalStyle.introStyle`: none/envelope/curtain) — click mở đồng thời bật nhạc (giải quyết chặn autoplay).
- Tên khách cá nhân hoá: `?khach=Anh%20Nam` → thay placeholder `{khach}` trong text (mặc định "Quý khách"), tự điền form RSVP.
- Thêm vào lịch: link Google Calendar + tải file `.ics` sinh từ `weddingIsoDate` / events.
- RSVP & lời chúc `POST` về API; tường lời chúc `GET /api/cards/<slug>/wishes`.

## Bước 6 — Backend Python + Excel (`server/`)
- FastAPI, phục vụ tĩnh thư mục gốc (editor ở `/`, khách ở `/c/{slug}` → `invite.html`).
- API:
  - `GET/PUT /api/cards/{slug}` — đọc/ghi `data/cards/{slug}.json` (validate slug `^[a-z0-9-]{3,50}$`, khoá ghi bằng `X-Edit-Key` sinh ra khi tạo thiệp lần đầu, lưu localStorage editor).
  - `POST /api/upload` — lưu `data/uploads/`, giới hạn 10MB, chỉ ảnh/audio.
  - `POST /api/cards/{slug}/rsvp`, `POST/GET /api/cards/{slug}/wishes` — ghi `data/guests.xlsx` (cột: thời gian, slug, tên, SĐT, số người, tham dự, bên, lời nhắn); lời chúc chỉ trả các dòng đã duyệt (cột `hien_thi`, mặc định TRUE).
  - `GET /api/cards/{slug}/export.xlsx` (cần edit key) — tải danh sách RSVP/lời chúc.
- `excel_store.py`: `threading.Lock` quanh load/save workbook (openpyxl không an toàn đa luồng); tạo file + header nếu chưa có.
- Chạy: `pip install -r server/requirements.txt` → `uvicorn server.app:app --reload --port 8000`.

## Cập nhật tài liệu
Sửa `CLAUDE.md`: cấu trúc file mới, registry section (thêm loại = 1 file trong `js/sections/` + đăng ký), runtime dùng chung, cách chạy backend.

## Kiểm thử
1. `uvicorn server.app:app --reload` → mở `http://localhost:8000/`: editor render giống hiện tại (so sánh trước/sau tái cấu trúc bằng Chrome extension/screenshot).
2. Thêm/nhân bản/xoá/sắp xếp section, đổi preset, undo/redo, reload trang → bản nháp còn.
3. Xuất bản slug `tung-ngoc` → mở `/c/tung-ngoc?khach=Anh%20Nam`: phong bì, nhạc, tên khách, countdown, lịch .ics, map, QR VietQR.
4. Gửi RSVP + lời chúc → kiểm tra `data/guests.xlsx` có dòng mới, tường lời chúc hiển thị; gửi đồng thời vài request (curl) không hỏng file.
5. Mở `index.html` trực tiếp bằng file:// → editor vẫn chạy (không backend: tắt nút xuất bản, ảnh dùng base64).
6. Export HTML tĩnh vẫn mở được độc lập.
