# Hồ sơ: Triển khai nhiều người dùng sau Cloudflare Tunnel

- **Nhánh**: `feat/trien-khai-nhieu-nguoi-dung` (từ `master` @ `a97a509`)
- **Giao kèo**: `dac_ta_trien_khai.md` · **AD**: AD-002, AD-003, AD-004 (mới, T31)
- **Phân loại**: [CREATE] mã tạo thiệp, verify-key, mở thiệp đã xuất bản để sửa, Docker · [UPDATE] siết upload/tạo thiệp, IP thật, hạn mức

## Quyết định đã chốt (2026-11-14)
- Tên miền: riêng (người dùng gửi sau), host/subdomain riêng trỏ thẳng container — ứng dụng dùng đường dẫn tuyệt đối nên không đặt dưới `/thiep/`.
- Nhiều người dùng editor (không khoá editor bằng Cloudflare Access theo email).
- Q1 (a) Mã tạo thiệp `THIEP_CREATE_CODES`; trống = tắt (dev/test). Tạo thiệp mới giới hạn 5/giờ/IP.
- Q2 Upload cần `X-Create-Code` hợp lệ hoặc `X-Card-Slug` + `X-Edit-Key` của thiệp có thật; chưa có quyền → editor dùng base64 ≤ 1,5MB + toast hướng dẫn.
- Q3 Hạn mức tổng `uploads/` `THIEP_UPLOAD_QUOTA_MB` (mặc định 2048) → 507.
- Q4 "Mở thiệp đã xuất bản để sửa" trong modal Xuất bản: slug + khoá → `POST verify-key` → tải state → `replaceState`; mất khoá chỉ quản trị cấp lại (xoá `.key`).
- Q5 `THIEP_TRUST_CF=1` → IP từ `CF-Connecting-IP` (chỉ bật sau Tunnel).
- Q6 Dữ liệu Docker ở `C:/dev/thiep_data` (ngoài OneDrive).
- Q7 Repo chỉ thêm Dockerfile/.dockerignore/docs/deploy.md; sửa portal + DNS là điểm dừng (chờ tên miền).
- Q8 Ghi AD-004 + luật.
- Giả định: ô "Mã tạo thiệp" chỉ ở modal Xuất bản, nhớ trong localStorage `thiep:createCode`.

## Bảng task
| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| T31 | AD-004 + luật + backlog | `docs/quyet_dinh.md`, `.agents/rules/domain_backend.md`, `.agents/rules/domain_security_storage.md`, `docs/backlog.md` | memoryer | 1 | không | không | xong (+T31.1) |
| T32 | Backend nhiều người dùng + test | `server/app.py`, `server/tests/test_nhieu_nguoi_dung.py` (+ `server/tests/conftest.py` nếu cần) | py-backend | 1 | G1 | có | xong (+T32.1, T32.2) |
| T33 | Front-end mã tạo thiệp + mở thiệp để sửa + 403 upload | `js/api.js`, `index.html`, `js/editor.js` | frontend-ui | 1 | G1, G2 | có | xong (+T33.1) |
| T34 | Dockerfile, .dockerignore, docs/deploy.md | `Dockerfile`, `.dockerignore`, `docs/deploy.md` | py-backend | 1 | G3 | có | xong (+T34.1) |
| T35 | Chạy thật docker build + container tạm | (không sửa tệp) | autotest | 2 | T32–T34 | — | xong |
| T36 | Gắn vào portal + DNS (ĐIỂM DỪNG: chờ tên miền) | ngoài repo | phiên chính | 3 | T35 | — | CHỜ tên miền |

Ngoại lệ: T31 sửa 4 tệp tài liệu. Sau đợt 1 phiên chính chạy `py tools/build_export_bundle.py` (`js/api.js` thuộc bundle).

## Nhật ký nghiệm thu
- **T31 + T31.1** (memoryer): AD-004, luật backend/bảo mật, backlog. T31.1 sửa quy trình cấp lại khoá (ghi hash SHA-256 vào `.key`, không xoá `.key` — phiên chính kiểm `check_key` trả 403 khi thiếu `.key`).
- **T32 + T32.1 + T32.2** (py-backend): review ĐẠT, không chặn. T32.1 sửa `test_health` cũ. T32.2 theo review: rate limit trước khi so mã tạo thiệp (10/300s), validate `CF-Connecting-IP` bằng `ipaddress`, cửa sổ theo khoá, rate limit PUT cập nhật 30/phút, compare_digest trên bytes. pytest 49 passed.
- **T33 + T33.1** (frontend-ui): review ĐẠT, không chặn. T33.1: luôn gửi mã khi có + hiện ô mã khi 403, chỉ lưu mã sau thành công, uploadFile chỉ gửi slug+khoá khi cần, toast tệp lớn 403/507. node --check OK.
- **T34 + T34.1** (py-backend): review ĐẠT. T34.1: cảnh báo Tunnel portal ngắt khi khởi động lại, sao lưu + `tunnel ingress validate` trước, bắt buộc đặt mã khi công khai, `.dockerignore` thêm `.env*`, `*.xlsx`.
- **T35** (autotest): docker build OK; image chỉ có css/js/server/index/invite + `/app/data` rỗng; container healthy; 11/11 kiểm HTTP đạt (health needCreateCode, 403 không mã, tạo có mã, verify-key, upload ghi ra bind mount bằng uid 10001, /c/<slug>); đã dọn container/image. Không đụng portal.
- Bundle sinh lại; `CLAUDE.md` mục Backend cập nhật chế độ nhiều người dùng.
- **Inspector**: PASS 10/10 Điều; rà bù T32.2, T33.1 không lỗi. Phiếu sửa nhỏ T31.1, T32.1, T34.1 giao qua tin nhắn, nội dung ghi ở nhật ký này (không có tệp phiếu riêng). 2 ghi chú đưa vào backlog.
