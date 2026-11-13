# T25 — Luật & tài liệu: nền tổng thể, layout hero, schema v5

- **Sub-agent**: `memoryer` · **Đợt**: 1 · **Review**: không
- **Tệp được sửa (đóng)**: `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`, `docs/backlog.md`, `CLAUDE.md`
- **Đọc trước**: `CLAUDE.md`, `.agents/rules/hard_constitution.md`, `docs/hinh-nen-anh-bia/README.md`, `docs/hinh-nen-anh-bia/dac_ta_hinh_nen_anh_bia.md`

## Việc
1. `domain_frontend.md` §3 (Giao diện) thêm mục "Nền toàn thiệp":
   - Thứ tự chồng lớp dưới → trên: màu nền, ảnh nền (`globalStyle.bgImage`), lớp phủ trắng (`bgImageOverlay`), texture `tex-*`, nền riêng section.
   - Nền khung `#weddingCardFrame` chỉ áp qua `cardBgVars(g)` / `cardBgStyleText(g)` (state.js) ở cả editor, `invite.html`, export; không tự ghép `url()` ở nơi khác.
   - Cấm chèn `url()` vào CSS mà chưa qua `safeCssImageUrl`.
   - Ô ảnh (URL) trong inspector luôn kèm nút "Tải ảnh từ máy tính" dùng `uploadOrDataUrl`.
2. `domain_sections.md`: thêm mục ngắn "Biến thể bố cục trong một section": section có nhiều bố cục khai báo trường `data.layout` + danh sách kiểu trong chính tệp section, `migrate` riêng đưa giá trị lạ về mặc định; không rẽ nhánh bố cục ngoài tệp section. Ví dụ: hero (`classic|fade|arch|fullscreen`).
3. `docs/backlog.md`: thêm các ý ngoài phạm vi (xem cuối đặc tả) — mỗi dòng "việc — lý do — ưu tiên (Thấp/Trung bình)"; thêm ghi chú: ảnh nền `cover` trên thiệp rất dài sẽ phóng to mạnh — cân nhắc chế độ "phủ theo bề ngang" (Trung bình).
4. `CLAUDE.md`: sửa "bump `SCHEMA_VERSION`, currently 4" thành 5. Không sửa gì khác.

## Tiêu chí đạt
Nội dung tiếng Việt (trừ CLAUDE.md giữ tiếng Anh), không mâu thuẫn Hiến pháp/AD; chỉ 4 tệp trên bị sửa.

## Không được làm
Sửa mã, sửa AD đã chốt, sửa tệp ngoài danh sách.
