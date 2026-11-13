// Section: Tường lời chúc (khách gửi lời chúc, hiển thị công khai)
registerSection({
    type: 'wishes',
    label: 'Lời chúc',
    icon: 'fa-comments',
    defaults: () => ({
        title: 'Sổ Lưu Bút',
        intro: 'Gửi đến chúng mình đôi lời chúc mừng nhé!'
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        return `
                <div class="py-10 px-6 text-center space-y-5" style="color: ${v.secColor};">
                    <h3 class="font-bold uppercase tracking-wider" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>
                    <p class="text-xs leading-relaxed opacity-85" ${fieldAttr(ctx, 'intro')}>${escapeHtml(d.intro)}</p>
                    <form data-role="wish-form" class="bg-white p-5 rounded-2xl shadow-sm border border-amber-900/10 space-y-3 text-left text-xs">
                        <div>
                            <label class="block font-semibold mb-1 opacity-80">Tên của bạn *</label>
                            <input type="text" data-role="wish-name" maxlength="80" placeholder="Nhập họ và tên..." class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none">
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 opacity-80">Lời chúc *</label>
                            <textarea data-role="wish-text" rows="3" maxlength="500" placeholder="Chúc hai bạn trăm năm hạnh phúc..." class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"></textarea>
                        </div>
                        <button type="submit" data-role="wish-submit" class="w-full py-3 rounded-xl font-bold text-white shadow transition hover:opacity-95 text-center" style="background-color: ${v.pc};">
                            GỬI LỜI CHÚC
                        </button>
                    </form>
                    <div data-role="wish-wall" class="space-y-2.5 text-left text-xs max-h-80 overflow-y-auto"></div>
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
                <label class="block font-semibold text-slate-700 mb-1">Lời dẫn</label>
                <textarea rows="2" oninput="updateSectionField('${id}','intro',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.intro)}</textarea>
            </div>
        `;
    },
    mount(root, sec, ctx) {
        const form = root.querySelector('[data-role="wish-form"]');
        const nameEl = root.querySelector('[data-role="wish-name"]');
        const textEl = root.querySelector('[data-role="wish-text"]');
        const btn = root.querySelector('[data-role="wish-submit"]');
        const wall = root.querySelector('[data-role="wish-wall"]');
        if (!form || !nameEl || !textEl || !btn || !wall) return;

        const slug = ctx && ctx.slug;
        const live = !!(slug && ctx.mode !== 'editor' && window.api && window.api.available);
        const KEY = 'thiep:wished:' + slug;
        let disposed = false;

        const toast = (m) => { if (typeof window.showToast === 'function') window.showToast(m); };
        const lsGet = (k) => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
        const lsSet = (k, val) => { try { localStorage.setItem(k, val); } catch (e) { /* bỏ qua */ } };

        // Dựng 1 thẻ lời chúc bằng textContent (không innerHTML)
        function addItem(name, text, atTop) {
            const box = document.createElement('div');
            box.className = 'bg-white rounded-xl border border-amber-900/10 p-3 shadow-sm';
            const n = document.createElement('div');
            n.className = 'font-bold mb-1';
            n.textContent = String(name || '');
            const t = document.createElement('div');
            t.className = 'opacity-85 whitespace-pre-line break-words';
            t.textContent = String(text || '');
            box.appendChild(n);
            box.appendChild(t);
            if (atTop && wall.firstChild) wall.insertBefore(box, wall.firstChild);
            else wall.appendChild(box);
        }
        function setNote(msg) {
            wall.textContent = '';
            const p = document.createElement('p');
            p.className = 'text-center opacity-70';
            p.textContent = msg;
            wall.appendChild(p);
        }

        if (ctx && ctx.guestName && !nameEl.value) nameEl.value = String(ctx.guestName).slice(0, 80);

        if (!live) {
            [
                ['Minh Anh', 'Chúc hai bạn trăm năm hạnh phúc, sớm có tin vui nhé!'],
                ['Gia đình bác Hùng', 'Chúc mừng hai cháu, mãi mãi yêu thương nhau.'],
                ['Thu Hà', 'Chúc mừng đám cưới! Hạnh phúc ngập tràn nha cặp đôi.']
            ].forEach(w => addItem(w[0], w[1], false));
            const onSample = (e) => {
                e.preventDefault();
                toast('Chỉ hoạt động trên thiệp đã xuất bản');
            };
            form.addEventListener('submit', onSample);
            return () => form.removeEventListener('submit', onSample);
        }

        const already = () => lsGet(KEY) === '1';
        if (already()) {
            btn.disabled = true;
            btn.classList.add('opacity-60');
            btn.textContent = 'ĐÃ GỬI LỜI CHÚC';
        }

        setNote('Đang tải lời chúc...');
        window.api.getWishes(slug).then(res => {
            if (disposed) return;
            const list = Array.isArray(res) ? res : (res && Array.isArray(res.items) ? res.items : []);
            wall.textContent = '';
            if (!list.length) { setNote('Hãy là người đầu tiên gửi lời chúc!'); return; }
            list.forEach(w => addItem(w && w.ten, w && w.loi_chuc, false));
        }).catch(err => {
            if (disposed) return;
            setNote((err && err.message) || 'Không tải được lời chúc.');
        });

        let busy = false;
        const onSubmit = async (e) => {
            e.preventDefault();
            if (busy) return;
            const ten = nameEl.value.trim();
            const loi = textEl.value.trim();
            if (!ten) { toast('Vui lòng nhập tên của bạn'); return; }
            if (ten.length > 80) { toast('Tên tối đa 80 ký tự'); return; }
            if (!loi) { toast('Vui lòng nhập lời chúc'); return; }
            if (loi.length > 500) { toast('Lời chúc tối đa 500 ký tự'); return; }
            busy = true;
            btn.disabled = true;
            btn.classList.add('opacity-60');
            try {
                await window.api.postWish(slug, { ten: ten, loi_chuc: loi });
                lsSet(KEY, '1');
                if (!disposed) {
                    if (wall.querySelector('p')) wall.textContent = '';
                    addItem(ten, loi, true);
                    textEl.value = '';
                    btn.textContent = 'ĐÃ GỬI LỜI CHÚC';
                }
                toast('Cảm ơn bạn đã gửi lời chúc!');
            } catch (err) {
                toast((err && err.message) || 'Gửi lời chúc thất bại, vui lòng thử lại.');
                if (!disposed) {
                    btn.disabled = false;
                    btn.classList.remove('opacity-60');
                }
            } finally {
                busy = false;
            }
        };
        form.addEventListener('submit', onSubmit);
        return () => { disposed = true; form.removeEventListener('submit', onSubmit); };
    }
});
