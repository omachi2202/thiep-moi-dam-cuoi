// Chuẩn hoá state về schema hiện tại đúng một lần ở lần render đầu (registry đã nạp đủ ở thời điểm này)
function ensureStateMigrated() {
    if (window.__stateMigrated) return;
    window.__stateMigrated = true;
    appState = migrate(appState);
}

function renderAll() {
    ensureStateMigrated();
    renderSectionListSidebar();
    renderThemePresetGrid();
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
        const unknown = !getSectionDef(sec.type);
        const subLabel = unknown
            ? '<span class="text-amber-600"><i class="fa-solid fa-triangle-exclamation"></i> Loại section không được hỗ trợ</span>'
            : (sec.visible ? 'Đang hiển thị' : 'Đang ẩn');
        const menuOpen = window.__secMenuId === sec.id;
        const sidAttr = escapeHtml(sec.id);
        const last = idx >= appState.sections.length - 2 && appState.sections.length > 2;
        const btnCls = 'w-8 h-8 rounded hover:bg-slate-200 flex items-center justify-center';
        return `
        <div onclick="selectSection('${sidAttr}')" class="px-2.5 py-1.5 min-h-[48px] rounded-xl border transition cursor-pointer flex items-center justify-between gap-1 ${isSelected ? 'bg-violet-50 border-violet-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'} ${!sec.visible ? 'opacity-50' : ''}">
            <div class="flex items-center gap-2 min-w-0 flex-1">
                <div class="w-7 h-7 rounded-lg ${isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center shrink-0 text-xs">
                    <i class="fa-solid ${escapeHtml(sec.icon)}"></i>
                </div>
                <div class="min-w-0">
                    <div class="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight" title="${escapeHtml(sec.name)}">${escapeHtml(sec.name)}</div>
                    <div class="text-[10px] text-slate-400 leading-tight">${subLabel}</div>
                </div>
            </div>
            <div class="flex items-center shrink-0" onclick="event.stopPropagation()">
                <button onclick="moveSection(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="${btnCls} text-slate-500 disabled:opacity-30" title="Lên trên">
                    <i class="fa-solid fa-arrow-up text-[11px]"></i>
                </button>
                <button onclick="moveSection(${idx}, 1)" ${idx === appState.sections.length - 1 ? 'disabled' : ''} class="${btnCls} text-slate-500 disabled:opacity-30" title="Xuống dưới">
                    <i class="fa-solid fa-arrow-down text-[11px]"></i>
                </button>
                <button onclick="toggleSectionVisibility('${sidAttr}')" class="${btnCls} ${sec.visible ? 'text-violet-600' : 'text-slate-400'}" title="Ẩn/Hiện phần này">
                    <i class="fa-solid ${sec.visible ? 'fa-eye' : 'fa-eye-slash'} text-xs"></i>
                </button>
                <div class="relative">
                    <button onclick="toggleSectionMenu('${sidAttr}')" class="${btnCls} text-slate-500" title="Thêm thao tác" aria-haspopup="true" aria-expanded="${menuOpen}">
                        <i class="fa-solid fa-ellipsis text-xs"></i>
                    </button>
                    ${menuOpen ? `<div class="absolute right-0 ${last ? 'bottom-full mb-1' : 'top-full mt-1'} z-20 w-36 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                        <button onclick="closeSectionMenu(); duplicateSection('${sidAttr}')" class="w-full min-h-[36px] px-3 text-left text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"><i class="fa-solid fa-clone text-[10px]"></i> Nhân bản</button>
                        <button onclick="closeSectionMenu(); deleteSection('${sidAttr}')" class="w-full min-h-[36px] px-3 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"><i class="fa-solid fa-trash text-[10px]"></i> Xoá</button>
                    </div>` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('') + renderAddSectionMenuHtml();
}

// Menu "⋯" của thẻ section: trạng thái giữ ở window vì sidebar được vẽ lại sau mỗi commit
function toggleSectionMenu(secId) {
    window.__secMenuId = window.__secMenuId === secId ? null : secId;
    renderSectionListSidebar();
}
function closeSectionMenu() {
    if (!window.__secMenuId) return;
    window.__secMenuId = null;
    renderSectionListSidebar();
}
window.toggleSectionMenu = toggleSectionMenu;
window.closeSectionMenu = closeSectionMenu;
document.addEventListener('click', function (e) {
    if (window.__secMenuId && !(e.target.closest && e.target.closest('[aria-haspopup="true"]')) ) closeSectionMenu();
});
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSectionMenu();
});

// Nút "+ Thêm section" và danh sách loại lấy từ registry (loại mới đăng ký tự xuất hiện)
function renderAddSectionMenuHtml() {
    const types = Object.keys(window.SECTION_TYPES).filter(t => getSectionDef(t));
    const open = !!window.__addMenuOpen;
    let panel = '';
    if (open) {
        panel = types.length
            ? types.map(t => {
                const d = getSectionDef(t);
                return `<button onclick="addSection('${escapeHtml(t)}')" class="w-full min-h-[44px] px-3 rounded-lg border border-slate-200 bg-white hover:border-violet-500 text-left flex items-center gap-2.5">
                    <span class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs shrink-0"><i class="fa-solid ${escapeHtml(d.icon)}"></i></span>
                    <span class="text-xs font-semibold text-slate-800">${escapeHtml(d.label)}</span>
                </button>`;
            }).join('')
            : '<div class="text-amber-600 text-xs"><i class="fa-solid fa-triangle-exclamation"></i> Chưa có loại section nào được đăng ký.</div>';
    }
    return `
        <div class="pt-1 space-y-2">
            <button onclick="toggleAddSectionMenu()" class="w-full min-h-[44px] rounded-xl border-2 border-dashed border-violet-300 text-violet-700 text-xs font-semibold hover:bg-violet-50 flex items-center justify-center gap-1.5">
                <i class="fa-solid ${open ? 'fa-xmark' : 'fa-plus'}"></i> ${open ? 'Đóng' : 'Thêm section'}
            </button>
            ${open ? `<div class="space-y-1.5">${panel}</div>` : ''}
        </div>`;
}

// Vẽ lưới preset từ THEME_PRESETS vào khung có sẵn trong tab giao diện (index.html chỉ có nút tĩnh cũ)
function renderThemePresetGrid() {
    const grid = document.querySelector('#leftTab-theme .grid.grid-cols-2');
    if (!grid) return;
    grid.innerHTML = Object.keys(THEME_PRESETS).map(k => {
        const p = THEME_PRESETS[k];
        return `<button onclick="applyThemePreset('${escapeHtml(k)}')" class="p-2.5 min-h-[44px] rounded-xl border border-slate-200 hover:border-violet-500 text-left transition flex items-center gap-2" style="background-color:${safeColor(p.bgColor, '#ffffff')}">
            <span class="w-5 h-5 rounded-full shrink-0 border border-white shadow" style="background-color:${safeColor(p.primaryColor, '#8c6239')}"></span>
            <div>
                <div class="text-xs font-bold text-slate-800">${escapeHtml(p.label || k)}</div>
                <div class="text-[10px] text-slate-500">${escapeHtml(p.desc || '')}</div>
            </div>
        </button>`;
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
    const esc = (typeof CSS !== 'undefined' && CSS.escape) ? CSS.escape(secId) : String(secId).replace(/["\\\]]/g, '\\$&');
    const targetEl = document.querySelector(`.wedding-section[data-section-id="${esc}"]`);
    if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ---- Trang trí G5 (whitelist: tên lớp CSS được ghép từ giá trị nên giá trị lạ về mặc định) ----
const G5_WL = {
    bgTexture: ['none', 'paper', 'floral', 'silk'],
    frameStyle: ['none', 'single', 'double', 'floral-corner'],
    cornerOrnament: ['none', 'leaf', 'rose'],
    revealAnimation: ['none', 'fade-up', 'zoom', 'slide', 'fade', 'flip', 'pop']
};
const G5_DEFAULT = { bgTexture: 'none', frameStyle: 'none', cornerOrnament: 'none', revealAnimation: 'fade-up' };
const SEC_STYLE_WL = {
    paddingY: ['', 'sm', 'md', 'lg'],
    align: ['', 'left', 'center', 'right'],
    animation: ['', 'none', 'fade-up', 'zoom', 'slide', 'fade', 'flip', 'pop'],
    animDuration: ['', 'fast', 'slow'],
    ornament: ['', 'top', 'bottom', 'both']
};

function g5Value(g, key) {
    const v = g && typeof g[key] === 'string' ? g[key] : '';
    return G5_WL[key].indexOf(v) >= 0 ? v : G5_DEFAULT[key];
}

function secStyleValue(st, key) {
    const v = st && typeof st[key] === 'string' ? st[key] : '';
    return SEC_STYLE_WL[key].indexOf(v) >= 0 ? v : '';
}

// Lớp toàn thiệp: tex-*, frame-*, orn-* (đặt trên .card-root và #weddingCardFrame)
function cardDecorClasses(g) {
    return 'tex-' + g5Value(g, 'bgTexture') + ' frame-' + g5Value(g, 'frameStyle') + ' orn-' + g5Value(g, 'cornerOrnament');
}

// Trả { cls, style } cho wrapper section từ sec.style (G5); style đã sạch, vẫn phải escapeHtml khi đưa vào thuộc tính
function sectionDecor(sec, g) {
    const st = (sec && sec.style && typeof sec.style === 'object') ? sec.style : {};
    const cls = [];
    const css = [];
    const bg = safeColor(st.bgColor, '');
    if (bg) css.push('background-color:' + bg);
    const img = safeCssImageUrl(st.bgImage);
    if (img) {
        let op = parseFloat(st.bgOverlayOpacity);
        if (!isFinite(op)) op = 0;
        op = Math.min(0.9, Math.max(0, op));
        const layers = [];
        if (op > 0) layers.push('linear-gradient(rgba(255,255,255,' + op + '),rgba(255,255,255,' + op + '))');
        layers.push('url("' + img + '")');
        css.push('background-image:' + layers.join(','));
        css.push('background-size:cover');
        css.push('background-position:center');
    }
    const py = secStyleValue(st, 'paddingY');
    if (py) cls.push('sec-py-' + py);
    const al = secStyleValue(st, 'align');
    if (al) cls.push('sec-align-' + al);
    const orn = secStyleValue(st, 'ornament');
    if (orn) cls.push('sec-orn-' + orn);
    let anim = secStyleValue(st, 'animation');
    if (anim === '') anim = g5Value(g, 'revealAnimation');
    if (anim !== 'none') {
        cls.push('reveal-' + anim);
        const dur = secStyleValue(st, 'animDuration');
        if (dur) cls.push('reveal-dur-' + dur);
    }
    return { cls: cls.join(' '), style: css.join(';') };
}

// Đổi một thuộc tính trong sec.style qua updateSectionStyle (→ commitState)
function setSectionDecor(secId, prop, value) {
    const sec = appState.sections.find(s => s.id === secId);
    if (!sec) return;
    const next = Object.assign({}, (sec.style && typeof sec.style === 'object') ? sec.style : {});
    next[prop] = value;
    updateSectionStyle(secId, 'style', next);
}

function renderDecorInspectorHtml(sec) {
    const sid = escapeHtml(sec.id);
    const st = (sec.style && typeof sec.style === 'object') ? sec.style : {};
    const sel = (key, opts) => `<select onchange="setSectionDecor('${sid}', '${key}', this.value)" class="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white">${
        opts.map(o => `<option value="${escapeHtml(o[0])}" ${secStyleValue(st, key) === o[0] ? 'selected' : ''}>${escapeHtml(o[1])}</option>`).join('')
    }</select>`;
    let op = parseFloat(st.bgOverlayOpacity);
    if (!isFinite(op)) op = 0;
    op = Math.min(0.9, Math.max(0, op));
    const bgc = safeColor(st.bgColor, '');
    const open = window.__decorOpen ? 'open' : '';
    return `
        <details ${open} ontoggle="window.__decorOpen = this.open" class="rounded-xl border border-slate-200 bg-white">
            <summary class="p-3 cursor-pointer font-bold text-slate-700 flex items-center gap-1.5 min-h-[44px]">
                <i class="fa-solid fa-wand-magic-sparkles text-violet-600"></i> Nền &amp; Trang trí
            </summary>
            <div class="p-3 pt-0 space-y-3">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Màu nền phần này</label>
                    <div class="flex items-center gap-1.5">
                        <input type="color" value="${escapeHtml(bgc || '#ffffff')}" onchange="setSectionDecor('${sid}', 'bgColor', this.value)" class="w-10 h-9 rounded border border-slate-300 cursor-pointer">
                        <button onclick="setSectionDecor('${sid}', 'bgColor', '')" class="min-h-[36px] px-2 text-[11px] text-slate-500 underline">Bỏ nền</button>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Ảnh nền (dán link hoặc tải ảnh)</label>
                    <input type="text" value="${escapeHtml(st.bgImage || '')}" onchange="setSectionDecor('${sid}', 'bgImage', this.value.trim())" class="w-full px-2.5 py-2 rounded-lg border border-slate-300" placeholder="https://...">
                    <div class="flex items-center gap-2 mt-1.5">
                        <label class="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer inline-flex items-center gap-1.5">
                            <i class="fa-solid fa-upload"></i> Tải ảnh từ máy tính
                            <input type="file" accept="image/*" class="hidden" onchange="handleSectionBgUpload(event, '${sid}')">
                        </label>
                        ${st.bgImage ? `<button onclick="setSectionDecor('${sid}', 'bgImage', '')" class="min-h-[36px] px-2 text-[11px] text-slate-500 underline">Bỏ ảnh</button>` : ''}
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Lớp phủ sáng trên ảnh (${Math.round(op * 100)}%)</label>
                    <input type="range" min="0" max="0.9" step="0.05" value="${op}" onchange="setSectionDecor('${sid}', 'bgOverlayOpacity', parseFloat(this.value))" class="w-full accent-violet-600">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Khoảng cách trên/dưới</label>
                        ${sel('paddingY', [['', 'Mặc định'], ['sm', 'Nhỏ'], ['md', 'Vừa'], ['lg', 'Lớn']])}
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Căn chữ</label>
                        ${sel('align', [['', 'Mặc định'], ['left', 'Trái'], ['center', 'Giữa'], ['right', 'Phải']])}
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Hiệu ứng xuất hiện</label>
                        ${sel('animation', [['', 'Theo toàn thiệp'], ['none', 'Không'], ['fade-up', 'Hiện dần'], ['zoom', 'Phóng to'], ['slide', 'Trượt'], ['fade', 'Mờ dần'], ['flip', 'Lật'], ['pop', 'Bật nảy']])}
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Tốc độ hiệu ứng</label>
                        ${sel('animDuration', [['', 'Mặc định'], ['fast', 'Nhanh'], ['slow', 'Chậm']])}
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-700 mb-1">Hoa văn viền phần</label>
                        ${sel('ornament', [['', 'Không'], ['top', 'Phía trên'], ['bottom', 'Phía dưới'], ['both', 'Cả hai']])}
                    </div>
                </div>
            </div>
        </details>`;
}

// 4. VẼ KHUNG THIỆP CƯỚI (DÙNG CHUNG CHO EDITOR / TRANG KHÁCH / EXPORT)
// Trả về HTML các section đang hiển thị. Ngoài mode 'editor' không có badge, onclick, contenteditable.
function renderCardHtml(state, ctx) {
    // State schema cũ/lạ: chuẩn hoá trên bản sao, không sửa state gốc
    if (state.schemaVersion !== SCHEMA_VERSION) {
        state = migrate(JSON.parse(JSON.stringify(state)));
    }
    const c = Object.assign({ mode: 'invite', guestName: '', slug: null }, ctx || {}, { appState: state });
    const isEditor = c.mode === 'editor';

    const gs = state.globalStyle || {};
    const sectionsHtml = state.sections
        .filter(sec => sec.visible && getSectionDef(sec.type))
        .map(sec => {
            let innerHtml;
            try {
                innerHtml = getSectionDef(sec.type).renderCanvas(sec, c);
            } catch (err) {
                console.error('renderCanvas lỗi ở section', sec.id, err);
                if (!isEditor) return '';
                innerHtml = `<div class="m-3 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 text-xs">Không hiển thị được phần "${escapeHtml(sec.name)}". Kiểm tra lại dữ liệu của phần này.</div>`;
            }
            const dec = sectionDecor(sec, gs);
            const styleAttr = dec.style ? ` style="${escapeHtml(dec.style)}"` : '';
            if (!isEditor) {
                if (!String(innerHtml == null ? '' : innerHtml).trim()) return '';
                return `
            <section data-section-id="${escapeHtml(sec.id)}" class="wedding-section ${dec.cls}"${styleAttr}>
                ${innerHtml}
            </section>`;
            }
            const isSelected = state.selectedSectionId === sec.id;
            return `
            <section data-section-id="${escapeHtml(sec.id)}" onclick="selectSection('${escapeHtml(sec.id)}')" class="wedding-section ${dec.cls} ${isSelected ? 'selected-section' : ''}"${styleAttr}>
                <!-- Nhãn công cụ nổi kiểu Canva khi di chuột vào Section -->
                <div class="section-badge absolute top-2 right-2 z-30 items-center gap-1 bg-violet-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md">
                    <i class="fa-solid fa-pen-ruler"></i>
                    <span>${escapeHtml(sec.name)}</span>
                </div>
                ${innerHtml}
            </section>`;
        }).join('');
    return `<div class="card-root ${cardDecorClasses(gs)}">${sectionsHtml}</div>`;
}

function renderWeddingCanvas() {
    const frame = document.getElementById('weddingCardFrame');
    const viewport = document.getElementById('sectionsViewport');
    const g = appState.globalStyle;

    frame.style.backgroundColor = g.bgColor;
    const bgVars = cardBgVars(g);
    Object.keys(bgVars).forEach(k => frame.style.setProperty(k, bgVars[k]));
    frame.style.color = g.textColor;
    frame.style.fontFamily = safeFontCss(g.bodyFont, DEFAULT_STATE.globalStyle.bodyFont);
    // Áp lớp G5 lên khung (giữ các lớp khác của frame, chỉ thay tex-/frame-/orn-)
    Array.from(frame.classList).forEach(cl => { if (/^(tex|frame|orn)-/.test(cl)) frame.classList.remove(cl); });
    cardDecorClasses(g).split(' ').forEach(cl => frame.classList.add(cl));
    document.getElementById('floatingMusicBtn').style.backgroundColor = g.primaryColor;

    const ctx = { appState: appState, mode: appState.isPreviewMode ? 'preview' : 'editor', guestName: '', slug: null };
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
// Đọc văn bản của phần tử contenteditable: <br> và khối (div/p/li) thành \n, dùng textContent (không bị text-transform ảnh hưởng)
function readEditableText(el) {
    let out = '';
    (function walk(node) {
        node.childNodes.forEach(c => {
            if (c.nodeType === 3) {
                out += c.textContent;
            } else if (c.nodeType === 1) {
                if (c.tagName === 'BR') { out += '\n'; return; }
                if (/^(DIV|P|LI)$/.test(c.tagName) && out && !out.endsWith('\n')) out += '\n';
                walk(c);
            }
        });
    })(el);
    return out.replace(/\n+$/, '').trim();
}

const __fieldOrigText = new WeakMap();

function __editableFieldOf(e) {
    const el = e.target;
    if (!el || !el.closest) return null;
    const field = el.closest('[data-field]');
    if (!field) return null;
    const viewport = document.getElementById('sectionsViewport');
    if (!viewport || !viewport.contains(field)) return null;
    return field;
}

document.addEventListener('focusin', function (e) {
    const field = __editableFieldOf(e);
    if (field) __fieldOrigText.set(field, readEditableText(field));
});

document.addEventListener('focusout', function (e) {
    const field = __editableFieldOf(e);
    if (!field) return;
    if (appState.isPreviewMode) return;
    const secEl = field.closest('[data-section-id]');
    if (!secEl) return;
    const value = readEditableText(field);
    if (__fieldOrigText.has(field) && __fieldOrigText.get(field) === value) return;
    updateSectionField(secEl.dataset.sectionId, field.dataset.field, value);
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

    const def = getSectionDef(sec.type);
    let specificFieldsHtml;
    if (def && typeof def.renderInspector === 'function') {
        try {
            specificFieldsHtml = def.renderInspector(sec);
        } catch (err) {
            console.error('renderInspector lỗi ở section', sec.id, err);
            specificFieldsHtml = '<div class="text-amber-600 text-xs">Không hiển thị được bảng thuộc tính của phần này. Kiểm tra lại dữ liệu.</div>';
        }
    } else {
        specificFieldsHtml = '<div class="text-amber-600 text-xs">Loại section này không được hỗ trợ ở phiên bản hiện tại; dữ liệu được giữ nguyên.</div>';
    }
    const sid = escapeHtml(sec.id);

    document.getElementById('inspectorContent').innerHTML = `
        <!-- Khối Tùy chỉnh Font & Cỡ chữ riêng cho Section này (Canva Style) -->
        <div class="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200 space-y-3">
            <div class="font-bold text-violet-900 flex items-center gap-1.5">
                <i class="fa-solid fa-font text-violet-600"></i> Kiểu chữ riêng của Phần này
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Phông chữ Tiêu đề phần này</label>
                <select onchange="updateSectionStyle('${sid}', 'customFont', this.value)" class="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white">
                    ${fontOptionsHtml}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Cỡ tiêu đề (${escapeHtml(sec.customTitleSize)}px)</label>
                    <input type="range" min="18" max="48" value="${escapeHtml(sec.customTitleSize)}" oninput="updateSectionStyle('${sid}', 'customTitleSize', this.value)" class="w-full accent-violet-600 mt-1.5">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1">Màu chữ riêng</label>
                    <div class="flex items-center gap-1.5">
                        <input type="color" value="${escapeHtml(sec.customTextColor || appState.globalStyle.textColor)}" onchange="updateSectionStyle('${sid}', 'customTextColor', this.value)" class="w-8 h-7 rounded border border-slate-300 cursor-pointer">
                        <button onclick="updateSectionStyle('${sid}', 'customTextColor', '')" class="text-[10px] text-slate-500 underline">Mặc định</button>
                    </div>
                </div>
            </div>
        </div>

        ${renderDecorInspectorHtml(sec)}

        <hr class="border-slate-200">

        <!-- Nội dung chi tiết của Section -->
        <div class="space-y-3">
            <div class="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Nội dung chi tiết</div>
            ${specificFieldsHtml}
        </div>
    `;
}
