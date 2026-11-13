# Luật vận hành sub-agent

## 1. Đội ngũ
Xem `.agents/AGENTS.md`. Mỗi agent chỉ làm đúng vai trò; việc ngoài vai trò ghi vào mục `Đề xuất` của báo cáo.

## 2. Đường tắt việc nhỏ
Đủ cả 4 điều kiện: sửa ≤ 1 tệp, ≤ 30 dòng, không chạm schema state/API/Excel/an toàn, không thêm thư viện. Khi đó có thể bỏ hồ sơ `docs/<slug>/`, vẫn tạo nhánh và chạy `autotest`. Riêng khi người dùng gọi `/dieu-phoi` thì vẫn dừng chờ duyệt kế hoạch.

## 3. Ma trận quyền
| Agent | Sửa tệp | Chạy lệnh |
|---|---|---|
| frontend-ui | `index.html`, `invite.html`, `css/`, `js/` (theo phiếu) | Không |
| py-backend | `server/` (theo phiếu) | Không |
| memoryer | `docs/`, `CLAUDE.md`, `.agents/` (khi phiếu cho phép) | Không |
| planner | `docs/<slug>/` (hồ sơ, phiếu) | Không |
| autotest | Không | Có (lệnh kiểm, chỉ đọc) |
| researcher | Không | Có (tra cứu) |
| frontend-architect, backend-architect, reviewer-code, inspector, ui-aesthetic-reviewer | Không | Không |

## 4. Mẫu báo cáo của sub-agent
```
Kết quả: ĐẠT | CHƯA ĐẠT | BỊ CHẶN
Tệp đã sửa: <danh sách>
Đã tự kiểm: <lệnh/cách kiểm → kết quả> (agent không chạy lệnh thì ghi "chờ autotest")
Lệch phiếu / giả định: <nếu có>
Đề xuất: <việc cần agent khác hoặc người dùng>
```

## 5. Báo cáo bàn giao (phiên chính → người dùng)
```
## Bàn giao: <tên việc>
- Nhánh: <tên> (chưa push / chưa merge)
- Commit: <hash ngắn — mô tả>, …
- Bảng task cuối: <Mã | Việc | Trạng thái | Review>
- Kiểm thử: <lệnh → kết quả>; kiểm tay: <đã/chưa>
- Inspector: PASS | REJECT (<lý do>)
- Việc còn lại / rủi ro: <nếu có>
- Cách chạy thử: <lệnh>
```
