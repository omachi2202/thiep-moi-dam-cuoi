# T31 — AD-004 + luật backend/bảo mật cho chế độ nhiều người dùng

- **Sub-agent**: `memoryer` · **Đợt**: 1 · **Review**: không
- **Tệp được sửa (đóng)**: `docs/quyet_dinh.md`, `.agents/rules/domain_backend.md`, `.agents/rules/domain_security_storage.md`, `docs/backlog.md`
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `docs/trien-khai-nhieu-nguoi-dung/README.md`, `dac_ta_trien_khai.md`

## Việc
1. `docs/quyet_dinh.md`: thêm **AD-004 — Triển khai nhiều người dùng sau Cloudflare Tunnel** (Bối cảnh / Quyết định / Hệ quả): container Docker 1 worker, host riêng qua Tunnel, mã tạo thiệp, quyền upload, hạn mức, IP thật `CF-Connecting-IP` khi `THIEP_TRUST_CF=1`, dữ liệu ngoài OneDrive, mất khoá chỉ quản trị cấp lại. Không sửa AD cũ.
2. `domain_backend.md` §3: thêm route `POST /api/cards/{slug}/verify-key`, cập nhật `GET /api/health`, `PUT` tạo mới cần `X-Create-Code` khi bật, `POST /api/upload` quyền + 507; thêm bảng biến môi trường (G1); mã lỗi 429/507 vào danh sách.
3. `domain_security_storage.md` §2–3: quyền upload, hạn mức, mã tạo thiệp (compare_digest, không log, không trả về), giới hạn tạo 5/giờ/IP, verify 10/phút/IP, chỉ bật `THIEP_TRUST_CF` sau Cloudflare.
4. `docs/backlog.md`: gạch mục "`POST /api/upload` không cần edit key" (ĐÃ XONG — T32), mục "Thêm ô nhập edit key thủ công…" (ĐÃ XONG — T33 "Mở thiệp đã xuất bản để sửa"); thêm: "Quản lý mã tạo thiệp qua giao diện quản trị (hiện sửa biến môi trường + khởi động lại container) — Thấp", "Dọn ảnh upload không còn thiệp nào dùng — Trung bình".

## Tiêu chí đạt
Tiếng Việt, khớp đặc tả G1/G3, không mâu thuẫn Hiến pháp; chỉ 4 tệp trên bị sửa.
