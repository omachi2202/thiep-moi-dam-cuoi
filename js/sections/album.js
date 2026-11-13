// Section: Album ảnh & lời cảm ơn
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
        footerCredit: 'HIME WEDDING INVITATION'
    }),
    migrate(data) {
        if (!Array.isArray(data.photos)) data.photos = [];
        return data;
    },
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        const photos = Array.isArray(d.photos) ? d.photos : [];
        const photosGrid = photos.map((url, idx) => `
                    <div class="overflow-hidden rounded-xl shadow-sm border border-white aspect-[3/4] bg-slate-100 group">
                        <img src="${escapeHtml(safeUrl(url))}" alt="Album ${idx + 1}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" onerror="this.src='https://placehold.co/400x500/e2d9d0/5c4938?text=Wedding+Photo'">
                    </div>
                `).join('');
        return `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${v.secColor};">
                    <div class="space-y-1">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'albumTitle')}>${escapeHtml(d.albumTitle)}</h3>
                        <p class="text-[11px] tracking-[0.22em] uppercase opacity-70" ${fieldAttr(ctx, 'albumSubtitle')}>${escapeHtml(d.albumSubtitle)}</p>
                    </div>

                    <!-- Lưới 6 ảnh cưới -->
                    <div class="grid grid-cols-2 gap-2.5">
                        ${photosGrid}
                    </div>

                    <!-- Lời cảm ơn -->
                    <div class="pt-6 border-t border-amber-900/15 space-y-2">
                        <h4 class="text-3xl font-bold" style="font-family: ${v.globalScriptFont}; color: ${v.pc};">Thank you!</h4>
                        <p class="text-xs leading-relaxed px-2 opacity-85" ${fieldAttr(ctx, 'thankYouText')}>${escapeHtml(d.thankYouText)}</p>
                    </div>

                    <!-- Footer Credit -->
                    <div class="pt-4 text-[10px] tracking-[0.2em] uppercase opacity-50" ${fieldAttr(ctx, 'footerCredit')}>
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
                <label class="block font-semibold text-slate-700 mb-1.5">Danh sách 6 ảnh trong Album</label>
                <div class="space-y-2">${photoInputs}</div>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Lời cảm ơn cuối thiệp</label>
                <textarea rows="2" oninput="updateSectionField('${id}','thankYouText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.thankYouText)}</textarea>
            </div>
        `;
    }
});
