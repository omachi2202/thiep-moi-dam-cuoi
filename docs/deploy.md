# Hướng dẫn triển khai Thiệp cưới online (Docker + Cloudflare Tunnel)

Tài liệu này mô tả cách đóng gói ứng dụng thành image Docker và gắn vào stack "portal" hiện có
(docker compose + Cloudflare Tunnel). Mọi giá trị nhạy cảm (mã tạo thiệp, tên miền thật) chỉ là
placeholder, hãy tự điền khi triển khai và không commit vào repo.

## 1. Yêu cầu

- Windows có Docker Desktop (đã chạy, engine sẵn sàng).
- Stack portal đang chạy bằng `docker compose` và có Cloudflare Tunnel (`cloudflared`) kèm tệp `config.yml`.
- Một tên miền đã quản lý trên Cloudflare: `<ten-mien-cua-ban>`.
- Thư mục dữ liệu bền trên máy chủ, ví dụ `C:/dev/thiep_data` (tạo trước). Thư mục này chứa
  `guests.xlsx`, `cards/` (nội dung thiệp + khoá chỉnh sửa) và `uploads/`.

## 2. Build và chạy thử cục bộ

Chạy từ gốc repo:

```bash
docker build -t thiep-cuoi .

docker run --rm -p 127.0.0.1:8095:8000 \
  -v C:/dev/thiep_data:/app/data \
  -e THIEP_CREATE_CODES=<ma-tao-thiep-1>,<ma-tao-thiep-2> \
  thiep-cuoi
```

Kiểm tra: mở `http://127.0.0.1:8095/` (trình chỉnh sửa) và `http://127.0.0.1:8095/api/health`
(trả `{"ok": true, "needCreateCode": true}` khi đã đặt mã).

Ghi chú:
- Image chỉ chứa `server/`, `js/`, `css/`, `index.html`, `invite.html`. Không có `data/`, `docs/`, `tools/`,
  `server/tests/`, `.git/`, `.agents/`, `.claude/` (xem `.dockerignore`).
- Container chạy bằng user không phải root (uid 10001), đúng 1 worker uvicorn.
- Trên Docker Desktop (WSL2), thư mục gắn từ ổ Windows thường ghi được cho user trong container.
  Nếu gặp lỗi quyền ghi, kiểm tra thư mục không bị chặn/chỉ-đọc, hoặc dùng named volume.

## 3. Gắn vào portal

### 3.1. Service mẫu trong `portal/docker-compose.yml`

Thêm vào mục `services:` (không cần `depends_on`):

```yaml
  thiep_cuoi:
    build:
      context: ../personal/thiep_moi_dam_cuoi
    ports:
      - "127.0.0.1:8095:8000"
    volumes:
      - C:/dev/thiep_data:/app/data
    environment:
      - THIEP_CREATE_CODES=<ma-tao-thiep-1>,<ma-tao-thiep-2>
      - THIEP_TRUST_CF=1
      - THIEP_UPLOAD_QUOTA_MB=2048
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
```

**BẮT BUỘC đặt `THIEP_CREATE_CODES` khi công khai ra Internet**: để rỗng nghĩa là ai cũng tạo thiệp và tải tệp lên được.

Nên để mã tạo thiệp trong tệp `.env` / `env_file` nằm ngoài repo thay vì ghi thẳng vào compose.
Cổng được bind vào `127.0.0.1` nên chỉ `cloudflared` trên cùng máy truy cập được, không lộ ra mạng LAN.

Khởi chạy riêng service này:

```bash
cd <thu-muc-portal>
docker compose up -d --build thiep_cuoi
docker compose ps
docker compose logs --tail 100 thiep_cuoi
```

### 3.2. Ingress trong `portal/cloudflared/config.yml`

Thêm rule hostname **trước** rule mặc định `http_status:404` (cloudflared khớp từ trên xuống,
rule cuối không hostname phải đứng cuối cùng):

```yaml
ingress:
  # ... các hostname hiện có của portal ...

  - hostname: <ten-mien-cua-ban>
    service: http://127.0.0.1:8095

  # Rule mặc định (giữ cuối cùng)
  - service: http_status:404
```

### 3.3. Trỏ DNS qua Tunnel

Chỉ làm một lần cho mỗi tên miền. Lệnh cần `cert.pem` (từ `cloudflared tunnel login`) đúng tài khoản Cloudflare,
và tên miền phải nằm trong zone của tài khoản đó:

```bash
cloudflared tunnel route dns <ten-tunnel-hoac-id> <ten-mien-cua-ban>
```

**Cẩn thận:** `cert.pem` gắn với một zone cụ thể (zone đã chọn khi `tunnel login`). Nếu tên miền thiệp là zone
khác, lệnh trên **không báo lỗi** mà tạo nhầm CNAME `<ten-mien-cua-ban>.<zone-cu>` trong zone cũ. Khi đó xoá bản ghi
nhầm trên dashboard và tạo tay trong zone của tên miền thiệp (bật Proxied):

| Type | Name | Target |
|---|---|---|
| CNAME | `@` | `<tunnel-id>.cfargotunnel.com` |
| CNAME | `www` | `<tunnel-id>.cfargotunnel.com` |

Xoá trước các bản ghi A/AAAA trùng tên (nếu có). Kiểm tra: `nslookup <ten-mien-cua-ban> 1.1.1.1` trả địa chỉ Cloudflare.

### 3.4. Khởi động lại cloudflared để nhận ingress mới

Portal hiện chạy `cloudflared` như một tiến trình ẩn do `start-portal-on-boot.ps1` mở
(`cloudflared.exe --config <portal>\cloudflared\config.yml tunnel run`). Script này **bỏ qua** nếu
tiến trình `cloudflared` đã chạy, nên chỉ sửa `config.yml` là chưa đủ: cần tắt tiến trình cũ rồi
chạy lại script khởi động để nạp ingress mới.

**Cảnh báo: Tunnel của TOÀN portal bị ngắt** trong lúc khởi động lại cloudflared (có thể tới ~2 phút vì script
chờ health các container). Làm vào giờ ít truy cập. Các bước (PowerShell, tại thư mục portal):

```powershell
# 1. Sao lưu cấu hình trước khi sửa
Copy-Item cloudflared\config.yml cloudflared\config.yml.bak

# 2. Sau khi sửa config.yml, kiểm tra TRƯỚC khi khởi động lại
cloudflared --config <portal>\cloudflared\config.yml tunnel ingress validate
cloudflared --config <portal>\cloudflared\config.yml tunnel ingress rule https://<ten-mien-cua-ban>

# 3. Chắc chắn chỉ có tunnel của portal đang chạy rồi mới tắt
Get-Process cloudflared
Stop-Process -Name cloudflared -Force
.\start-portal-on-boot.ps1
```

Nếu `validate` báo lỗi hoặc `rule` không trả về `http://127.0.0.1:8095`, khôi phục từ `config.yml.bak` và không khởi động lại.

Nếu chạy `start-portal-on-boot.ps1` từ một phiên PowerShell không tương tác (công cụ tự động, Windows PowerShell 5.1),
bước `docker compose up -d` có thể bị coi là lỗi vì ghi ra stderr và script dừng **trước khi** mở lại Tunnel
(log: `Portal startup sequence failed: Container ... Running`). Khi đó mở lại Tunnel trực tiếp (ngắt chỉ vài giây):

```powershell
Start-Process -FilePath "C:\Program Files (x86)\cloudflared\cloudflared.exe" `
  -ArgumentList '--config','<portal>\cloudflared\config.yml','tunnel','run' -WindowStyle Hidden
Get-Process cloudflared
```

Cập nhật phiên bản thiệp (`docker compose up -d --build thiep_cuoi`) không cần khởi động lại cloudflared.

`start-portal-on-boot.ps1` sẽ chạy `docker compose up -d` (không làm gián đoạn container đã chạy),
đợi các service healthy rồi mở lại Tunnel. Lưu ý script chỉ chờ health của các container portal đã liệt kê
sẵn, không gồm `thiep_cuoi`; hãy tự kiểm tra bằng `docker compose ps`.
`restart-portal.ps1` khởi động lại cả Docker Desktop rồi gọi script trên: chỉ dùng khi thật sự cần,
vì sẽ làm gián đoạn mọi dịch vụ trong portal. Đừng sửa hai script này cho việc triển khai thiệp cưới.

## 4. Biến môi trường

| Biến | Ý nghĩa | Mặc định |
|---|---|---|
| `THIEP_DATA_DIR` | Thư mục dữ liệu trong container | `/app/data` (đặt sẵn trong Dockerfile) |
| `THIEP_CREATE_CODES` | Danh sách mã tạo thiệp, ngăn bởi dấu phẩy. Rỗng = không yêu cầu mã (ai cũng tạo được thiệp) | rỗng |
| `THIEP_UPLOAD_QUOTA_MB` | Hạn mức tổng dung lượng `uploads/` (MB, số nguyên > 0) | 2048 |
| `THIEP_TRUST_CF` | `1` = lấy IP khách từ header `CF-Connecting-IP` (dùng cho giới hạn tần suất) | tắt |

## 5. Vận hành

Cảnh báo quan trọng:
- **Chỉ 1 worker uvicorn.** Khoá ghi Excel và giới hạn tần suất nằm trong bộ nhớ một tiến trình; không thêm `--workers N`
  và không chạy nhiều container cùng ghi vào một thư mục dữ liệu.
- **Chỉ bật `THIEP_TRUST_CF=1` khi mọi truy cập đi qua Cloudflare.** Nếu cổng bị mở trực tiếp, kẻ tấn công giả header
  `CF-Connecting-IP` để lách giới hạn tần suất. Vì vậy luôn bind `127.0.0.1` như mẫu trên.

Sao lưu:
- Sao lưu định kỳ toàn bộ `C:/dev/thiep_data` (`guests.xlsx`, `cards/`, `uploads/`). Nên dừng ghi hoặc sao chép lúc ít truy cập;
  tệp được ghi nguyên tử nên bản sao thường nhất quán nhưng không nên sao chép khi đang có nhiều thao tác.
- Hạn chế quyền truy cập thư mục chứa bản sao lưu (chỉ quản trị): có `.key` và dữ liệu khách (RSVP, lời chúc).
- Thư mục `cards/` chứa cả tệp `.key` (hash SHA-256 của khoá chỉnh sửa): coi là dữ liệu nhạy cảm, không đưa lên nơi công khai.

Cấp lại khoá chỉnh sửa cho khách quên khoá:
1. Xác minh danh tính chủ thiệp (ngoài hệ thống). Chỉ chạy khi chủ thiệp không đang thao tác/xuất bản thiệp đó.
2. KHÔNG xoá tệp `.key`: khi `<slug>.json` còn mà `<slug>.key` mất, server trả 403 (không đọc được khoá)
   và không có cách tự tạo lại qua giao diện. Thay vào đó sinh khoá mới và ghi hash SHA-256 (hex) của nó
   vào `cards/<slug>.key` (giữ nguyên `<slug>.json`). Ví dụ chạy trong container (thay `<container>` và `<slug>`):

   ```bash
   docker exec <container> python -c "import secrets,hashlib,pathlib;k=secrets.token_urlsafe(24);pathlib.Path('/app/data/cards/<slug>.key').write_text(hashlib.sha256(k.encode()).hexdigest());print(k)"
   ```

   Lệnh in ra khoá mới (dạng rõ) một lần duy nhất; trên đĩa chỉ lưu hash.
3. Gửi khoá in ra cho chủ thiệp qua kênh riêng (không đăng nơi công khai, không đưa vào URL hay log chung).
   Chủ thiệp nhập khoá này ở khối "Mở thiệp đã xuất bản để sửa" trong modal Xuất bản.

Đổi mã tạo thiệp:
1. Sửa giá trị `THIEP_CREATE_CODES` (compose hoặc `.env`).
2. Áp dụng: `docker compose up -d thiep_cuoi` (tạo lại container với biến mới).
3. Thiệp đã tạo vẫn dùng khoá chỉnh sửa riêng, không bị ảnh hưởng khi đổi mã.

Xem log và trạng thái:

```bash
docker compose logs -f --tail 200 thiep_cuoi
docker compose ps
docker inspect --format "{{.State.Health.Status}}" <ten-container-thiep_cuoi>
```

Cập nhật phiên bản mới: lấy mã mới về, rồi `docker compose up -d --build thiep_cuoi`. Dữ liệu nằm ở volume nên không mất.
