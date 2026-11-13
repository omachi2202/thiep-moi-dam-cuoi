// Section: Xác nhận tham dự & hộp mừng cưới
registerSection({
    type: 'rsvp',
    label: 'Xác nhận tham dự & Mừng cưới',
    icon: 'fa-envelope-open-text',
    defaults: () => ({
        rsvpIntro: 'Hãy xác nhận sự có mặt của bạn để chúng mình chuẩn bị đón tiếp một cách chu đáo nhất. Trân trọng!',
        groomBtnText: 'GỬI MỪNG CƯỚI NHÀ TRAI',
        brideBtnText: 'GỬI MỪNG CƯỚI NHÀ GÁI',
        nameLabel: 'Tên của bạn *',
        phoneLabel: 'Số điện thoại (không bắt buộc)',
        attendLabel: 'Bạn sẽ tham dự chứ?',
        sideLabel: 'Khách của',
        countLabel: 'Số người tham dự',
        noteLabel: 'Lời chúc gửi tới cô dâu & chú rể',
        submitText: 'GỬI XÁC NHẬN & LỜI CHÚC'
    }),
    // Bổ sung trường mới, không ghi đè giá trị đã có
    migrate(data) {
        const def = this.defaults();
        const out = (data && typeof data === 'object') ? data : {};
        Object.keys(def).forEach(k => {
            if (out[k] === undefined || out[k] === null) out[k] = def[k];
        });
        return out;
    },
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = Object.assign({}, this.defaults(), sec.data || {});
        const cls = 'w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none';
        return `
                <div class="py-10 px-6 text-center space-y-5 bg-black/[0.02]" style="color: ${v.secColor};">
                    <h3 class="font-bold uppercase tracking-wider" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};">Xác Nhận Tham Dự</h3>
                    <p class="text-xs leading-relaxed opacity-85" ${fieldAttr(ctx, 'rsvpIntro')}>${escapeHtml(d.rsvpIntro)}</p>

                    <!-- Form RSVP -->
                    <form data-rsvp-form class="bg-white p-5 rounded-2xl shadow-sm border border-amber-900/10 space-y-3 text-left text-xs">
                        <div>
                            <label class="block font-semibold mb-1 opacity-80" ${fieldAttr(ctx, 'nameLabel')}>${escapeHtml(d.nameLabel)}</label>
                            <input type="text" name="ten" required maxlength="80" placeholder="Nhập họ và tên..." class="${cls}">
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 opacity-80" ${fieldAttr(ctx, 'phoneLabel')}>${escapeHtml(d.phoneLabel)}</label>
                            <input type="tel" name="sdt" maxlength="20" placeholder="09xx xxx xxx" class="${cls}">
                        </div>
                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="block font-semibold mb-1 opacity-80" ${fieldAttr(ctx, 'attendLabel')}>${escapeHtml(d.attendLabel)}</label>
                                <select name="tham_du" class="${cls}">
                                    <option value="co">Có, mình sẽ đến</option>
                                    <option value="khong">Rất tiếc, không thể</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-semibold mb-1 opacity-80" ${fieldAttr(ctx, 'sideLabel')}>${escapeHtml(d.sideLabel)}</label>
                                <select name="ben" class="${cls}">
                                    <option value="nha_trai">Nhà Trai</option>
                                    <option value="nha_gai">Nhà Gái</option>
                                    <option value="">Khác</option>
                                </select>
                            </div>
                        </div>
                        <div data-rsvp-count>
                            <label class="block font-semibold mb-1 opacity-80" ${fieldAttr(ctx, 'countLabel')}>${escapeHtml(d.countLabel)}</label>
                            <input type="number" name="so_nguoi" min="1" max="20" step="1" value="1" class="${cls}">
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 opacity-80" ${fieldAttr(ctx, 'noteLabel')}>${escapeHtml(d.noteLabel)}</label>
                            <textarea name="loi_nhan" rows="2" maxlength="500" placeholder="Chúc hai bạn trăm năm hạnh phúc..." class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"></textarea>
                        </div>
                        <button type="submit" data-rsvp-submit class="w-full py-3 rounded-xl font-bold text-white shadow transition hover:opacity-95 text-center" style="background-color: ${v.pc};">
                            <span ${fieldAttr(ctx, 'submitText')}>${escapeHtml(d.submitText)}</span>
                        </button>
                    </form>

                    <!-- 2 Nút Gửi Mừng Cưới Nhà Trai / Nhà Gái -->
                    <div class="pt-2 space-y-2.5">
                        <button type="button" onclick="openGiftModal('groom'); event.stopPropagation();" class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow flex items-center justify-center gap-2 transition transform hover:scale-[1.01]" style="background-color: ${v.pc};">
                            <i class="fa-solid fa-gift"></i>
                            <span ${fieldAttr(ctx, 'groomBtnText')}>${escapeHtml(d.groomBtnText)}</span>
                        </button>
                        <button type="button" onclick="openGiftModal('bride'); event.stopPropagation();" class="w-full py-3 px-4 rounded-xl font-bold text-xs border-2 bg-white shadow-sm flex items-center justify-center gap-2 transition transform hover:scale-[1.01]" style="border-color: ${v.pc}; color: ${v.pc};">
                            <i class="fa-solid fa-heart"></i>
                            <span ${fieldAttr(ctx, 'brideBtnText')}>${escapeHtml(d.brideBtnText)}</span>
                        </button>
                    </div>
                </div>`;
    },
    mount(rootEl, sec, ctx) {
        const form = rootEl.querySelector('[data-rsvp-form]');
        if (!form) return undefined;
        const btn = form.querySelector('[data-rsvp-submit]');
        const btnLabel = btn ? btn.innerHTML : '';
        const attend = form.elements.tham_du;
        const countWrap = form.querySelector('[data-rsvp-count]');
        const slug = ctx && ctx.slug;
        const storeKey = 'thiep:rsvp:' + slug;
        const toast = (m) => { if (typeof window.showToast === 'function') window.showToast(m); };
        const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
        const lsSet = (k, val) => { try { localStorage.setItem(k, val); } catch (e) { /* bỏ qua */ } };

        if (ctx && ctx.guestName && form.elements.ten && !form.elements.ten.value) {
            form.elements.ten.value = String(ctx.guestName).slice(0, 80);
        }

        const markSent = () => {
            if (!btn) return;
            btn.disabled = true;
            btn.classList.add('opacity-60', 'cursor-not-allowed');
            btn.textContent = 'ĐÃ GỬI XÁC NHẬN';
        };
        if (slug && lsGet(storeKey)) markSent();

        const syncCount = () => {
            if (countWrap && attend) countWrap.classList.toggle('hidden', attend.value === 'khong');
        };
        syncCount();
        if (attend) attend.addEventListener('change', syncCount);

        const onSubmit = async (e) => {
            e.preventDefault();
            if (btn && btn.disabled) return;
            const ten = String(form.elements.ten.value || '').trim().slice(0, 80);
            if (!ten) { toast('Vui lòng nhập tên của bạn.'); return; }
            const thamDu = !attend || attend.value !== 'khong';
            let soNguoi = parseInt(form.elements.so_nguoi.value, 10);
            if (!isFinite(soNguoi)) soNguoi = 1;
            soNguoi = Math.min(20, Math.max(1, soNguoi));
            const ben = form.elements.ben.value;
            const body = {
                ten: ten,
                sdt: String(form.elements.sdt.value || '').trim().slice(0, 20),
                so_nguoi: thamDu ? soNguoi : 1,
                tham_du: thamDu,
                ben: (ben === 'nha_trai' || ben === 'nha_gai') ? ben : '',
                loi_nhan: String(form.elements.loi_nhan.value || '').trim().slice(0, 500)
            };

            if (!(slug && window.api && window.api.available)) {
                toast('Cảm ơn bạn đã gửi lời chúc & xác nhận tham dự!');
                return;
            }
            if (btn) { btn.disabled = true; btn.classList.add('opacity-60'); }
            try {
                await window.api.postRsvp(slug, body);
                lsSet(storeKey, '1');
                toast('Cảm ơn bạn đã gửi lời chúc & xác nhận tham dự!');
                markSent();
            } catch (err) {
                toast((err && err.message) || 'Gửi xác nhận thất bại, vui lòng thử lại.');
                if (btn) { btn.disabled = false; btn.classList.remove('opacity-60'); btn.innerHTML = btnLabel; }
            }
        };
        form.addEventListener('submit', onSubmit);
        return () => {
            form.removeEventListener('submit', onSubmit);
            if (attend) attend.removeEventListener('change', syncCount);
        };
    },
    renderInspector(sec) {
        const d = Object.assign({}, this.defaults(), sec.data || {});
        const id = escapeHtml(sec.id);
        const inp = (key, label) => `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">${label}</label>
                <input type="text" value="${escapeHtml(d[key])}" oninput="updateSectionField('${id}','${key}',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>`;
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Lời nhắn xác nhận tham dự</label>
                <textarea rows="3" oninput="updateSectionField('${id}','rsvpIntro',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.rsvpIntro)}</textarea>
            </div>
            ${inp('groomBtnText', 'Chữ trên nút QR Nhà Trai')}
            ${inp('brideBtnText', 'Chữ trên nút QR Nhà Gái')}
            ${inp('nameLabel', 'Nhãn ô tên')}
            ${inp('phoneLabel', 'Nhãn ô số điện thoại')}
            ${inp('attendLabel', 'Nhãn ô tham dự')}
            ${inp('sideLabel', 'Nhãn ô bên nhà')}
            ${inp('countLabel', 'Nhãn ô số người')}
            ${inp('noteLabel', 'Nhãn ô lời chúc')}
            ${inp('submitText', 'Chữ trên nút gửi')}
        `;
    }
});
