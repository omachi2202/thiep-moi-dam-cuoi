// Section: Xác nhận tham dự & hộp mừng cưới
registerSection({
    type: 'rsvp',
    label: 'Xác nhận tham dự & Mừng cưới',
    icon: 'fa-envelope-open-text',
    defaults: () => ({
        rsvpIntro: 'Hãy xác nhận sự có mặt của bạn để chúng mình chuẩn bị đón tiếp một cách chu đáo nhất. Trân trọng!',
        groomBtnText: 'GỬI MỪNG CƯỚI NHÀ TRAI',
        brideBtnText: 'GỬI MỪNG CƯỚI NHÀ GÁI'
    }),
    renderCanvas(sec, ctx) {
        const v = sectionVars(sec, ctx);
        const d = sec.data;
        return `
                <div class="py-10 px-6 text-center space-y-5 bg-black/[0.02]" style="color: ${v.secColor};">
                    <h3 class="font-bold uppercase tracking-wider" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};">Xác Nhận Tham Dự</h3>
                    <p class="text-xs leading-relaxed opacity-85" ${fieldAttr(ctx, 'rsvpIntro')}>${escapeHtml(d.rsvpIntro)}</p>

                    <!-- Form RSVP -->
                    <form onsubmit="handleRsvpSubmit(event)" class="bg-white p-5 rounded-2xl shadow-sm border border-amber-900/10 space-y-3 text-left text-xs">
                        <div>
                            <label class="block font-semibold mb-1 opacity-80">Tên của bạn *</label>
                            <input type="text" required placeholder="Nhập họ và tên..." class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none">
                        </div>
                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="block font-semibold mb-1 opacity-80">Khách của</label>
                                <select class="w-full px-3 py-2.5 rounded-xl border border-slate-200">
                                    <option>Nhà Trai</option>
                                    <option>Nhà Gái</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-semibold mb-1 opacity-80">Số người đi cùng</label>
                                <select class="w-full px-3 py-2.5 rounded-xl border border-slate-200">
                                    <option>Đi 1 mình</option>
                                    <option>Đi cùng 1 người</option>
                                    <option>Đi cùng gia đình</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 opacity-80">Lời chúc gửi tới cô dâu & chú rể</label>
                            <textarea rows="2" placeholder="Chúc hai bạn trăm năm hạnh phúc..." class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"></textarea>
                        </div>
                        <button type="submit" class="w-full py-3 rounded-xl font-bold text-white shadow transition hover:opacity-95 text-center" style="background-color: ${v.pc};">
                            GỬI XÁC NHẬN & LỜI CHÚC
                        </button>
                    </form>

                    <!-- 2 Nút Gửi Mừng Cưới Nhà Trai / Nhà Gái -->
                    <div class="pt-2 space-y-2.5">
                        <button onclick="openGiftModal('groom'); event.stopPropagation();" class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow flex items-center justify-center gap-2 transition transform hover:scale-[1.01]" style="background-color: ${v.pc};">
                            <i class="fa-solid fa-gift"></i>
                            <span ${fieldAttr(ctx, 'groomBtnText')}>${escapeHtml(d.groomBtnText)}</span>
                        </button>
                        <button onclick="openGiftModal('bride'); event.stopPropagation();" class="w-full py-3 px-4 rounded-xl font-bold text-xs border-2 bg-white shadow-sm flex items-center justify-center gap-2 transition transform hover:scale-[1.01]" style="border-color: ${v.pc}; color: ${v.pc};">
                            <i class="fa-solid fa-heart"></i>
                            <span ${fieldAttr(ctx, 'brideBtnText')}>${escapeHtml(d.brideBtnText)}</span>
                        </button>
                    </div>
                </div>`;
    },
    renderInspector(sec) {
        const d = sec.data;
        const id = escapeHtml(sec.id);
        return `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Lời nhắn xác nhận tham dự</label>
                <textarea rows="3" oninput="updateSectionField('${id}','rsvpIntro',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${escapeHtml(d.rsvpIntro)}</textarea>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Chữ trên nút QR Nhà Trai</label>
                <input type="text" value="${escapeHtml(d.groomBtnText)}" oninput="updateSectionField('${id}','groomBtnText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Chữ trên nút QR Nhà Gái</label>
                <input type="text" value="${escapeHtml(d.brideBtnText)}" oninput="updateSectionField('${id}','brideBtnText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
        `;
    }
});
