# Hồ sơ: Thiệp tuỳ biến sâu (editor + backend Python/Excel)

- **Nhánh**: `feat/thiep-tuy-bien-sau` (từ `master` @ mốc gốc)
- **Nguồn**: `PLAN_THUC_HIEN.md` · **Giao kèo**: `dac_ta_thiep_tuy_bien_sau.md` · **AD**: AD-001, AD-002 (`docs/quyet_dinh.md`)
- **Phân loại**: [CREATE] luật + tính năng mới · [UPDATE] tách tệp, viết lại agents/skill · [DELETE] 6 agent cũ

## Bảng task
| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| L1–L7 | Luật, agents, skill, hồ sơ | `.agents/`, `.claude/`, `docs/` | phiên chính | 0 | — | — | xong |
| T1 | Tách index.html thành css/js (không đổi hành vi) | index.html, css/, js/ (tách) | frontend-ui | 2 | không | có | xong |
| T2 | Backend FastAPI + Excel store | `server/app.py`, `server/excel_store.py`, `server/requirements.txt` | py-backend | 2 | không | có | xong |
| T3 | Registry section + chuyển 6 loại cũ + migrate | `js/render.js`, `js/state.js`, `js/sections/{hero,family,events,countdown,rsvp,album}.js` | frontend-ui | 3 | T1 | có | xong |
| T4 | CardRuntime dùng chung + export không nhân đôi | `js/runtime.js`, `js/editor.js` | frontend-ui | 3 | T1 | không | xong |
| T5 | Test API pytest | `server/tests/test_api.py` | py-backend | 3 | T2 | không | xong |
| T6 | commitState, undo/redo, autosave, JSON, upload | `js/store.js`, `js/editor.js` | frontend-ui | 4 | T3, T4 | có | chờ |
| T7 | Thêm/nhân bản/xoá section + preset toàn thiệp | `js/section_ops.js`, `js/render.js`, `js/state.js` | frontend-ui | 4 | T3 | không | chờ |
| T8 | Client API + modal Xuất bản | `js/api.js`, `index.html` | frontend-ui | 4 | T2, T3 | có | xong (T8.1 đang sửa) |
| T9 | Section story + video | `js/sections/story.js`, `js/sections/video.js` | frontend-ui | 5 | T7 | không | chờ |
| T10 | Section map + dresscode | `js/sections/map.js`, `js/sections/dresscode.js` | frontend-ui | 5 | T7 | không | chờ |
| T11 | Section wishes + gift (VietQR) | `js/sections/wishes.js`, `js/sections/gift.js` | frontend-ui | 5 | T7, T8 | có | chờ |
| T12 | Section thanks + nâng cấp RSVP | `js/sections/thanks.js`, `js/sections/rsvp.js` | frontend-ui | 5 | T7, T8 | có | chờ |
| T13 | Style toàn thiệp mới: state + điều khiển | `js/state.js`, `index.html`, `js/editor.js` | frontend-ui | 6 | đợt 5 | có | chờ |
| T14 | Áp texture/khung/ornament/reveal + override nền section | `js/render.js`, `css/app.css` | frontend-ui | 6 | đợt 5 | không | chờ |
| T15 | Trang khách invite.html + intro, {khach}, lịch, reveal, hiệu ứng rơi | `invite.html`, `js/runtime.js`, `css/invite.css` | frontend-ui | 6 | đợt 5 | có | chờ |
| T16 | Rà thẩm mỹ desktop + 390px | (chỉ đọc) | ui-aesthetic-reviewer | 7 | T13–T15 | — | chờ |
| T17 | Cập nhật CLAUDE.md + biên bản | `CLAUDE.md`, `docs/thiep-tuy-bien-sau/README.md` | memoryer | 7 | T15 | không | chờ |

Ngoại lệ đã duyệt: T1 sửa nhiều hơn 3 tệp (tách tệp cơ học, đa số là stub). T13 trong kế hoạch được tách thành T13 (state + điều khiển) và T14 (áp lớp + CSS) để không trùng tệp với T15 trong cùng đợt.

## Nhật ký nghiệm thu
- **T1** (2026-11-13): ĐẠT. Phiên chính so sánh từng dòng với `master:index.html`: CSS trùng khớp; tập hàm trùng khớp; chỉ khác ở `THEME_PRESETS`, các stub, comment và thẻ script. `node --check` mọi tệp JS đạt. reviewer-code: ĐẠT, không có mục CHẶN/NÊN SỬA (thứ tự nạp, onload, handler toàn cục, #editorToolbar, export). Chưa kiểm trên trình duyệt (chờ kiểm tay sau T3).
- **T2 + T2.1** (2026-11-13): review lần 1 CHƯA ĐẠT (CHẶN: PUT đọc trọn body trước khi kiểm 2MB) cùng 6 mục NÊN SỬA, sau đó làm phiếu sửa T2.1 (9 mục, thêm quyết định trả 404 khi thiệp chưa tồn tại). Re-review: ĐẠT. Smoke test bằng TestClient trên thư mục tạm: health, edit key, chặn traversal, 413/422/404/429, SVG bị chặn, /docs tắt. Còn lại T2.2 (chỉ bắt các lỗi hỏng tệp thực sự khi đổi tên xlsx, stamp chống trùng), làm sau T5.
- **T4 + T4.1** (2026-11-13): lần đầu `node --check js/editor.js` LỖI (regex chứa ký tự U+2028/2029 thô). T4.1 sửa lỗi này và thêm `js/api.js` vào export. Sau sửa: node --check đạt, `_exportJson` thoát đúng `</script>`, U+2028, U+2029. Chưa kiểm tích hợp với T3 (export, CardRuntime.init) — kiểm sau khi T3 xong.
- **T5** (2026-11-13): `py -m pytest server/tests -q` cho 27 passed (warning chỉ là DeprecationWarning của thư viện), không tạo `data/` trong repo. Chưa phủ: 503 PermissionError, rate limit GET wishes/upload.
- **T2.2** (2026-11-13): chỉ cách ly xlsx khi thật sự hỏng; OSError trả 503 và không đổi tên tệp; tên tệp cách ly thêm 4 hex. pytest: 29 passed. reviewer-code: ĐẠT.
- **T3** (2026-11-13): kiểm bằng vm: đủ 6 loại theo hợp đồng, migrate idempotent, XSS cơ bản bị chặn. Ảnh chụp headless editor sau T3 giống hệt mốc trước T1. reviewer-code: ĐẠT, có 4 mục NÊN SỬA (N1 injection qua id trong onclick, N2 CSS injection, N3 focusout ghi lại khi không sửa/IN HOA, N4 render không chịu lỗi), giao phiếu T3.1 sửa trước đợt 4.
- **T8** (2026-11-13): chạy tích hợp thật với backend: publish lần 1 có editKey và lưu lại, lần 2 dùng lại key, sai key báo lỗi tiếng Việt, wishes/rsvp chạy, state gửi lên đã bỏ trường editor. reviewer-code: ĐẠT, có 3 mục NÊN SỬA (timeout request, race khi vẽ QR, SRI), giao T8.1. Đưa vào backlog: ô nhập edit key thủ công cho slug đã tồn tại (G3); CSP cho /c/ (đề xuất kiểm ở T15).
- **T3.1** (2026-11-13): kiểm bằng vm đạt (chặn injection qua id/CSS, render không chịu ảnh hưởng khi thiếu photos, migrate idempotent, HTML mặc định không đổi). Re-review: ĐẠT nhưng phát hiện hồi quy M1 (safeFont loại Roboto Slab), giao T3.2 (vòng 2, vòng cuối).
- **T8.1** (2026-11-13): thêm timeout AbortController, chống race QR, SRI cho qrcodejs, copyFrom báo đúng kết quả, xoá edit key khi đóng modal, gọi lại checkHealth. Chạy lại tích hợp với backend: đạt. Re-review: ĐẠT.
- **T3.2** (2026-11-13): thêm Roboto Slab/Tinos/Open Sans vào FONT_OPTIONS, SECTION_TYPES dùng Object.create(null) kèm getSectionDef, inspector chịu lỗi, preview không cho sửa. Kiểm bằng vm: Roboto Slab hiển thị, type 'constructor' an toàn, các kiểm của T3.1 vẫn đạt. Re-review vòng 2: ĐẠT.
