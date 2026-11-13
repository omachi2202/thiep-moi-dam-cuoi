// Section: Thông tin gia đình & lời mời
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
        coupleAvatar: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=700&q=80'
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        return `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${v.secColor};">
                    <!-- Nhà Trai & Nhà Gái -->
                    <div class="grid grid-cols-2 gap-4 text-xs border-y border-amber-900/15 py-5">
                        <div class="space-y-1 pr-2 border-r border-amber-900/15">
                            <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${v.pc};">Nhà Trai</p>
                            <p class="whitespace-pre-line font-semibold leading-relaxed" ${fieldAttr(ctx, 'groomParents')}>${escapeHtml(d.groomParents)}</p>
                            <p class="text-[11px] opacity-75" ${fieldAttr(ctx, 'groomAddress')}>${escapeHtml(d.groomAddress)}</p>
                        </div>
                        <div class="space-y-1 pl-2">
                            <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${v.pc};">Nhà Gái</p>
                            <p class="whitespace-pre-line font-semibold leading-relaxed" ${fieldAttr(ctx, 'brideParents')}>${escapeHtml(d.brideParents)}</p>
                            <p class="text-[11px] opacity-75" ${fieldAttr(ctx, 'brideAddress')}>${escapeHtml(d.brideAddress)}</p>
                        </div>
                    </div>

                    <!-- Lời mời -->
                    <div class="space-y-1.5">
                        <h3 class="font-bold tracking-[0.15em] text-sm" style="font-family: ${v.secFont}; color: ${v.pc};" ${fieldAttr(ctx, 'inviteHeader')}>${escapeHtml(d.inviteHeader)}</h3>
                        <p class="text-[11px] uppercase tracking-widest opacity-75" ${fieldAttr(ctx, 'inviteSub')}>${escapeHtml(d.inviteSub)}</p>
                    </div>

                    <!-- Tên đầy đủ Cô Dâu & Chú Rể -->
                    <div class="py-2 space-y-1" style="font-family: ${v.scriptFont}; font-size: ${v.titleSize};">
                        <div class="font-bold" ${fieldAttr(ctx, 'groomFullName')}>${escapeHtml(d.groomFullName)}</div>
                        <div class="text-base opacity-70">&amp;</div>
                        <div class="font-bold" ${fieldAttr(ctx, 'brideFullName')}>${escapeHtml(d.brideFullName)}</div>
                    </div>

                    <!-- Ảnh tròn cặp đôi -->
                    <div class="w-48 h-60 mx-auto rounded-t-full overflow-hidden border-4 border-white shadow-lg">
                        <img src="${escapeHtml(safeUrl(d.coupleAvatar))}" alt="Couple" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400x500/e2d9d0/5c4938?text=Couple'">
                    </div>
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        return `
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
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ảnh Cặp Đôi (Khung vòm)</label>
                <input type="text" value="${escapeHtml(d.coupleAvatar)}" oninput="updateSectionField('${id}','coupleAvatar',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300 mb-1.5">
                <label class="w-full py-2 px-3 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-200 cursor-pointer flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-upload"></i> Đổi ảnh từ máy tính
                    <input type="file" accept="image/*" class="hidden" onchange="handleLocalImageUpload(event, '${id}', 'coupleAvatar')">
                </label>
            </div>
        `;
    }
});
