// Section: Chuyện tình yêu (timeline dọc)
(function () {
    function normItem(it) {
        const o = (it && typeof it === 'object') ? it : {};
        return {
            date: String(o.date === undefined || o.date === null ? '' : o.date),
            title: String(o.title === undefined || o.title === null ? '' : o.title),
            text: String(o.text === undefined || o.text === null ? '' : o.text),
            image: String(o.image === undefined || o.image === null ? '' : o.image)
        };
    }

    function getItems(secId) {
        const sec = appState.sections.find(s => s.id === secId);
        if (!sec || !sec.data) return null;
        return (Array.isArray(sec.data.items) ? sec.data.items : []).map(normItem);
    }

    window.storyAddItem = function (secId) {
        const items = getItems(secId);
        if (!items) return;
        items.push({ date: '', title: 'Cột mốc mới', text: '', image: '' });
        updateSectionField(secId, 'items', items, false);
    };

    window.storyRemoveItem = function (secId, i) {
        const items = getItems(secId);
        if (!items || i < 0 || i >= items.length) return;
        items.splice(i, 1);
        updateSectionField(secId, 'items', items, false);
    };

    window.storyMoveItem = function (secId, i, dir) {
        const items = getItems(secId);
        const j = i + (dir < 0 ? -1 : 1);
        if (!items || i < 0 || i >= items.length || j < 0 || j >= items.length) return;
        const tmp = items[i];
        items[i] = items[j];
        items[j] = tmp;
        updateSectionField(secId, 'items', items, false);
    };

    // field ∈ date | title | text | image; gõ trong ô thì không dựng lại inspector
    window.storyUpdateItem = function (secId, i, field, value, rerenderInspector) {
        if (['date', 'title', 'text', 'image'].indexOf(field) < 0) return;
        const items = getItems(secId);
        if (!items || i < 0 || i >= items.length) return;
        items[i][field] = String(value);
        updateSectionField(secId, 'items', items, !rerenderInspector);
    };

    window.storyUploadImage = async function (event, secId, i) {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        try {
            let url;
            if (typeof uploadOrDataUrl === 'function') {
                url = await uploadOrDataUrl(file);
            } else {
                url = await new Promise((resolve, reject) => {
                    const r = new FileReader();
                    r.onload = e => resolve(e.target.result);
                    r.onerror = () => reject(new Error('read'));
                    r.readAsDataURL(file);
                });
            }
            window.storyUpdateItem(secId, i, 'image', url, true);
            if (typeof showToast === 'function') showToast('Đã cập nhật ảnh mốc #' + (i + 1) + '!');
        } catch (err) {
            if (typeof showToast === 'function') showToast('Không tải được ảnh, vui lòng thử lại.');
        }
    };

    registerSection({
        type: 'story',
        label: 'Chuyện tình yêu',
        icon: 'fa-book-heart',
        defaults: () => ({
            title: 'OUR STORY',
            subtitle: 'CHUYỆN TÌNH YÊU CỦA CHÚNG MÌNH',
            items: [
                { date: '2019', title: 'Lần đầu gặp gỡ', text: 'Chúng mình gặp nhau trong một buổi chiều tình cờ và câu chuyện bắt đầu từ đó.', image: '' },
                { date: '2022', title: 'Lời tỏ tình', text: 'Một lời hẹn ước nhỏ bé nhưng đủ để cả hai cùng nắm tay đi tiếp.', image: '' },
                { date: '2025', title: 'Lời cầu hôn', text: 'Và rồi chúng mình quyết định về chung một nhà.', image: '' }
            ]
        }),
        migrate(data) {
            if (typeof data.title !== 'string') data.title = 'OUR STORY';
            if (typeof data.subtitle !== 'string') data.subtitle = '';
            data.items = (Array.isArray(data.items) ? data.items : []).map(normItem);
            return data;
        },
        renderCanvas(sec, ctx) {
            const v = sectionVars(sec, ctx);
            const d = sec.data;
            const items = (Array.isArray(d.items) ? d.items : []).map(normItem);
            const rows = items.map(it => {
                const img = safeUrl(it.image);
                return `
                    <div class="relative pl-8 pb-8 last:pb-0">
                        <span class="absolute left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow" style="background: ${v.pc};"></span>
                        <div class="text-[11px] font-bold tracking-widest uppercase" style="color: ${v.pc};">${escapeHtml(it.date)}</div>
                        <h4 class="text-base font-bold mt-0.5" style="font-family: ${v.secFont};">${escapeHtml(it.title)}</h4>
                        ${it.text ? `<p class="text-xs leading-relaxed mt-1 opacity-85 whitespace-pre-line">${escapeHtml(it.text)}</p>` : ''}
                        ${img ? `<img src="${escapeHtml(img)}" alt="${escapeHtml(it.title)}" class="mt-2 w-full rounded-xl shadow-sm object-cover aspect-[4/3]" loading="lazy" onerror="this.style.display='none'">` : ''}
                    </div>`;
            }).join('');
            return `
                <div class="py-10 px-6 space-y-6" style="color: ${v.secColor};">
                    <div class="text-center space-y-1">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>
                        <p class="text-[11px] tracking-[0.22em] uppercase opacity-70" ${fieldAttr(ctx, 'subtitle')}>${escapeHtml(d.subtitle)}</p>
                    </div>
                    <div class="relative">
                        <span class="absolute left-[12px] top-2 bottom-2 w-px" style="background: ${v.pc}; opacity: .35;"></span>
                        ${rows}
                    </div>
                </div>`;
        },
        renderInspector(sec) {
            const d = sec.data;
            const id = escapeHtml(sec.id);
            const items = (Array.isArray(d.items) ? d.items : []).map(normItem);
            const last = items.length - 1;
            const cards = items.map((it, i) => `
                <div class="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                    <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold text-slate-500 uppercase">Mốc #${i + 1}</span>
                        <div class="flex gap-1">
                            <button type="button" ${i === 0 ? 'disabled' : ''} onclick="storyMoveItem('${id}', ${i}, -1)" class="w-8 h-8 rounded bg-white border border-slate-300 text-slate-600 disabled:opacity-40" title="Lên"><i class="fa-solid fa-arrow-up"></i></button>
                            <button type="button" ${i === last ? 'disabled' : ''} onclick="storyMoveItem('${id}', ${i}, 1)" class="w-8 h-8 rounded bg-white border border-slate-300 text-slate-600 disabled:opacity-40" title="Xuống"><i class="fa-solid fa-arrow-down"></i></button>
                            <button type="button" onclick="storyRemoveItem('${id}', ${i})" class="w-8 h-8 rounded bg-white border border-red-300 text-red-600" title="Xoá mốc"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <input type="text" value="${escapeHtml(it.date)}" placeholder="Thời gian (vd: 2020)" oninput="storyUpdateItem('${id}', ${i}, 'date', this.value)" class="w-full px-2 py-1.5 rounded border border-slate-300 text-xs">
                    <input type="text" value="${escapeHtml(it.title)}" placeholder="Tiêu đề" oninput="storyUpdateItem('${id}', ${i}, 'title', this.value)" class="w-full px-2 py-1.5 rounded border border-slate-300 text-xs">
                    <textarea rows="2" placeholder="Nội dung" oninput="storyUpdateItem('${id}', ${i}, 'text', this.value)" class="w-full px-2 py-1.5 rounded border border-slate-300 text-xs">${escapeHtml(it.text)}</textarea>
                    <div class="flex items-center gap-1.5">
                        <input type="text" value="${escapeHtml(it.image)}" placeholder="URL ảnh (không bắt buộc)" oninput="storyUpdateItem('${id}', ${i}, 'image', this.value)" class="flex-1 px-2 py-1.5 rounded border border-slate-300 text-[11px]">
                        <label class="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-600" title="Tải ảnh lên">
                            <i class="fa-solid fa-upload"></i>
                            <input type="file" accept="image/*" class="hidden" onchange="storyUploadImage(event, '${id}', ${i})">
                        </label>
                    </div>
                </div>
            `).join('');
            return `
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Tiêu đề</label>
                    <input type="text" value="${escapeHtml(d.title)}" oninput="updateSectionField('${id}','title',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Tiêu đề phụ</label>
                    <input type="text" value="${escapeHtml(d.subtitle)}" oninput="updateSectionField('${id}','subtitle',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1.5">Các mốc thời gian</label>
                    <div class="space-y-2">${cards || '<p class="text-[11px] text-slate-400">Chưa có mốc nào.</p>'}</div>
                    <button type="button" onclick="storyAddItem('${id}')" class="mt-2 w-full py-2 rounded-lg border border-dashed border-slate-400 text-slate-600 hover:bg-slate-50 text-xs font-semibold"><i class="fa-solid fa-plus mr-1"></i> Thêm mốc</button>
                </div>
            `;
        }
    });
})();
