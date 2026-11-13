# T2 — Backend FastAPI + Excel store

- **Sub-agent**: `py-backend` · **Đợt**: 2 · **Phụ thuộc**: không · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`server/app.py`, `server/excel_store.py`, `server/requirements.txt` (+ `server/__init__.py` rỗng)

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_backend.md`, `.agents/rules/domain_security_storage.md`

## Việc cần làm
- Làm đủ route ở `domain_backend.md` §3, sheet/cột §4, an toàn ở `domain_security_storage.md`.
- `requirements.txt`: fastapi, uvicorn[standard], openpyxl, python-multipart (ghi phiên bản tối thiểu `>=`).
- `THIEP_DATA_DIR` đọc lúc tạo app (hàm `create_app(data_dir=None)` + `app = create_app()`), để test truyền thư mục tạm.
- Phục vụ tĩnh: `/` → `index.html`, `/c/{slug}` → `invite.html` (nếu chưa có tệp thì 404 tiếng Việt), `/css`, `/js` từ gốc repo, `/uploads` từ data dir. Không mount cả thư mục gốc.
- Giới hạn tần suất đơn giản trong bộ nhớ cho `rsvp`/`wishes` (10 lần/phút/IP/slug).
- Hàm public của `excel_store`: `append_rsvp(slug, row)`, `append_wish(slug, row)`, `list_wishes(slug, limit=200)`, `export_slug(slug) -> bytes`.

## Tiêu chí đạt
- `py -c "import server.app"` không lỗi; `py -m uvicorn server.app:app` chạy được.
- Các ca ở `domain_workflow_testing.md` §4 sẽ pass ở T5 (thiết kế sẵn để test được).

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest".

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
