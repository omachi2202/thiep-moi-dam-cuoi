# T4 — Boot trang khách nhanh, phông theo thiệp, nhạc không tải trước, editor gửi `share`

**Sub-agent**: frontend-ui · **Đợt** 1 · **Review**: có

## Mục tiêu
Đặc tả §3.

## Tệp được sửa (danh sách đóng)
- `invite.html`: bỏ link Google Fonts 30 họ (giữ 2 preconnect); boot đọc `#cardState` (fallback fetch); chèn link phông bằng `window.cardFontsUrl(state)` trước render (hàm do T2 viết song song — kiểm `typeof === 'function'`, không có thì chèn link đầy đủ cũ làm dự phòng); không chờ health; `<audio … preload="none">`.
- `js/api.js`: giữ promise của `checkHealth()`; gửi RSVP/lời chúc/lấy lời chúc và chỗ kiểm `api.available` ở form phải chờ promise đó nếu chưa xong (không đổi hành vi khi `file://`).
- `js/editor.js` — CHỈ 2 chỗ: (a) chỗ gọi `api.publishCard` truyền `Object.assign({}, appState, { share: cardShareInfo(appState) })` (kiểm hàm tồn tại); (b) `preload="none"` cho `<audio>` trong chuỗi export (nếu có).

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `domain_frontend.md`, `domain_runtime_invite.md`, `docs/og-va-toc-do/dac_ta_og_va_toc_do.md`.

## Tiêu chí đạt
- Mở `/c/<slug>` có `#cardState`: không request `/api/cards/<slug>`; render không đợi `/api/health`.
- Không có `#cardState`: vẫn chạy như trước.
- Khách bấm gửi RSVP ngay sau khi mở: không báo nhầm "không có máy chủ".
- Nhạc chỉ tải sau khi bấm mở thiệp.
- Không sửa link phông của editor (`index.html`) và chuỗi export.

## Lệnh tự kiểm (phiên chính chạy)
`node --check js/api.js js/editor.js`; trích script trong `invite.html` rồi `node --check`; `py tools/build_export_bundle.py`; `py -m pytest server/tests -q`.

## Không được làm
Không sửa `state.js`, `runtime.js`, section, CSS, `index.html`, server.
