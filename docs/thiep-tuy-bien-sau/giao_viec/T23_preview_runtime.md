# T23 — "Xem thực tế" chạy hiệu ứng như khách (runtime)

- **Sub-agent**: `frontend-ui` · **Đợt**: 10 · **Review**: có
- **Tệp được sửa**: `js/runtime.js`, `js/render.js`, `css/app.css` (và `css/invite.css` nếu phải chuyển CSS intro)
- **Luật**: `.agents/rules/domain_runtime_invite.md` §1 (đã thêm mode 'preview'), `domain_sections.md` §1

## Việc
1. `render.js`: canvas editor dựng với `ctx.mode = appState.isPreviewMode ? 'preview' : 'editor'` (cả renderCardHtml cho canvas lẫn ctx truyền CardRuntime.init). Không đổi mode 'invite'/'export'.
2. `runtime.js`: mode 'preview' xử lý như 'invite' cho intro, `.reveal-on` + IntersectionObserver, hiệu ứng rơi, thay `{khach}` ("Quý khách"); khác biệt:
   - Overlay intro gắn vào `#weddingCardFrame` (position: absolute; inset: 0; z-index trên nội dung khung), KHÔNG gắn body, KHÔNG khoá `body.style.overflow`; khi mở xong thì gỡ overlay.
   - IntersectionObserver: dùng root = phần tử cuộn chứa canvas nếu có (tìm tổ tiên gần nhất có overflow-y auto/scroll), không có thì null.
   - Xuất `CardRuntime.replayIntro()`: nếu đang preview → dựng lại intro + reset reveal (bỏ `.is-visible`), cuộn khung về đầu.
   - `destroy()` gỡ overlay preview, observer, `.reveal-on`.
   - Hiệu ứng rơi: bảo đảm nhìn thấy trong khung ở editor/preview (kiểm z-index/vị trí `#fallingContainer` so với nội dung khung; ảnh chụp hiện có 12 phần tử rơi nhưng không thấy).
3. CSS intro (phong bì/rèm) hiện ở `css/invite.css` mà editor không nạp: chuyển các quy tắc intro sang `css/app.css` (giữ nguyên tên lớp), invite.css chỉ giữ phần riêng trang khách. Thêm biến thể khung: `.intro-in-frame { position:absolute; inset:0; border-radius: inherit; }`.
4. Chế độ Thiết kế (mode 'editor') giữ nguyên hành vi.

## Giao kèo với T24 (song song)
T24 sửa `editor.js` (setPreviewMode, nút "Xem lại hiệu ứng mở" gọi `CardRuntime.replayIntro()`), `index.html`, `store.js` — không đụng tệp của T23.

## Tiêu chí đạt
CDP 1440px: bật "Xem thực tế" → intro hiện trong khung điện thoại, bấm mở → reveal khi cuộn trong khung, cánh hoa rơi nhìn thấy; tắt preview → về chế độ Thiết kế không còn overlay/reveal; trang khách /c/ không đổi. Sau khi xong phiên chính sinh lại bundle.
