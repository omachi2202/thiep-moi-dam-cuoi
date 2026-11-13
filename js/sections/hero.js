// Section: Trang bìa (Save The Date)
registerSection({
    type: 'hero',
    label: 'Trang bìa',
    icon: 'fa-heart',
    defaults: () => ({
        coupleShortName: 'Tùng & Ngọc',
        tagline: 'SAVE OUR DATE',
        dateDisplay: '24.10.2026',
        heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        subNote: 'Trân trọng báo tin lễ thành hôn của chúng mình'
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        return `
                <div class="relative text-center pb-8">
                    <div class="relative h-[470px] overflow-hidden">
                        <img src="${escapeHtml(safeUrl(d.heroImage))}" alt="Wedding Banner" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/600x800/e2d9d0/5c4938?text=Wedding+Photo'">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                        <div class="absolute bottom-8 inset-x-4 text-white">
                            <p class="tracking-[0.28em] text-xs uppercase mb-2 opacity-90" ${fieldAttr(ctx, 'tagline')}>${escapeHtml(d.tagline)}</p>
                            <h1 class="mb-2 drop-shadow" style="font-family: ${v.scriptFont}; font-size: ${v.titleSize};" ${fieldAttr(ctx, 'coupleShortName')}>${escapeHtml(d.coupleShortName)}</h1>
                            <div class="w-16 h-[1px] bg-white/70 mx-auto my-3"></div>
                            <p class="text-xl tracking-[0.2em] font-semibold" style="font-family: ${v.secFont};" ${fieldAttr(ctx, 'dateDisplay')}>${escapeHtml(d.dateDisplay)}</p>
                        </div>
                    </div>
                    <p class="text-xs italic mt-4 px-6 opacity-80" style="color: ${v.secColor};" ${fieldAttr(ctx, 'subNote')}>${escapeHtml(d.subNote)}</p>
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tên Cặp Đôi (Trang bìa)</label>
                <input type="text" value="${escapeHtml(d.coupleShortName)}" oninput="updateSectionField('${id}','coupleShortName',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Thông điệp</label>
                    <input type="text" value="${escapeHtml(d.tagline)}" oninput="updateSectionField('${id}','tagline',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Ngày hiển thị</label>
                    <input type="text" value="${escapeHtml(d.dateDisplay)}" oninput="updateSectionField('${id}','dateDisplay',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ảnh Bìa Chính (URL hoặc Tải ảnh)</label>
                <input type="text" value="${escapeHtml(d.heroImage)}" oninput="updateSectionField('${id}','heroImage',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300 mb-1.5">
                <label class="w-full py-2 px-3 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-200 cursor-pointer flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-upload"></i> Tải ảnh từ máy tính
                    <input type="file" accept="image/*" class="hidden" onchange="handleLocalImageUpload(event, '${id}', 'heroImage')">
                </label>
            </div>
        `;
    }
});
