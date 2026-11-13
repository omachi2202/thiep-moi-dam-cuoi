# Đội sub-agent — Thiệp cưới online

Định nghĩa cho Claude Code: `.claude/agents/<mã>.md`. Quyền chi tiết: `.agents/rules/domain_subagents_workflow.md` §3.

| Mã | Vai trò | Sửa tệp | Dùng khi |
|---|---|---|---|
| `planner` | Chia phiếu, viết hồ sơ | `docs/<slug>/` | Việc lớn cần phân rã |
| `frontend-ui` | Làm editor, thiệp, trang khách | `index.html`, `invite.html`, `css/`, `js/` | Mọi phiếu front-end |
| `py-backend` | FastAPI + Excel + pytest | `server/` | Mọi phiếu backend |
| `frontend-architect` | Tư vấn kiến trúc front-end | — | Đổi hợp đồng registry/runtime |
| `backend-architect` | Tư vấn API, lưu trữ | — | Đổi schema, cột Excel |
| `autotest` | Chạy kiểm nhanh | — (chạy lệnh) | Sau mỗi đợt |
| `reviewer-code` | Review an toàn, logic | — | Phiếu Review = "có" |
| `inspector` | Cổng chất lượng cuối | — | Trước bàn giao |
| `ui-aesthetic-reviewer` | Thẩm định thẩm mỹ | — | Đổi giao diện lớn |
| `memoryer` | Tài liệu, AD, CLAUDE.md | `docs/`, `CLAUDE.md` | Phiếu tài liệu |
| `researcher` | Tra cứu kỹ thuật | — | Cần tài liệu ngoài |
