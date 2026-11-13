// Section: Lịch tháng & đếm ngược
// Vẽ lưới ngày của tháng cưới (chỉ dùng trong section này)
function generateCalendarHtml(isoDateStr, primaryColor) {
    const d = new Date(isoDateStr || '2026-10-24T16:00:00');
    const year = isNaN(d.getFullYear()) ? 2026 : d.getFullYear();
    const month = isNaN(d.getMonth()) ? 9 : d.getMonth(); // 0-indexed
    const weddingDay = isNaN(d.getDate()) ? 24 : d.getDate();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (CN) -> 6 (T7)
    // Chuyển sang Thứ 2 là đầu tuần (0: T2 ... 6: CN)
    const offset = (firstDayOfMonth + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    let cells = weekDays.map(w => `<div class="font-bold text-[11px] py-1.5 opacity-70">${w}</div>`).join('');

    for (let i = 0; i < offset; i++) {
        cells += `<div></div>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
        if (day === weddingDay) {
            cells += `
            <div class="relative flex items-center justify-center py-1">
                <span class="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md" style="background-color: ${primaryColor};">
                    ${day}
                </span>
                <i class="fa-solid fa-heart text-[9px] absolute -top-0.5 right-1 text-rose-500"></i>
            </div>`;
        } else {
            cells += `<div class="py-1.5 text-xs">${day}</div>`;
        }
    }
    return cells;
}

registerSection({
    type: 'countdown',
    label: 'Lịch tháng & Đếm ngược',
    icon: 'fa-calendar-check',
    defaults: () => ({
        quoteTitle: 'Happy Wedding',
        quoteText: '"It\'s been said that you only truly fall in love once, but don\'t believe it. Every time I see you, I fall in love all over again!"',
        weddingIsoDate: '2026-10-24T16:00:00',
        calendarTitle: 'THÁNG 10 / 2026'
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        const calendarGrid = generateCalendarHtml(d.weddingIsoDate, v.pc);
        // data-slot: chỗ cố định để runtime (CardRuntime) gắn đồng hồ đếm ngược và nút thêm vào lịch (giao kèo G4)
        const cell = (id, label) => `
                            <div class="bg-white rounded-xl py-3 px-2 shadow-sm border border-amber-900/10">
                                <span id="${id}" class="block text-xl font-bold" style="color: ${v.pc}; font-family: ${v.secFont};">00</span>
                                <span class="text-[11px] uppercase opacity-80">${label}</span>
                            </div>`;
        return `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${v.secColor};">
                    <div class="space-y-2">
                        <h3 style="font-family: ${v.scriptFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'quoteTitle')}>${escapeHtml(d.quoteTitle)}</h3>
                        <p class="text-xs italic leading-relaxed px-2 opacity-85" ${fieldAttr(ctx, 'quoteText')}>${escapeHtml(d.quoteText)}</p>
                    </div>

                    <!-- Tờ lịch tháng -->
                    <div class="bg-white rounded-2xl p-5 shadow-sm border border-amber-900/10">
                        <div class="font-bold text-sm tracking-widest uppercase mb-3 pb-2 border-b border-slate-100" style="color: ${v.pc}; font-family: ${v.secFont};" ${fieldAttr(ctx, 'calendarTitle')}>
                            ${escapeHtml(d.calendarTitle)}
                        </div>
                        <div class="grid grid-cols-7 gap-1 text-center">
                            ${calendarGrid}
                        </div>
                        <div data-slot="calendar-actions"></div>
                    </div>

                    <!-- Đồng hồ đếm ngược -->
                    <div class="space-y-3 pt-2" data-slot="countdown">
                        <p class="text-xs font-bold tracking-[0.25em] uppercase opacity-75">COUNTDOWN</p>
                        <div class="grid grid-cols-4 gap-2.5">${cell('cd-days', 'Ngày')}${cell('cd-hours', 'Giờ')}${cell('cd-mins', 'Phút')}${cell('cd-secs', 'Giây')}
                        </div>
                    </div>
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ngày & Giờ Cưới (Tự động vẽ Lịch & Đếm ngược)</label>
                <input type="datetime-local" value="${escapeHtml(d.weddingIsoDate)}" onchange="updateWeddingDateTime('${id}', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tiêu đề Tháng hiển thị</label>
                <input type="text" value="${escapeHtml(d.calendarTitle)}" oninput="updateSectionField('${id}','calendarTitle',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Câu trích dẫn (Quote)</label>
                <textarea rows="3" oninput="updateSectionField('${id}','quoteText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.quoteText)}</textarea>
            </div>
        `;
    }
});
