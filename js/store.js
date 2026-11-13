// T6: commitState (snapshot undo/redo, autosave nháp), nhập/xuất JSON, banner khôi phục nháp.
// Mọi thay đổi state đi qua commitState (Điều 5). Nạp state từ ngoài luôn qua migrate().
(function () {
    const MAX_UNDO = 50;
    const MERGE_MS = 800;
    const SAVE_DEBOUNCE_MS = 500;
    const DRAFT_KEY = 'thiep:draft';
    const DRAFT_AT_KEY = 'thiep:draft:savedAt';

    let undoStack = [];
    let redoStack = [];
    let lastSnap = null;      // snapshot của state sau lần commit gần nhất
    let lastKey = null;
    let lastTime = 0;
    let saveTimer = null;
    let quotaWarned = false;
    let bannerEl = null;

    function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lsRemove(k) { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } }

    // Snapshot không gồm cờ giao diện (chọn section, xem thực tế) để undo không nhảy lựa chọn
    function snap() {
        const c = Object.assign({}, appState);
        delete c.selectedSectionId;
        delete c.isPreviewMode;
        return JSON.stringify(c);
    }

    function isValidState(o) {
        return !!o && typeof o === 'object' && !Array.isArray(o) && Array.isArray(o.sections);
    }

    // ---- Autosave ----
    function saveDraftNow() {
        if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
        try {
            if (!isValidState(appState)) return;
            const c = Object.assign({}, appState);
            delete c.isPreviewMode;
            localStorage.setItem(DRAFT_KEY, JSON.stringify(c));
            localStorage.setItem(DRAFT_AT_KEY, String(Date.now()));
        } catch (e) {
            if (!quotaWarned) {
                quotaWarned = true;
                if (typeof showToast === 'function') showToast('Không lưu được bản nháp tự động (hết dung lượng trình duyệt).');
            }
        }
    }

    function scheduleSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveDraftNow, SAVE_DEBOUNCE_MS);
    }

    // ---- Toolbar ----
    function updateToolbarState() {
        const u = document.getElementById('btnUndo');
        const r = document.getElementById('btnRedo');
        if (u) { u.disabled = undoStack.length === 0; u.classList.toggle('opacity-40', undoStack.length === 0); }
        if (r) { r.disabled = redoStack.length === 0; r.classList.toggle('opacity-40', redoStack.length === 0); }
    }

    function removeBanner() {
        if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl);
        bannerEl = null;
    }

    // Đồng bộ UI ngoài canvas sau khi thay toàn bộ state
    function refreshAfterReplace() {
        if (typeof syncLeftControlsWithState === 'function') syncLeftControlsWithState();
        const audio = document.getElementById('weddingAudio');
        if (audio && appState.globalStyle) audio.src = appState.globalStyle.audioUrl || '';
        renderAll();
        if (typeof initFallingEffect === 'function') initFallingEffect();
        updateToolbarState();
    }

    // Thay toàn bộ state (khôi phục nháp, nhập JSON, reset): qua migrate, có thể hoàn tác
    function replaceState(obj) {
        if (!isValidState(obj)) return false;
        const keepPreview = !!appState.isPreviewMode;
        const next = migrate(obj);
        next.isPreviewMode = keepPreview;
        if (lastSnap !== null) {
            undoStack.push(lastSnap);
            if (undoStack.length > MAX_UNDO) undoStack.shift();
        }
        redoStack = [];
        appState = next;
        lastSnap = snap();
        lastKey = null;
        removeBanner();
        scheduleSave();
        refreshAfterReplace();
        return true;
    }

    function applySnapshot(json) {
        let o;
        try { o = JSON.parse(json); } catch (e) { return false; }
        if (!isValidState(o)) return false;
        const keepPreview = !!appState.isPreviewMode;
        const keepSel = appState.selectedSectionId;
        const next = migrate(o);
        next.isPreviewMode = keepPreview;
        if (next.sections.some(s => s.id === keepSel)) next.selectedSectionId = keepSel;
        appState = next;
        lastSnap = snap();
        lastKey = null;
        scheduleSave();
        refreshAfterReplace();
        return true;
    }

    function commitState(label, opts) {
        opts = opts || {};
        const cur = snap();
        if (lastSnap !== null && cur !== lastSnap) {
            const key = String(label || '') + '|' + String(opts.secId || '');
            const now = Date.now();
            const merge = !opts.noMerge && key === lastKey && (now - lastTime) < MERGE_MS && undoStack.length > 0;
            if (!merge) {
                undoStack.push(lastSnap);
                if (undoStack.length > MAX_UNDO) undoStack.shift();
            }
            redoStack = [];
            lastKey = key;
            lastTime = now;
        }
        lastSnap = cur;
        if (bannerEl) removeBanner();
        scheduleSave();
        if (opts.skipInspector) {
            if (typeof renderSectionListSidebar === 'function') renderSectionListSidebar();
            renderWeddingCanvas();
        } else {
            renderAll();
        }
        updateToolbarState();
    }

    function undoState() {
        if (!undoStack.length) { if (typeof showToast === 'function') showToast('Không còn gì để hoàn tác.'); return; }
        const prev = undoStack.pop();
        redoStack.push(lastSnap);
        if (!applySnapshot(prev)) { undoStack = []; updateToolbarState(); }
    }

    function redoState() {
        if (!redoStack.length) { if (typeof showToast === 'function') showToast('Không còn gì để làm lại.'); return; }
        const next = redoStack.pop();
        undoStack.push(lastSnap);
        if (!applySnapshot(next)) { redoStack = []; updateToolbarState(); }
    }

    // ---- Xuất / Nhập JSON ----
    function exportJson() {
        const c = JSON.parse(JSON.stringify(appState));
        delete c.selectedSectionId;
        delete c.isPreviewMode;
        const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'thiep-cuoi.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (typeof showToast === 'function') showToast('Đã xuất tệp thiep-cuoi.json!');
    }

    function importJsonFile(event) {
        const input = event.target;
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            let obj;
            try {
                obj = JSON.parse(String(e.target.result));
            } catch (err) {
                showToast('Tệp JSON không hợp lệ, không đọc được nội dung.');
                input.value = '';
                return;
            }
            if (!replaceState(obj)) {
                showToast('Tệp JSON không phải dữ liệu thiệp (thiếu danh sách sections).');
            } else {
                showToast('Đã nhập thiệp từ tệp JSON!');
            }
            input.value = '';
        };
        reader.onerror = function () {
            showToast('Không đọc được tệp đã chọn.');
            input.value = '';
        };
        reader.readAsText(file);
    }

    // ---- Banner khôi phục nháp ----
    function readDraft() {
        const raw = lsGet(DRAFT_KEY);
        if (raw === null) return null;
        try {
            const o = JSON.parse(raw);
            if (isValidState(o)) return o;
        } catch (e) { /* rơi xuống xoá */ }
        lsRemove(DRAFT_KEY);
        lsRemove(DRAFT_AT_KEY);
        return null;
    }

    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    function showDraftBanner(draft) {
        const host = document.getElementById('editorToolbar');
        if (!host) return;
        const t = new Date(Number(lsGet(DRAFT_AT_KEY)) || Date.now());
        const hhmm = pad2(t.getHours()) + ':' + pad2(t.getMinutes());
        const span = document.createElement('span');
        span.className = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-amber-100 text-amber-900 border border-amber-300';
        const msg = document.createElement('span');
        msg.textContent = 'Có bản nháp lúc ' + hhmm + ' —';
        const bRestore = document.createElement('button');
        bRestore.type = 'button';
        bRestore.className = 'font-semibold underline';
        bRestore.textContent = 'Khôi phục';
        bRestore.onclick = function () {
            if (replaceState(draft)) showToast('Đã khôi phục bản nháp!');
            else { removeBanner(); showToast('Bản nháp không hợp lệ.'); }
        };
        const bSkip = document.createElement('button');
        bSkip.type = 'button';
        bSkip.className = 'underline text-amber-700';
        bSkip.textContent = 'Bỏ qua';
        bSkip.onclick = function () {
            lsRemove(DRAFT_KEY);
            lsRemove(DRAFT_AT_KEY);
            removeBanner();
        };
        span.appendChild(msg);
        span.appendChild(bRestore);
        span.appendChild(bSkip);
        host.insertBefore(span, host.firstChild);
        bannerEl = span;
    }

    function makeBtn(id, icon, text, title, onclick) {
        const b = document.createElement('button');
        b.type = 'button';
        if (id) b.id = id;
        b.title = title;
        b.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1.5 disabled:cursor-not-allowed';
        const i = document.createElement('i');
        i.className = 'fa-solid ' + icon;
        b.appendChild(i);
        b.appendChild(document.createTextNode(' ' + text));
        b.onclick = onclick;
        return b;
    }

    // Gọi một lần sau lần renderAll đầu tiên (state đã migrate)
    function initStore() {
        lastSnap = snap();
        undoStack = [];
        redoStack = [];

        const host = document.getElementById('editorToolbar');
        if (host && !document.getElementById('btnUndo')) {
            host.appendChild(makeBtn('btnUndo', 'fa-rotate-left', 'Hoàn tác', 'Hoàn tác (Ctrl+Z)', undoState));
            host.appendChild(makeBtn('btnRedo', 'fa-rotate-right', 'Làm lại', 'Làm lại (Ctrl+Y)', redoState));
            host.appendChild(makeBtn('btnExportJson', 'fa-file-export', 'Xuất JSON', 'Tải dữ liệu thiệp về dạng JSON', exportJson));
            const file = document.createElement('input');
            file.type = 'file';
            file.accept = '.json,application/json';
            file.className = 'hidden';
            file.id = 'importJsonInput';
            file.onchange = importJsonFile;
            host.appendChild(file);
            host.appendChild(makeBtn('btnImportJson', 'fa-file-import', 'Nhập JSON', 'Nạp thiệp từ tệp JSON', function () { file.click(); }));
        }
        updateToolbarState();

        const draft = readDraft();
        if (draft) showDraftBanner(draft);
    }

    document.addEventListener('keydown', function (e) {
        if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
        const t = e.target;
        if (t && t.closest && t.closest('input, textarea, select, [contenteditable]')) return;
        const k = String(e.key || '').toLowerCase();
        if (k === 'z' && !e.shiftKey) { e.preventDefault(); undoState(); }
        else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redoState(); }
    });

    // Lưu ngay khi rời trang để lần mở sau còn bản nháp mới nhất
    window.addEventListener('pagehide', function () { if (saveTimer) saveDraftNow(); });
    window.addEventListener('beforeunload', function () { if (saveTimer) saveDraftNow(); });

    window.commitState = commitState;
    window.replaceState = replaceState;
    window.undoState = undoState;
    window.redoState = redoState;
    window.exportJson = exportJson;
    window.importJsonFile = importJsonFile;
    window.initStore = initStore;
})();
