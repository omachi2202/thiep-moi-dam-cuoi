// Section: Dress code (danh sách màu swatch động)

function dresscodeGetColors(secId) {
    const sec = appState.sections.find(s => s.id === secId);
    if (!sec || !Array.isArray(sec.data.colors)) return [];
    return sec.data.colors.filter(c => typeof c === 'string');
}

function dresscodeAddColor(secId) {
    const arr = dresscodeGetColors(secId);
    if (arr.length >= 8) return;
    arr.push('#d4a373');
    updateSectionField(secId, 'colors', arr, false);
}

function dresscodeRemoveColor(secId, i) {
    const arr = dresscodeGetColors(secId);
    if (i < 0 || i >= arr.length) return;
    arr.splice(i, 1);
    updateSectionField(secId, 'colors', arr, false);
}

// Đổi màu khi kéo color picker: fromInspector=true để không dựng lại inspector (giữ focus picker)
function dresscodeSetColor(secId, i, value) {
    const arr = dresscodeGetColors(secId);
    if (i < 0 || i >= arr.length) return;
    arr[i] = String(value);
    updateSectionField(secId, 'colors', arr, true);
}
window.dresscodeAddColor = dresscodeAddColor;
window.dresscodeRemoveColor = dresscodeRemoveColor;
window.dresscodeSetColor = dresscodeSetColor;

registerSection({
    type: 'dresscode',
    label: 'Dress code',
    icon: 'fa-shirt',
    defaults: () => ({
        title: 'DRESS CODE',
        note: 'Chúng mình rất vui nếu bạn mặc trang phục theo tông màu dưới đây.',
        colors: ['#f5e6d3', '#d4a373', '#8b5e3c']
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        const colors = Array.isArray(d.colors) ? d.colors : [];
        const swatches = colors.map(c => {
            const col = safeColor(c, '');
            if (!col) return '';
            return `<span class="inline-block w-10 h-10 rounded-full border border-slate-300 shadow-sm" style="background-color: ${col};"></span>`;
        }).join('');
        return `
                <div class="py-10 px-6 text-center space-y-4" style="color: ${v.secColor};">
                    <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>
                    <div class="w-10 h-0.5 mx-auto opacity-40" style="background-color: ${v.pc};"></div>
                    <p class="text-sm italic opacity-80" ${fieldAttr(ctx, 'note')}>${escapeHtml(d.note)}</p>
                    <div class="flex flex-wrap justify-center gap-3 pt-2">${swatches}</div>
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        const colors = Array.isArray(d.colors) ? d.colors : [];
        const rows = colors.map((c, i) => `
                <div class="flex items-center gap-2">
                    <input type="color" value="${escapeHtml(safeColor(c, '#cccccc'))}" oninput="dresscodeSetColor('${id}',${i},this.value)" class="w-10 h-8 rounded border border-slate-300 cursor-pointer">
                    <span class="text-xs text-slate-500 flex-1">${escapeHtml(c)}</span>
                    <button type="button" onclick="dresscodeRemoveColor('${id}',${i})" class="px-2 py-1 rounded bg-red-50 text-red-600 border border-red-200 text-xs hover:bg-red-100"><i class="fa-solid fa-trash"></i></button>
                </div>`).join('');
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tiêu đề</label>
                <input type="text" value="${escapeHtml(d.title)}" oninput="updateSectionField('${id}','title',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ghi chú</label>
                <textarea rows="3" oninput="updateSectionField('${id}','note',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.note)}</textarea>
            </div>
            <div class="space-y-2">
                <label class="block font-semibold text-slate-700">Màu trang phục (tối đa 8)</label>
                ${rows}
                <button type="button" onclick="dresscodeAddColor('${id}')" class="w-full py-2 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-200 transition"><i class="fa-solid fa-plus"></i> Thêm màu</button>
            </div>
        `;
    },
    migrate(data) {
        data.title = typeof data.title === 'string' ? data.title : 'DRESS CODE';
        data.note = typeof data.note === 'string' ? data.note : '';
        data.colors = Array.isArray(data.colors) ? data.colors.filter(c => typeof c === 'string') : [];
        return data;
    }
});
