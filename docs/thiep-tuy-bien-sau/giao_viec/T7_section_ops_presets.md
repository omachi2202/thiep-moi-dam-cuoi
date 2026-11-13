# T7 — Thêm/nhân bản/xoá section + preset toàn thiệp

- **Sub-agent**: `frontend-ui` · **Đợt**: 4 · **Phụ thuộc**: T3 · **Review**: không
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`js/section_ops.js`, `js/render.js`, `js/state.js`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/domain_frontend.md`, `.agents/rules/domain_sections.md`

## Việc cần làm
- `addSection(type)` (id `<type>-<n>`, data = `defaults()`, chèn sau section đang chọn), `duplicateSection(id)` (deep copy, name + ' (bản sao)'), `deleteSection(id)` (xác nhận bằng modal nhỏ trong trang, không confirm()). Đều gọi `commitState`.
- Sidebar (`renderSectionListSidebar`): nút "+ Thêm section" mở danh sách loại từ `SECTION_TYPES` (label + icon); mỗi dòng thêm nút nhân bản, xoá; loại không có trong registry hiện cảnh báo.
- `THEME_PRESETS`: 5 mẫu (vd Cổ điển nâu MM03, Pastel hồng, Xanh sage, Đỏ truyền thống, Tối giản trắng đen) — mỗi mẫu: màu, 3 font, `fallingEffect`, và (khi T13 xong sẽ có) `bgTexture`/`frameStyle`; tuỳ chọn `sectionOrder`. `applyThemePreset` chỉ ghi khoá có trong preset, gọi `commitState`.

## Tiêu chí đạt
- Thêm mỗi loại có trong registry, nhân bản, xoá, đổi thứ tự hoạt động và undo được.

## Tự kiểm
Không chạy lệnh được — ghi "chờ autotest"; tự soát cú pháp, ngoặc, dấu phẩy, `</script>` trong chuỗi.

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
