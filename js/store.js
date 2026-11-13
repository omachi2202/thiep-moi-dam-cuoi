// T6: commitState (snapshot undo/redo, autosave nháp), nhập/xuất JSON, banner khôi phục nháp.
// Mọi thay đổi state đi qua commitState (Điều 5). Nạp state từ ngoài luôn qua migrate().
(function () {
    const MAX_UNDO = 50;
    const MERGE_MS = 800;
    const SAVE_DEBOUNCE_MS = 500;
    const DRAFT_KEY = 'thiep:draft';
    const DRAFT_AT_KEY = 'thiep:draft:savedAt';
    const PREV_KEY = 'thiep:draft:prev';
    const PREV_AT_KEY = 'thiep:draft:prev:savedAt';
    const MAX_UNDO_CHARS = 30 * 1024 * 1024;
    const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
    const MAX_SECTIONS = 100;
    let bannerMode = '';      // '' | 'draft' | 'prev'

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
            localStorage.setItem(DRAFT_AT_KEY, String(Date.now()));
            localStorage.setItem(DRAFT_KEY, JSON.stringify(c));
            quotaWarned = false;
        } catch (e) {
            // Xoá cả hai khoá để không để lại nháp lệch (savedAt mới, state cũ)
            lsRemove(DRAFT_KEY);
            lsRemove(DRAFT_AT_KEY);
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
        bannerMode = '';
    }

    function pushUndo(s) {
        undoStack.push(s);
        if (undoStack.length > MAX_UNDO) undoStack.shift();
        let total = 0;
        undoStack.forEach(x => { total += x.length; });
        while (total > MAX_UNDO_CHARS && undoStack.length > 0) {
            total -= undoStack.shift().length;
        }
    }

    // Người dùng sửa khi banner nháp còn đó: giữ nháp cũ sang khoá prev trước khi autosave ghi đè
    function keepPrevDraft() {
        if (bannerMode !== 'draft') return;
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw !== null) {
                localStorage.setItem(PREV_AT_KEY, localStorage.getItem(DRAFT_AT_KEY) || String(Date.now()));
                localStorage.setItem(PREV_KEY, raw);
            }
        } catch (e) { /* bỏ qua: không giữ được thì thôi */ }
        const draftRaw = lsGet(PREV_KEY);
        removeBanner();
        if (draftRaw !== null) showDraftBanner(readPrev(), 'prev');
    }

    // Đồng bộ UI ngoài canvas sau khi thay toàn bộ state
    function refreshAfterReplace() {
        if (typeof syncLeftControlsWithState === 'function') syncLeftControlsWithState();
        const audio = document.getElementById('weddingAudio');
        if (audio && appState.globalStyle) {
            audio.src = (typeof safeAudioUrl === 'function' ? safeAudioUrl(appState.globalStyle.audioUrl) : (typeof safeUrl === 'function' ? safeUrl(appState.globalStyle.audioUrl) : appState.globalStyle.audioUrl)) || '';
        }
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
        keepPrevDraft();
        if (lastSnap !== null) pushUndo(lastSnap);
        redoStack = [];
        appState = next;
        lastSnap = snap();
        lastKey = null;
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
            const key = String(label || '') + '|' + String(opts.secId || '') + '|' + String(opts.mergeKey || '');
            const now = Date.now();
            // Chỉ gộp khi có secId (sửa trường/kiểu của một section); thao tác cấu trúc không bao giờ gộp
            const merge = !!(opts.mergeKey || opts.secId) &&!opts.noMerge && key === lastKey && (now - lastTime) < MERGE_MS && undoStack.length > 0;
            if (!merge) pushUndo(lastSnap);
            redoStack = [];
            lastKey = key;
            lastTime = now;
        }
        lastSnap = cur;
        keepPrevDraft();
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
        if (!applySnapshot(prev)) { undoStack = []; updateToolbarState(); showToast('Không hoàn tác được: dữ liệu lịch sử bị lỗi.'); }
    }

    function redoState() {
        if (!redoStack.length) { if (typeof showToast === 'function') showToast('Không còn gì để làm lại.'); return; }
        const next = redoStack.pop();
        pushUndo(lastSnap);
        if (!applySnapshot(next)) { redoStack = []; updateToolbarState(); showToast('Không làm lại được: dữ liệu lịch sử bị lỗi.'); }
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
        if (file.size > MAX_IMPORT_BYTES) {
            showToast('Tệp JSON quá lớn (tối đa 10MB).');
            input.value = '';
            return;
        }
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
            if (isValidState(obj) && (obj.sections.length < 1 || obj.sections.length > MAX_SECTIONS)) {
                showToast('Số phần (sections) trong tệp phải từ 1 đến ' + MAX_SECTIONS + '.');
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

    function readPrev() {
        const raw = lsGet(PREV_KEY);
        if (raw === null) return null;
        try {
            const o = JSON.parse(raw);
            if (isValidState(o)) return o;
        } catch (e) { /* rơi xuống xoá */ }
        lsRemove(PREV_KEY);
        lsRemove(PREV_AT_KEY);
        return null;
    }

    // mode: 'draft' (nháp vừa phát hiện) hoặc 'prev' (nháp cũ đã được giữ sang khoá prev)
    function showDraftBanner(draft, mode) {
        const host = document.getElementById('editorToolbar');
        if (!host || !draft) return;
        const isPrev = mode === 'prev';
        const t = new Date(Number(lsGet(isPrev ? PREV_AT_KEY : DRAFT_AT_KEY)) || Date.now());
        const hhmm = pad2(t.getHours()) + ':' + pad2(t.getMinutes());
        const span = document.createElement('span');
        span.className = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap max-w-[260px] shrink-0 bg-amber-100 text-amber-900 border border-amber-300';
        span.title = isPrev
            ? 'Bản nháp trước (' + hhmm + ') đã được giữ'
            : 'Có bản nháp lúc ' + hhmm;
        const msg = document.createElement('span');
        msg.className = 'flex items-center gap-1.5';
        const ic = document.createElement('i');
        ic.className = 'fa-solid fa-clock-rotate-left';
        msg.appendChild(ic);
        msg.appendChild(document.createTextNode('Có bản nháp'));
        const bRestore = document.createElement('button');
        bRestore.type = 'button';
        bRestore.className = 'font-semibold underline';
        bRestore.textContent = 'Khôi phục';
        bRestore.onclick = function () {
            removeBanner(); // trước replaceState để không bị giữ-prev lần nữa
            if (isPrev) { lsRemove(PREV_KEY); lsRemove(PREV_AT_KEY); }
            if (replaceState(draft)) showToast('Đã khôi phục bản nháp!');
            else showToast('Bản nháp không hợp lệ.');
        };
        const bSkip = document.createElement('button');
        bSkip.type = 'button';
        bSkip.className = 'underline text-amber-700';
        bSkip.textContent = 'Bỏ qua';
        bSkip.onclick = function () {
            if (!isPrev) { lsRemove(DRAFT_KEY); lsRemove(DRAFT_AT_KEY); }
            lsRemove(PREV_KEY);
            lsRemove(PREV_AT_KEY);
            removeBanner();
        };
        span.appendChild(msg);
        span.appendChild(bRestore);
        span.appendChild(bSkip);
        host.insertBefore(span, host.firstChild);
        bannerEl = span;
        bannerMode = isPrev ? 'prev' : 'draft';
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
        if (draft) showDraftBanner(draft, 'draft');
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
