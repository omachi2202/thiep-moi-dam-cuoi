# T17 — Cập nhật CLAUDE.md + biên bản

- **Sub-agent**: `memoryer` · **Đợt**: 7 · **Phụ thuộc**: T15 · **Review**: không
- **Hồ sơ**: `docs/thiep-tuy-bien-sau/README.md`, giao kèo `docs/thiep-tuy-bien-sau/dac_ta_thiep_tuy_bien_sau.md`

## Tệp được sửa (danh sách đóng)
`CLAUDE.md`, `docs/thiep-tuy-bien-sau/README.md`

## Rules phải đọc
`CLAUDE.md`, `.agents/rules/hard_constitution.md`, `.agents/rules/hard_constitution.md`, `.agents/AGENTS.md`

## Việc cần làm
- Viết lại `CLAUDE.md` theo kiến trúc mới: cấu trúc tệp, registry (thêm loại = 1 tệp + thẻ script), runtime dùng chung, export, chạy backend bằng `py -m uvicorn`, test `py -m pytest server/tests`, trỏ tới `.agents/rules/` và `/dieu-phoi`.
- Ghi tổng kết vào README hồ sơ.

## Tiêu chí đạt
- CLAUDE.md không còn mô tả "single file"/runtime nhân đôi.

## Tự kiểm
—

## Không được làm
- Sửa tệp ngoài danh sách; đổi giao kèo G1–G7 (cần đổi thì dừng, ghi Đề xuất).
- Thêm thư viện/bước build ngoài phiếu; git commit/push.
