// Section: Trang bìa (Save The Date)
// Danh sách kiểu bố cục trang bìa (khoá + tên hiển thị + trường nhập thêm theo kiểu)
const HERO_LAYOUTS = [
    { key: 'classic', label: 'Cổ điển', extra: [] },
    { key: 'fade', label: 'Mờ dần', extra: ['inviteLine', 'weekday', 'timeText', 'venueText', 'closingNote'] },
    { key: 'arch', label: 'Vòm cong', extra: ['monogram', 'weekday'] },
    { key: 'fullscreen', label: 'Toàn màn hình', extra: [] }
];
const HERO_PLACEHOLDER = "this.src='https://placehold.co/600x800/e2d9d0/5c4938?text=Wedding+Photo'";
const HERO_EXTRA_LABELS = {
    inviteLine: 'Dòng mời (trên cùng)',
    weekday: 'Thứ trong tuần',
    timeText: 'Giờ',
    venueText: 'Địa điểm',
    closingNote: 'Câu nhắn cuối',
    monogram: 'Monogram (chữ cái đầu)'
};

// Màu chữ trên nền màu chủ đạo: nền tối -> kem vàng, nền sáng -> xám đen (hex 3/6 ký tự; dạng khác coi là tối)
function heroInkFor(color) {
    let h = String(color || '').trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(h)) h = h.replace(/./g, c => c + c);
    if (!/^[0-9a-f]{6}$/i.test(h)) return '#efe3c4';
    const ch = i => {
        const s = parseInt(h.substr(i, 2), 16) / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const lum = 0.2126 * ch(0) + 0.7152 * ch(2) + 0.0722 * ch(4);
    return lum > 0.5 ? '#2a2f27' : '#efe3c4';
}

registerSection({
    type: 'hero',
    label: 'Trang bìa',
    icon: 'fa-heart',
    defaults: () => ({
        coupleShortName: 'Tùng & Ngọc',
        tagline: 'SAVE OUR DATE',
        dateDisplay: '24.10.2026',
        heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        subNote: 'Trân trọng báo tin lễ thành hôn của chúng mình',
        layout: 'classic',
        monogram: 'T & N',
        inviteLine: 'Trân trọng kính mời bạn đến chung vui cùng gia đình chúng mình',
        weekday: 'Thứ Bảy',
        timeText: '17:00',
        venueText: 'Tư gia nhà gái · Cẩm Lý, Lục Nam, Bắc Giang',
        closingNote: 'Sự hiện diện của bạn là niềm vinh hạnh của chúng mình!'
    }),
    migrate(data) {
        if (!HERO_LAYOUTS.some(l => l.key === data.layout)) data.layout = 'classic';
        return data;
    },
    // Hook tuỳ chọn: tiêu đề trang = tên cặp đôi
    pageTitle(sec) { return (sec && sec.data && sec.data.coupleShortName) || ''; },
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        const layout = HERO_LAYOUTS.some(l => l.key === d.layout) ? d.layout : 'classic';
        const img = escapeHtml(safeUrl(d.heroImage));
        const f = k => fieldAttr(ctx, k);
        const t = k => escapeHtml(d[k]);

        if (layout === 'fade') {
            return `
                <div class="hero-fade text-center pb-8" style="color: ${v.secColor};">
                    <div class="hero-fade-stage">
                        <div class="hero-fade-media">
                            <img src="${img}" alt="Wedding Banner" onerror="${HERO_PLACEHOLDER}">
                        </div>
                        <div class="hero-fade-top">
                            <p class="hero-fade-invite" style="font-family: ${v.secFont};" ${f('inviteLine')}>${t('inviteLine')}</p>
                            <p class="hero-fade-tag" style="font-family: ${v.secFont};" ${f('tagline')}>${t('tagline')}</p>
                            <h1 class="hero-fade-names" style="font-family: ${v.scriptFont}; font-size: calc(${v.titleSize} * 1.5);" ${f('coupleShortName')}>${t('coupleShortName')}</h1>
                        </div>
                    </div>
                    <div class="hero-fade-info" style="--hero-line: ${v.pc};">
                        <div class="hero-fade-col">
                            <p class="hero-fade-weekday" style="font-family: ${v.secFont};" ${f('weekday')}>${t('weekday')}</p>
                            <p class="hero-fade-date" style="font-family: ${v.secFont}; color: ${v.pc};" ${f('dateDisplay')}>${t('dateDisplay')}</p>
                        </div>
                        <div class="hero-fade-col">
                            <p class="hero-fade-time" style="font-family: ${v.secFont};" ${f('timeText')}>${t('timeText')}</p>
                            <p class="hero-fade-venue" style="font-family: ${v.secFont};" ${f('venueText')}>${t('venueText')}</p>
                        </div>
                        <div class="hero-fade-col">
                            <p class="hero-fade-closing" style="font-family: ${v.scriptFont};" ${f('closingNote')}>${t('closingNote')}</p>
                            <i class="fa-solid fa-heart hero-fade-heart" style="color: ${v.pc};"></i>
                        </div>
                    </div>
                    <p class="text-xs italic mt-5 px-6 opacity-80" ${f('subNote')}>${t('subNote')}</p>
                </div>`;
        }

        if (layout === 'arch') {
            return `
                <div class="hero-arch text-center" style="background: ${v.pc}; --hero-arch-ink: ${heroInkFor(v.pc)};">
                    <div class="hero-arch-head">
                        <div class="hero-arch-mono" style="font-family: ${v.scriptFont};" ${f('monogram')}>${t('monogram')}</div>
                        <p class="hero-arch-tag" style="font-family: ${v.secFont};" ${f('tagline')}>${t('tagline')}</p>
                        <h1 class="hero-arch-names" style="font-family: ${v.secFont}; font-size: ${v.titleSize};" ${f('coupleShortName')}>${t('coupleShortName')}</h1>
                        <div class="hero-arch-rule"><span></span><i class="fa-solid fa-leaf"></i><span></span></div>
                        <p class="hero-arch-date" style="font-family: ${v.secFont};" ${f('dateDisplay')}>${t('dateDisplay')}</p>
                        <p class="hero-arch-weekday" style="font-family: ${v.secFont};" ${f('weekday')}>${t('weekday')}</p>
                    </div>
                    <div class="hero-arch-photo">
                        <img src="${img}" alt="Wedding Banner" onerror="${HERO_PLACEHOLDER}">
                    </div>
                    <p class="hero-arch-note" style="font-family: ${v.secFont};" ${f('subNote')}>${t('subNote')}</p>
                </div>`;
        }

        if (layout === 'fullscreen') {
            return `
                <div class="hero-full">
                    <img class="hero-full-img" src="${img}" alt="Wedding Banner" onerror="${HERO_PLACEHOLDER}">
                    <div class="hero-full-shade"></div>
                    <div class="hero-full-body">
                        <p class="hero-full-tag" style="font-family: ${v.secFont};" ${f('tagline')}>${t('tagline')}</p>
                        <h1 class="hero-full-names" style="font-family: ${v.scriptFont}; font-size: calc(${v.titleSize} * 1.3);" ${f('coupleShortName')}>${t('coupleShortName')}</h1>
                        <div class="w-16 h-[1px] bg-white/70 mx-auto my-3"></div>
                        <p class="hero-full-date" style="font-family: ${v.secFont};" ${f('dateDisplay')}>${t('dateDisplay')}</p>
                        <p class="hero-full-note" ${f('subNote')}>${t('subNote')}</p>
                    </div>
                    <i class="fa-solid fa-chevron-down hero-full-arrow"></i>
                </div>`;
        }

        // classic: giữ nguyên HTML cũ
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
        const cur = HERO_LAYOUTS.find(l => l.key === d.layout) || HERO_LAYOUTS[0];
        const picker = HERO_LAYOUTS.map(l => {
            const on = l.key === cur.key;
            return `
                <button type="button" onclick="updateSectionField('${id}','layout','${l.key}',false)" aria-pressed="${on}"
                    class="hero-pick ${on ? 'is-on' : ''}">
                    <span class="hero-dia hero-dia-${l.key}"><i></i><b></b></span>
                    <span class="hero-pick-name">${escapeHtml(l.label)}</span>
                </button>`;
        }).join('');
        const textInput = key => `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">${escapeHtml(HERO_EXTRA_LABELS[key])}</label>
                <input type="text" value="${escapeHtml(d[key])}" oninput="updateSectionField('${id}','${key}',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>`;
        const extras = cur.extra.map(textInput).join('');
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Kiểu trang bìa</label>
                <div class="hero-pick-grid">${picker}</div>
            </div>
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
            ${extras}
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Lời nhắn dưới ảnh</label>
                <input type="text" value="${escapeHtml(d.subNote)}" oninput="updateSectionField('${id}','subNote',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
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
