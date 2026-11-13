// Chuẩn hoá state về schema hiện tại đúng một lần ở lần render đầu (registry đã nạp đủ ở thời điểm này)
function ensureStateMigrated() {
    if (window.__stateMigrated) return;
    window.__stateMigrated = true;
    appState = migrate(appState);
}

function renderAll() {
    ensureStateMigrated();
    renderSectionListSidebar();
    renderWeddingCanvas();
    renderRightInspector();
}

// 3. QUẢN LÝ SIDEBAR TRÁI (DANH SÁCH SECTION, SẮP XẾP, ẨN/HIỆN)
function switchLeftTab(tabName) {
    ['sections', 'theme', 'settings'].forEach(t => {
        document.getElementById(`leftTab-${t}`).classList.toggle('hidden', t !== tabName);
        const btn = document.getElementById(`tabBtn-${t}`);
        if (t === tabName) {
            btn.className = "py-3 flex flex-col items-center gap-1 border-b-2 border-violet-600 text-violet-700 bg-white";
        } else {
            btn.className = "py-3 flex flex-col items-center gap-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800";
        }
    });
}

function renderSectionListSidebar() {
    const container = document.getElementById('sectionListContainer');
    container.innerHTML = appState.sections.map((sec, idx) => {
        const isSelected = appState.selectedSectionId === sec.id;
        const unknown = !SECTION_TYPES[sec.type];
        const subLabel = unknown
            ? '<span class="text-amber-600"><i class="fa-solid fa-triangle-exclamation"></i> Loại section không được hỗ trợ</span>'
            : (sec.visible ? 'Đang hiển thị' : 'Đang ẩn');
        return `
        <div onclick="selectSection('${escapeHtml(sec.id)}')" class="p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${isSelected ? 'bg-violet-50 border-violet-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'} ${!sec.visible ? 'opacity-50' : ''}">
            <div class="flex items-center gap-2.5 overflow-hidden">
                <div class="w-7 h-7 rounded-lg ${isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center shrink-0 text-xs">
                    <i class="fa-solid ${escapeHtml(sec.icon)}"></i>
                </div>
                <div class="truncate">
                    <div class="text-xs font-semibold text-slate-800 truncate">${escapeHtml(sec.name)}</div>
                    <div class="text-[10px] text-slate-400">${subLabel}</div>
                </div>
            </div>
            <div class="flex items-center gap-1 shrink-0" onclick="event.stopPropagation()">
                <button onclick="moveSection(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="w-6 h-6 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 flex items-center justify-center" title="Lên trên">
                    <i class="fa-solid fa-arrow-up text-[10px]"></i>
                </button>
                <button onclick="moveSection(${idx}, 1)" ${idx === appState.sections.length - 1 ? 'disabled' : ''} class="w-6 h-6 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 flex items-center justify-center" title="Xuống dưới">
                    <i class="fa-solid fa-arrow-down text-[10px]"></i>
                </button>
                <button onclick="toggleSectionVisibility('${escapeHtml(sec.id)}')" class="w-6 h-6 rounded hover:bg-slate-200 ${sec.visible ? 'text-violet-600' : 'text-slate-400'} flex items-center justify-center" title="Ẩn/Hiện phần này">
                    <i class="fa-solid ${sec.visible ? 'fa-eye' : 'fa-eye-slash'} text-xs"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

function selectSection(secId) {
    appState.selectedSectionId = secId;
    renderSectionListSidebar();
    renderRightInspector();

    // Highlight trên khung Canvas
    document.querySelectorAll('.wedding-section').forEach(el => {
        el.classList.toggle('selected-section', el.dataset.sectionId === secId);
    });

    // Cuộn mượt tới section đó
    const targetEl = document.querySelector(`.wedding-section[data-section-id="${secId}"]`);
    if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 4. VẼ KHUNG THIỆP CƯỚI (DÙNG CHUNG CHO EDITOR / TRANG KHÁCH / EXPORT)
// Trả về HTML các section đang hiển thị. Ngoài mode 'editor' không có badge, onclick, contenteditable.
function renderCardHtml(state, ctx) {
    const c = Object.assign({ mode: 'invite', guestName: '', slug: null }, ctx || {}, { appState: state });
    const isEditor = c.mode === 'editor';

    return state.sections
        .filter(sec => sec.visible && SECTION_TYPES[sec.type])
        .map(sec => {
            const innerHtml = SECTION_TYPES[sec.type].renderCanvas(sec, c);
            if (!isEditor) {
                return `
            <section data-section-id="${escapeHtml(sec.id)}" class="wedding-section">
                ${innerHtml}
            </section>`;
            }
            const isSelected = state.selectedSectionId === sec.id;
            return `
            <section data-section-id="${escapeHtml(sec.id)}" onclick="selectSection('${escapeHtml(sec.id)}')" class="wedding-section ${isSelected ? 'selected-section' : ''}">
                <!-- Nhãn công cụ nổi kiểu Canva khi di chuột vào Section -->
                <div class="section-badge absolute top-2 right-2 z-30 items-center gap-1 bg-violet-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md">
                    <i class="fa-solid fa-pen-ruler"></i>
                    <span>${escapeHtml(sec.name)}</span>
                </div>
                ${innerHtml}
            </section>`;
        }).join('');
}

function renderWeddingCanvas() {
    const frame = document.getElementById('weddingCardFrame');
    const viewport = document.getElementById('sectionsViewport');
    const g = appState.globalStyle;

    frame.style.backgroundColor = g.bgColor;
    frame.style.color = g.textColor;
    frame.style.fontFamily = g.bodyFont;
    document.getElementById('floatingMusicBtn').style.backgroundColor = g.primaryColor;

    const ctx = { appState: appState, mode: 'editor', guestName: '', slug: null };
    viewport.innerHTML = renderCardHtml(appState, ctx);

    // Runtime dùng chung (T4) nếu đã có; chưa có thì giữ cách cũ
    if (typeof CardRuntime !== 'undefined' && CardRuntime && typeof CardRuntime.init === 'function') {
        if (typeof CardRuntime.destroy === 'function') CardRuntime.destroy();
        CardRuntime.init(viewport, appState, ctx);
    } else {
        updateCountdownDisplay();
    }
}

// Listener chung cho mọi trường sửa inline [data-field] (giao kèo G4)
document.addEventListener('focusout', function (e) {
    const el = e.target;
    if (!el || !el.closest) return;
    const field = el.closest('[data-field]');
    if (!field) return;
    const viewport = document.getElementById('sectionsViewport');
    if (!viewport || !viewport.contains(field)) return;
    const secEl = field.closest('[data-section-id]');
    if (!secEl) return;
    updateSectionField(secEl.dataset.sectionId, field.dataset.field, field.innerText);
});

// 5. BẢNG THUỘC TÍNH BÊN PHẢI (CONTEXTUAL INSPECTOR CHO TỪNG SECTION)
function renderRightInspector() {
    const sec = appState.sections.find(s => s.id === appState.selectedSectionId);
    if (!sec) return;

    document.getElementById('inspectorTitle').textContent = sec.name;
    document.getElementById('inspectorBadge').textContent = sec.id.toUpperCase();

    const fontOptionsHtml = FONT_OPTIONS.map(opt =>
        `<option value="${escapeHtml(opt.value)}" ${sec.customFont === opt.value ? 'selected' : ''}>${escapeHtml(opt.label)}</option>`
    ).join('');

    const def = SECTION_TYPES[sec.type];
    const specificFieldsHtml = def
        ? def.renderInspector(sec)
        : '<div class="text-amber-600 text-xs">Loại section này không được hỗ trợ ở phiên bản hiện tại; dữ liệu được giữ nguyên.</div>';
    const sid = escapeHtml(sec.id);

    document.getElementById('inspectorContent').innerHTML = `
        <!-- Khối Tùy chỉnh Font & Cỡ chữ riêng cho Section này (Canva Style) -->
        <div class="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200 space-y-3">
            <div class="font-bold text-violet-900 flex items-center gap-1.5">
                <i class="fa-solid fa-font text-violet-600"></i> Kiểu chữ riêng của Phần này
            </div>
            <div>
                <label class="block text-[11px] font-medium text-slate-600 mb-1">Phông chữ Tiêu đề phần này</label>
                <select onchange="updateSectionStyle('${sid}', 'customFont', this.value)" class="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white">
                    ${fontOptionsHtml}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Cỡ tiêu đề (${escapeHtml(sec.customTitleSize)}px)</label>
                    <input type="range" min="18" max="48" value="${escapeHtml(sec.customTitleSize)}" oninput="updateSectionStyle('${sid}', 'customTitleSize', this.value)" class="w-full accent-violet-600 mt-1.5">
                </div>
                <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Màu chữ riêng</label>
                    <div class="flex items-center gap-1.5">
                        <input type="color" value="${escapeHtml(sec.customTextColor || appState.globalStyle.textColor)}" onchange="updateSectionStyle('${sid}', 'customTextColor', this.value)" class="w-8 h-7 rounded border border-slate-300 cursor-pointer">
                        <button onclick="updateSectionStyle('${sid}', 'customTextColor', '')" class="text-[10px] text-slate-500 underline">Mặc định</button>
                    </div>
                </div>
            </div>
        </div>

        <hr class="border-slate-200">

        <!-- Nội dung chi tiết của Section -->
        <div class="space-y-3">
            <div class="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Nội dung chi tiết</div>
            ${specificFieldsHtml}
        </div>
    `;
}
