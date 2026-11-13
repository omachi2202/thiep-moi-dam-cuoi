# T36 — Gắn vào portal + DNS (ĐIỂM DỪNG)

- **Người làm**: phiên chính · **Đợt**: 3
- **Điều kiện bắt đầu**: T35 đạt + người dùng gửi tên miền và xác nhận lại (đụng hạ tầng đang chạy các app khác).

## Việc (theo `docs/deploy.md`)
1. Tạo `C:/dev/thiep_data`.
2. `portal/docker-compose.yml`: thêm service `thiep_cuoi` (không sửa service khác).
3. `portal/cloudflared/config.yml`: thêm ingress hostname mới TRƯỚC rule 404.
4. `cloudflared tunnel route dns <tunnel> <ten-mien>`; khởi động lại cloudflared theo cách portal đang dùng.
5. `docker compose up -d --build thiep_cuoi`; kiểm `https://<ten-mien>/api/health`.
6. Đặt `THIEP_CREATE_CODES` do người dùng chọn (không commit mã vào git).
