// 2. KHỞI TẠO ỨNG DỤNG
window.onload = function () {
    syncLeftControlsWithState();
    renderAll();
    if (typeof initStore === 'function') initStore();
    setupFileMenu();
    initFallingEffect();
    startCountdownTimer();
};

// Gom Xuất/Nhập JSON (do store.js chèn vào #editorToolbar) vào menu "Tệp"; chuyển phần tử có sẵn nên id và onclick giữ nguyên
function setupFileMenu() {
    const host = document.getElementById('editorToolbar');
    // Hoàn tác/Làm lại: chỉ icon (bỏ nút văn bản; title tooltip giữ nguyên, thêm aria-label)
    [['btnUndo', 'Hoàn tác'], ['btnRedo', 'Làm lại']].forEach(pair => {
        const b = document.getElementById(pair[0]);
        if (!b) return;
        Array.from(b.childNodes).forEach(n => { if (n.nodeType === 3) b.removeChild(n); });
        b.setAttribute('aria-label', pair[1]);
    });
    const bExport = document.getElementById('btnExportJson');
    const bImport = document.getElementById('btnImportJson');
    if (!host || !bExport || !bImport || document.getElementById('fileMenuPanel')) return;

    const wrap = document.createElement('div');
    wrap.className = 'relative';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'btnFileMenu';
    toggle.title = 'Xuất/Nhập dữ liệu thiệp (JSON)';
    toggle.className = 'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5';
    toggle.innerHTML = '<i class="fa-solid fa-folder-open"></i> Tệp <i class="fa-solid fa-chevron-down text-[9px]"></i>';
    const panel = document.createElement('div');
    panel.id = 'fileMenuPanel';
    panel.className = 'hidden absolute right-0 top-full mt-1 z-50 min-w-[150px] p-1 rounded-lg bg-slate-800 border border-slate-700 shadow-xl flex-col gap-1';
    [bExport, bImport].forEach(b => {
        b.classList.add('w-full', 'whitespace-nowrap', 'border-transparent');
        panel.appendChild(b);
    });
    const setOpen = open => {
        panel.classList.toggle('hidden', !open);
        panel.classList.toggle('flex', open);
    };
    toggle.onclick = e => { e.stopPropagation(); setOpen(panel.classList.contains('hidden')); };
    panel.addEventListener('click', () => setOpen(false));
    document.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    wrap.appendChild(toggle);
    wrap.appendChild(panel);
    host.appendChild(wrap);
}

function syncLeftControlsWithState() {
    document.getElementById('globalScriptFont').value = appState.globalStyle.scriptFont;
    document.getElementById('globalHeadingFont').value = appState.globalStyle.headingFont;
    document.getElementById('globalBodyFont').value = appState.globalStyle.bodyFont;
    document.getElementById('inputPrimaryColor').value = appState.globalStyle.primaryColor;
    document.getElementById('inputBgColor').value = appState.globalStyle.bgColor;
    document.getElementById('inputTextColor').value = appState.globalStyle.textColor;
    document.getElementById('selectFallingEffect').value = appState.globalStyle.fallingEffect;
    ['bgTexture', 'frameStyle', 'cornerOrnament', 'revealAnimation', 'introStyle', 'bgImageFit'].forEach(k => {
        const el = document.getElementById('select_' + k);
        if (el) el.value = appState.globalStyle[k];
    });
    const bgImgEl = document.getElementById('inputBgImage');
    if (bgImgEl) bgImgEl.value = appState.globalStyle.bgImage || '';
    const ovEl = document.getElementById('inputBgImageOverlay');
    if (ovEl) ovEl.value = appState.globalStyle.bgImageOverlay || 0;
    const ovLbl = document.getElementById('bgImageOverlayLabel');
    if (ovLbl) ovLbl.textContent = Math.round((Number(appState.globalStyle.bgImageOverlay) || 0) * 100) + '%';
    // Phong bì / màn mở (v7): bỏ qua nếu ô chưa có; ô màu rỗng hiện màu chủ đạo
    const gsEnv = appState.globalStyle;
    const setEnvVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    setEnvVal('env_flapColor', gsEnv.envFlapColor || gsEnv.primaryColor);
    setEnvVal('env_bodyColor', gsEnv.envBodyColor || gsEnv.primaryColor);
    setEnvVal('env_cardImage', gsEnv.envCardImage || '');
    setEnvVal('env_seal', gsEnv.envSeal || 'heart');
    setEnvVal('env_monogram', gsEnv.envMonogram || '');
    setEnvVal('intro_toText', gsEnv.introToText || '');
    setEnvVal('intro_btnText', gsEnv.introBtnText || '');
    document.getElementById('inputAudioUrl').value = appState.globalStyle.audioUrl;

    document.getElementById('groomBankName').value = appState.bankInfo.groom.bank;
    document.getElementById('groomBankAcc').value = appState.bankInfo.groom.acc;
    document.getElementById('groomBankOwner').value = appState.bankInfo.groom.owner;

    document.getElementById('brideBankName').value = appState.bankInfo.bride.bank;
    document.getElementById('brideBankAcc').value = appState.bankInfo.bride.acc;
    document.getElementById('brideBankOwner').value = appState.bankInfo.bride.owner;
}

// 6. CÁC HÀM CẬP NHẬT TRẠNG THÁI & GIAO DIỆN
function updateSectionStyle(secId, prop, value) {
    const sec = appState.sections.find(s => s.id === secId);
    if (!sec) return;
    sec[prop] = value;
    commitState('style:' + prop, { secId: secId });
}

function updateSectionField(secId, fieldKey, value, fromInspector = false) {
    const sec = appState.sections.find(s => s.id === secId);
    if (!sec) return;
    sec.data[fieldKey] = value;
    commitState('field:' + fieldKey, { secId: secId, skipInspector: !!fromInspector });
}

function updateWeddingDateTime(secId, isoVal) {
    const sec = appState.sections.find(s => s.id === secId);
    if (!sec) return;
    sec.data.weddingIsoDate = isoVal;
    const d = new Date(isoVal);
    if (!isNaN(d.getTime())) {
        sec.data.calendarTitle = `THÁNG ${d.getMonth() + 1} / ${d.getFullYear()}`;
    }
    commitState('datetime', { secId: secId });
    showToast("Đã cập nhật Lịch tháng & Đồng hồ đếm ngược!");
}

function updateAlbumPhoto(secId, index, url, skipInspector = true) {
    const sec = appState.sections.find(s => s.id === secId);
    if (!sec || !sec.data || !Array.isArray(sec.data.photos)) return;
    sec.data.photos[index] = url;
    commitState('photo:' + index, { secId: secId, skipInspector: skipInspector });
}

// Upload: có backend thì gửi lên máy chủ (lỗi -> base64), không thì base64 như cũ
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Không đọc được tệp.'));
        reader.readAsDataURL(file);
    });
}

const MAX_BASE64_BYTES = 1.5 * 1024 * 1024;

// ---------- Nén ảnh trước khi gửi ----------
const IMG_MAX_EDGE = 2000;
const IMG_SKIP_BYTES = 500 * 1024;
const IMG_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function loadImageForCompress(file) {
    if (typeof createImageBitmap === 'function') {
        return createImageBitmap(file, { imageOrientation: 'from-image' }).then(
            bmp => ({ src: bmp, w: bmp.width, h: bmp.height, done: () => { if (bmp.close) bmp.close(); } }),
            () => loadImageViaElement(file)
        );
    }
    return loadImageViaElement(file);
}

function loadImageViaElement(file) {
    return new Promise((resolve, reject) => {
        const u = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => resolve({ src: img, w: img.naturalWidth, h: img.naturalHeight, done: () => URL.revokeObjectURL(u) });
        img.onerror = () => { URL.revokeObjectURL(u); reject(new Error('decode')); };
        img.src = u;
    });
}

// Trả File mới (nhỏ hơn) hoặc đúng tệp gốc; không bao giờ ném lỗi
async function compressImageIfNeeded(file) {
    let img = null;
    try {
        if (!file || !IMG_EXT[file.type]) return file;
        img = await loadImageForCompress(file);
        const w = img.w, h = img.h;
        if (!w || !h) return file;
        const longEdge = Math.max(w, h);
        if (file.size <= IMG_SKIP_BYTES && longEdge <= IMG_MAX_EDGE) return file;
        const scale = longEdge > IMG_MAX_EDGE ? IMG_MAX_EDGE / longEdge : 1;
        const cw = Math.max(1, Math.round(w * scale));
        const ch = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) return file;
        const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        if (outType === 'image/jpeg') { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cw, ch); }
        ctx.drawImage(img.src, 0, 0, cw, ch);
        const blob = await new Promise(res => canvas.toBlob(res, outType, 0.85));
        if (!blob || blob.type !== outType || blob.size >= file.size) return file;
        const base = (file.name || 'anh').replace(/\.[^.]*$/, '') || 'anh';
        return new File([blob], base + '.' + IMG_EXT[outType], { type: outType, lastModified: Date.now() });
    } catch (e) {
        return file;
    } finally {
        if (img && img.done) { try { img.done(); } catch (e) { /* bỏ qua */ } }
    }
}

// ---------- Hiệu ứng tiến độ tải tệp ----------
let uploadIndicatorEl = null;
let uploadActive = 0;

function getUploadIndicator() {
    if (uploadIndicatorEl && document.body.contains(uploadIndicatorEl)) return uploadIndicatorEl;
    const el = document.createElement('div');
    el.className = 'upload-indicator';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<i class="fa-solid fa-spinner upload-spin"></i><span class="upload-indicator-text"></span>' +
        '<span class="upload-indicator-bar"><span class="upload-indicator-fill"></span></span>';
    document.body.appendChild(el);
    uploadIndicatorEl = el;
    return el;
}

// Bắt đầu hiệu ứng; trả {set(text, pct|null), end()}
function beginUploadUi(trigger, label) {
    const ind = getUploadIndicator();
    uploadActive++;
    ind.classList.add('is-visible');
    let lab = null;
    let status = null;
    let saved = [];
    let mini = false;
    try {
        lab = trigger && trigger.closest ? trigger.closest('label') : null;
        if (trigger && 'disabled' in trigger) trigger.disabled = true;
        if (lab) {
            lab.classList.add('is-uploading');
            mini = lab.textContent.trim() === '';
            status = document.createElement('span');
            status.className = mini ? 'upload-mini-overlay' : 'upload-status';
            if (!mini) {
                saved = Array.prototype.filter.call(lab.childNodes, n => n !== trigger);
                saved.forEach(n => lab.removeChild(n));
                lab.insertBefore(status, trigger && trigger.parentNode === lab ? trigger : lab.firstChild);
            } else {
                lab.appendChild(status);
            }
        }
    } catch (e) { /* label có thể đã bị gỡ */ }

    function set(text, pct) {
        const hasPct = typeof pct === 'number';
        const p = hasPct ? Math.round(pct * 100) : 0;
        try {
            ind.querySelector('.upload-indicator-text').textContent = text;
            ind.querySelector('.upload-indicator-fill').style.width = (hasPct ? p : 0) + '%';
            ind.classList.toggle('is-indeterminate', !hasPct);
            if (status) {
                status.innerHTML = mini
                    ? '<span class="upload-mini-text">' + (hasPct ? p + '%' : '') + '</span>'
                    : '<i class="fa-solid fa-spinner upload-spin"></i> ' + text;
                if (mini && !hasPct) status.innerHTML = '<i class="fa-solid fa-spinner upload-spin"></i>';
            }
        } catch (e) { /* bỏ qua */ }
    }
    set(label || 'Đang xử lý…', null);

    return {
        set,
        end() {
            uploadActive = Math.max(0, uploadActive - 1);
            if (uploadActive === 0 && uploadIndicatorEl) uploadIndicatorEl.classList.remove('is-visible');
            try {
                if (status && status.parentNode) status.parentNode.removeChild(status);
                if (lab) {
                    lab.classList.remove('is-uploading');
                    saved.forEach(n => lab.insertBefore(n, trigger && trigger.parentNode === lab ? trigger : null));
                }
                if (trigger && 'disabled' in trigger) trigger.disabled = false;
            } catch (e) { /* bỏ qua */ }
        }
    };
}

async function uploadOrDataUrl(file, opts) {
    const ui = beginUploadUi(opts && opts.trigger, 'Đang xử lý…');
    try {
        return await uploadOrDataUrlInner(file, ui, opts && opts.label);
    } finally {
        ui.end();
    }
}

async function uploadOrDataUrlInner(file, ui, label) {
    let apiFailed = false;
    let failStatus = 0;
    let failMsg = '';
    if (IMG_EXT[file.type]) {
        ui.set('Đang nén ảnh…', null);
        file = await compressImageIfNeeded(file);
    }
    if (window.api && window.api.available) {
        try {
            ui.set('Đang tải lên 0%', 0);
            const url = await window.api.uploadFile(file, p => ui.set('Đang tải lên ' + Math.round(p * 100) + '%', p), label);
            if (url) return url;
        } catch (err) {
            apiFailed = true;
            failStatus = (err && err.status) || 0;
            failMsg = (err && err.message) || '';
        }
    }
    // Fallback base64 làm phình state/nháp: từ chối tệp lớn (một toast duy nhất)
    if (apiFailed && (failStatus === 403 || failStatus === 507) && file.size <= MAX_BASE64_BYTES) {
        showToast(failStatus === 403
            ? 'Chưa có quyền tải lên máy chủ: nhập Mã tạo thiệp trong mục Xuất bản. Tạm nhúng ảnh vào thiệp.'
            : (failMsg || 'Máy chủ đã hết dung lượng lưu tệp.') + ' Tạm nhúng tệp vào thiệp.');
        return readFileAsDataUrl(file);
    }
    if (apiFailed && (failStatus === 403 || failStatus === 507) && file.size > MAX_BASE64_BYTES) {
        showToast((failStatus === 403
            ? 'Chưa có quyền tải lên máy chủ: nhập Mã tạo thiệp trong mục Xuất bản.'
            : (failMsg || 'Máy chủ đã hết dung lượng lưu tệp.')) + ' Tệp quá lớn để nhúng trực tiếp (tối đa 1,5MB).');
        const err = new Error('Tệp quá lớn');
        err.handled = true;
        throw err;
    }
    if (file.size > MAX_BASE64_BYTES) {
        showToast((apiFailed ? 'Tải lên máy chủ thất bại và tệp quá lớn để nhúng trực tiếp (tối đa 1,5MB). ' : 'Tệp quá lớn để nhúng trực tiếp (tối đa 1,5MB). ') + 'Hãy thử lại khi backend hoạt động hoặc nén nhỏ tệp trước.');
        const err = new Error('Tệp quá lớn');
        err.handled = true;
        throw err;
    }
    if (apiFailed) showToast('Tải lên máy chủ thất bại, dùng bản nhúng tạm trong thiệp.');
    return readFileAsDataUrl(file);
}

async function handleLocalImageUpload(event, secId, fieldKey) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const url = await uploadOrDataUrl(file, { trigger: event.target, label: secId });
        updateSectionField(secId, fieldKey, url, false);
        showToast("Đã tải ảnh lên thành công!");
    } catch (err) {
        if (!err || !err.handled) showToast("Không tải được ảnh, vui lòng thử lại.");
    } finally {
        event.target.value = '';
    }
}

// Hình nền toàn thiệp (G4)
async function handleGlobalBgUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const url = await uploadOrDataUrl(file, { trigger: event.target, label: 'nen' });
        updateGlobalStyle('bgImage', url);
        showToast("Đã đặt hình nền thiệp!");
    } catch (err) {
        if (!err || !err.handled) showToast("Không tải được ảnh, vui lòng thử lại.");
    } finally {
        event.target.value = '';
    }
}

// Ảnh nền riêng của một section (gọi từ inspector do render.js sinh)
async function handleSectionBgUpload(event, secId) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const url = await uploadOrDataUrl(file, { trigger: event.target, label: secId + '-nen' });
        setSectionDecor(secId, 'bgImage', url);
        showToast("Đã đặt ảnh nền cho phần này!");
    } catch (err) {
        if (!err || !err.handled) showToast("Không tải được ảnh, vui lòng thử lại.");
    } finally {
        event.target.value = '';
    }
}
// Ảnh toàn thiệp theo khoá cho phép (hiện chỉ ảnh thiệp trong phong bì)
async function handleGlobalImageUpload(event, key, label) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        if (['envCardImage'].indexOf(key) < 0) return;
        const url = await uploadOrDataUrl(file, { trigger: event.target, label: label || 'anh' });
        updateGlobalStyle(key, url);
        showToast("Đã đặt ảnh!");
    } catch (err) {
        if (!err || !err.handled) showToast("Không tải được ảnh, vui lòng thử lại.");
    } finally {
        event.target.value = '';
    }
}
window.handleGlobalImageUpload = handleGlobalImageUpload;
window.handleGlobalBgUpload = handleGlobalBgUpload;
window.handleSectionBgUpload = handleSectionBgUpload;

// secId tuỳ chọn: inspector luôn hiển thị section đang chọn nên mặc định lấy selectedSectionId
async function handleAlbumFileUpload(event, idx, secId) {
    const file = event.target.files[0];
    if (!file) return;
    const sid = secId || appState.selectedSectionId;
    try {
        const url = await uploadOrDataUrl(file, { trigger: event.target, label: sid });
        updateAlbumPhoto(sid, idx, url, false);
        showToast(`Đã cập nhật ảnh Album #${idx + 1}!`);
    } catch (err) {
        if (!err || !err.handled) showToast("Không tải được ảnh, vui lòng thử lại.");
    } finally {
        event.target.value = '';
    }
}

async function handleAudioFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
        const url = await uploadOrDataUrl(file, { trigger: event.target, label: 'nhac' });
        const input = document.getElementById('inputAudioUrl');
        if (input) input.value = url;
        updateGlobalStyle('audioUrl', url);
        showToast("Đã đổi nhạc nền thiệp cưới!");
    } catch (err) {
        if (!err || !err.handled) showToast("Không tải được nhạc, vui lòng thử lại.");
    } finally {
        event.target.value = '';
    }
}

// ---------- Cột phải: tab "Chỉnh sửa" / "Ảnh đã tải" (trạng thái UI, không commitState) ----------
let rightTab = 'edit';
let uploadsReqId = 0;

function setRightTab(tab) {
    rightTab = tab === 'uploads' ? 'uploads' : 'edit';
    const isUp = rightTab === 'uploads';
    const ins = document.getElementById('inspectorContent');
    const pnl = document.getElementById('uploadsPanel');
    if (ins) ins.classList.toggle('hidden', isUp);
    if (pnl) pnl.classList.toggle('hidden', !isUp);
    [['rightTabEdit', !isUp], ['rightTabUploads', isUp]].forEach(p => {
        const b = document.getElementById(p[0]);
        if (!b) return;
        b.classList.toggle('is-active', p[1]);
        b.setAttribute('aria-selected', p[1] ? 'true' : 'false');
    });
    if (isUp) refreshUploadsPanel();
}

function formatUploadSize(n) {
    n = Number(n) || 0;
    if (n >= 1048576) return (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
    if (n >= 1024) return Math.round(n / 1024) + ' KB';
    return n + ' B';
}

function uploadItemHtml(it) {
    const url = String(it.url || '');
    const name = String(it.name || url.split('/').pop() || '');
    const isAudio = /\.(mp3|m4a|ogg|wav)$/i.test(name);
    const isVideo = /\.mp4$/i.test(name);
    const thumb = (isAudio || isVideo)
        ? '<div class="upload-thumb upload-thumb-icon"><i class="fa-solid ' + (isAudio ? 'fa-music' : 'fa-film') + '"></i></div>'
        : '<img class="upload-thumb" loading="lazy" alt="" src="' + escapeHtml(url) + '">';
    const size = it.size ? ' · ' + formatUploadSize(it.size) : '';
    return '<div class="upload-item">' + thumb +
        '<div class="upload-name" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</div>' +
        '<div class="upload-meta">' + escapeHtml(size.replace(/^ · /, '')) + '</div>' +
        '<div class="upload-actions">' +
        '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener" class="upload-btn" title="Mở trong tab mới" aria-label="Mở trong tab mới"><i class="fa-solid fa-up-right-from-square"></i></a>' +
        '<button type="button" class="upload-btn" data-copy-url="' + escapeHtml(url) + '" title="Sao chép đường dẫn" aria-label="Sao chép đường dẫn"><i class="fa-regular fa-copy"></i></button>' +
        '</div></div>';
}

function copyUploadUrl(url) {
    const full = /^https?:/i.test(url) ? url : location.origin + url;
    const done = () => showToast('Đã sao chép đường dẫn!');
    const fail = () => showToast('Không sao chép được, hãy sao chép thủ công.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(full).then(done, fail);
    else fail();
}

async function refreshUploadsPanel() {
    const pnl = document.getElementById('uploadsPanel');
    if (!pnl || rightTab !== 'uploads') return;
    const api = window.api;
    const reqId = ++uploadsReqId;
    const refreshBtn = '<button type="button" class="upload-refresh" onclick="refreshUploadsPanel()"><i class="fa-solid fa-rotate"></i> Làm mới</button>';
    const grid = items => '<div class="upload-grid">' + items.map(uploadItemHtml).join('') + '</div>';
    const note = t => '<p class="text-[11px] text-slate-500 leading-relaxed">' + t + '</p>';
    let html;
    if (!api || !api.available) {
        html = note('Chưa kết nối máy chủ nên chưa có thư viện ảnh. Ảnh đang được nhúng trực tiếp vào thiệp.');
    } else {
        const card = api.currentCard();
        if (!card) {
            const pend = api.getPendingUploads().map(u => ({ url: u, name: u.split('/').pop() }));
            html = note('Xuất bản thiệp để lưu danh sách ảnh theo thiệp.') +
                (pend.length ? '<div class="mt-3">' + grid(pend) + '</div>' : note('<br>Chưa có ảnh nào được tải lên.'));
        } else {
            pnl.innerHTML = note('<i class="fa-solid fa-spinner upload-spin"></i> Đang tải danh sách ảnh…');
            try {
                const j = await api.listUploads(card.slug);
                if (reqId !== uploadsReqId) return;
                const items = (j && Array.isArray(j.items)) ? j.items : [];
                html = '<div class="flex items-center justify-between mb-3"><span class="font-semibold text-slate-700">' +
                    items.length + ' tệp của thiệp ' + escapeHtml(card.slug) + '</span>' + refreshBtn + '</div>' +
                    (items.length ? grid(items) : note('Chưa có ảnh nào được lưu cho thiệp này.'));
            } catch (e) {
                if (reqId !== uploadsReqId) return;
                html = note(escapeHtml((e && e.message) || 'Không tải được danh sách ảnh.')) + '<div class="mt-2">' + refreshBtn + '</div>';
            }
        }
    }
    if (reqId !== uploadsReqId || rightTab !== 'uploads') return;
    pnl.innerHTML = html;
}

window.setRightTab = setRightTab;
window.refreshUploadsPanel = refreshUploadsPanel;
window.addEventListener('uploads:changed', () => { if (rightTab === 'uploads') refreshUploadsPanel(); });
window.addEventListener('api:ready', () => { if (rightTab === 'uploads') refreshUploadsPanel(); });
document.addEventListener('click', e => {
    const b = e.target && e.target.closest ? e.target.closest('[data-copy-url]') : null;
    if (b) copyUploadUrl(b.getAttribute('data-copy-url') || '');
});

function updateGlobalStyle(key, val) {
    // Khoá G5: chỉ nhận giá trị thuộc whitelist
    if (window.G5_OPTIONS && G5_OPTIONS[key] && G5_OPTIONS[key].indexOf(val) < 0) return;
    appState.globalStyle[key] = val;
    if (key === 'audioUrl') {
        const audio = document.getElementById('weddingAudio');
        audio.src = safeAudioUrl(val);
    }
    if (key === 'fallingEffect') {
        initFallingEffect();
    }
    commitState('global:' + key, { skipInspector: true, mergeKey: 'global:' + key });
}

function selectPresetAudio(url) {
    document.getElementById('inputAudioUrl').value = url;
    updateGlobalStyle('audioUrl', url);
    showToast("Đã đổi nhạc nền thiệp cưới!");
}

function updateBankInfo(side, field, value) {
    appState.bankInfo[side][field] = value;
    commitState('bank:' + side + ':' + field, { skipInspector: true, mergeKey: 'bank:' + side + ':' + field });
}

// 8. CHẾ ĐỘ XEM THỰC TẾ (PREVIEW) & KHÔI PHỤC MẶC ĐỊNH
function setPreviewMode(isPreview) {
    appState.isPreviewMode = isPreview;
    const left = document.getElementById('leftSidebar');
    const right = document.getElementById('rightSidebar');
    const card = document.getElementById('weddingCardFrame');
    const btnEdit = document.getElementById('btnModeEdit');
    const btnPreview = document.getElementById('btnModePreview');
    const btnReplay = document.getElementById('btnReplayIntro');
    if (btnReplay) {
        btnReplay.classList.toggle('hidden', !isPreview);
        btnReplay.classList.toggle('flex', !!isPreview);
    }

    if (isPreview) {
        left.classList.add('hidden');
        right.classList.add('hidden');
        card.classList.remove('editor-mode');
        btnPreview.className = "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 bg-violet-600 text-white shadow transition";
        btnEdit.className = "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 text-slate-300 hover:text-white transition";
    } else {
        left.classList.remove('hidden');
        right.classList.remove('hidden');
        card.classList.add('editor-mode');
        btnEdit.className = "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 bg-violet-600 text-white shadow transition";
        btnPreview.className = "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 text-slate-300 hover:text-white transition";
    }

    // Về Thiết kế: dừng nhạc nền đang phát (toggleAudioPlayback đồng bộ nút/icon nhạc)
    if (!isPreview) {
        const audio = document.getElementById('weddingAudio');
        if (audio && !audio.paused && typeof toggleAudioPlayback === 'function') toggleAudioPlayback();
    }

    // Render canvas SAU khi sidebar/editor-mode đã đổi để intro đo đúng khung; cũng để fieldAttr bỏ/bật contenteditable
    renderWeddingCanvas();
}

function replayInviteIntro() {
    if (window.CardRuntime && typeof CardRuntime.replayIntro === 'function') CardRuntime.replayIntro();
}

function resetToDefault() {
    // replaceState: migrate + đẩy vào lịch sử undo + đồng bộ UI + autosave
    replaceState(JSON.parse(JSON.stringify(DEFAULT_STATE)));
    showToast("Đã khôi phục về mẫu gốc MM03!");
}

// 9. TRÌNH XUẤT FILE HTML ĐỘC LẬP (1-CLICK EXPORT STANDALONE WEB PAGE)
// Export = CDN + inline css/app.css + js/state.js + api.js + runtime.js + sections/*.js + render.js
// + window.__CARD_STATE__ + bootstrap (renderCardHtml mode 'export' rồi CardRuntime.init).
// Suy từ registry: mỗi type [a-z]+ tương ứng js/sections/<type>.js
function getExportSectionFiles() {
    return Object.keys(window.SECTION_TYPES || {}).filter(t => /^[a-z]+$/.test(t));
}

function _exportEsc(s) {
    if (typeof escapeHtml === 'function') return escapeHtml(s);
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Thoát chuỗi đóng thẻ trong nội dung inline
function _exportInlineJs(code) {
    return code.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
}
function _exportInlineCss(code) {
    return code.replace(/<\/style/gi, '<\\/style');
}
// JSON an toàn khi nhúng trong <script>. Dùng mã ký tự (không viết thẳng U+2028/U+2029 vào mã nguồn).
function _exportJson(obj) {
    const ls = new RegExp(String.fromCharCode(0x2028), 'g');
    const ps = new RegExp(String.fromCharCode(0x2029), 'g');
    return JSON.stringify(obj)
        .replace(/</g, '\\' + 'u003c')
        .replace(ls, '\\' + 'u2028')
        .replace(ps, '\\' + 'u2029');
}

// AD-003: http -> fetch; file:// hoặc fetch lỗi -> window.__EXPORT_SOURCES (js/export_bundle.js)
async function getExportSource(path) {
    if (location.protocol !== 'file:') {
        try {
            const res = await fetch(path, { cache: 'no-store' });
            if (res.ok) return await res.text();
        } catch (e) { /* rơi xuống bundle */ }
    }
    const src = window.__EXPORT_SOURCES && window.__EXPORT_SOURCES[path];
    if (typeof src === 'string') {
        if (!window.__exportBundleWarned) {
            window.__exportBundleWarned = true;
            console.warn('Export dùng js/export_bundle.js — nếu vừa sửa JS/CSS hãy chạy py tools/build_export_bundle.py');
        }
        return src;
    }
    const err = new Error('Thiếu nguồn export: ' + path);
    err.exportSourceMissing = true;
    throw err;
}

async function openExportModal() {
    if (typeof renderCardHtml !== 'function') {
        showToast('Chưa sẵn sàng xuất thiệp (thiếu renderCardHtml).');
        return;
    }

    const jsFiles = ['js/state.js', 'js/api.js', 'js/runtime.js']
        .concat(getExportSectionFiles().map(n => 'js/sections/' + n + '.js'))
        .concat(['js/render.js']);

    let css, scripts;
    try {
        css = await getExportSource('css/app.css');
        scripts = await Promise.all(jsFiles.map(getExportSource));
    } catch (err) {
        if (err && err.exportSourceMissing) {
            showToast('Thiếu js/export_bundle.js — chạy: py tools/build_export_bundle.py');
        } else {
            showToast('Không xuất được HTML: ' + (err && err.message ? err.message : err));
        }
        return;
    }

    // Bản sao state sạch dấu vết editor
    const state = JSON.parse(JSON.stringify(appState));
    delete state.selectedSectionId;
    state.isPreviewMode = false;

    const g = state.globalStyle || {};
    const titleName = typeof cardPageTitle === 'function' ? cardPageTitle(state) : '';
    const pageTitle = titleName ? `Thiệp Cưới ${titleName}` : 'Thiệp Cưới Online';
    const audioSrc = (typeof safeAudioUrl === 'function' ? safeAudioUrl(g.audioUrl) : (typeof safeUrl === 'function' ? safeUrl(g.audioUrl) : g.audioUrl)) || '';

    const inlineScripts = scripts.map(code => `<script>\n${_exportInlineJs(code)}\n<\/script>`).join('\n');

    const bootstrap = `(function () {
    var s = window.__CARD_STATE__;
    if (typeof migrate === 'function') { s = migrate(s) || s; }
    appState = s;
    window.__CARD_STATE__ = s;
    var vp = document.getElementById('sectionsViewport');
    var ctx = { appState: s, mode: 'export', guestName: '', slug: null };
    if (typeof renderCardHtml === 'function') { vp.innerHTML = renderCardHtml(s, ctx); }
    if (window.CardRuntime) { window.CardRuntime.init(vp, s, ctx); }
})();`;

    const standaloneHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${_exportEsc(pageTitle)}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Dancing+Script:wght@500;700&family=Great+Vibes&family=Montserrat:wght@300;400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Open+Sans:wght@400;600;700&family=Oswald:wght@400;600&family=Philosopher:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto+Slab:wght@400;600&family=Tinos:ital,wght@0,400;0,700;1,400&family=Alex+Brush&family=Allura&family=Beau+Rivage&family=Bonheur+Royale&family=Charm:wght@400;700&family=Corinthia:wght@400;700&family=Ephesis&family=Hurricane&family=Imperial+Script&family=Lobster&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Moon+Dance&family=Pacifico&family=Patrick+Hand&family=Pinyon+Script&family=Playball&family=Prata&family=Rokkitt:wght@400;600;700&family=Spectral:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
    <style>
${_exportInlineCss(css)}
    </style>
    <style>
        body { background-color: #e2e8f0; margin: 0; padding: 0; }
    </style>
</head>
<body class="min-h-screen flex justify-center">
    <div id="weddingCardFrame" class="w-full max-w-[430px] min-h-screen shadow-2xl relative overflow-hidden ${_exportEsc(cardDecorClasses(g))}" style="background-color: ${_exportEsc(g.bgColor)}; color: ${_exportEsc(g.textColor)}; font-family: ${safeFont(g.bodyFont, DEFAULT_STATE.globalStyle.bodyFont)}; ${_exportEsc(cardBgStyleText(g))};">
        <div id="fallingContainer" class="inset-0 pointer-events-none overflow-hidden sticky top-0 h-0 z-40"></div>

        <button id="floatingMusicBtn" onclick="toggleAudioPlayback()" class="fixed bottom-5 left-5 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white" style="background-color: ${_exportEsc(g.primaryColor)};" title="Bật/Tắt nhạc cưới">
            <i id="musicIcon" class="fa-solid fa-music text-sm"></i>
        </button>
        <audio id="weddingAudio" loop preload="auto" src="${_exportEsc(audioSrc)}"></audio>

        <div id="sectionsViewport"></div>

        <!-- Popup QR Mừng Cưới -->
        <div id="giftModal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                <button onclick="closeGiftModal()" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600" aria-label="Đóng">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div id="giftModalBadge" class="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white shadow" style="background-color: ${_exportEsc(g.primaryColor)};">
                    <i class="fa-solid fa-gift text-lg"></i>
                </div>
                <h4 id="giftModalTitle" class="text-lg font-bold text-slate-800 mb-1">Gửi Mừng Cưới</h4>
                <p class="text-xs text-slate-500 mb-4">Quét mã QR ngân hàng bên dưới để gửi lời chúc phúc</p>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 inline-block mb-3">
                    <img id="giftModalQrImg" src="" alt="VietQR" class="w-48 h-48 object-contain mx-auto rounded-lg" onerror="this.src='https://placehold.co/250x250/f8fafc/64748b?text=VietQR'">
                </div>
                <div class="text-xs space-y-1 text-slate-700 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
                    <p>Ngân hàng: <strong id="giftModalBank"></strong></p>
                    <p>Số TK: <strong id="giftModalAcc" class="text-sm tracking-wider"></strong></p>
                    <p>Chủ TK: <strong id="giftModalOwner"></strong></p>
                </div>
                <button id="giftModalCopyBtn" onclick="copyBankAccount()" class="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow transition" style="background-color: ${_exportEsc(g.primaryColor)};">
                    <i class="fa-regular fa-copy mr-1"></i> Sao chép Số Tài Khoản
                </button>
            </div>
        </div>
    </div>

    <!-- Toast -->
    <div id="toastNotification" class="fixed bottom-5 right-5 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700">
        <i class="fa-solid fa-circle-check text-emerald-400"></i>
        <span id="toastMessage"></span>
    </div>

    <script>window.__CARD_STATE__ = ${_exportJson(state)};<\/script>
${inlineScripts}
    <script>
${bootstrap}
    <\/script>
</body>
</html>`;

    document.getElementById('exportedHtmlCode').value = standaloneHtml;
    document.getElementById('exportModal').classList.remove('hidden');
}

function closeExportModal() {
    document.getElementById('exportModal').classList.add('hidden');
}

function copyExportedHtml() {
    const textarea = document.getElementById('exportedHtmlCode');
    textarea.select();
    document.execCommand('copy');
    showToast("Đã sao chép toàn bộ mã HTML!");
}

function downloadExportedHtml() {
    const htmlContent = document.getElementById('exportedHtmlCode').value;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thiep-cuoi-online.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Đã tải file thiep-cuoi-online.html về máy!");
}
