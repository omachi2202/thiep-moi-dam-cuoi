// Section: Lịch trình sự kiện & chỉ đường (danh sách sự kiện động, 0..10)

const EVENTS_MAX = 10;
const EVENTS_FIELDS = ['title', 'time', 'date', 'lunar', 'venue', 'mapUrl'];

function eventsDefaultItems() {
    return [
        {
            title: 'TIỆC MỪNG CƯỚI',
            time: '16:00 - CHỦ NHẬT',
            date: '24.10.2026',
            lunar: '(Tức ngày 15 tháng 09 năm Bính Ngọ)',
            venue: 'Tại Tư Gia Nhà Gái - Cẩm Lý, Lục Nam, Bắc Giang',
            mapUrl: 'https://maps.google.com/?q=Cam+Ly+Luc+Nam+Bac+Giang'
        },
        {
            title: 'LỄ THÀNH HÔN',
            time: '09:00 - THỨ HAI',
            date: '25.10.2026',
            lunar: '(Tức ngày 16 tháng 09 năm Bính Ngọ)',
            venue: 'Tại Tư Gia Nhà Trai - Cẩm Lý, Lục Nam, Bắc Giang',
            mapUrl: 'https://maps.google.com/?q=Cam+Ly+Luc+Nam+Bac+Giang'
        }
    ];
}

// Chuẩn hoá một phần tử về object đủ 6 trường chuỗi
function eventsNormItem(it) {
    const src = (it && typeof it === 'object' && !Array.isArray(it)) ? it : {};
    const out = {};
    EVENTS_FIELDS.forEach(f => { out[f] = typeof src[f] === 'string' ? src[f] : (src[f] == null ? '' : String(src[f])); });
    return out;
}

function eventsGetItems(secId) {
    const sec = appState.sections.find(s => s.id === secId);
    if (!sec || !sec.data || !Array.isArray(sec.data.items)) return [];
    return sec.data.items.map(eventsNormItem);
}

function eventsCommit(secId, arr, skipInspector) {
    updateSectionField(secId, 'items', arr, !!skipInspector);
}

function eventsAddItem(secId) {
    const arr = eventsGetItems(secId);
    if (arr.length >= EVENTS_MAX) return;
    const it = eventsNormItem({});
    it.title = 'SỰ KIỆN MỚI';
    arr.push(it);
    eventsCommit(secId, arr, false);
}

function eventsRemoveItem(secId, i) {
    const arr = eventsGetItems(secId);
    if (!Number.isInteger(i) || i < 0 || i >= arr.length) return;
    arr.splice(i, 1);
    eventsCommit(secId, arr, false);
}

function eventsMoveItem(secId, i, dir) {
    const arr = eventsGetItems(secId);
    const j = i + (dir < 0 ? -1 : 1);
    if (!Number.isInteger(i) || i < 0 || i >= arr.length || j < 0 || j >= arr.length) return;
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    eventsCommit(secId, arr, false);
}

function eventsUpdateItem(secId, i, field, value, skipInspector) {
    if (EVENTS_FIELDS.indexOf(field) < 0) return;
    const arr = eventsGetItems(secId);
    if (!Number.isInteger(i) || i < 0 || i >= arr.length) return;
    arr[i][field] = String(value == null ? '' : value);
    eventsCommit(secId, arr, skipInspector);
}

// Xoá hai bước trong cùng nút: bấm lần 1 -> "Chắc chắn?" 3 giây, bấm lần 2 -> xoá
function eventsConfirmRemove(btn, secId, i) {
    if (btn.dataset.armed === '1') {
        clearTimeout(btn._evTimer);
        eventsRemoveItem(secId, i);
        return;
    }
    const original = btn.innerHTML;
    btn.dataset.armed = '1';
    btn.textContent = 'Chắc chắn?';
    btn._evTimer = setTimeout(() => {
        btn.dataset.armed = '';
        btn.innerHTML = original;
    }, 3000);
}

window.eventsAddItem = eventsAddItem;
window.eventsRemoveItem = eventsRemoveItem;
window.eventsMoveItem = eventsMoveItem;
window.eventsUpdateItem = eventsUpdateItem;
window.eventsConfirmRemove = eventsConfirmRemove;

registerSection({
    type: 'events',
    label: 'Lịch trình & Chỉ đường',
    icon: 'fa-location-dot',
    defaults: () => ({ items: eventsDefaultItems() }),
    // Hook: sự kiện đầu tiên cho nút thêm vào lịch (không có ngày giờ riêng)
    calendarEvent(sec) {
        const items = sec && sec.data && Array.isArray(sec.data.items) ? sec.data.items : [];
        if (!items.length) return null;
        const it = eventsNormItem(items[0]);
        return { title: it.title, location: it.venue, iso: null };
    },
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const items = Array.isArray(sec.data.items) ? sec.data.items.map(eventsNormItem) : [];
        const editable = ctx.mode === 'editor' && !(ctx.appState && ctx.appState.isPreviewMode);
        const evAttr = (i, f) => editable ? `data-ev-field="${i}.${f}" contenteditable="true"` : '';
        // Nút chỉ đường chỉ nhận http(s); URL rỗng/không hợp lệ thì ẩn nút
        const mapBtn = (it) => {
            const url = safeUrl(it.mapUrl);
            if (!/^https?:\/\//i.test(url)) return '';
            return `<div class="pt-2">
                            <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white shadow transition hover:opacity-90" style="background-color: ${v.pc};">
                                <i class="fa-solid fa-location-dot"></i> XEM CHỈ ĐƯỜNG
                            </a>
                        </div>`;
        };
        const block = (it, i) => `
                    <div class="bg-white/90 rounded-2xl p-6 shadow-sm border border-amber-900/10 space-y-2.5">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${evAttr(i, 'title')}>${escapeHtml(it.title)}</h3>
                        <div class="w-10 h-0.5 mx-auto opacity-40" style="background-color: ${v.pc};"></div>
                        <p class="font-bold text-sm tracking-wide" ${evAttr(i, 'time')}>${escapeHtml(it.time)}</p>
                        <p class="text-2xl font-bold tracking-wider" style="color: ${v.pc}; font-family: ${v.secFont};" ${evAttr(i, 'date')}>${escapeHtml(it.date)}</p>
                        <p class="text-xs italic opacity-75" ${evAttr(i, 'lunar')}>${escapeHtml(it.lunar)}</p>
                        <p class="text-xs font-medium pt-1" ${evAttr(i, 'venue')}>${escapeHtml(it.venue)}</p>
                        ${mapBtn(it)}
                    </div>`;
        if (!items.length) {
            if (ctx.mode !== 'editor') return '';
            return `
                <div class="py-10 px-6 text-center" style="color: ${v.secColor};">
                    <div class="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-sm text-slate-500">Chưa có sự kiện — thêm ở cột phải</div>
                </div>`;
        }
        return `
                <div class="py-10 px-6 text-center space-y-6 bg-black/[0.02]" style="color: ${v.secColor};">${items.map(block).join('\n')}
                </div>`;
    },
    renderInspector(sec) {
        const id = escapeHtml(sec.id);
        const items = Array.isArray(sec.data.items) ? sec.data.items.map(eventsNormItem) : [];
        const inp = (i, f, val, ph) => `<input type="text" value="${escapeHtml(val)}" oninput="eventsUpdateItem('${id}',${i},'${f}',this.value,true)" placeholder="${ph}" class="w-full px-2.5 py-1.5 rounded border border-slate-300">`;
        const btnCls = 'px-2 py-1 rounded bg-white text-slate-600 border border-slate-300 text-xs hover:bg-slate-100';
        const group = (it, i) => `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div class="flex items-center gap-1">
                    <div class="font-bold text-violet-700 flex-1">Sự kiện ${i + 1}</div>
                    <button type="button" ${i === 0 ? 'disabled' : ''} onclick="eventsMoveItem('${id}',${i},-1)" class="${btnCls} disabled:opacity-40" title="Lên"><i class="fa-solid fa-arrow-up"></i></button>
                    <button type="button" ${i === items.length - 1 ? 'disabled' : ''} onclick="eventsMoveItem('${id}',${i},1)" class="${btnCls} disabled:opacity-40" title="Xuống"><i class="fa-solid fa-arrow-down"></i></button>
                    <button type="button" onclick="eventsConfirmRemove(this,'${id}',${i})" class="px-2 py-1 rounded bg-red-50 text-red-600 border border-red-200 text-xs hover:bg-red-100"><i class="fa-solid fa-trash"></i> Xoá</button>
                </div>
                ${inp(i, 'title', it.title, 'Tên sự kiện')}
                ${inp(i, 'time', it.time, 'Giờ & Thứ')}
                ${inp(i, 'date', it.date, 'Ngày dương lịch')}
                ${inp(i, 'lunar', it.lunar, 'Ngày âm lịch')}
                ${inp(i, 'venue', it.venue, 'Địa điểm')}
                ${inp(i, 'mapUrl', it.mapUrl, 'Link Google Maps')}
            </div>`;
        const full = items.length >= EVENTS_MAX;
        return items.map(group).join('\n') + `
            <button type="button" ${full ? 'disabled' : ''} onclick="eventsAddItem('${id}')" class="w-full py-2 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-200 transition disabled:opacity-40"><i class="fa-solid fa-plus"></i> Thêm sự kiện (${items.length}/${EVENTS_MAX})</button>`;
    },
    // Chỉ sửa inline trên canvas editor: focusin lưu giá trị gốc, focusout ghi khi đổi
    mount(rootEl, sec, ctx) {
        if (!ctx || ctx.mode !== 'editor' || !rootEl) return undefined;
        const orig = new WeakMap();
        const read = (el) => typeof readEditableText === 'function' ? readEditableText(el) : String(el.textContent || '').trim();
        const target = (e) => {
            const el = e.target && e.target.closest ? e.target.closest('[data-ev-field]') : null;
            return el && rootEl.contains(el) ? el : null;
        };
        const onIn = (e) => {
            const el = target(e);
            if (el) orig.set(el, read(el));
        };
        const onOut = (e) => {
            const el = target(e);
            if (!el) return;
            if (typeof appState !== 'undefined' && appState.isPreviewMode) return;
            const m = /^(\d+)\.([A-Za-z]+)$/.exec(el.getAttribute('data-ev-field') || '');
            if (!m || EVENTS_FIELDS.indexOf(m[2]) < 0) return;
            const value = read(el);
            if (orig.has(el) && orig.get(el) === value) return;
            eventsUpdateItem(sec.id, parseInt(m[1], 10), m[2], value, false);
        };
        rootEl.addEventListener('focusin', onIn);
        rootEl.addEventListener('focusout', onOut);
        return () => {
            rootEl.removeEventListener('focusin', onIn);
            rootEl.removeEventListener('focusout', onOut);
        };
    },
    migrate(data) {
        const legacy = Object.keys(data).some(k => /^event[12](Title|Time|Date|Lunar|Venue|MapUrl)$/.test(k));
        const cap = { Title: 'title', Time: 'time', Date: 'date', Lunar: 'lunar', Venue: 'venue', MapUrl: 'mapUrl' };
        // items là mặc định do migrate toàn cục vừa điền (hoặc không phải mảng) thì khoá cũ có ưu tiên;
        // items đã tuỳ chỉnh thì giữ nguyên, chỉ xoá khoá cũ
        const isDefaultItems = Array.isArray(data.items) &&
            JSON.stringify(data.items.map(eventsNormItem)) === JSON.stringify(eventsDefaultItems());
        if (!Array.isArray(data.items) || (legacy && isDefaultItems)) {
            const items = [];
            [1, 2].forEach(n => {
                const it = {};
                Object.keys(cap).forEach(k => {
                    const v = data['event' + n + k];
                    it[cap[k]] = typeof v === 'string' ? v : (v == null ? '' : String(v));
                });
                if (EVENTS_FIELDS.some(f => it[f] !== '')) items.push(it);
            });
            data.items = items;
        }
        Object.keys(data).forEach(k => { if (/^event[12]/.test(k)) delete data[k]; });
        data.items = data.items.slice(0, EVENTS_MAX).map(eventsNormItem);
        return data;
    }
});
