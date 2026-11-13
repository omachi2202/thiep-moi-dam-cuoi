# Hồ sơ: Hình nền tổng thể + style ảnh bìa ảnh to

- **Nhánh**: `feat/hinh-nen-anh-bia` (từ `master` @ `fa0690b`)
- **Giao kèo**: `dac_ta_hinh_nen_anh_bia.md` · **AD**: AD-001, AD-003
- **Phân loại**: [CREATE] hình nền toàn thiệp, 3 kiểu ảnh bìa, preset Xanh rêu & vàng · [UPDATE] nút tải ảnh cho ảnh nền section
- **Tham khảo**: mẫu Sophia & Daniel (khối xanh rêu + ảnh lớn mép cong), mẫu Aline & Marcelo (ảnh full-bleed mờ dần, tên thư pháp đè ảnh, khối 3 cột ngày / giờ-địa điểm / lời nhắn)

## Quyết định đã chốt (grilling 2026-11-13)
- Q1 `globalStyle.bgImage`, `bgImageOverlay` (0–0.9, phủ trắng), `bgImageFit` (`cover|repeat`); không làm `fixed`. Bổ sung: ô ảnh nền trong "Nền & Trang trí" của section phải có nút tải ảnh.
- Q2 Chồng lớp (dưới → trên): màu nền → ảnh nền → lớp phủ → texture → nền riêng section.
- Q3 `hero.data.layout`: `classic` (mặc định, giữ nguyên) | `fade` | `arch` | `fullscreen`.
- Q4 Cao ảnh theo tỉ lệ: fade ≈ 4:5, arch ≈ 3:4, fullscreen 100svh (trang khách/export), 760px trong khung editor.
- Q5 Trường riêng của hero: `monogram`, `inviteLine`, `weekday`, `timeText`, `venueText`, `closingNote` (không đồng bộ với section Sự kiện).
- Q6 Inspector hero: lưới ô xem trước (sơ đồ CSS) chọn kiểu; chỉ hiện trường kiểu đang dùng.
- Q7 Preset `moss` "Xanh rêu & vàng"; preset không chạm `layout`/`bgImage`.
- Q8 Ý khác của 2 mẫu → `docs/backlog.md`.
- Q9 Base64 > 1,5MB: dùng chặn sẵn có trong `uploadOrDataUrl` (toast, không nhúng).

## Bảng task
| Mã | Việc | Tệp | Sub-agent | Đợt | Phụ thuộc | Review | Trạng thái |
|---|---|---|---|---|---|---|---|
| T25 | Luật + tài liệu | `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `docs/backlog.md`, `CLAUDE.md` | memoryer | 1 | không | không | chờ |
| T26 | Schema v5 + `cardBgVars` + preset moss | `js/state.js` | frontend-ui | 1 | không | có | chờ |
| T27 | 3 kiểu ảnh bìa + inspector chọn kiểu | `js/sections/hero.js`, `css/app.css` | frontend-ui | 1 | giao kèo G5 | có | chờ |
| T28 | Áp nền khung editor/trang khách + CSS chồng lớp + nút tải ảnh nền section | `js/render.js`, `invite.html`, `css/app.css` | frontend-ui | 2 | T26, T27 | có | chờ |
| T29 | Panel "Hình nền thiệp" + handler upload + nền khung bản export | `index.html`, `js/editor.js` | frontend-ui | 2 | T26 | có | chờ |

Ngoại lệ: T25 sửa 4 tệp (chỉ tài liệu; `CLAUDE.md` một dòng). Sau mỗi đợt có sửa tệp thuộc danh sách bundle, phiên chính chạy `py tools/build_export_bundle.py` (tệp sinh, AD-003, không sửa tay).

## Nhật ký nghiệm thu
