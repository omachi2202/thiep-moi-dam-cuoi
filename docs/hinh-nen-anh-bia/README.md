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
| T25 | Luật + tài liệu | `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `docs/backlog.md`, `CLAUDE.md` | memoryer | 1 | không | không | xong |
| T26 | Schema v5 + `cardBgVars` + preset moss | `js/state.js` | frontend-ui | 1 | không | có | xong |
| T27 | 3 kiểu ảnh bìa + inspector chọn kiểu | `js/sections/hero.js`, `css/app.css` | frontend-ui | 1 | giao kèo G5 | có | xong (+T27.1, T27.2) |
| T28 | Áp nền khung editor/trang khách + CSS chồng lớp + nút tải ảnh nền section | `js/render.js`, `invite.html`, `css/app.css` | frontend-ui | 2 | T26, T27 | có | xong |
| T29 | Panel "Hình nền thiệp" + handler upload + nền khung bản export | `index.html`, `js/editor.js` | frontend-ui | 1 (giao sớm) | T26 | có | xong |
| T30 | `cover` → phủ theo bề ngang, lặp dọc (phát sinh, người dùng chọn A) | `js/state.js`, `index.html` | frontend-ui | 3 | T28 | có (inspector) | xong |

Ngoại lệ: T25 sửa 4 tệp (chỉ tài liệu; `CLAUDE.md` một dòng). Sau mỗi đợt có sửa tệp thuộc danh sách bundle, phiên chính chạy `py tools/build_export_bundle.py` (tệp sinh, AD-003, không sửa tay).

## Nhật ký nghiệm thu
- **T25** (memoryer): luật "Nền toàn thiệp" (domain_frontend §3), "Biến thể bố cục" (domain_sections §2), backlog, CLAUDE.md schema 5. Không cần review. ĐẠT.
- **T26** (frontend-ui): schema v5, cardBgVars/cardBgStyleText, safeCssImageUrl chuyển sang state.js, preset moss. Phiên chính chạy node: migrate v4→v5, kẹp overlay, whitelist fit, idempotent, chặn javascript:/ký tự phá CSS. Review: ĐẠT.
- **T27 + T27.1** (frontend-ui): 4 kiểu bìa. Review ĐẠT có điều kiện → T27.1 sửa: fallback `height:100vh` trước `svh`, ngày không ngắt ở cột fade, màu chữ arch theo độ sáng pc. node render 4 kiểu × editor/invite: không XSS, không contenteditable ngoài editor.
- **T29** (frontend-ui, giao sớm vì chỉ phụ thuộc T26): panel Hình nền thiệp, handler upload, export gắn cardBgStyleText + cardDecorClasses. Review: ĐẠT.
- **T28** (frontend-ui): áp nền khung editor/trang khách, CSS chồng lớp, nút tải/bỏ ảnh nền section. Lệch phiếu được chấp nhận: invite.html gắn cardDecorClasses lên khung (sửa lỗi cũ trang khách không hiện texture/khung/hoa góc). Review: ĐẠT.
- **T27.2** (frontend-ui): phát hiện qua ảnh chụp headless 390px — trang bìa hở 2 bên khi có khung/hoa góc, monogram xuống dòng. Sửa xong, chụp lại đạt.
- **T30**: ảnh chụp cho thấy `cover` trên thiệp ~6000px chỉ còn mảng màu; người dùng chọn phương án A (phủ bề ngang, lặp dọc).
- Bundle sinh lại sau mỗi đợt; pytest 34 passed.
- **T30** (frontend-ui): `cardBgVars` cover → `100% auto` + `repeat-y`, nhãn "Phủ theo bề ngang (lặp dọc)"; giá trị lưu không đổi. Phiên chính: node --check, node cardBgVars, chụp 390px thấy rõ ảnh nền. ĐẠT.
- **Cuối**: autotest ĐẠT (node --check 5 tệp + script inline invite.html, registry 13 loại trong VM, bundle --check khớp, pytest 34 passed). Inspector PASS 10/10 Điều; rà bù T30 (chưa qua reviewer-code riêng) đạt.
