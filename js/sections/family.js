// Section: Thông tin gia đình & lời mời
const FAMILY_LAYOUTS = [
    { key: 'classic', label: 'Cổ điển' },
    { key: 'split', label: 'Tách đôi' },
    { key: 'traditional', label: 'Thiệp in' }
];
const FAMILY_GROOM_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80';
const FAMILY_BRIDE_PHOTO = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80';
registerSection({
    type: 'family',
    label: 'Gia đình & Lời mời',
    icon: 'fa-users',
    defaults: () => ({
        brideParents: 'Ông: Nguyễn Văn Đoàn\nBà: Vũ Thị Đương',
        brideAddress: 'Cẩm Lý, Lục Nam, Bắc Giang',
        groomParents: 'Ông: Nguyễn Văn Thắng\nBà: Lương Thị Tám',
        groomAddress: 'Cẩm Lý, Lục Nam, Bắc Giang',
        inviteHeader: 'TRÂN TRỌNG KÍNH MỜI',
        inviteSub: 'THAM DỰ LỄ CƯỚI CỦA CHÚNG MÌNH',
        groomFullName: 'Nguyễn Thanh Tùng',
        brideFullName: 'Trần Khánh Ngọc',
        coupleAvatar: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=700&q=80',
        imageShape: '',
        layout: 'classic',
        groomPhoto: FAMILY_GROOM_PHOTO,
        bridePhoto: FAMILY_BRIDE_PHOTO
    }),
    migrate(data) {
        if (!IMAGE_SHAPES.some(s => s[0] === data.imageShape)) data.imageShape = '';
        if (!FAMILY_LAYOUTS.some(l => l.key === data.layout)) data.layout = 'classic';
        if (typeof data.groomPhoto !== 'string') data.groomPhoto = FAMILY_GROOM_PHOTO;
        if (typeof data.bridePhoto !== 'string') data.bridePhoto = FAMILY_BRIDE_PHOTO;
        return data;
    },
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        const shape = imageShapeClass(d.imageShape);
        const layout = FAMILY_LAYOUTS.some(l => l.key === d.layout) ? d.layout : 'classic';
        const f = k => fieldAttr(ctx, k);
        const t = k => escapeHtml(d[k]);
        const ph = "this.onerror=null;this.src='https://placehold.co/400x500/e2d9d0/5c4938?text=Photo'";

        if (layout === 'split') {
            const photo = (key, nameKey, role) => `
                        <div class="space-y-2">
                            ${shape
                                ? `<img src="${escapeHtml(safeUrl(d[key]))}" alt="${role}" loading="lazy" decoding="async" class="${shape} block w-full object-cover" onerror="${ph}">`
                                : `<div class="w-full aspect-[4/5] rounded-t-full overflow-hidden border-4 border-white shadow-lg"><img src="${escapeHtml(safeUrl(d[key]))}" alt="${role}" loading="lazy" decoding="async" class="w-full h-full object-cover" onerror="${ph}"></div>`}
                            <p class="text-[11px] font-bold uppercase tracking-wider" style="color: ${v.pc};">${role}</p>
                            <p class="font-bold leading-snug" style="font-family: ${v.secFont}; font-size: calc(${v.titleSize} * 0.8);" ${f(nameKey)}>${t(nameKey)}</p>
                        </div>`;
            return `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${v.secColor};">
                    <div class="space-y-1.5">
                        <h3 class="font-bold tracking-[0.15em] text-sm" style="font-family: ${v.secFont}; color: ${v.pc};" ${f('inviteHeader')}>${t('inviteHeader')}</h3>
                        <p class="text-xs uppercase tracking-widest opacity-80" ${f('inviteSub')}>${t('inviteSub')}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4 items-start">${photo('groomPhoto', 'groomFullName', 'Chú Rể')}${photo('bridePhoto', 'brideFullName', 'Cô Dâu')}
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-xs border-y border-amber-900/15 py-5">
                        <div class="space-y-1 pr-2 border-r border-amber-900/15">
                            <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${v.pc};">Nhà Trai</p>
                            <p class="whitespace-pre-line font-semibold leading-relaxed" ${f('groomParents')}>${t('groomParents')}</p>
                            <p class="text-xs opacity-80" ${f('groomAddress')}>${t('groomAddress')}</p>
                        </div>
                        <div class="space-y-1 pl-2">
                            <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${v.pc};">Nhà Gái</p>
                            <p class="whitespace-pre-line font-semibold leading-relaxed" ${f('brideParents')}>${t('brideParents')}</p>
                            <p class="text-xs opacity-80" ${f('brideAddress')}>${t('brideAddress')}</p>
                        </div>
                    </div>
                </div>`;
        }

        if (layout === 'traditional') {
            return `
                <div class="py-10 px-5" style="color: ${v.secColor};">
                    <div class="p-1.5 border-2" style="border-color: ${v.pc};">
                        <div class="border px-5 py-8 text-center space-y-5" style="border-color: ${v.pc};">
                            <div class="space-y-1" style="color: ${v.pc};">
                                <i class="fa-solid fa-ring text-2xl"></i>
                                <p class="font-bold tracking-[0.3em] uppercase text-sm" style="font-family: ${v.secFont};">Song Hỷ</p>
                            </div>
                            <div class="space-y-4 text-xs">
                                <div class="space-y-1">
                                    <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${v.pc};">Nhà Trai</p>
                                    <p class="whitespace-pre-line font-semibold leading-relaxed" ${f('groomParents')}>${t('groomParents')}</p>
                                    <p class="opacity-80" ${f('groomAddress')}>${t('groomAddress')}</p>
                                </div>
                                <div class="space-y-1">
                                    <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${v.pc};">Nhà Gái</p>
                                    <p class="whitespace-pre-line font-semibold leading-relaxed" ${f('brideParents')}>${t('brideParents')}</p>
                                    <p class="opacity-80" ${f('brideAddress')}>${t('brideAddress')}</p>
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <h3 class="font-bold tracking-[0.15em] text-sm" style="font-family: ${v.secFont}; color: ${v.pc};" ${f('inviteHeader')}>${t('inviteHeader')}</h3>
                                <p class="text-xs uppercase tracking-widest opacity-80" ${f('inviteSub')}>${t('inviteSub')}</p>
                            </div>
                            <div class="space-y-1" style="font-family: ${v.secFont}; font-size: ${v.titleSize};">
                                <div class="font-bold" ${f('groomFullName')}>${t('groomFullName')}</div>
                                <div class="text-base opacity-70">&amp;</div>
                                <div class="font-bold" ${f('brideFullName')}>${t('brideFullName')}</div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }

        return `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${v.secColor};">
                    <!-- Nhà Trai & Nhà Gái -->
                    <div class="grid grid-cols-2 gap-4 text-xs border-y border-amber-900/15 py-5">
                        <div class="space-y-1 pr-2 border-r border-amber-900/15">
                            <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${v.pc};">Nhà Trai</p>
                            <p class="whitespace-pre-line font-semibold leading-relaxed" ${fieldAttr(ctx, 'groomParents')}>${escapeHtml(d.groomParents)}</p>
                            <p class="text-xs opacity-80" ${fieldAttr(ctx, 'groomAddress')}>${escapeHtml(d.groomAddress)}</p>
                        </div>
                        <div class="space-y-1 pl-2">
                            <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${v.pc};">Nhà Gái</p>
                            <p class="whitespace-pre-line font-semibold leading-relaxed" ${fieldAttr(ctx, 'brideParents')}>${escapeHtml(d.brideParents)}</p>
                            <p class="text-xs opacity-80" ${fieldAttr(ctx, 'brideAddress')}>${escapeHtml(d.brideAddress)}</p>
                        </div>
                    </div>

                    <!-- Lời mời -->
                    <div class="space-y-1.5">
                        <h3 class="font-bold tracking-[0.15em] text-sm" style="font-family: ${v.secFont}; color: ${v.pc};" ${fieldAttr(ctx, 'inviteHeader')}>${escapeHtml(d.inviteHeader)}</h3>
                        <p class="text-xs uppercase tracking-widest opacity-80" ${fieldAttr(ctx, 'inviteSub')}>${escapeHtml(d.inviteSub)}</p>
                    </div>

                    <!-- Tên đầy đủ Cô Dâu & Chú Rể -->
                    <div class="py-2 space-y-1" style="font-family: ${v.secFont}; font-size: ${v.titleSize};">
                        <div class="font-bold" ${fieldAttr(ctx, 'groomFullName')}>${escapeHtml(d.groomFullName)}</div>
                        <div class="text-base opacity-70">&amp;</div>
                        <div class="font-bold" ${fieldAttr(ctx, 'brideFullName')}>${escapeHtml(d.brideFullName)}</div>
                    </div>

                    <!-- Ảnh tròn cặp đôi -->
                    ${shape
                        ? `<img src="${escapeHtml(safeUrl(d.coupleAvatar))}" alt="Couple" loading="lazy" decoding="async" class="${shape} block w-48 mx-auto object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x500/e2d9d0/5c4938?text=Couple'">`
                        : `<div class="w-48 h-60 mx-auto rounded-t-full overflow-hidden border-4 border-white shadow-lg">
                        <img src="${escapeHtml(safeUrl(d.coupleAvatar))}" alt="Couple" loading="lazy" decoding="async" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x500/e2d9d0/5c4938?text=Couple'">
                    </div>`}
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        const cur = FAMILY_LAYOUTS.some(l => l.key === d.layout) ? d.layout : 'classic';
        const picker = FAMILY_LAYOUTS.map(l => {
            const on = l.key === cur;
            return `<button type="button" onclick="updateSectionField('${id}','layout','${l.key}',false)" aria-pressed="${on}" class="px-1.5 py-2 rounded-lg border text-xs font-semibold transition ${on ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}">${escapeHtml(l.label)}</button>`;
        }).join('');
        const photoBox = (key, title) => `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">${title}</label>
                <input type="text" value="${escapeHtml(d[key])}" oninput="updateSectionField('${id}','${key}',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300 mb-1.5">
                <label class="w-full py-2 px-3 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-200 cursor-pointer flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-upload"></i> Đổi ảnh từ máy tính
                    <input type="file" accept="image/*" class="hidden" onchange="handleLocalImageUpload(event, '${id}', '${key}')">
                </label>
            </div>`;
        const splitPhotos = cur === 'split' ? photoBox('groomPhoto', 'Ảnh Chú Rể') + photoBox('bridePhoto', 'Ảnh Cô Dâu') : '';
        const shapeBox = cur === 'traditional' ? '' : `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Khung ảnh</label>
                <select onchange="updateSectionField('${id}','imageShape',this.value,false)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                    ${IMAGE_SHAPES.map(s => `<option value="${escapeHtml(s[0])}" ${s[0] === d.imageShape ? 'selected' : ''}>${escapeHtml(s[1])}</option>`).join('')}
                </select>
            </div>`;
        const coupleBox = cur === 'classic' ? photoBox('coupleAvatar', 'Ảnh Cặp Đôi') : '';
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Kiểu bố cục</label>
                <div class="grid grid-cols-3 gap-1.5">${picker}</div>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Họ tên Chú Rể</label>
                    <input type="text" value="${escapeHtml(d.groomFullName)}" oninput="updateSectionField('${id}','groomFullName',this.value,true)" class="w-full px-2.5 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Họ tên Cô Dâu</label>
                    <input type="text" value="${escapeHtml(d.brideFullName)}" oninput="updateSectionField('${id}','brideFullName',this.value,true)" class="w-full px-2.5 py-2 rounded-lg border border-slate-300">
                </div>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Phụ huynh Nhà Trai</label>
                <textarea rows="2" oninput="updateSectionField('${id}','groomParents',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.groomParents)}</textarea>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Địa chỉ Nhà Trai</label>
                <input type="text" value="${escapeHtml(d.groomAddress)}" oninput="updateSectionField('${id}','groomAddress',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Phụ huynh Nhà Gái</label>
                <textarea rows="2" oninput="updateSectionField('${id}','brideParents',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.brideParents)}</textarea>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Địa chỉ Nhà Gái</label>
                <input type="text" value="${escapeHtml(d.brideAddress)}" oninput="updateSectionField('${id}','brideAddress',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            ${shapeBox}
            ${coupleBox}
            ${splitPhotos}
        `;
    }
});
