// Thao tác trên danh sách section: thêm/nhân bản/xoá, đổi vị trí, ẩn/hiện, áp preset.
// Mọi thao tác kết thúc bằng commitState(label) (Hiến pháp Điều 5).

// Sinh id <base>-<n>, n nhỏ nhất chưa dùng; base chỉ gồm [a-z] để id khớp ^[a-z0-9_-]{1,40}$
function nextSectionId(type) {
    const base = (typeof type === 'string' && /^[a-z]{1,30}$/.test(type)) ? type : 'section';
    const used = new Set(appState.sections.map(s => s.id));
    let n = 1;
    while (used.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
}

function addSection(type) {
    const def = getSectionDef(type);
    if (!def) {
        showToast('Loại section này chưa được hỗ trợ.');
        return;
    }
    const sec = {
        id: nextSectionId(type),
        type: type,
        name: def.label,
        icon: def.icon,
        visible: true,
        customFont: '',
        customTitleSize: '28',
        customTextColor: '',
        style: defaultSectionStyle(),
        data: typeof def.defaults === 'function' ? def.defaults() : {}
    };
    const selIdx = appState.sections.findIndex(s => s.id === appState.selectedSectionId);
    const at = selIdx >= 0 ? selIdx + 1 : appState.sections.length;
    appState.sections.splice(at, 0, sec);
    appState.selectedSectionId = sec.id;
    window.__addMenuOpen = false;
    commitState('Thêm phần: ' + sec.name);
    showToast('Đã thêm: ' + sec.name);
}

function duplicateSection(secId) {
    const idx = appState.sections.findIndex(s => s.id === secId);
    if (idx < 0) return;
    const src = appState.sections[idx];
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = nextSectionId(src.type);
    copy.name = (src.name || '') + ' (bản sao)';
    appState.sections.splice(idx + 1, 0, copy);
    appState.selectedSectionId = copy.id;
    commitState('Nhân bản phần: ' + src.name);
    showToast('Đã nhân bản: ' + src.name);
}

// Modal xác nhận trong trang (không dùng confirm()); nội dung chèn bằng textContent
function showConfirmModal(message, confirmLabel, onConfirm) {
    const old = document.getElementById('confirmModalOverlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'confirmModalOverlay';
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4';

    const box = document.createElement('div');
    box.className = 'bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');

    const msg = document.createElement('p');
    msg.className = 'text-sm text-slate-700 leading-relaxed';
    msg.textContent = message;

    const row = document.createElement('div');
    row.className = 'flex justify-end gap-2';

    const btnCancel = document.createElement('button');
    btnCancel.type = 'button';
    btnCancel.className = 'min-h-[44px] px-4 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50';
    btnCancel.textContent = 'Huỷ';

    const btnOk = document.createElement('button');
    btnOk.type = 'button';
    btnOk.className = 'min-h-[44px] px-4 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700';
    btnOk.textContent = confirmLabel;

    function close() {
        document.removeEventListener('keydown', onKey);
        overlay.remove();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    btnCancel.addEventListener('click', close);
    btnOk.addEventListener('click', function () { close(); onConfirm(); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', onKey);

    row.appendChild(btnCancel);
    row.appendChild(btnOk);
    box.appendChild(msg);
    box.appendChild(row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    btnCancel.focus();
}

function deleteSection(secId) {
    const idx = appState.sections.findIndex(s => s.id === secId);
    if (idx < 0) return;
    if (appState.sections.length <= 1) {
        showToast('Thiệp cần có ít nhất một phần.');
        return;
    }
    const name = appState.sections[idx].name;
    showConfirmModal('Xoá phần "' + name + '"? Có thể hoàn tác bằng Undo.', 'Xoá', function () {
        const i = appState.sections.findIndex(s => s.id === secId);
        if (i < 0) return;
        appState.sections.splice(i, 1);
        if (appState.selectedSectionId === secId) {
            const next = appState.sections[Math.min(i, appState.sections.length - 1)];
            appState.selectedSectionId = next ? next.id : '';
        }
        commitState('Xoá phần: ' + name);
        showToast('Đã xoá: ' + name);
    });
}

function toggleAddSectionMenu() {
    window.__addMenuOpen = !window.__addMenuOpen;
    renderSectionListSidebar();
}

function moveSection(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= appState.sections.length) return;
    const temp = appState.sections[index];
    appState.sections[index] = appState.sections[targetIndex];
    appState.sections[targetIndex] = temp;
    commitState('Đổi vị trí phần');
    showToast("Đã thay đổi vị trí phần!");
}

function toggleSectionVisibility(secId) {
    const sec = appState.sections.find(s => s.id === secId);
    if (sec) {
        sec.visible = !sec.visible;
        commitState(sec.visible ? 'Hiện phần' : 'Ẩn phần');
        showToast(sec.visible ? `Đã hiện: ${sec.name}` : `Đã ẩn: ${sec.name}`);
    }
}

// Chỉ ghi khoá có trong preset, và chỉ khoá thuộc whitelist; giá trị qua kiểm tra
function applyThemePreset(presetName) {
    const p = Object.prototype.hasOwnProperty.call(THEME_PRESETS, presetName) ? THEME_PRESETS[presetName] : null;
    if (!p) return;
    const g = appState.globalStyle;
    const prevFalling = g.fallingEffect;
    ['scriptFont', 'headingFont', 'bodyFont'].forEach(k => {
        if (p[k] === undefined) return;
        const v = safeFont(p[k], '');
        if (v) g[k] = p[k];
    });
    ['primaryColor', 'bgColor', 'textColor'].forEach(k => {
        if (p[k] === undefined) return;
        const v = safeColor(p[k], '');
        if (v) g[k] = v;
    });
    // Khoá G5: chỉ ghi giá trị thuộc whitelist G5_OPTIONS (state.js)
    Object.keys(G5_OPTIONS).forEach(k => {
        if (p[k] !== undefined && G5_OPTIONS[k].indexOf(p[k]) >= 0) g[k] = p[k];
    });
    if (Array.isArray(p.sectionOrder)) {
        const rank = new Map();
        p.sectionOrder.forEach((id, i) => { if (!rank.has(id)) rank.set(id, i); });
        const listed = appState.sections.filter(s => rank.has(s.id)).sort((a, b) => rank.get(a.id) - rank.get(b.id));
        const rest = appState.sections.filter(s => !rank.has(s.id));
        appState.sections = listed.concat(rest);
    }
    commitState('Áp bộ giao diện: ' + (p.label || presetName));
    if (typeof syncLeftControlsWithState === 'function') syncLeftControlsWithState();
    if (g.fallingEffect !== prevFalling && typeof initFallingEffect === 'function') initFallingEffect();
    showToast("Đã áp dụng bộ phối màu & phông chữ mới!");
}

window.addSection = addSection;
window.duplicateSection = duplicateSection;
window.deleteSection = deleteSection;
window.moveSection = moveSection;
window.toggleSectionVisibility = toggleSectionVisibility;
window.applyThemePreset = applyThemePreset;
window.toggleAddSectionMenu = toggleAddSectionMenu;
