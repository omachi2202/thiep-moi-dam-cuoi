# T33 — Front-end: mã tạo thiệp, mở thiệp đã xuất bản để sửa, xử lý upload 403/507

- **Sub-agent**: `frontend-ui` · **Đợt**: 1 · **Review**: có
- **Tệp được sửa (đóng)**: `js/api.js`, `index.html` (chỉ modal Xuất bản), `js/editor.js` (chỉ `uploadOrDataUrl`)
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_security_storage.md` §1, §4, `docs/trien-khai-nhieu-nguoi-dung/dac_ta_trien_khai.md` G1, G2

## Việc
Làm đúng G2 (API server theo G1 do T32 làm song song — chỉ dựa vào giao kèo):
1. `js/api.js`: đọc `needCreateCode` từ health; `publishCard` gửi `X-Create-Code` khi chưa có khoá; `uploadFile` gửi header quyền; thêm `verifyKey`, `getCard`; phần modal: ô mã tạo thiệp (ẩn/hiện theo điều kiện), khối "Mở thiệp đã xuất bản để sửa" và luồng mở (gọi `window.replaceState`). Khoá slug của thiệp vừa mở cho cả nút Xuất bản.
2. `index.html`: markup trong `#publishModal` cho ô mã tạo thiệp và khối mở thiệp (id mới tiền tố `publish`/`openCard`), vùng chạm ≥ 44px, tiếng Việt, gợi ý "Chưa có mã? Liên hệ người quản lý trang."
3. `js/editor.js` `uploadOrDataUrl`: xử lý `status` 403/507 như G2.
4. Hiển thị khoá chỉnh sửa vẫn như cũ sau lần xuất bản đầu.

## Tiêu chí đạt
- `node --check js/api.js js/editor.js` OK (phiên chính chạy).
- Không đưa mã/khoá vào URL, state thiệp, log console.
- `file://`: modal/nút xuất bản vẫn khoá như cũ, không lỗi.
- Server tắt mã: giao diện không hiện ô mã, mọi thứ như cũ.

## Không được làm
Sửa `js/store.js`, `server/`, các phần khác của `index.html`/`editor.js`.
