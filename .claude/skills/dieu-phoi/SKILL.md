---
name: dieu-phoi
description: Quy trình điều phối 6 bước của repo Tích Hợp Web - phân loại yêu cầu CREATE/UPDATE/DELETE, nạp đúng rules trong .agents/rules, xuất kế hoạch kèm bảng chia việc rồi dừng chờ người dùng duyệt; sau khi duyệt thì tự tạo nhánh, lập hồ sơ docs/<slug>/ và giao các sub-agent chạy song song, phiên chính chỉ điều phối. Chỉ dùng khi người dùng gọi /dieu-phoi hoặc yêu cầu làm theo quy trình điều phối.
argument-hint: "<yêu cầu cần phân loại, lập kế hoạch và giao việc>"
---

# Điều phối 6 bước: phân loại → nạp rules → kế hoạch → chờ duyệt → nhánh + hồ sơ → giao sub-agent

Yêu cầu cần xử lý: $ARGUMENTS

Nếu dòng trên trống, lấy yêu cầu gần nhất của người dùng trong hội thoại. Vẫn không rõ thì hỏi lại.

Thực hiện đủ 6 bước theo thứ tự. **Không sửa tệp, không chạy lệnh làm thay đổi hệ thống** (ghi tệp, tạo nhánh, git commit, cài gói, docker) trước khi người dùng duyệt ở Bước 4. Lệnh chỉ đọc (đọc tệp, grep, `graphify query`, `git status`, `git log`) được phép dùng ở mọi bước.

**Phiên chính chỉ điều phối.** Sau khi được duyệt, phiên chính không tự sửa bất kỳ tệp nào trong `backend/` và `frontend/`, bằng bất kỳ công cụ nào: mọi việc sửa mã đều giao sub-agent (Bước 6).

Mọi đường dẫn dưới đây tính từ gốc repo.

## Bước 1: Phân loại ý định

Gắn cho yêu cầu đúng một nhãn:

- `[CREATE]`: tạo mới module, tính năng, endpoint, schema hoặc UI component.
- `[UPDATE]`: sửa đổi, tối ưu, refactor, sửa lỗi mã hiện có.
- `[DELETE]`: xóa bỏ, dọn dẹp hàm, tệp, thư viện hoặc module không còn dùng.

Quy tắc:
- Yêu cầu gồm nhiều loại (ví dụ thay module cũ bằng module mới) thì tách thành các việc con, mỗi việc một nhãn, và nạp workflow của từng nhãn.
- Không xác định được nhãn hoặc phạm vi thì hỏi người dùng một câu ngắn, không đoán.
- Yêu cầu chỉ hỏi thông tin, không thay đổi gì: trả lời trực tiếp, nói rõ quy trình này không áp dụng.

## Bước 2: Nạp quy chuẩn liên quan

Dùng công cụ đọc tệp để đọc thật, không dựa vào trí nhớ. Tệp đã đọc trong phiên này thì không cần đọc lại.

1. Luôn đọc: `.agents/rules/hard_constitution.md` và `.agents/rules/workflows/giao_viec.md`
2. Theo nhãn:
   - `[CREATE]`: `.agents/rules/workflows/create.md`
   - `[UPDATE]`: `.agents/rules/workflows/update.md`
   - `[DELETE]`: `.agents/rules/workflows/delete.md`
3. Theo phạm vi kỹ thuật:
   - Đụng API, service, dữ liệu lưu trữ: `.agents/rules/domain_backend.md` và `.agents/rules/domain_security_storage.md`
   - Đụng giao diện: `.agents/rules/domain_frontend.md`
   - Đụng test, build, Docker, APK: `.agents/rules/domain_workflow_testing.md`
4. Theo trang bị chạm (chỉ khi việc liên quan tới công thức hoặc quy trình nghiệp vụ của trang đó):

| Trang (route) | Tệp |
|---|---|
| Dashboard (`/`) | `.agents/rules/domain_dashboard.md` |
| N30 (`/ban-le/n30`) | `.agents/rules/domain_ban_le_n30.md` |
| KS5 (`/ban-le/ks5`) | `.agents/rules/domain_ban_le_ks5.md` |
| Điều chuyển (`/ban-le/dieu-chuyen`) | `.agents/rules/domain_ban_le_dieu_chuyen.md` |
| Hầm Bể (`/ban-le/ham-be`) | `.agents/rules/domain_ban_le_ham_be.md` |
| PTK, Báo giá (`/ptk`) | `.agents/rules/domain_ptk.md` |
| Kiểm kê (`/kiem-ke/theo-thang`) | `.agents/rules/domain_kiem_ke_theo_thang.md` |
| Cài đặt (`/settings`) | `.agents/rules/domain_settings.md` |

Tệp workflow của nhãn là quy trình chi tiết cho phần còn lại: làm đúng thứ tự các mục trong đó. Ba việc dưới đây có trong cả ba workflow và **không được bỏ qua**:

### 2.1. Soát luật còn thiếu

Sau khi đọc, đối chiếu yêu cầu với luật theo các câu hỏi ở mục 2 của tệp workflow. Nếu phần sắp làm chưa có luật nào quy định (trang mới, công thức mới, định dạng lưu trữ mới, cách xử lý dữ liệu cũ), hoặc yêu cầu trái một luật hay AD đang hiệu lực: **báo người dùng ngay và gợi ý bổ sung luật**, gồm thiếu gì, nên thêm vào tệp và mục nào, bản nháp 3–8 gạch đầu dòng, và lựa chọn thêm luật trước hay trong cùng đợt. Không tự đặt quy ước rồi làm. Không tự sửa `.agents/` khi chưa được duyệt.

### 2.2. Hỏi lại để đào sâu yêu cầu

Đối chiếu yêu cầu với danh sách điểm cần rõ ở mục 3 của tệp workflow. Còn điểm chưa rõ mà không tự tra được trong mã hay tài liệu thì hỏi người dùng trước khi lập kế hoạch:
- Còn nhiều điểm mở hoặc yêu cầu chạm công thức, số liệu, dữ liệu đã lưu, việc xóa: gọi skill `grilling` (hoặc `grill-me` nếu có) để hỏi lần lượt cho tới khi hai bên hiểu giống nhau.
- Chỉ còn một hai điểm: hỏi trực tiếp, mỗi câu kèm phương án đề xuất.
- Mọi điểm đã rõ: không hỏi thêm, ghi "yêu cầu đã rõ" kèm các giả định vào kế hoạch.

Vì sau chốt duyệt sẽ không hỏi lại, mọi quyết định nghiệp vụ mà các phiếu cần phải được hỏi xong ở bước này.

### 2.3. Nhánh làm việc

Chạy `git branch --show-current` và `git status --short`. Mọi việc có sửa tệp đều làm trên nhánh mới, **tự tạo sau khi kế hoạch được duyệt** (không hỏi riêng). Ở bước này chỉ:
- đặt tên nhánh `<loại>/<tên-ngắn>` theo mục 4 của tệp workflow và ghi vào kế hoạch;
- nếu có tệp **đã theo dõi đang sửa dở**: hỏi người dùng ngay cách xử lý (`giao_viec.md` §3). Tệp chưa theo dõi không liên quan thì để yên.

### 2.4. Khảo sát mã

Khảo sát mã liên quan ở mức đủ để chia phiếu chính xác tới từng tệp. Có `graphify-out/graph.json` thì chạy `graphify query` trước lần grep/đọc mã đầu tiên (CLAUDE.md §9).

## Bước 3: Xuất kế hoạch triển khai

Trình bày bằng tiếng Việt, đúng khung sau:

```markdown
## Kế hoạch triển khai

**1. Phân loại tác vụ**: [CREATE | UPDATE | DELETE] — <một câu mô tả việc>

**2. Phạm vi ảnh hưởng**
- Tệp/component sẽ tạo, sửa hoặc xóa: <đường dẫn từ gốc repo>
- Tệp phụ thuộc bị ảnh hưởng gián tiếp: <nếu có>
- Số liệu lưu/xuất, schema API, mốc golden: <có đổi hay không, đổi gì>

**3. Bảng chia việc**
| Mã | Việc | Tệp (2–3 tệp) | Sub-agent | Đợt | Phụ thuộc | Review |
|---|---|---|---|---|---|---|
| T1 | … | … | gas-backend | 1 | không | có |

- Giao kèo giữa các phiếu cùng đợt: <chữ ký hàm, tên trường, đường dẫn đã chốt để chạy song song>
- Sau mỗi đợt: `autotest`. Cuối: `inspector`.

**4. Kịch bản kiểm thử**
- <lệnh sẽ chạy và kết quả mong đợi, theo từng phiếu>
- <kiểm tra tay nếu có: desktop, mobile 390px>

**Quy chuẩn đã nạp**: <danh sách tệp rules đã đọc>
**Căn cứ áp dụng**: <Điều của Hiến pháp, mã AD liên quan>
**Luật còn thiếu / đề xuất bổ sung**: <thiếu gì, thêm vào đâu, bản nháp; không thiếu thì ghi "đã đủ luật">
**Yêu cầu đã làm rõ**: <các câu trả lời của người dùng và giả định còn lại>
**Nhánh và hồ sơ**: <nhánh hiện tại → nhánh sẽ tự tạo; hồ sơ `docs/<slug>/`; hoặc "việc nhỏ, không lập hồ sơ">
**Điểm dừng sau duyệt**: <việc chạy thật, thao tác không đảo ngược, phiếu bị chặn; không có thì ghi "không">
**Rủi ro, điểm cần người dùng quyết**: <nếu có; không có thì ghi "không">
```

Yêu cầu với bản kế hoạch:
- Đủ các mục mà tệp workflow của nhãn đó ghi là "nội dung bắt buộc của kế hoạch".
- Bảng chia việc theo luật ở `giao_viec.md` §5: mỗi phiếu một mục tiêu, 2–3 tệp; cùng đợt không trùng tệp; xếp được song song thì không xếp tuần tự; phiếu tài liệu ở đợt 1; việc chạy thật, chạy lâu là phiếu riêng chạy nền. Sub-agent lấy từ `.agents/AGENTS.md` (bản cho Claude Code: `.claude/agents/`).
- Nếu kế hoạch chạm vùng cấm CLAUDE.md §6, trái một AD đã chốt hoặc trái Hiến pháp: nêu rõ ở mục rủi ro và đề xuất phương án không vi phạm. Không tự lách.
- Chốt review bắt buộc: phiếu chạm công thức, tiền, đơn giá, quy tắc đối soát, số liệu lưu/xuất, schema API hoặc cấu trúc dữ liệu lưu trữ phải ghi Review = "có" (`reviewer-code` rà ngay khi phiếu xong), và cả việc phải qua `inspector` trước khi bàn giao.

## Bước 4: Dừng lại chờ xác nhận

- Kết thúc lượt trả lời sau khi trình kế hoạch. Đang ở plan mode thì trình qua ExitPlanMode.
- Chỉ sang Bước 5 khi người dùng đồng ý rõ ràng. Người dùng yêu cầu chỉnh thì sửa kế hoạch và trình lại, vẫn chưa triển khai.
- Khi đã gọi quy trình này thì luôn dừng chờ duyệt, kể cả với việc đủ điều kiện "đường tắt việc nhỏ" ở `.agents/rules/domain_subagents_workflow.md` §2.
- Đây là chốt duyệt duy nhất. Sau khi được duyệt, làm tới bàn giao mà không hỏi lại, trừ các điểm dừng đã ghi trong kế hoạch và các trường hợp `giao_viec.md` bắt dừng.

## Bước 5: Tạo nhánh và lập hồ sơ

Làm theo `.agents/rules/workflows/giao_viec.md` §3 và §4:

- Tự tạo nhánh đã ghi trong kế hoạch.
- Lập `docs/<slug>/`: `README.md` (nhiệm vụ tổng, bảng task), `dac_ta_<viec>.md`, một phiếu `giao_viec/T<n>_<ten>.md` cho mỗi dòng của bảng chia việc. Commit hồ sơ.
- Việc nhỏ: chỉ tạo nhánh, không lập hồ sơ (`giao_viec.md` §8).

## Bước 6: Giao sub-agent, nghiệm thu, bàn giao

Làm theo `.agents/rules/workflows/giao_viec.md` §6 và §7:

- Giao **cả đợt trong một message** (nhiều lời gọi Agent song song), `subagent_type` đúng mã trong `.claude/agents/`. Trong lúc chờ, làm việc không phụ thuộc (tệp luật đã duyệt, phiếu đợt sau).
- Sau mỗi đợt: `autotest`; phiếu Review = "có": `reviewer-code` ngay. Đạt thì ghi biên bản và commit riêng từng phiếu trên nhánh. Chưa đạt thì phiếu sửa `T<n>.1` giao lại bên làm, tối đa 2 vòng rồi dừng báo.
- Cuối: `inspector` trên toàn bộ diff của nhánh.
- Phát sinh ngoài kế hoạch đã duyệt thì dừng và báo, không tự mở rộng. **Không merge vào `master`, không push, không deploy** nếu người dùng chưa ra lệnh.
- Báo cáo bàn giao theo mẫu ở `.agents/rules/domain_subagents_workflow.md` §5, kèm tên nhánh, danh sách commit và bảng task cuối.
