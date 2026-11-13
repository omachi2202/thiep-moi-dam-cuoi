# T5 — Test API pytest

- **Sub-agent**: `py-backend` · **Đợt**: 3 · **Phụ thuộc**: T2 · **Review**: không
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`server/tests/test_api.py` (+ `server/tests/__init__.py`, `conftest.py` nếu cần)

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_backend.md`, `.agents/rules/domain_security_storage.md`, `.agents/rules/domain_workflow_testing.md`

## Việc cần làm
- Dùng `create_app(tmp_path)` + `TestClient`. Đủ các ca bắt buộc ở `domain_workflow_testing.md` §4, thêm: tạo thiệp lần đầu trả editKey, PUT lần 2 sai key 403, GET thiệp không lộ key, `/c/{slug}`, export.xlsx đọc lại bằng openpyxl đúng số dòng.

## Tiêu chí đạt
- `py -m pytest server/tests -q` pass (autotest chạy).

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest".

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
