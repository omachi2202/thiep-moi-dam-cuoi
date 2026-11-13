// Section: Lịch trình sự kiện & chỉ đường
registerSection({
    type: 'events',
    label: 'Lịch trình & Chỉ đường',
    icon: 'fa-location-dot',
    defaults: () => ({
        event1Title: 'TIỆC MỪNG CƯỚI',
        event1Time: '16:00 - CHỦ NHẬT',
        event1Date: '24.10.2026',
        event1Lunar: '(Tức ngày 15 tháng 09 năm Bính Ngọ)',
        event1Venue: 'Tại Tư Gia Nhà Gái - Cẩm Lý, Lục Nam, Bắc Giang',
        event1MapUrl: 'https://maps.google.com/?q=Cam+Ly+Luc+Nam+Bac+Giang',
        event2Title: 'LỄ THÀNH HÔN',
        event2Time: '09:00 - THỨ HAI',
        event2Date: '25.10.2026',
        event2Lunar: '(Tức ngày 16 tháng 09 năm Bính Ngọ)',
        event2Venue: 'Tại Tư Gia Nhà Trai - Cẩm Lý, Lục Nam, Bắc Giang',
        event2MapUrl: 'https://maps.google.com/?q=Cam+Ly+Luc+Nam+Bac+Giang'
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        const block = (n) => `
                    <div class="bg-white/90 rounded-2xl p-6 shadow-sm border border-amber-900/10 space-y-2.5">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, `event${n}Title`)}>${escapeHtml(d[`event${n}Title`])}</h3>
                        <div class="w-10 h-0.5 mx-auto opacity-40" style="background-color: ${v.pc};"></div>
                        <p class="font-bold text-sm tracking-wide" ${fieldAttr(ctx, `event${n}Time`)}>${escapeHtml(d[`event${n}Time`])}</p>
                        <p class="text-2xl font-bold tracking-wider" style="color: ${v.pc}; font-family: ${v.secFont};" ${fieldAttr(ctx, `event${n}Date`)}>${escapeHtml(d[`event${n}Date`])}</p>
                        <p class="text-xs italic opacity-75" ${fieldAttr(ctx, `event${n}Lunar`)}>${escapeHtml(d[`event${n}Lunar`])}</p>
                        <p class="text-xs font-medium pt-1" ${fieldAttr(ctx, `event${n}Venue`)}>${escapeHtml(d[`event${n}Venue`])}</p>
                        <div class="pt-2">
                            <a href="${escapeHtml(safeUrl(d[`event${n}MapUrl`]))}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white shadow transition hover:opacity-90" style="background-color: ${v.pc};">
                                <i class="fa-solid fa-location-dot"></i> XEM CHỈ ĐƯỜNG
                            </a>
                        </div>
                    </div>`;
        return `
                <div class="py-10 px-6 text-center space-y-6 bg-black/[0.02]" style="color: ${v.secColor};">
                    <!-- Sự kiện 1: Tiệc Mừng Cưới -->${block(1)}

                    <!-- Sự kiện 2: Lễ Thành Hôn -->${block(2)}
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        const group = (n, title) => `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div class="font-bold text-violet-700">${title}</div>
                <input type="text" value="${escapeHtml(d[`event${n}Title`])}" oninput="updateSectionField('${id}','event${n}Title',this.value,true)" placeholder="Tên sự kiện" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${escapeHtml(d[`event${n}Time`])}" oninput="updateSectionField('${id}','event${n}Time',this.value,true)" placeholder="Giờ & Thứ" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${escapeHtml(d[`event${n}Date`])}" oninput="updateSectionField('${id}','event${n}Date',this.value,true)" placeholder="Ngày dương lịch" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${escapeHtml(d[`event${n}Lunar`])}" oninput="updateSectionField('${id}','event${n}Lunar',this.value,true)" placeholder="Ngày âm lịch" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${escapeHtml(d[`event${n}Venue`])}" oninput="updateSectionField('${id}','event${n}Venue',this.value,true)" placeholder="Địa điểm" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${escapeHtml(d[`event${n}MapUrl`])}" oninput="updateSectionField('${id}','event${n}MapUrl',this.value,true)" placeholder="Link Google Maps" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
            </div>`;
        return group(1, 'Sự kiện 1 (Tiệc Cưới)') + '\n' + group(2, 'Sự kiện 2 (Lễ Thành Hôn)');
    }
});
