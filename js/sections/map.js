// Section: Bản đồ & chỉ đường (iframe Google Maps)

// Trả URL embed hợp lệ: URL người dùng dán chỉ nhận host www.google.com + path /maps/embed; sai thì về dạng q=<địa chỉ>
function mapEmbedSrc(d) {
    const raw = String(d.embedUrl === undefined || d.embedUrl === null ? '' : d.embedUrl).trim();
    if (raw) {
        try {
            const u = new URL(raw);
            if (u.protocol === 'https:' && u.hostname === 'www.google.com' && u.pathname.indexOf('/maps/embed') === 0) {
                return u.href;
            }
        } catch (e) { /* URL sai: rơi về dạng q= */ }
    }
    const addr = String(d.address === undefined || d.address === null ? '' : d.address).trim();
    if (!addr) return '';
    return 'https://www.google.com/maps?q=' + encodeURIComponent(addr) + '&output=embed';
}

function mapDirectionsUrl(d) {
    const addr = String(d.address === undefined || d.address === null ? '' : d.address).trim();
    if (!addr) return '';
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(addr);
}

registerSection({
    type: 'map',
    label: 'Bản đồ',
    icon: 'fa-map-location-dot',
    defaults: () => ({
        title: 'BẢN ĐỒ ĐƯỜNG ĐI',
        address: 'Cẩm Lý, Lục Nam, Bắc Giang',
        embedUrl: '',
        buttonLabel: 'Chỉ đường'
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        const src = mapEmbedSrc(d);
        const dir = mapDirectionsUrl(d);
        // Editor: ảnh giữ chỗ thay iframe cho nhẹ; invite/export: iframe thật
        let mapBlock = '';
        if (ctx.mode === 'editor') {
            mapBlock = `<div class="w-full h-56 rounded-2xl border border-amber-900/10 bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-500">
                            <i class="fa-solid fa-map-location-dot text-4xl" style="color: ${v.pc};"></i>
                            <span class="text-xs px-4">Bản đồ sẽ hiển thị ở thiệp khi xuất bản</span>
                        </div>`;
        } else if (src) {
            mapBlock = `<iframe src="${escapeHtml(src)}" title="Bản đồ" class="w-full h-56 rounded-2xl border-0 shadow-sm" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
        }
        const btn = dir ? `<div class="pt-1">
                            <a href="${escapeHtml(dir)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white shadow transition hover:opacity-90" style="background-color: ${v.pc};">
                                <i class="fa-solid fa-diamond-turn-right"></i> <span ${fieldAttr(ctx, 'buttonLabel')}>${escapeHtml(d.buttonLabel)}</span>
                            </a>
                        </div>` : '';
        return `
                <div class="py-10 px-6 text-center space-y-4" style="color: ${v.secColor};">
                    <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>
                    <div class="w-10 h-0.5 mx-auto opacity-40" style="background-color: ${v.pc};"></div>
                    <p class="text-sm font-medium" ${fieldAttr(ctx, 'address')}>${escapeHtml(d.address)}</p>
                    ${mapBlock}
                    ${btn}
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tiêu đề</label>
                <input type="text" value="${escapeHtml(d.title)}" oninput="updateSectionField('${id}','title',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Địa chỉ</label>
                <input type="text" value="${escapeHtml(d.address)}" oninput="updateSectionField('${id}','address',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">URL nhúng Google Maps (tuỳ chọn)</label>
                <input type="text" value="${escapeHtml(d.embedUrl)}" oninput="updateSectionField('${id}','embedUrl',this.value,true)" placeholder="https://www.google.com/maps/embed?..." class="w-full px-3 py-2 rounded-lg border border-slate-300">
                <p class="text-[11px] text-slate-500 mt-1">Để trống sẽ tự nhúng theo địa chỉ. Chỉ nhận link bắt đầu bằng https://www.google.com/maps/embed.</p>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Chữ trên nút chỉ đường</label>
                <input type="text" value="${escapeHtml(d.buttonLabel)}" oninput="updateSectionField('${id}','buttonLabel',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
        `;
    },
    migrate(data) {
        const str = (x, f) => (typeof x === 'string' ? x : f);
        data.title = str(data.title, 'BẢN ĐỒ ĐƯỜNG ĐI');
        data.address = str(data.address, '');
        data.embedUrl = str(data.embedUrl, '');
        data.buttonLabel = str(data.buttonLabel, 'Chỉ đường');
        return data;
    }
});
