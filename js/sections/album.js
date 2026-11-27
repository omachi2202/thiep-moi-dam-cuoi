// Section: Album ảnh & lời cảm ơn
const ALBUM_LAYOUTS = [['grid', 'Lưới'], ['masonry', 'So le'], ['feature', '1 ảnh lớn + lưới nhỏ']];
registerSection({
    type: 'album',
    label: 'Album ảnh & Lời cảm ơn',
    icon: 'fa-images',
    defaults: () => ({
        albumTitle: 'OUR ALBUM',
        albumSubtitle: 'CAPTURED WITH LOVE',
        photos: [
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
            'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'
        ],
        thankYouText: 'Sự hiện diện của Quý khách là niềm vinh hạnh đối với gia đình chúng tôi. Xin chân thành cảm ơn!',
        footerCredit: 'HIME WEDDING INVITATION',
        layout: 'grid'
    }),
    migrate(data) {
        if (!Array.isArray(data.photos)) data.photos = [];
        if (!ALBUM_LAYOUTS.some(l => l[0] === data.layout)) data.layout = 'grid';
        return data;
    },
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        const photos = Array.isArray(d.photos) ? d.photos : [];
        const layout = ALBUM_LAYOUTS.some(l => l[0] === d.layout) ? d.layout : 'grid';
        const zoom = ctx && ctx.mode !== 'editor';
        const fb = "this.onerror=null;this.src='https://placehold.co/400x500/e2d9d0/5c4938?text=Wedding+Photo'";
        const tile = (url, idx, wrapCls, imgCls) => `
                    <div class="${wrapCls}" data-album-idx="${idx}"${zoom ? ` style="cursor: zoom-in;" tabindex="0" role="button" aria-label="Xem ảnh ${idx + 1} phóng to"` : ''}>
                        <img src="${escapeHtml(safeUrl(url))}" alt="Album ${idx + 1}" loading="lazy" decoding="async" class="${imgCls}" onerror="${fb}">
                    </div>
                `;
        let photosGrid;
        let gridAttr;
        if (layout === 'masonry') {
            gridAttr = 'class="text-left" style="columns: 2; column-gap: 10px;"';
            photosGrid = photos.map((url, i) => tile(url, i, 'overflow-hidden rounded-xl shadow-sm border border-white bg-slate-100 group mb-2.5 break-inside-avoid', 'w-full h-auto block transition duration-500 group-hover:scale-105')).join('');
        } else if (layout === 'feature') {
            gridAttr = 'class="grid grid-cols-3 gap-2.5"';
            photosGrid = photos.map((url, i) => i === 0
                ? tile(url, i, 'col-span-3 overflow-hidden rounded-xl shadow-sm border border-white aspect-[4/3] bg-slate-100 group', 'w-full h-full object-cover transition duration-500 group-hover:scale-105')
                : tile(url, i, 'overflow-hidden rounded-lg shadow-sm border border-white aspect-square bg-slate-100 group', 'w-full h-full object-cover transition duration-500 group-hover:scale-105')).join('');
        } else {
            gridAttr = 'class="grid grid-cols-2 gap-2.5"';
            photosGrid = photos.map((url, i) => tile(url, i, 'overflow-hidden rounded-xl shadow-sm border border-white aspect-[3/4] bg-slate-100 group', 'w-full h-full object-cover transition duration-500 group-hover:scale-105')).join('');
        }
        return `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${v.secColor};" data-album="${escapeHtml(sec.id)}">
                    <div class="space-y-1">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'albumTitle')}>${escapeHtml(d.albumTitle)}</h3>
                        <p class="text-xs tracking-[0.22em] uppercase opacity-80" ${fieldAttr(ctx, 'albumSubtitle')}>${escapeHtml(d.albumSubtitle)}</p>
                    </div>

                    <!-- Lưới 6 ảnh cưới -->
                    <div ${gridAttr}>
                        ${photosGrid}
                    </div>

                    <!-- Lời cảm ơn -->
                    <div class="pt-6 border-t border-amber-900/15 space-y-2">
                        <h4 class="text-3xl font-bold" style="font-family: ${v.globalScriptFont}; color: ${v.pc};">Thank you!</h4>
                        <p class="text-xs leading-relaxed px-2 opacity-85" ${fieldAttr(ctx, 'thankYouText')}>${escapeHtml(d.thankYouText)}</p>
                    </div>

                    <!-- Footer Credit -->
                    <div class="pt-4 text-[11px] tracking-[0.2em] uppercase opacity-60" ${fieldAttr(ctx, 'footerCredit')}>
                        ${escapeHtml(d.footerCredit)}
                    </div>
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        const photoInputs = (Array.isArray(d.photos) ? d.photos : []).map((url, i) => `
            <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold text-slate-400 w-4">#${i + 1}</span>
                <input type="text" value="${escapeHtml(url)}" oninput="updateAlbumPhoto('${id}', ${i}, this.value)" class="flex-1 px-2 py-1.5 rounded border border-slate-300 text-[11px]">
                <label class="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-600" title="Tải ảnh lên">
                    <i class="fa-solid fa-upload"></i>
                    <input type="file" accept="image/*" class="hidden" onchange="handleAlbumFileUpload(event, ${i}, '${id}')">
                </label>
            </div>
        `).join('');

        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Bố cục ảnh</label>
                <select onchange="updateSectionField('${id}','layout',this.value,false)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                    ${ALBUM_LAYOUTS.map(l => `<option value="${escapeHtml(l[0])}" ${l[0] === d.layout ? 'selected' : ''}>${escapeHtml(l[1])}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1.5">Danh sách 6 ảnh trong Album</label>
                <div class="space-y-2">${photoInputs}</div>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Lời cảm ơn cuối thiệp</label>
                <textarea rows="2" oninput="updateSectionField('${id}','thankYouText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.thankYouText)}</textarea>
            </div>
        `;
    },
    mount(root, sec, ctx) {
        if (!root || !ctx || ctx.mode === 'editor') return;
        let el = null;
        root.querySelectorAll('[data-album]').forEach(e => {
            if (e.getAttribute('data-album') === sec.id) el = e;
        });
        if (!el) return;
        // Danh sách xem: bỏ URL rỗng nhưng giữ ánh xạ chỉ số gốc (orig)
        const items = [];
        (Array.isArray(sec.data && sec.data.photos) ? sec.data.photos : []).forEach((u, k) => {
            const s = safeUrl(u);
            if (s) items.push({ orig: k, url: s });
        });
        if (!items.length) return;
        const urls = items.map(it => it.url);
        const isPreview = ctx.mode === 'preview';

        let overlay = null;
        let idx = 0;
        let lockEl = null;
        let prevOverflow = '';
        let frameEl = null;
        let prevFramePos = null;
        let opener = null;
        const listeners = [];
        function on(target, type, fn) {
            target.addEventListener(type, fn);
            listeners.push(function () { target.removeEventListener(type, fn); });
        }
        function host() {
            if (ctx.mode === 'preview') return root.closest('#weddingCardFrame') || root;
            return document.body;
        }
        function show(i) {
            idx = ((i % urls.length) + urls.length) % urls.length;
            const im = overlay.querySelector('img');
            im.src = urls[idx];
            overlay.querySelector('[data-lb-count]').textContent = (idx + 1) + ' / ' + urls.length;
        }
        function btn(label, html, pos) {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', label);
            b.innerHTML = html;
            b.style.cssText = 'position:absolute;width:48px;height:48px;border:0;border-radius:50%;background:rgba(255,255,255,0.18);color:#fff;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;' + pos;
            return b;
        }
        function scrollParent(node) {
            let p = node && node.parentElement;
            while (p && p !== document.body && p !== document.documentElement) {
                const oy = getComputedStyle(p).overflowY;
                if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p;
                p = p.parentElement;
            }
            return null;
        }
        function close() {
            if (!overlay) return;
            document.removeEventListener('keydown', onKey);
            overlay.remove();
            overlay = null;
            if (lockEl) { lockEl.style.overflow = prevOverflow; lockEl = null; }
            if (frameEl && prevFramePos !== null) { frameEl.style.position = prevFramePos; }
            frameEl = null;
            prevFramePos = null;
            if (opener && opener.focus && document.contains(opener)) { try { opener.focus(); } catch (err) { /* bỏ qua */ } }
            opener = null;
        }
        function onKey(e) {
            if (!overlay) return;
            if (e.key === 'Escape') close();
            else if (e.key === 'ArrowLeft') show(idx - 1);
            else if (e.key === 'ArrowRight') show(idx + 1);
            else if (e.key === 'Tab') {
                // Giữ focus trong overlay
                const f = Array.prototype.slice.call(overlay.querySelectorAll('button'));
                if (!f.length) return;
                const first = f[0], last = f[f.length - 1];
                const act = document.activeElement;
                if (!overlay.contains(act)) { e.preventDefault(); first.focus(); }
                else if (e.shiftKey && act === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus(); }
            }
        }
        function open(orig, trigger) {
            if (overlay) return;
            const pos = items.findIndex(it => it.orig === orig);
            if (pos < 0) return;
            opener = trigger || null;
            overlay = document.createElement('div');
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'Xem ảnh phóng to');
            overlay.style.cssText = 'z-index:9999;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;' + (isPreview ? 'position:absolute;left:0;width:100%;' : 'position:fixed;inset:0;');
            const im = document.createElement('img');
            im.alt = 'Ảnh phóng to';
            im.style.cssText = 'max-width:92%;max-height:84%;object-fit:contain;border-radius:8px;';
            im.addEventListener('click', function (e) { e.stopPropagation(); });
            const count = document.createElement('div');
            count.setAttribute('data-lb-count', '');
            count.style.cssText = 'position:absolute;bottom:14px;left:0;right:0;text-align:center;color:#fff;font-size:12px;';
            const closeB = btn('Đóng', '<i class="fa-solid fa-xmark"></i>', 'top:12px;right:12px;');
            closeB.addEventListener('click', function (e) { e.stopPropagation(); close(); });
            overlay.appendChild(im);
            overlay.appendChild(count);
            overlay.appendChild(closeB);
            if (urls.length > 1) {
                const p = btn('Ảnh trước', '<i class="fa-solid fa-chevron-left"></i>', 'left:8px;top:50%;margin-top:-24px;');
                const n = btn('Ảnh sau', '<i class="fa-solid fa-chevron-right"></i>', 'right:8px;top:50%;margin-top:-24px;');
                p.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
                n.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
                overlay.appendChild(p);
                overlay.appendChild(n);
            }
            overlay.addEventListener('click', close);
            const h = host();
            if (isPreview) {
                // Đặt phủ đúng phần khung đang nhìn thấy; khung tạm position:relative
                frameEl = h;
                prevFramePos = h.style.position;
                if (getComputedStyle(h).position === 'static') h.style.position = 'relative';
                const sp = scrollParent(h);
                const fr = h.getBoundingClientRect();
                const topV = sp ? sp.getBoundingClientRect().top : 0;
                const botV = sp ? sp.getBoundingClientRect().bottom : window.innerHeight;
                const top = Math.max(0, topV - fr.top);
                const height = Math.max(200, Math.min(fr.bottom, botV) - Math.max(fr.top, topV));
                overlay.style.top = top + 'px';
                overlay.style.height = height + 'px';
                lockEl = sp;
            } else {
                lockEl = document.body;
            }
            if (lockEl) { prevOverflow = lockEl.style.overflow; lockEl.style.overflow = 'hidden'; }
            h.appendChild(overlay);
            document.addEventListener('keydown', onKey);
            show(pos);
            closeB.focus();
        }

        el.querySelectorAll('[data-album-idx]').forEach(t => {
            const go = function () { open(Number(t.getAttribute('data-album-idx')), t); };
            on(t, 'click', go);
            on(t, 'keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
            });
        });

        return function () {
            close();
            listeners.forEach(fn => fn());
            listeners.length = 0;
        };
    }
});
