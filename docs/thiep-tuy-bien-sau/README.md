# Hồ sơ: Thiệp tuỳ biến sâu (editor + backend Python/Excel)

- **Nhánh**: `feat/thiep-tuy-bien-sau` (từ `master` @ mốc gốc)
- **Nguồn**: `PLAN_THUC_HIEN.md` · **Giao kèo**: `dac_ta_thiep_tuy_bien_sau.md` · **AD**: AD-001, AD-002 (`docs/quyet_dinh.md`)
- **Phân loại**: [CREATE] luật + tính năng mới · [UPDATE] tách tệp, viết lại agents/skill · [DELETE] 6 agent cũ

## Bảng task
| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| L1–L7 | Luật, agents, skill, hồ sơ | `.agents/`, `.claude/`, `docs/` | phiên chính | 0 | — | — | xong |
| T1 | Tách index.html thành css/js (không đổi hành vi) | index.html, css/, js/ (tách) | frontend-ui | 2 | không | có | chờ |
| T2 | Backend FastAPI + Excel store | `server/app.py`, `server/excel_store.py`, `server/requirements.txt` | py-backend | 2 | không | có | chờ |
| T3 | Registry section + chuyển 6 loại cũ + migrate | `js/render.js`, `js/state.js`, `js/sections/{hero,family,events,countdown,rsvp,album}.js` | frontend-ui | 3 | T1 | có | chờ |
| T4 | CardRuntime dùng chung + export không nhân đôi | `js/runtime.js`, `js/editor.js` | frontend-ui | 3 | T1 | không | chờ |
| T5 | Test API pytest | `server/tests/test_api.py` | py-backend | 3 | T2 | không | chờ |
| T6 | commitState, undo/redo, autosave, JSON, upload | `js/store.js`, `js/editor.js` | frontend-ui | 4 | T3, T4 | có | chờ |
| T7 | Thêm/nhân bản/xoá section + preset toàn thiệp | `js/section_ops.js`, `js/render.js`, `js/state.js` | frontend-ui | 4 | T3 | không | chờ |
| T8 | Client API + modal Xuất bản | `js/api.js`, `index.html` | frontend-ui | 4 | T2, T3 | có | chờ |
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
