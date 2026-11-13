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
| T31 | AD-004 + luật + backlog | `docs/quyet_dinh.md`, `.agents/rules/domain_backend.md`, `.agents/rules/domain_security_storage.md`, `docs/backlog.md` | memoryer | 1 | không | không | chờ |
| T32 | Backend nhiều người dùng + test | `server/app.py`, `server/tests/test_nhieu_nguoi_dung.py` (+ `server/tests/conftest.py` nếu cần) | py-backend | 1 | G1 | có | chờ |
| T33 | Front-end mã tạo thiệp + mở thiệp để sửa + 403 upload | `js/api.js`, `index.html`, `js/editor.js` | frontend-ui | 1 | G1, G2 | có | chờ |
| T34 | Dockerfile, .dockerignore, docs/deploy.md | `Dockerfile`, `.dockerignore`, `docs/deploy.md` | py-backend | 1 | G3 | có | chờ |
| T35 | Chạy thật docker build + container tạm | (không sửa tệp) | autotest | 2 | T32–T34 | — | chờ |
| T36 | Gắn vào portal + DNS (ĐIỂM DỪNG: chờ tên miền) | ngoài repo | phiên chính | 3 | T35 | — | chờ |

Ngoại lệ: T31 sửa 4 tệp tài liệu. Sau đợt 1 phiên chính chạy `py tools/build_export_bundle.py` (`js/api.js` thuộc bundle).

## Nhật ký nghiệm thu
