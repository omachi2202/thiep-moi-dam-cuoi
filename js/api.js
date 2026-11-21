// Client API (T8): gọi backend FastAPI, quản lý edit key, modal Xuất bản.
(function () {
    const SLUG_RE = /^[a-z0-9-]{3,50}$/;
    const KEY_PREFIX = 'thiep:editKey:';
    const LAST_SLUG = 'thiep:lastSlug';
    const CODE_KEY = 'thiep:createCode';
    const QR_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

    const QR_SRI = 'sha512-CNgIRecGo7nphbeZ04Sc13ka07paqdeTu0WR1IM4kNcpmBAUSHSQX0FslNhTDadL4O5SAGapGt4FodqL8My0mA==';

    const NO_BACKEND = 'Chưa kết nối máy chủ. Hãy chạy backend và mở trang qua http://localhost:8000.';

    function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } }

    function toast(msg) {
        if (typeof window.showToast === 'function') window.showToast(msg);
    }

    // Đọc phản hồi; lỗi -> Error(detail tiếng Việt)
    async function request(url, opts, timeoutMs) {
        if (!api.available) throw new Error(NO_BACKEND);
        const ctrl = new AbortController();
        let timedOut = false;
        const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, timeoutMs || 30000);
        let res;
        let body = null;
        try {
            try {
                res = await fetch(url, Object.assign({}, opts, { signal: ctrl.signal }));
            } catch (e) {
                if (timedOut) throw new Error('Máy chủ phản hồi quá chậm, vui lòng thử lại.');
                throw new Error('Không kết nối được máy chủ. Vui lòng thử lại.');
            }
            try { body = await res.json(); } catch (e) {
                if (timedOut) throw new Error('Máy chủ phản hồi quá chậm, vui lòng thử lại.');
                body = null;
            }
        } finally {
            clearTimeout(timer);
        }
        if (!res.ok) {
            let msg = body && body.detail;
            if (Array.isArray(msg)) msg = 'Dữ liệu gửi lên không hợp lệ.';
            const err = new Error(msg || ('Lỗi máy chủ (' + res.status + ').'));
            err.status = res.status;
            throw err;
        }
        return body;
    }

    function jsonOpts(method, body, headers) {
        return {
            method,
            headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}),
            body: JSON.stringify(body)
        };
    }

    const PENDING_KEY = 'thiep:uploads:pending';
    const PENDING_MAX = 200;

    // Duyệt sâu mọi chuỗi bắt đầu bằng /uploads/ trong state (không rẽ nhánh theo type)
    function collectUploadUrls(node, out, depth) {
        if (depth > 12 || out.length >= 400) return;
        if (typeof node === 'string') {
            if (node.indexOf('/uploads/') === 0 && node.length < 200 && !/\s/.test(node)) out.push(node);
        } else if (Array.isArray(node)) {
            node.forEach(v => collectUploadUrls(v, out, depth + 1));
        } else if (node && typeof node === 'object') {
            Object.keys(node).forEach(k => collectUploadUrls(node[k], out, depth + 1));
        }
    }

    // Gắn ảnh đã tải (pending + đang dùng) vào chỉ mục của thiệp; lỗi không làm hỏng xuất bản
    async function attachAfterPublish(slug, stateCopy) {
        try {
            const urls = api.getPendingUploads();
            collectUploadUrls(stateCopy, urls, 0);
            const uniq = Array.from(new Set(urls)).slice(0, 200);
            if (!uniq.length) { window.dispatchEvent(new CustomEvent('uploads:changed')); return; }
            await api.attachUploads(slug, uniq);
            api.clearPendingUploads();
        } catch (e) { /* giữ pending để thử lại lần xuất bản sau */ }
        try { window.dispatchEvent(new CustomEvent('uploads:changed')); } catch (e) { /* bỏ qua */ }
    }

    const api = {
        available: false,
        needCreateCode: false,

        async checkHealth() {
            const proto = location.protocol;
            if (proto !== 'http:' && proto !== 'https:') { api.available = false; return false; }
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 2000);
            try {
                const res = await fetch('/api/health', { signal: ctrl.signal });
                const j = await res.json();
                api.available = !!(res.ok && j && j.ok === true);
                api.needCreateCode = api.available && j.needCreateCode === true;
            } catch (e) {
                api.available = false;
                api.needCreateCode = false;
            } finally {
                clearTimeout(timer);
            }
            return api.available;
        },

        // Thiệp đang sửa đã xuất bản và máy có khoá: {slug, key} | null
        currentCard() {
            const last = lsGet(LAST_SLUG);
            const key = SLUG_RE.test(last) ? lsGet(KEY_PREFIX + last) : '';
            return key ? { slug: last, key } : null;
        },

        // Danh sách URL ảnh tải lên khi thiệp chưa có khoá (localStorage)
        getPendingUploads() {
            try {
                const a = JSON.parse(lsGet(PENDING_KEY) || '[]');
                return Array.isArray(a) ? a.filter(u => typeof u === 'string') : [];
            } catch (e) { return []; }
        },
        addPendingUpload(url) {
            if (typeof url !== 'string' || url.indexOf('/uploads/') !== 0) return;
            try {
                const a = api.getPendingUploads().filter(u => u !== url);
                a.push(url);
                lsSet(PENDING_KEY, JSON.stringify(a.slice(-PENDING_MAX)));
            } catch (e) { /* bỏ qua */ }
        },
        clearPendingUploads() {
            try { localStorage.removeItem(PENDING_KEY); } catch (e) { /* bỏ qua */ }
        },

        listUploads(slug) {
            const key = lsGet(KEY_PREFIX + slug);
            return request('/api/cards/' + encodeURIComponent(slug) + '/uploads',
                { headers: { 'X-Edit-Key': key } });
        },
        attachUploads(slug, urls) {
            const key = lsGet(KEY_PREFIX + slug);
            return request('/api/cards/' + encodeURIComponent(slug) + '/uploads/attach',
                jsonOpts('POST', { urls: (urls || []).slice(0, 200) }, { 'X-Edit-Key': key }));
        },

        // Trả URL (chuỗi). label: nhãn tên tệp (vd hero-1, nen, nhac)
        uploadFile(file, onProgress, label) {
            if (!api.available) return Promise.reject(new Error(NO_BACKEND));
            const fd = new FormData();
            if (label) fd.append('label', String(label));
            fd.append('file', file);
            const headers = {};
            const code = lsGet(CODE_KEY);
            if (code) headers['X-Create-Code'] = code;
            // Thiệp đã xuất bản có khoá: luôn kèm để server ghi vào chỉ mục ảnh (và làm quyền dự phòng)
            const card = api.currentCard();
            if (card) {
                headers['X-Card-Slug'] = card.slug;
                headers['X-Edit-Key'] = card.key;
            }
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/upload');
                Object.keys(headers).forEach(k => xhr.setRequestHeader(k, headers[k]));
                xhr.timeout = 60000;
                xhr.responseType = 'text';
                if (typeof onProgress === 'function' && xhr.upload) {
                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable && e.total > 0) {
                            try { onProgress(Math.min(1, e.loaded / e.total)); } catch (x) { /* bỏ qua */ }
                        }
                    };
                }
                xhr.onerror = () => reject(new Error('Không kết nối được máy chủ. Vui lòng thử lại.'));
                xhr.ontimeout = () => reject(new Error('Máy chủ phản hồi quá chậm, vui lòng thử lại.'));
                xhr.onload = () => {
                    let body = null;
                    try { body = JSON.parse(xhr.responseText); } catch (e) { body = null; }
                    if (xhr.status < 200 || xhr.status >= 300) {
                        let msg = body && body.detail;
                        if (Array.isArray(msg)) msg = 'Dữ liệu gửi lên không hợp lệ.';
                        const err = new Error(msg || ('Lỗi máy chủ (' + xhr.status + ').'));
                        err.status = xhr.status;
                        reject(err);
                        return;
                    }
                    if (typeof onProgress === 'function') { try { onProgress(1); } catch (x) { /* bỏ qua */ } }
                    const url = body && body.url;
                    if (url && !card) api.addPendingUpload(url);
                    try { window.dispatchEvent(new CustomEvent('uploads:changed')); } catch (x) { /* bỏ qua */ }
                    resolve(url);
                };
                xhr.send(fd);
            });
        },

        // true | ném Error (.status)
        async verifyKey(slug, key) {
            if (!SLUG_RE.test(slug || '')) {
                throw new Error('Đường dẫn chỉ gồm chữ thường không dấu, số, dấu gạch ngang (3–50 ký tự).');
            }
            await request('/api/cards/' + encodeURIComponent(slug) + '/verify-key',
                { method: 'POST', headers: { 'X-Edit-Key': key || '' } });
            return true;
        },

        getCard(slug) {
            return request('/api/cards/' + encodeURIComponent(slug));
        },

        // Trả {url, editKey?}; editKey chỉ có ở lần tạo đầu tiên
        async publishCard(slug, state, createCode) {
            if (!SLUG_RE.test(slug || '')) {
                throw new Error('Đường dẫn chỉ gồm chữ thường không dấu, số, dấu gạch ngang (3–50 ký tự).');
            }
            const copy = JSON.parse(JSON.stringify(state));
            delete copy.selectedSectionId;
            delete copy.isPreviewMode;
            const headers = {};
            const key = lsGet(KEY_PREFIX + slug);
            if (key) headers['X-Edit-Key'] = key;
            const code = createCode || lsGet(CODE_KEY);
            if (code) headers['X-Create-Code'] = code;
            const j = await request('/api/cards/' + encodeURIComponent(slug), jsonOpts('PUT', copy, headers), 60000);
            if (j && j.editKey) lsSet(KEY_PREFIX + slug, j.editKey);
            lsSet(LAST_SLUG, slug);
            await attachAfterPublish(slug, copy);
            return { url: location.origin + '/c/' + slug, editKey: (j && j.editKey) || undefined };
        },

        postRsvp(slug, body) {
            return request('/api/cards/' + encodeURIComponent(slug) + '/rsvp', jsonOpts('POST', body));
        },
        postWish(slug, body) {
            return request('/api/cards/' + encodeURIComponent(slug) + '/wishes', jsonOpts('POST', body));
        },
        getWishes(slug) {
            return request('/api/cards/' + encodeURIComponent(slug) + '/wishes');
        }
    };
    window.api = api;

    // ---------- Slug gợi ý ----------
    function slugify(s) {
        return String(s || '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            .slice(0, 50);
    }
    function suggestSlug() {
        let name = '';
        try {
            name = (typeof window.cardPageTitle === 'function' ? window.cardPageTitle(appState) : '') || '';
        } catch (e) { /* appState chưa sẵn sàng */ }
        const s = slugify(name);
        return s.length >= 3 ? s : '';
    }

    // ---------- Modal Xuất bản ----------
    let qrLoading = null;
    function loadQrLib() {
        if (window.QRCode) return Promise.resolve();
        if (qrLoading) return qrLoading;
        qrLoading = new Promise((resolve, reject) => {
            const sc = document.createElement('script');
            sc.src = QR_SRC;
            sc.integrity = QR_SRI;
            sc.crossOrigin = 'anonymous';
            sc.referrerPolicy = 'no-referrer';
            sc.onload = () => resolve();
            sc.onerror = () => { qrLoading = null; reject(new Error('Không tải được thư viện QR.')); };
            document.head.appendChild(sc);
        });
        return qrLoading;
    }

    function $(id) { return document.getElementById(id); }
    let publishedSlug = '';

    function guestLink() {
        const name = ($('publishGuestName').value || '').trim();
        const base = location.origin + '/c/' + publishedSlug;
        return name ? base + '?khach=' + encodeURIComponent(name) : base;
    }

    function refreshGuest() {
        const name = ($('publishGuestName').value || '').trim();
        const link = guestLink();
        $('publishGuestLink').value = link;
        $('publishMessage').value = 'Trân trọng kính mời ' + (name || 'bạn') +
            ' tới dự lễ cưới của chúng tôi. Xem thiệp mời tại: ' + link;
    }

    function setBusy(busy) {
        const b = $('publishSubmitBtn');
        b.disabled = busy;
        b.classList.toggle('opacity-60', busy);
    }

    // Ô mã tạo thiệp: chỉ hiện khi server bật mã và slug đang nhập chưa có khoá trên máy
    let forceCodeBox = false; // bật khi server trả 403 lúc xuất bản
    function refreshCodeBox() {
        const box = $('publishCodeBox');
        if (!box) return;
        const v = $('publishSlugInput').value;
        const show = api.needCreateCode &&
            (forceCodeBox || !(SLUG_RE.test(v) && lsGet(KEY_PREFIX + v)));
        box.classList.toggle('hidden', !show);
    }

    function validateSlugUi() {
        const v = $('publishSlugInput').value;
        const ok = SLUG_RE.test(v);
        $('publishSlugError').classList.toggle('hidden', ok || v === '');
        refreshCodeBox();
        return ok;
    }

    function copyFrom(id) {
        const el = $(id);
        const done = () => toast('Đã sao chép!');
        const fail = () => { el.focus(); el.select(); toast('Hãy bôi đen và sao chép thủ công'); };
        const legacy = () => {
            let ok = false;
            try { el.focus(); el.select(); ok = document.execCommand('copy'); } catch (e) { ok = false; }
            if (ok) done(); else fail();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(el.value).then(done, legacy);
        } else {
            legacy();
        }
    }

    function showResult(res, slug) {
        publishedSlug = slug;
        $('publishResult').classList.remove('hidden');
        $('publishLink').value = res.url;
        const keyBox = $('publishKeyBox');
        if (res.editKey) {
            $('publishEditKey').value = res.editKey;
            keyBox.classList.remove('hidden');
        } else {
            keyBox.classList.add('hidden');
        }
        refreshGuest();
        const qrEl = $('publishQr');
        qrEl.innerHTML = '';
        loadQrLib().then(() => {
            qrEl.innerHTML = '';
            if (publishedSlug !== slug || $('publishLink').value !== res.url) return;
            new window.QRCode(qrEl, { text: res.url, width: 160, height: 160 });
        }).catch(e => { qrEl.textContent = e.message; });
    }

    async function submitPublish() {
        if (!validateSlugUi()) { toast('Đường dẫn chưa hợp lệ.'); return; }
        const slug = $('publishSlugInput').value;
        const codeBox = $('publishCodeBox');
        const typed = ($('publishCodeInput').value || '').trim();
        const useTyped = !!(codeBox && !codeBox.classList.contains('hidden') && typed);
        setBusy(true);
        try {
            const res = await api.publishCard(slug, appState, useTyped ? typed : '');
            if (useTyped) lsSet(CODE_KEY, typed); // chỉ lưu sau khi thành công
            forceCodeBox = false;
            showResult(res, slug);
            refreshCodeBox();
            toast('Đã xuất bản thiệp!');
        } catch (e) {
            if (e && e.status === 403 && api.needCreateCode) {
                forceCodeBox = true;
                refreshCodeBox();
            }
            toast(e.message || 'Xuất bản thất bại.');
        } finally {
            setBusy(false);
        }
    }

    async function openPublishModal() {
        if (!api.available) {
            await api.checkHealth();
            applyAvailability();
        }
        if (!api.available) { toast(NO_BACKEND); return; }
        const input = $('publishSlugInput');
        input.value = lsGet(LAST_SLUG) || suggestSlug();
        $('publishResult').classList.add('hidden');
        $('publishGuestName').value = '';
        $('publishCodeInput').value = lsGet(CODE_KEY);
        $('openCardSlug').value = '';
        $('openCardKey').value = '';
        forceCodeBox = false;
        validateSlugUi();
        $('publishModal').classList.remove('hidden');
        input.focus();
    }
    function closePublishModal() {
        $('publishModal').classList.add('hidden');
        $('publishEditKey').value = '';
        $('openCardKey').value = '';
        $('publishCodeInput').value = '';
    }

    // Mở thiệp đã xuất bản để sửa: verifyKey -> getCard -> replaceState
    async function openPublishedCard() {
        const slug = ($('openCardSlug').value || '').trim();
        const key = ($('openCardKey').value || '').trim();
        if (!SLUG_RE.test(slug)) { toast('Đường dẫn chưa hợp lệ.'); return; }
        if (!key) { toast('Hãy nhập khoá chỉnh sửa.'); return; }
        const btn = $('openCardBtn');
        btn.disabled = true;
        btn.classList.add('opacity-60');
        try {
            await api.verifyKey(slug, key);
            const st = await api.getCard(slug);
            if (typeof window.replaceState !== 'function' || !window.replaceState(st)) {
                toast('Dữ liệu thiệp không hợp lệ.');
                return;
            }
            lsSet(KEY_PREFIX + slug, key);
            lsSet(LAST_SLUG, slug);
            $('publishSlugInput').value = slug;
            refreshCodeBox();
            toast('Đã mở thiệp ' + slug + ' để chỉnh sửa.');
            closePublishModal();
        } catch (e) {
            if (e && e.status === 403) toast('Khoá chỉnh sửa không đúng.');
            else if (e && e.status === 404) toast('Không tìm thấy thiệp.');
            else toast((e && e.message) || 'Không mở được thiệp.');
        } finally {
            btn.disabled = false;
            btn.classList.remove('opacity-60');
        }
    }
    window.openPublishedCard = openPublishedCard;

    window.openPublishModal = openPublishModal;
    window.closePublishModal = closePublishModal;
    window.submitPublish = submitPublish;
    window.publishValidateSlug = validateSlugUi;
    window.publishRefreshGuest = refreshGuest;
    window.publishCopy = copyFrom;

    // ---------- Khoá/mở nút Xuất bản theo backend ----------
    function applyAvailability() {
        const btn = $('btnPublish');
        if (!btn) return;
        // Không dùng disabled thật khi mở qua http(s) để người dùng bấm lại kiểm tra backend
        const web = location.protocol === 'http:' || location.protocol === 'https:';
        btn.disabled = !api.available && !web;
        btn.classList.toggle('opacity-50', !api.available);
        btn.classList.toggle('cursor-not-allowed', !api.available && !web);
        btn.title = api.available
            ? 'Xuất bản thiệp lên máy chủ để gửi link cho khách'
            : (web
                ? 'Chạy backend rồi tải lại trang hoặc bấm lại'
                : 'Cần chạy backend và mở trang qua http://localhost:8000 để xuất bản (đang mở bằng file://).');
    }

    function boot() {
        applyAvailability();
        api.checkHealth().then(() => {
            applyAvailability();
            window.dispatchEvent(new CustomEvent('api:ready', { detail: { available: api.available } }));
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
})();
