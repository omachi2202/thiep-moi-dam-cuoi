# T15 — Trang khách invite.html + intro, {khach}, lịch, reveal, hiệu ứng rơi

- **Sub-agent**: `frontend-ui` · **Đợt**: 6 · **Phụ thuộc**: đợt 5 · **Review**: có
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`invite.html`, `js/runtime.js`, `css/invite.css`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `.agents/rules/domain_runtime_invite.md`, `.agents/rules/domain_security_storage.md`

## Việc cần làm
- `invite.html` theo domain_runtime_invite §2 (nạp script theo G1, Google Fonts như editor), thêm lớp `.reveal-on` lên gốc.
- runtime: intro envelope/curtain (CSS ở invite.css) bấm mở + phát nhạc; thay `{khach}` trên text node; điền nút Google Calendar + tải `.ics` vào `[data-slot="calendar-actions"]`; IntersectionObserver thêm `.is-visible`; hiệu ứng rơi petals/snow/stars.
- Export (mode export) cũng chạy intro/reveal như invite.

- **Bổ sung sau T3 (Điều 3):** `runtime.js` còn `s.id === 'countdown'` trong `updateCountdownDisplay` — đổi sang lấy section theo slot `[data-slot="countdown"]` và `data-section-id` của phần tử đó.

## Tiêu chí đạt
- `/c/<slug>?khach=Anh%20Nam`: intro, nhạc, tên khách, .ics mở được bằng lịch, reveal mượt ở 390px.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
