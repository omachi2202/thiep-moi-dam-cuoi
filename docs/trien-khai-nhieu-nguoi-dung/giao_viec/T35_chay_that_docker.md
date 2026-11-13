# T35 — Chạy thật: build image + container tạm

- **Sub-agent**: `autotest` · **Đợt**: 2 · **Review**: —
- **Tệp được sửa**: không (không sửa tệp dự án; thư mục dữ liệu tạm trong scratchpad/TEMP)

## Việc
1. `docker build -t thiep-cuoi:test .` tại gốc repo.
2. `docker run -d --name thiep-test -p 127.0.0.1:18095:8000 -v <thư mục tạm>:/app/data -e THIEP_CREATE_CODES=thu123 thiep-cuoi:test`.
3. Gọi thử (curl hoặc `py` urllib): `GET /api/health` → `needCreateCode: true`; `GET /` trả HTML editor; `PUT /api/cards/test-docker` không mã → 403, có `X-Create-Code: thu123` → editKey; `POST /api/cards/test-docker/verify-key` đúng → 200; upload PNG nhỏ với mã → 200 và tệp xuất hiện trong thư mục tạm; `GET /c/test-docker` → 200; `whoami` trong container không phải root.
4. Dọn: `docker rm -f thiep-test`, `docker rmi thiep-cuoi:test`, xoá thư mục tạm. KHÔNG đụng container/compose của portal.

## Tiêu chí đạt
Mọi bước đúng kỳ vọng; báo lệnh + kết quả rút gọn.
