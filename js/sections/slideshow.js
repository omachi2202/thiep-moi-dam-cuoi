// Section: Trình chiếu ảnh (slideshow)
(function () {
    const SS_MAX_PHOTOS = 12;
    const SS_EFFECTS = [['fade', 'Mờ dần'], ['slide', 'Trượt ngang']];
    const SS_RATIOS = [['3/4', 'Dọc 3:4'], ['1/1', 'Vuông 1:1'], ['4/3', 'Ngang 4:3']];
    const SS_FALLBACK = 'https://placehold.co/600x800/e2d9d0/5c4938?text=Wedding+Photo';

    function ssInterval(v) {
        let n = Math.round(Number(v));
        if (!isFinite(n)) n = 4;
        return Math.min(10, Math.max(2, n));
    }
    function ssPick(v, list, def) {
        return list.some(x => x[0] === v) ? v : def;
    }

    // Thêm / xoá ảnh: tạo mảng mới rồi đi qua updateSectionField (commitState)
    function slideshowAddPhoto(secId) {
        const sec = appState.sections.find(s => s.id === secId);
        if (!sec || !sec.data) return;
        const cur = Array.isArray(sec.data.photos) ? sec.data.photos : [];
        if (cur.length >= SS_MAX_PHOTOS) {
            if (typeof showToast === 'function') showToast('Tối đa ' + SS_MAX_PHOTOS + ' ảnh.');
            return;
        }
        updateSectionField(secId, 'photos', cur.concat(['']), false);
    }
    function slideshowRemovePhoto(secId, idx) {
        const sec = appState.sections.find(s => s.id === secId);
        if (!sec || !sec.data || !Array.isArray(sec.data.photos)) return;
        updateSectionField(secId, 'photos', sec.data.photos.filter((_, i) => i !== idx), false);
    }
    window.slideshowAddPhoto = slideshowAddPhoto;
    window.slideshowRemovePhoto = slideshowRemovePhoto;

    registerSection({
        type: 'slideshow',
        label: 'Trình chiếu ảnh',
        icon: 'fa-film',
        defaults: () => ({
            title: 'KHOẢNH KHẮC',
            subtitle: 'OUR MOMENTS',
            photos: [
                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80'
            ],
            interval: 4,
            effect: 'fade',
            ratio: '3/4',
            showDots: true
        }),
        migrate(data) {
            if (!Array.isArray(data.photos)) data.photos = [];
            data.photos = data.photos.map(p => (typeof p === 'string' ? p : '')).slice(0, SS_MAX_PHOTOS);
            data.interval = ssInterval(data.interval);
            data.effect = ssPick(data.effect, SS_EFFECTS, 'fade');
            data.ratio = ssPick(data.ratio, SS_RATIOS, '3/4');
            data.showDots = data.showDots !== false;
            if (typeof data.title !== 'string') data.title = 'KHOẢNH KHẮC';
            if (typeof data.subtitle !== 'string') data.subtitle = 'OUR MOMENTS';
            return data;
        },
        renderCanvas(sec, ctx) {
            const v = sectionVars(sec, ctx);
            const d = sec.data;
            const photos = (Array.isArray(d.photos) ? d.photos : []).filter(p => typeof p === 'string' && p);
            const effect = ssPick(d.effect, SS_EFFECTS, 'fade');
            const ratio = ssPick(d.ratio, SS_RATIOS, '3/4');
            const n = photos.length;
            const img = (url, idx) => `<img src="${escapeHtml(safeUrl(url))}" alt="Ảnh ${idx + 1}" loading="${idx === 0 ? 'eager' : 'lazy'}" decoding="async" class="w-full h-full object-cover" draggable="false" onerror="this.onerror=null;this.src='${SS_FALLBACK}'">`;

            let stage;
            if (!n) {
                stage = `<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100/70 text-slate-400 text-xs">
                            <i class="fa-regular fa-images text-3xl"></i><span>Chưa có ảnh nào</span></div>`;
            } else if (effect === 'slide') {
                stage = `<div class="ss-track absolute inset-0 flex" style="transition: transform 0.6s ease;">
                            ${photos.map((u, i) => `<div class="ss-slide flex-none w-full h-full" style="flex: 0 0 100%;">${img(u, i)}</div>`).join('')}
                         </div>`;
            } else {
                stage = photos.map((u, i) => `<div class="ss-slide absolute inset-0" style="opacity: ${i === 0 ? 1 : 0}; transition: opacity 0.8s ease;">${img(u, i)}</div>`).join('');
            }

            const navBtn = (dir, icon, label) => `<button type="button" data-ss-${dir} aria-label="${label}" class="absolute top-1/2 -translate-y-1/2 ${dir === 'prev' ? 'left-1' : 'right-1'} w-11 h-11 flex items-center justify-center rounded-full bg-black/35 text-white hover:bg-black/55"><i class="fa-solid ${icon}"></i></button>`;
            const nav = n > 1 ? navBtn('prev', 'fa-chevron-left', 'Ảnh trước') + navBtn('next', 'fa-chevron-right', 'Ảnh sau') : '';
            const dots = (n > 1 && d.showDots !== false)
                ? `<div class="flex justify-center items-center gap-1 pt-1">${photos.map((_, i) => `<button type="button" data-ss-dot="${i}" aria-label="Ảnh ${i + 1}" class="w-6 h-6 flex items-center justify-center"><span class="ss-dot block w-2 h-2 rounded-full" style="background: ${v.pc}; opacity: ${i === 0 ? 1 : 0.3};"></span></button>`).join('')}</div>`
                : '';

            return `
                <div class="py-10 px-6 text-center space-y-5" style="color: ${v.secColor};" data-slideshow="${escapeHtml(sec.id)}" data-ss-effect="${escapeHtml(effect)}" data-ss-interval="${ssInterval(d.interval)}">
                    <div class="space-y-1">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>
                        <p class="text-xs tracking-[0.22em] uppercase opacity-80" ${fieldAttr(ctx, 'subtitle')}>${escapeHtml(d.subtitle)}</p>
                    </div>
                    <div class="ss-viewport relative overflow-hidden rounded-xl shadow-sm border border-white bg-slate-100" style="aspect-ratio: ${ratio}; touch-action: pan-y;">
                        ${stage}
                        ${nav}
                    </div>
                    ${dots}
                </div>`;
        },
        renderInspector(sec) {
            const d = sec.data;
            const id = escapeHtml(sec.id);
            const photos = Array.isArray(d.photos) ? d.photos : [];
            const rows = photos.map((url, i) => `
                <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-bold text-slate-400 w-4">#${i + 1}</span>
                    <input type="text" value="${escapeHtml(url)}" oninput="updateAlbumPhoto('${id}', ${i}, this.value)" class="flex-1 min-w-0 px-2 py-1.5 rounded border border-slate-300 text-[11px]">
                    <label class="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-600" title="Tải ảnh lên">
                        <i class="fa-solid fa-upload"></i>
                        <input type="file" accept="image/*" class="hidden" onchange="handleAlbumFileUpload(event, ${i}, '${id}')">
                    </label>
                    <button type="button" onclick="slideshowRemovePhoto('${id}', ${i})" class="px-2 py-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500" title="Xoá ảnh"><i class="fa-solid fa-trash"></i></button>
                </div>`).join('');
            const opts = (list, cur) => list.map(x => `<option value="${escapeHtml(x[0])}" ${x[0] === cur ? 'selected' : ''}>${escapeHtml(x[1])}</option>`).join('');
            const intervalOpts = [2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<option value="${n}" ${n === ssInterval(d.interval) ? 'selected' : ''}>${n} giây</option>`).join('');
            const sel = 'w-full px-2 py-1.5 rounded-lg border border-slate-300';

            return `
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Tiêu đề</label>
                    <input type="text" value="${escapeHtml(d.title)}" oninput="updateSectionField('${id}','title',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Phụ đề</label>
                    <input type="text" value="${escapeHtml(d.subtitle)}" oninput="updateSectionField('${id}','subtitle',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1.5">Ảnh trình chiếu (${photos.length}/${SS_MAX_PHOTOS})</label>
                    <div class="space-y-2">${rows}</div>
                    <button type="button" onclick="slideshowAddPhoto('${id}')" ${photos.length >= SS_MAX_PHOTOS ? 'disabled' : ''} class="mt-2 w-full px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"><i class="fa-solid fa-plus mr-1"></i>Thêm ảnh</button>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Hiệu ứng</label>
                        <select onchange="updateSectionField('${id}','effect',this.value,false)" class="${sel}">${opts(SS_EFFECTS, d.effect)}</select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Tỉ lệ khung</label>
                        <select onchange="updateSectionField('${id}','ratio',this.value,false)" class="${sel}">${opts(SS_RATIOS, d.ratio)}</select>
                    </div>
                    <div>
                        <label class="block font-semibold text-slate-700 mb-1">Tự chuyển sau</label>
                        <select onchange="updateSectionField('${id}','interval',Number(this.value),false)" class="${sel}">${intervalOpts}</select>
                    </div>
                    <label class="flex items-center gap-2 mt-6 font-semibold text-slate-700">
                        <input type="checkbox" ${d.showDots !== false ? 'checked' : ''} onchange="updateSectionField('${id}','showDots',this.checked,false)">
                        Hiện chấm chỉ số
                    </label>
                </div>
            `;
        },
        mount(root, sec, ctx) {
            if (!root) return;
            let el = null;
            root.querySelectorAll('[data-slideshow]').forEach(e => {
                if (e.getAttribute('data-slideshow') === sec.id) el = e;
            });
            if (!el) return;
            const slides = Array.prototype.slice.call(el.querySelectorAll('.ss-slide'));
            const n = slides.length;
            if (!n) return;
            const track = el.querySelector('.ss-track');
            const dots = Array.prototype.slice.call(el.querySelectorAll('.ss-dot'));
            const viewport = el.querySelector('.ss-viewport');
            const secs = ssInterval(sec.data && sec.data.interval) * 1000;
            const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            let idx = 0;
            let timer = null;

            if (reduce) {
                // Giảm chuyển động: đổi ảnh tức thì, không hiệu ứng
                if (track) track.style.transition = 'none';
                slides.forEach(s => { s.style.transition = 'none'; });
            }

            function show(i) {
                idx = ((i % n) + n) % n;
                if (track) track.style.transform = 'translateX(' + (-idx * 100) + '%)';
                else slides.forEach((s, k) => { s.style.opacity = k === idx ? '1' : '0'; });
                dots.forEach((dt, k) => { dt.style.opacity = k === idx ? '1' : '0.3'; });
            }
            function stop() { if (timer) { clearInterval(timer); timer = null; } }
            function start() {
                stop();
                if (ctx && ctx.mode === 'editor') return;   // editor: không tự chạy
                if (n < 2 || document.hidden) return;
                timer = setInterval(function () { show(idx + 1); }, secs);
            }
            function go(i) { show(i); start(); }

            const listeners = [];
            function on(target, type, fn, opts) {
                target.addEventListener(type, fn, opts);
                listeners.push(function () { target.removeEventListener(type, fn, opts); });
            }

            const prev = el.querySelector('[data-ss-prev]');
            const next = el.querySelector('[data-ss-next]');
            if (prev) on(prev, 'click', function () { go(idx - 1); });
            if (next) on(next, 'click', function () { go(idx + 1); });
            el.querySelectorAll('[data-ss-dot]').forEach(b => {
                on(b, 'click', function () { go(Number(b.getAttribute('data-ss-dot')) || 0); });
            });

            // Vuốt ngang (ngưỡng 40px)
            if (viewport && n > 1) {
                let startX = null;
                on(viewport, 'pointerdown', function (e) {
                    // Bắt đầu trên nút trước/sau hoặc chấm: không coi là vuốt
                    if (e.target && e.target.closest && e.target.closest('[data-ss-prev],[data-ss-next],[data-ss-dot]')) {
                        startX = null;
                        return;
                    }
                    startX = e.clientX;
                    try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ }
                });
                on(viewport, 'pointerup', function (e) {
                    if (startX === null) return;
                    const dx = e.clientX - startX;
                    startX = null;
                    if (Math.abs(dx) >= 40) go(dx < 0 ? idx + 1 : idx - 1);
                });
                on(viewport, 'pointercancel', function () { startX = null; });
                on(viewport, 'lostpointercapture', function () { startX = null; });
            }

            // Tạm dừng khi tab ẩn
            on(document, 'visibilitychange', function () {
                if (document.hidden) stop(); else start();
            });

            start();

            return function () {
                stop();
                listeners.forEach(fn => fn());
                listeners.length = 0;
            };
        }
    });
})();
