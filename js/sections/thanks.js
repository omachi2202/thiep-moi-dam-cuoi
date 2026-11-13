// Section: Lời cảm ơn
registerSection({
    type: 'thanks',
    label: 'Lời cảm ơn',
    icon: 'fa-hands-holding-heart',
    defaults: () => ({
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        title: 'Xin Cảm Ơn',
        message: 'Sự hiện diện của bạn là niềm vui và món quà quý giá nhất đối với chúng mình trong ngày trọng đại này. Chân thành cảm ơn!',
        signature: 'Tùng & Ngọc'
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = Object.assign({}, this.defaults(), sec.data || {});
        const img = safeUrl(d.image);
        return `
                <div class="py-10 px-6 text-center space-y-4" style="color: ${v.secColor};">
                    ${img ? `<img src="${escapeHtml(img)}" alt="Cảm ơn" class="w-full h-64 object-cover rounded-2xl shadow-sm" onerror="this.style.display='none'">` : ''}
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
