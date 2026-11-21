// Section: Trang trí / ngăn cách (hoạ tiết SVG viết sẵn, đường kẻ, chữ giữa hai đường kẻ, khoảng trống)
(function () {
const DIVIDER_KINDS = [
    ['floral', 'Hoa'], ['leaf', 'Lá'], ['heart', 'Tim'], ['rings', 'Nhẫn'],
    ['line', 'Đường kẻ'], ['text', 'Chữ'], ['space', 'Khoảng trống']
];
const DIVIDER_LINES = [['solid', 'Liền'], ['dotted', 'Chấm'], ['dashed', 'Gạch']];
const DIVIDER_SIZES = [['sm', 'Nhỏ'], ['md', 'Vừa'], ['lg', 'Lớn']];
const DIVIDER_LOOPS = [['none', 'Không'], ['swing', 'Đung đưa'], ['pulse', 'Phập phồng'], ['heartbeat', 'Nhịp tim']];
const DIVIDER_HEIGHT = { sm: 28, md: 40, lg: 56 };

// SVG tự vẽ, viewBox 120x40, dùng currentColor. Nội dung cố định, không nhận dữ liệu người dùng.
const DIVIDER_SVG = {
    floral: '<g fill="currentColor"><circle cx="60" cy="14" r="5"/><circle cx="60" cy="26" r="5"/><circle cx="54" cy="20" r="5"/><circle cx="66" cy="20" r="5"/></g><circle cx="60" cy="20" r="3" fill="#fff"/>'
        + '<g fill="currentColor"><path d="M48 20 C40 12 30 12 22 20 C30 28 40 28 48 20Z"/><path d="M72 20 C80 12 90 12 98 20 C90 28 80 28 72 20Z"/></g>'
        + '<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 20 H4"/><path d="M102 20 H116"/></g>',
    leaf: '<g fill="currentColor"><path d="M60 6 C70 14 70 26 60 34 C50 26 50 14 60 6Z"/>'
        + '<path d="M52 30 C40 32 28 26 22 16 C34 14 46 20 52 30Z"/><path d="M68 30 C80 32 92 26 98 16 C86 14 74 20 68 30Z"/></g>'
        + '<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M60 12 V36"/><path d="M16 22 H4"/><path d="M104 22 H116"/></g>',
    heart: '<path fill="currentColor" d="M60 34 C40 22 40 8 51 8 C56 8 59 11 60 14 C61 11 64 8 69 8 C80 8 80 22 60 34Z"/>'
        + '<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M34 20 H6"/><path d="M86 20 H114"/></g>'
        + '<g fill="currentColor"><circle cx="40" cy="20" r="2"/><circle cx="80" cy="20" r="2"/></g>',
    rings: '<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="50" cy="22" r="11"/><circle cx="70" cy="22" r="11"/></g>'
        + '<path fill="currentColor" d="M60 4 L64 9 L60 14 L56 9Z"/>'
        + '<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M30 22 H6"/><path d="M90 22 H114"/></g>'
};

function dividerPick(v, list, def) {
    return list.some(o => o[0] === v) ? v : def;
}

function dividerSvg(kind, h, color, loop) {
    const body = DIVIDER_SVG[kind];
    if (!body) return '';
    const loopCls = loop && loop !== 'none' ? ` loop-${loop}` : '';
    return `<span class="inline-block${loopCls}" style="color: ${color}; line-height: 0;"><svg viewBox="0 0 120 40" width="${Math.round(h * 3)}" height="${h}" role="img" aria-hidden="true" style="display:block; max-width:100%;">${body}</svg></span>`;
}

registerSection({
    type: 'divider',
    label: 'Trang trí / Ngăn cách',
    icon: 'fa-seedling',
    defaults: () => ({ kind: 'floral', text: 'Love', lineStyle: 'solid', size: 'md', color: '', loop: 'none' }),
    migrate(data) {
        const def = this.defaults();
        data = Object.assign({}, def, data || {});
        data.kind = dividerPick(data.kind, DIVIDER_KINDS, def.kind);
        data.lineStyle = dividerPick(data.lineStyle, DIVIDER_LINES, def.lineStyle);
        data.size = dividerPick(data.size, DIVIDER_SIZES, def.size);
        data.loop = dividerPick(data.loop, DIVIDER_LOOPS, def.loop);
        data.color = safeColor(data.color, '');
        data.text = typeof data.text === 'string' ? data.text.slice(0, 60) : def.text;
        return data;
    },
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = this.migrate(Object.assign({}, sec.data || {}));
        const color = safeColor(d.color, '') || v.pc;
        const h = DIVIDER_HEIGHT[d.size];
        const wrap = inner => `<div class="py-4 px-6 text-center" style="color: ${color};">${inner}</div>`;
        if (d.kind === 'space') {
            const box = ctx.mode === 'editor' ? ' border: 1px dashed rgba(148,163,184,0.6); border-radius: 8px;' : '';
            return `<div class="px-6"><div style="height: ${h}px;${box}"></div></div>`;
        }
        if (d.kind === 'line') {
            return wrap(`<div style="border-top:${d.size === 'lg' ? 3 : (d.size === 'md' ? 2 : 1)}px ${d.lineStyle} ${color}; width: 100%;"></div>`);
        }
        if (d.kind === 'text') {
            const line = `<span style="flex: 1; border-top: 1px ${d.lineStyle} ${color}; opacity: 0.7;"></span>`;
            const fs = d.size === 'lg' ? 36 : (d.size === 'md' ? 28 : 20);
            const loopCls = d.loop !== 'none' ? ` loop-${d.loop}` : '';
            return wrap(`<div style="display: flex; align-items: center; gap: 14px;">${line}<span class="${loopCls.trim()}" style="font-family: ${v.scriptFont}; font-size: ${fs}px; line-height: 1.2; min-width: 0; max-width: 70%; overflow-wrap: anywhere;" ${fieldAttr(ctx, 'text')}>${escapeHtml(d.text)}</span>${line}</div>`);
        }
        return wrap(dividerSvg(d.kind, h, color, d.loop));
    },
    renderInspector(sec) {
        const d = this.migrate(Object.assign({}, sec.data || {}));
        const id = escapeHtml(sec.id);
        const cls = 'w-full px-3 py-2 rounded-lg border border-slate-300';
        const prevColor = safeColor(d.color, '') || '#64748b';
        const picker = DIVIDER_KINDS.map(([k, label]) => {
            const on = k === d.kind;
            let thumb;
            if (DIVIDER_SVG[k]) thumb = `<svg viewBox="0 0 120 40" width="60" height="20" aria-hidden="true">${DIVIDER_SVG[k]}</svg>`;
            else if (k === 'line') thumb = '<span style="display:block; width:60px; border-top:2px solid currentColor;"></span>';
            else if (k === 'text') thumb = '<span style="font-size:12px;">— Aa —</span>';
            else thumb = '<span style="display:block; width:60px; height:16px; border:1px dashed currentColor; border-radius:4px; opacity:.6;"></span>';
            return `<button type="button" onclick="updateSectionField('${id}','kind','${k}',false)" aria-pressed="${on}"
                class="flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-lg border text-[11px] ${on ? 'border-violet-500 bg-violet-50 text-violet-700 font-semibold' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}">
                <span class="flex items-center justify-center" style="height:22px;">${thumb}</span>${escapeHtml(label)}</button>`;
        }).join('');
        const select = (key, list, cur) => `
            <select onchange="updateSectionField('${id}','${key}',this.value,false)" class="${cls} bg-white">
                ${list.map(([val, label]) => `<option value="${val}" ${val === cur ? 'selected' : ''}>${escapeHtml(label)}</option>`).join('')}
            </select>`;
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Kiểu trang trí</label>
                <div class="grid grid-cols-3 gap-2">${picker}</div>
            </div>
            ${d.kind === 'text' ? `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Chữ ở giữa</label>
                <input type="text" value="${escapeHtml(d.text)}" maxlength="60" oninput="updateSectionField('${id}','text',this.value,true)" class="${cls}">
            </div>` : ''}
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Kích thước</label>
                    ${select('size', DIVIDER_SIZES, d.size)}
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Kiểu đường kẻ</label>
                    ${select('lineStyle', DIVIDER_LINES, d.lineStyle)}
                </div>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Hiệu ứng chuyển động</label>
                ${select('loop', DIVIDER_LOOPS, d.loop)}
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Màu hoạ tiết</label>
                <div class="flex items-center gap-2">
                    <input type="color" value="${escapeHtml(prevColor.length === 7 ? prevColor : '#64748b')}" oninput="updateSectionField('${id}','color',this.value,true)" class="h-9 w-14 rounded border border-slate-300 bg-white">
                    <button type="button" onclick="updateSectionField('${id}','color','',false)" class="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-600">Dùng màu chủ đạo</button>
                </div>
            </div>
        `;
    }
});
})();
