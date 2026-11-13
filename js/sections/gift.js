// Section: Mừng cưới (2 thẻ ngân hàng + VietQR)
(function () {
    const BANK_RE = /^[A-Za-z0-9]{2,20}$/;
    const ACC_RE = /^[0-9]{4,25}$/;
    const SIDES = [['groom', 'Nhà Trai'], ['bride', 'Nhà Gái']];

    function cleanInfo(info) {
        const i = info || {};
        return {
            bank: String(i.bank == null ? '' : i.bank).trim(),
            acc: String(i.acc == null ? '' : i.acc).replace(/\s+/g, ''),
            owner: String(i.owner == null ? '' : i.owner).trim()
        };
    }

    function qrUrl(i) {
        if (!BANK_RE.test(i.bank) || !ACC_RE.test(i.acc)) return '';
        return 'https://img.vietqr.io/image/' + i.bank + '-' + i.acc +
            '-compact2.png?accountName=' + encodeURIComponent(i.owner);
    }

    registerSection({
        type: 'gift',
        label: 'Mừng cưới (QR)',
        icon: 'fa-gift',
        defaults: () => ({
            title: 'Gửi Mừng Cưới',
            intro: 'Sự hiện diện của bạn là niềm vui lớn nhất. Nếu muốn gửi quà mừng, bạn có thể dùng thông tin dưới đây.'
        }),
        renderCanvas(sec, ctx) {
            const v = sectionVars(sec, ctx);
            const d = sec.data;
            const bank = (ctx.appState && ctx.appState.bankInfo) || {};
            const cards = SIDES.map(function (s) {
                const i = cleanInfo(bank[s[0]]);
                const url = qrUrl(i);
                return `
                    <div class="bg-white p-4 rounded-2xl shadow-sm border border-amber-900/10 space-y-2" data-gift-side="${s[0]}">
                        <div class="font-bold uppercase text-xs tracking-wider" style="color: ${v.pc};">${s[1]}</div>
                        ${url ? `<img data-role="gift-qr" src="${escapeHtml(url)}" alt="Mã QR ${s[1]}" class="mx-auto w-40 h-40 object-contain" loading="lazy" referrerpolicy="no-referrer">` : ''}
                        <div class="text-xs space-y-0.5">
                            <div class="opacity-80">${escapeHtml(i.bank)}</div>
                            <div class="font-bold text-sm tracking-wider" data-role="gift-acc">${escapeHtml(i.acc)}</div>
                            <div class="opacity-80">${escapeHtml(i.owner)}</div>
                        </div>
                        <button type="button" data-role="gift-copy" data-side="${s[0]}" class="w-full py-2 rounded-xl text-xs font-bold text-white shadow" style="background-color: ${v.pc};">
                            <i class="fa-regular fa-copy"></i> Sao chép STK
                        </button>
                    </div>`;
            }).join('');
            return `
                <div class="py-10 px-6 text-center space-y-4" style="color: ${v.secColor};">
                    <h3 class="font-bold uppercase tracking-wider" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>
                    <p class="text-xs leading-relaxed opacity-85" ${fieldAttr(ctx, 'intro')}>${escapeHtml(d.intro)}</p>
                    <div class="space-y-3">${cards}</div>
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
                    <textarea rows="3" oninput="updateSectionField('${id}','intro',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.intro)}</textarea>
                </div>
                <p class="text-[11px] text-slate-500">Thông tin ngân hàng được chỉnh ở mục Ngân hàng bên trái.</p>
            `;
        },
        mount(root, sec, ctx) {
            const toast = (m) => { if (typeof window.showToast === 'function') window.showToast(m); };
            const bank = (ctx && ctx.appState && ctx.appState.bankInfo) || {};

            const onImgError = (e) => {
                const t = e.target;
                if (t && t.getAttribute && t.getAttribute('data-role') === 'gift-qr') t.style.display = 'none';
            };
            // error không nổi bọt: nghe ở pha capture
            root.addEventListener('error', onImgError, true);
            // Ảnh có thể đã lỗi trước khi gắn listener
            root.querySelectorAll('img[data-role="gift-qr"]').forEach(function (img) {
                if (img.complete && img.naturalWidth === 0) img.style.display = 'none';
            });

            const onClick = (e) => {
                const b = e.target.closest ? e.target.closest('[data-role="gift-copy"]') : null;
                if (!b || !root.contains(b)) return;
                e.stopPropagation();
                const side = b.getAttribute('data-side');
                const acc = cleanInfo(bank[side]).acc;
                if (!acc) { toast('Chưa có số tài khoản'); return; }
                const card = b.closest('[data-gift-side]');
                const accEl = card && card.querySelector('[data-role="gift-acc"]');
                const fallback = () => {
                    if (accEl) {
                        try {
                            const r = document.createRange();
                            r.selectNodeContents(accEl);
                            const s = window.getSelection();
                            s.removeAllRanges();
                            s.addRange(r);
                        } catch (err) { /* bỏ qua */ }
                    }
                    toast('Hãy bôi đen và sao chép thủ công');
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(acc).then(
                        () => toast('Đã sao chép STK: ' + acc), fallback);
                } else {
                    fallback();
                }
            };
            root.addEventListener('click', onClick);

            return () => {
                root.removeEventListener('error', onImgError, true);
                root.removeEventListener('click', onClick);
            };
        }
    });
})();
