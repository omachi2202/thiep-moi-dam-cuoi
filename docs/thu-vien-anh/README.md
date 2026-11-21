# Thư viện ảnh theo thiệp + tên tệp theo section + giới hạn 30MB

Nhánh `feat/thu-vien-anh`. Yêu cầu người dùng (2026-11-21):
- Thêm một tab ở cột phải chứa các ảnh đã tải lên **của thiệp đang sửa** (không hiện ảnh của thiệp khác).
- Tệp lưu tên dạng `<section>-<n>_<ngẫu nhiên>.<đuôi>` (giữ định dạng gốc sau nén, không ép PNG).
- Cho tải tệp lớn hơn: giới hạn mỗi tệp 30MB (ảnh vẫn được nén phía trình duyệt trước khi gửi).

Hai phiếu chạy song song, không trùng tệp. Giao kèo API dưới đây là chuẩn chung.

## Giao kèo API

`POST /api/upload` (multipart):
- Trường form tuỳ chọn `label` (chuỗi). Server chuẩn hoá: chữ thường, chỉ giữ `[a-z0-9-]`, gộp nhiều `-`, bỏ `-` đầu/cuối,
  tối đa 40 ký tự; rỗng → `anh`. Tên tệp = `<label>_<8 hex ngẫu nhiên>.<ext>` (`secrets.token_hex(4)`), sinh lại nếu trùng.
- Giới hạn 30MB (`MAX_UPLOAD_BYTES`, cả middleware content-length lẫn vòng đọc); thông báo "tối đa 30MB".
- Nếu request có `X-Card-Slug` + `X-Edit-Key` hợp lệ cho thiệp đã tồn tại → ghi thêm mục vào chỉ mục ảnh của thiệp đó.
  (Header này vốn đã là quyền dự phòng khi không có mã tạo thiệp; nay được dùng cả khi có mã. Khoá sai mà có mã đúng:
  vẫn cho upload nhưng KHÔNG ghi vào chỉ mục.)
- Trả `{"url": "/uploads/<name>", "name": "<name>", "size": <bytes>}`.

Chỉ mục ảnh: `data/cards/<slug>.uploads.json` = danh sách `{"name","url","size","type","label","createdAt"}`
(createdAt ISO UTC), ghi nguyên tử (tệp tạm + `os.replace`) dưới khoá tiến trình, không trùng `name`, tối đa 500 mục
(vượt thì bỏ mục cũ nhất). Không phục vụ tĩnh (đã chặn `data/`).

`GET /api/cards/{slug}/uploads` — cần `X-Edit-Key` đúng → `{"items": [...]}` mới nhất trước, bỏ mục mà tệp không còn.

`POST /api/cards/{slug}/uploads/attach` — cần `X-Edit-Key` đúng; body `{"urls": [...]}` (≤ 200 phần tử). Gắn các tệp
đã có trên server vào chỉ mục (dùng sau lần xuất bản đầu cho ảnh tải lên trước khi thiệp tồn tại). Mỗi URL phải khớp
`^/uploads/[a-z0-9-]{1,40}_[0-9a-f]{8}\.(jpg|jpeg|png|webp|gif|mp3|m4a|mp4|ogg|wav)$` hoặc tên cũ
`^/uploads/[0-9a-f]{32}\.(…cùng đuôi…)$`, và tệp phải tồn tại; URL khác bỏ qua im lặng. Trả `{"items": [...]}`.
Có rate limit như các route khác.

## Phiếu T39 — py-backend

Tệp: `server/app.py`, test mới `server/tests/test_thu_vien_anh.py` (sửa test cũ chỉ khi chúng kiểm chuỗi "10MB" / dạng tên uuid).
Làm đúng giao kèo trên. Test: label chuẩn hoá + tên tệp, 30MB (413 trên 30MB), ghi chỉ mục khi có slug+key đúng,
không ghi khi khoá sai, GET cần khoá (403 khi sai), attach lọc URL sai/không tồn tại, chặn path traversal trong urls.

## Phiếu T40 — frontend-ui

Tệp: `js/api.js`, `js/editor.js`, `js/sections/story.js`, `index.html`, `css/app.css` (và `js/render.js` nếu cần cho
tiêu đề inspector). Không sửa `server/`, `invite.html`.
1. `api.uploadFile(file, onProgress, label)`: gửi trường `label`; luôn kèm `X-Card-Slug` + `X-Edit-Key` khi editor đang
   sửa một thiệp đã xuất bản có khoá (ngoài `X-Create-Code` nếu có). Thêm `api.listUploads(slug)`,
   `api.attachUploads(slug, urls)`.
2. Nhãn: ảnh field section → `sec.id` (vd `hero-1`); album → `sec.id`; ảnh nền section → `<sec.id>-nen`;
   nền toàn thiệp → `nen`; nhạc → `nhac`; story → `sec.id`. `uploadOrDataUrl(file, opts)` nhận thêm `opts.label`.
3. Ảnh tải lên khi thiệp chưa xuất bản (không có slug/khoá): lưu URL vào localStorage `thiep:uploads:pending`
   (tối đa 200, bọc try/catch). Sau mỗi lần xuất bản thành công: gọi `attachUploads` với pending + mọi URL `/uploads/…`
   đang dùng trong `appState` (duyệt sâu, không rẽ nhánh theo type), thành công thì xoá pending.
4. Cột phải có 2 tab: "Chỉnh sửa" (inspector hiện tại) và "Ảnh đã tải". Tab ảnh:
   - Không có backend (`file://`) → thông báo nhẹ, không lỗi.
   - Thiệp chưa xuất bản → hiện ảnh pending từ localStorage + ghi chú "Xuất bản thiệp để lưu danh sách ảnh theo thiệp".
   - Đã xuất bản → `listUploads`; lưới ảnh thu nhỏ (nhạc hiện biểu tượng), tên tệp, dung lượng, nút mở tab mới và
     sao chép đường dẫn. Nút làm mới. Tự tải lại khi tab đang mở và có upload mới xong.
   - Đổi tab là trạng thái UI (không `commitState`), không phá render inspector hiện có.
5. Giữ toàn bộ hiệu ứng tiến độ/nén của T37. Chữ giao diện tiếng Việt; escape mọi tên tệp chèn vào HTML.

Kiểm (phiên chính): `py tools/build_export_bundle.py`, `node --check`, `py -m pytest server/tests -q`, thử trên trình duyệt.
