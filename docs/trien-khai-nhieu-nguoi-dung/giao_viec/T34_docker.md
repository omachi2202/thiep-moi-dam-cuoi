# T34 — Dockerfile, .dockerignore, hướng dẫn triển khai

- **Sub-agent**: `py-backend` · **Đợt**: 1 · **Review**: có
- **Tệp được tạo (đóng)**: `Dockerfile`, `.dockerignore`, `docs/deploy.md`
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_backend.md`, `docs/trien-khai-nhieu-nguoi-dung/dac_ta_trien_khai.md` G1, G3; tham khảo cách portal hiện có: `C:\Users\dudan\OneDrive\PETROLIMEX\code\portal\docker-compose.yml` và `portal\cloudflared\config.yml` (CHỈ ĐỌC)

## Việc
Làm đúng G3. `docs/deploy.md` tiếng Việt, có mục: Yêu cầu; Build & chạy thử cục bộ (lệnh `docker build -t thiep-cuoi .` và `docker run` với `-p 127.0.0.1:8095:8000 -v C:/dev/thiep_data:/app/data -e THIEP_CREATE_CODES=...`); Gắn vào portal (đoạn compose mẫu, ingress Tunnel, `cloudflared tunnel route dns`, khởi động lại cloudflared theo cách portal đang dùng — xem `start-portal-on-boot.ps1`/`restart-portal.ps1` để mô tả, không sửa); Biến môi trường; Vận hành (sao lưu, cấp lại khoá, đổi mã, xem log). Tên miền ghi placeholder `<ten-mien-cua-ban>`.

## Tiêu chí đạt
Dockerfile build được (phiên chính/T35 chạy); không copy dữ liệu/tài liệu nội bộ vào image; chạy user không phải root; 1 worker.

## Không được làm
Sửa tệp trong `portal/`, `server/`, front-end.
