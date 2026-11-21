// Section: Lịch tháng cưới (độc lập, không có đồng hồ đếm ngược)
(function () {
    const DEFAULT_DATE = '2026-10-24';

    // Phân tích 'YYYY-MM-DD' (tính UTC); sai định dạng/ngày không tồn tại -> null
    function parseDate(s) {
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
        if (!m) return null;
        const y = +m[1], mo = +m[2], da = +m[3];
        const dt = new Date(Date.UTC(y, mo - 1, da));
        if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== da) return null;
        return { y, m: mo - 1, d: da };
    }

    function normDate(s) {
        return parseDate(s) ? String(s).trim() : DEFAULT_DATE;
    }
    function normWeekStart(v) { return v === 'sun' ? 'sun' : 'mon'; }
    function normMark(v) { return v === 'circle' ? 'circle' : 'heart'; }

    function gridHtml(dateStr, weekStart, mark, pc) {
        const p = parseDate(dateStr) || parseDate(DEFAULT_DATE);
        const sunFirst = weekStart === 'sun';
        const labels = sunFirst ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const first = new Date(Date.UTC(p.y, p.m, 1)).getUTCDay(); // 0 = CN
        const offset = sunFirst ? first : (first + 6) % 7;
        const days = new Date(Date.UTC(p.y, p.m + 1, 0)).getUTCDate();
        let cells = labels.map(w => `<div class="font-bold text-[11px] py-1.5 opacity-70">${w}</div>`).join('');
        for (let i = 0; i < offset; i++) cells += '<div></div>';
        for (let day = 1; day <= days; day++) {
            if (day === p.d) {
                if (mark === 'circle') {
                    cells += `<div class="flex items-center justify-center py-1"><span class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style="border: 2px solid ${pc}; color: ${pc};">${day}</span></div>`;
                } else {
                    cells += `<div class="relative flex items-center justify-center py-1 w-8 h-8 mx-auto">
                        <i class="fa-solid fa-heart loop-heartbeat absolute inset-0 flex items-center justify-center text-[28px]" style="color: ${pc}; opacity: .9;"></i>
                        <span class="relative text-white font-bold text-[11px]">${day}</span>
                    </div>`;
                }
            } else {
                cells += `<div class="py-1.5 text-xs">${day}</div>`;
            }
        }
        return cells;
    }

    registerSection({
        type: 'calendar',
        label: 'Lịch tháng cưới',
        icon: 'fa-calendar-days',
        defaults: () => ({
            title: 'Tháng 10 / 2026',
            subtitle: 'SAVE THE DATE',
            date: DEFAULT_DATE,
            weekStart: 'mon',
            mark: 'heart',
            note: 'Thứ Bảy, ngày 24 tháng 10 năm 2026'
        }),
        migrate(data) {
            const d = Object.assign({}, this.defaults(), data || {});
            d.date = normDate(d.date);
            d.weekStart = normWeekStart(d.weekStart);
            d.mark = normMark(d.mark);
            return d;
        },
        renderCanvas(sec, ctx) {
            const v = sectionVars(sec, ctx);
            const d = Object.assign({}, this.defaults(), sec.data || {});
            const pc = safeColor(v.pc) || '#b45309';
            const grid = gridHtml(d.date, normWeekStart(d.weekStart), normMark(d.mark), pc);
            return `
                <div class="py-10 px-6 text-center space-y-4" style="color: ${v.secColor};">
                    <p class="text-xs font-bold tracking-[0.3em] uppercase opacity-75" ${fieldAttr(ctx, 'subtitle')}>${escapeHtml(d.subtitle)}</p>
                    <div class="bg-white rounded-2xl p-5 shadow-sm border border-amber-900/10">
                        <div class="font-bold text-sm tracking-widest uppercase mb-3 pb-2 border-b border-slate-100" style="color: ${pc}; font-family: ${v.secFont};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</div>
                        <div class="grid grid-cols-7 gap-1 text-center">${grid}</div>
                    </div>
                    <p class="text-sm" style="font-family: ${v.scriptFont}; color: ${pc};" ${fieldAttr(ctx, 'note')}>${escapeHtml(d.note)}</p>
                </div>`;
        },
        renderInspector(sec) {
            const d = Object.assign({}, this.defaults(), sec.data || {});
            const id = escapeHtml(sec.id);
            const cls = 'w-full px-3 py-2 rounded-lg border border-slate-300';
            const opt = (val, label, cur) => `<option value="${val}" ${val === cur ? 'selected' : ''}>${label}</option>`;
            return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tiêu đề</label>
                <input type="text" value="${escapeHtml(d.title)}" oninput="updateSectionField('${id}','title',this.value,true)" class="${cls}">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Phụ đề</label>
                <input type="text" value="${escapeHtml(d.subtitle)}" oninput="updateSectionField('${id}','subtitle',this.value,true)" class="${cls}">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ngày cưới (vẽ lịch tháng này)</label>
                <input type="date" value="${escapeHtml(normDate(d.date))}" onchange="updateSectionField('${id}','date',this.value,false)" class="${cls}">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tuần bắt đầu từ</label>
                <select onchange="updateSectionField('${id}','weekStart',this.value,false)" class="${cls}">
                    ${opt('mon', 'Thứ Hai', normWeekStart(d.weekStart))}${opt('sun', 'Chủ nhật', normWeekStart(d.weekStart))}
                </select>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Kiểu đánh dấu ngày cưới</label>
                <select onchange="updateSectionField('${id}','mark',this.value,false)" class="${cls}">
                    ${opt('heart', 'Trái tim', normMark(d.mark))}${opt('circle', 'Vòng tròn', normMark(d.mark))}
                </select>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <input type="text" value="${escapeHtml(d.note)}" oninput="updateSectionField('${id}','note',this.value,true)" class="${cls}">
            </div>
        `;
        }
    });
})();
