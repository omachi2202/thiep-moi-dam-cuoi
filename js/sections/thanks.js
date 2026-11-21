// Section: Lời cảm ơn
const THANKS_LAYOUTS = [['classic', 'Cổ điển'], ['overlay', 'Ảnh tràn nền'], ['curved', 'Ảnh mép cong']];
registerSection({
    type: 'thanks',
    label: 'Lời cảm ơn',
    icon: 'fa-hands-holding-heart',
    defaults: () => ({
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        title: 'Xin Cảm Ơn',
        message: 'Sự hiện diện của bạn là niềm vui và món quà quý giá nhất đối với chúng mình trong ngày trọng đại này. Chân thành cảm ơn!',
        signature: 'Tùng & Ngọc',
        imageShape: '',
        layout: 'classic'
    }),
    migrate(data) {
        if (!THANKS_LAYOUTS.some(l => l[0] === data.layout)) data.layout = 'classic';
        if (!IMAGE_SHAPES.some(s => s[0] === data.imageShape)) data.imageShape = '';
        return data;
    },
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = Object.assign({}, this.defaults(), sec.data || {});
        const img = safeUrl(d.image);
        const shape = imageShapeClass(d.imageShape);
        // Có khung: bỏ h-64 cố định, chiều rộng thu lại để khung 1:1 không méo
        const imgCls = shape ? `${shape} block mx-auto w-4/5 object-cover${(d.imageShape === 'arch' || d.imageShape === 'rounded') ? ' h-72' : ''}` : 'w-full h-64 object-cover rounded-2xl shadow-sm';
        const layout = THANKS_LAYOUTS.some(l => l[0] === d.layout) ? d.layout : 'classic';
        const titleH = `<h3 class="font-bold uppercase tracking-wider" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${layout === 'overlay' ? '#fff' : v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>`;
        if (layout === 'overlay') {
            return `
                <div class="relative overflow-hidden text-center" style="min-height: 440px; background: #2a2118;">
                    ${img ? `<img src="${escapeHtml(img)}" alt="Cảm ơn" class="absolute inset-0 w-full h-full object-cover" onerror="this.style.display='none'">` : ''}
                    <div class="absolute inset-0" style="background: rgba(0,0,0,0.5);"></div>
                    <div class="relative px-6 py-16 space-y-4 flex flex-col items-center justify-center" style="min-height: 440px; color: #fff;">
                        ${titleH}
                        <p class="text-xs leading-relaxed" style="color: rgba(255,255,255,0.92);" ${fieldAttr(ctx, 'message')}>${escapeHtml(d.message)}</p>
                        <p class="text-2xl" style="font-family: ${v.scriptFont}; color: #fff;" ${fieldAttr(ctx, 'signature')}>${escapeHtml(d.signature)}</p>
                    </div>
                </div>`;
        }
        if (layout === 'curved') {
            return `
                <div class="pb-10 text-center space-y-4 overflow-hidden" style="color: ${v.secColor};">
                    ${img ? `<img src="${escapeHtml(img)}" alt="Cảm ơn" class="block w-full object-cover" style="height: 280px; border-radius: 0 0 50% 50% / 0 0 22% 22%;" onerror="this.style.display='none'">` : ''}
                    <div class="px-6 pt-4 space-y-4">
                        ${titleH}
                        <p class="text-xs leading-relaxed opacity-85" ${fieldAttr(ctx, 'message')}>${escapeHtml(d.message)}</p>
                        <p class="text-2xl" style="font-family: ${v.scriptFont}; color: ${v.pc};" ${fieldAttr(ctx, 'signature')}>${escapeHtml(d.signature)}</p>
                    </div>
                </div>`;
        }
        return `
                <div class="py-10 px-6 text-center space-y-4" style="color: ${v.secColor};">
                    ${img ? `<img src="${escapeHtml(img)}" alt="Cảm ơn" class="${imgCls}" onerror="this.style.display='none'">` : ''}
                    <h3 class="font-bold uppercase tracking-wider" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>
                    <p class="text-xs leading-relaxed opacity-85" ${fieldAttr(ctx, 'message')}>${escapeHtml(d.message)}</p>
                    <p class="text-2xl" style="font-family: ${v.scriptFont}; color: ${v.pc};" ${fieldAttr(ctx, 'signature')}>${escapeHtml(d.signature)}</p>
                </div>`;
    },
    renderInspector(sec) {
        const d = Object.assign({}, this.defaults(), sec.data || {});
        const id = escapeHtml(sec.id);
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Bố cục</label>
                <select onchange="updateSectionField('${id}','layout',this.value,false)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                    ${THANKS_LAYOUTS.map(l => `<option value="${escapeHtml(l[0])}" ${l[0] === d.layout ? 'selected' : ''}>${escapeHtml(l[1])}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tiêu đề</label>
                <input type="text" value="${escapeHtml(d.title)}" oninput="updateSectionField('${id}','title',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Lời cảm ơn</label>
                <textarea rows="4" oninput="updateSectionField('${id}','message',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.message)}</textarea>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Chữ ký</label>
                <input type="text" value="${escapeHtml(d.signature)}" oninput="updateSectionField('${id}','signature',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            ${(d.layout === 'overlay' || d.layout === 'curved') ? '' : `<div>
                <label class="block font-semibold text-slate-700 mb-1">Khung ảnh</label>
                <select onchange="updateSectionField('${id}','imageShape',this.value,false)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                    ${IMAGE_SHAPES.map(s => `<option value="${escapeHtml(s[0])}" ${s[0] === d.imageShape ? 'selected' : ''}>${escapeHtml(s[1])}</option>`).join('')}
                </select>
            </div>`}
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ảnh (URL hoặc Tải ảnh)</label>
                <input type="text" value="${escapeHtml(d.image)}" oninput="updateSectionField('${id}','image',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300 mb-1.5">
                <label class="w-full py-2 px-3 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-200 cursor-pointer flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-upload"></i> Tải ảnh từ máy tính
                    <input type="file" accept="image/*" class="hidden" onchange="handleLocalImageUpload(event, '${id}', 'image')">
                </label>
            </div>
        `;
    }
});
