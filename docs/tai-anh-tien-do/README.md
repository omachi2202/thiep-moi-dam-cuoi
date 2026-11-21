# Tải ảnh: hiệu ứng tiến độ + nén ảnh

Nhánh `feat/tai-anh-tien-do`. Yêu cầu người dùng (2026-11-21): khi tải ảnh lên trong editor không có hiệu ứng gì;
trên khanhdu.store (qua Cloudflare) ảnh điện thoại 3–8MB mất vài giây mà giao diện đứng yên. Chọn phương án đầy đủ:
hiện % tiến độ + nén ảnh phía trình duyệt trước khi gửi.

## Phiếu T37 — frontend-ui

Tệp được sửa: `js/api.js`, `js/editor.js`, `css/app.css`, `js/sections/story.js`. Không sửa `server/`, `index.html`, `invite.html`.

1. **Tiến độ upload (`js/api.js`)** — `uploadFile(file, onProgress)`: gửi bằng `XMLHttpRequest` để có
   `xhr.upload.onprogress` → gọi `onProgress(0..1)`. Giữ nguyên header (X-Create-Code / X-Card-Slug + X-Edit-Key),
   timeout 60 giây, và đúng dạng lỗi như `request()` hiện tại: `Error` có `message` tiếng Việt (lấy `detail` từ JSON
   nếu có) và `err.status`; lỗi mạng / quá thời gian dùng cùng câu thông báo. Trả `j.url`. `onProgress` tuỳ chọn.
2. **Nén ảnh (`js/editor.js`)** — hàm `compressImageIfNeeded(file)` (tự viết, không thêm thư viện):
   - Chỉ áp dụng cho `image/jpeg`, `image/png`, `image/webp`. Bỏ qua GIF (mất động), audio, tệp lỗi giải mã.
   - Thu về cạnh dài tối đa 2000px; tôn trọng xoay EXIF (`createImageBitmap(file, {imageOrientation:'from-image'})`,
     dự phòng `<img>` + objectURL, nhớ `revokeObjectURL`).
   - JPEG/WebP → `image/jpeg` chất lượng ~0.85; PNG → giữ PNG (giữ nền trong suốt).
   - Nếu tệp gốc đã nhỏ (≤ ~500KB và cạnh dài ≤ 2000px) hoặc bản nén không nhỏ hơn bản gốc → dùng bản gốc.
   - Trả `File` mới có **tên đuôi khớp MIME** (vd `anh.jpg` + `image/jpeg`): server từ chối nếu đuôi không khớp content-type.
   - Lỗi bất kỳ khi nén → dùng tệp gốc, không chặn upload.
   - Bản nén cũng dùng cho nhánh dự phòng base64 (Điều 7) để nhánh này ít bị chặn bởi giới hạn 1,5MB hơn.
3. **Hiệu ứng trong editor (`js/editor.js` + `css/app.css`)** — `uploadOrDataUrl(file, opts)` với `opts.trigger`
   (phần tử input đã chọn tệp; tuỳ chọn để giữ tương thích):
   - Nút/label chứa input (`trigger.closest('label')`) vào trạng thái đang tải: lớp `is-uploading`, icon xoay, chữ
     "Đang nén ảnh…" rồi "Đang tải lên 45%", khoá input (không chọn lại được) cho tới khi xong/lỗi; luôn khôi phục
     nội dung gốc trong `finally`. Ô ảnh nhỏ trong album (label chỉ có icon) dùng lớp phủ mờ + % thay vì chữ dài.
   - Thêm một chỉ báo chung dạng viên nhỏ cố định (tạo bằng JS trong editor, không sửa `index.html`) có thanh tiến độ,
     để trường hợp gọi không có `trigger` vẫn thấy tiến độ.
   - Nếu re-render inspector thay mất label trong lúc tải thì chỉ báo chung vẫn đúng; không lỗi khi label đã bị gỡ.
   - Truyền `event.target` từ mọi handler upload hiện có (`handleLocalImageUpload`, `handleGlobalBgUpload`,
     `handleSectionBgUpload`, `handleAlbumFileUpload`, `handleAudioFileUpload`) và `storyUploadImage` trong `js/sections/story.js`.
     Audio không nén nhưng có % tiến độ.
   - Thêm `event.target.value = ''` sau xử lý ở các handler còn thiếu để chọn lại cùng tệp được.
4. CSS mới ở `css/app.css` theo phong cách editor hiện có (violet), có `prefers-reduced-motion` cho icon xoay.

Ràng buộc: Hiến pháp `.agents/rules/hard_constitution.md` (đặc biệt Điều 2, 3, 7). Không rẽ nhánh theo `sec.type`
trong `editor.js`. Chữ giao diện tiếng Việt.

Kiểm (phiên chính chạy): `py tools/build_export_bundle.py`, `node --check` các tệp JS đã sửa, `py -m pytest server/tests -q`,
thử upload ảnh lớn trên trình duyệt (có % và ảnh lưu trên server nhỏ hơn bản gốc).
