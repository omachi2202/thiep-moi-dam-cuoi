# T32 — Backend: mã tạo thiệp, quyền upload, hạn mức, verify-key, IP thật

- **Sub-agent**: `py-backend` · **Đợt**: 1 · **Review**: có
- **Tệp được sửa (đóng)**: `server/app.py`, `server/tests/test_nhieu_nguoi_dung.py` (mới); `server/tests/conftest.py` chỉ khi cần xoá env `THIEP_CREATE_CODES`/`THIEP_TRUST_CF`/`THIEP_UPLOAD_QUOTA_MB` trong fixture
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_backend.md`, `.agents/rules/domain_security_storage.md`, `.agents/rules/domain_workflow_testing.md` §4, `docs/trien-khai-nhieu-nguoi-dung/dac_ta_trien_khai.md` G1

## Việc
Làm đúng G1:
1. `create_app(..., create_codes=None, upload_quota_mb=None, trust_cf=None)` đọc env khi `None`.
2. `client_ip(request)`; `rate_check(..., window=None)`.
3. `GET /api/health` thêm `needCreateCode`.
4. `PUT /api/cards/{slug}`: nhánh tạo mới kiểm mã + giới hạn `create` 5/3600s/IP; nhánh cập nhật như cũ. Kiểm mã/giới hạn TRƯỚC khi ghi tệp; giữ nguyên khoá `card_lock`.
5. `POST /api/upload`: quyền (mã hoặc slug+khoá) khi bật mã; hạn mức tổng dung lượng luôn kiểm (tính tổng kích thước tệp thường trong `uploads_dir`), 507.
6. `POST /api/cards/{slug}/verify-key`.
7. Không đổi `excel_store.py`, không đổi định dạng tệp, không thêm gói.

## Test bắt buộc (`server/tests/test_nhieu_nguoi_dung.py`)
- Tắt mã: tạo thiệp không cần header; `health.needCreateCode == False`.
- Bật mã (`create_codes="abc,xyz"`): thiếu/sai mã → 403; đúng mã (cả mã thứ hai) → tạo được + `editKey`; cập nhật bằng `X-Edit-Key` không cần mã; `needCreateCode == True`.
- Giới hạn tạo: lần thứ 6 trong giờ (cùng IP) → 429; cập nhật thiệp không bị tính.
- Upload khi bật mã: không header → 403; mã đúng → 200; slug+khoá đúng → 200; slug+khoá sai / slug không tồn tại → 403.
- Hạn mức: `upload_quota_mb` nhỏ (vd tạo sẵn tệp lớn trong `uploads/`) → 507; tắt mã vẫn kiểm hạn mức.
- verify-key: đúng 200, sai 403, thiếu 403, thiệp không có 404, slug sai 400, quá 10 lần/phút → 429.
- `trust_cf=True`: hai `CF-Connecting-IP` khác nhau có bộ đếm riêng; `trust_cf=False`: header bị bỏ qua (cùng bộ đếm).
- Toàn bộ test cũ vẫn pass.

## Lệnh tự kiểm
Sub-agent không có Bash thì ghi rõ; phiên chính chạy `py -m py_compile server/app.py` và `py -m pytest server/tests -q`.

## Không được làm
Sửa front-end, Excel, thêm gói; ghi log mã/khoá.
