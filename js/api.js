// Client API (T8): gọi backend FastAPI, quản lý edit key, modal Xuất bản.
(function () {
    const SLUG_RE = /^[a-z0-9-]{3,50}$/;
    const KEY_PREFIX = 'thiep:editKey:';
    const LAST_SLUG = 'thiep:lastSlug';
    const QR_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

    const NO_BACKEND = 'Chưa kết nối máy chủ. Hãy chạy backend và mở trang qua http://localhost:8000.';

    function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
    function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } }

    function toast(msg) {
        if (typeof window.showToast === 'function') window.showToast(msg);
    }

    // Đọc phản hồi; lỗi -> Error(detail tiếng Việt)
    async function request(url, opts) {
        if (!api.available) throw new Error(NO_BACKEND);
        let res;
        try {
            res = await fetch(url, opts);
        } catch (e) {
            throw new Error('Không kết nối được máy chủ. Vui lòng thử lại.');
        }
        let body = null;
        try { body = await res.json(); } catch (e) { body = null; }
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

    const api = {
        available: false,

        async checkHealth() {
            const proto = location.protocol;
            if (proto !== 'http:' && proto !== 'https:') { api.available = false; return false; }
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 2000);
            try {
                const res = await fetch('/api/health', { signal: ctrl.signal });
                const j = await res.json();
                api.available = !!(res.ok && j && j.ok === true);
            } catch (e) {
                api.available = false;
            } finally {
                clearTimeout(timer);
            }
            return api.available;
        },

        uploadFile(file) {
            const fd = new FormData();
            fd.append('file', file);
            return request('/api/upload', { method: 'POST', body: fd }).then(j => j.url);
        },

        // Trả {url, editKey?}; editKey chỉ có ở lần tạo đầu tiên
        async publishCard(slug, state) {
            if (!SLUG_RE.test(slug || '')) {
                throw new Error('Đường dẫn chỉ gồm chữ thường không dấu, số, dấu gạch ngang (3–50 ký tự).');
            }
            const copy = JSON.parse(JSON.stringify(state));
            delete copy.selectedSectionId;
            delete copy.isPreviewMode;
            const headers = {};
            const key = lsGet(KEY_PREFIX + slug);
            if (key) headers['X-Edit-Key'] = key;
            const j = await request('/api/cards/' + encodeURIComponent(slug), jsonOpts('PUT', copy, headers));
            if (j && j.editKey) lsSet(KEY_PREFIX + slug, j.editKey);
            lsSet(LAST_SLUG, slug);
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
            const hero = (appState.sections || []).find(s => s.type === 'hero');
            name = hero && hero.data && hero.data.coupleShortName || '';
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

    function validateSlugUi() {
        const v = $('publishSlugInput').value;
        const ok = SLUG_RE.test(v);
        $('publishSlugError').classList.toggle('hidden', ok || v === '');
        return ok;
    }

    function copyFrom(id) {
        const el = $(id);
        const done = () => toast('Đã sao chép!');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(el.value).then(done, () => { el.select(); document.execCommand('copy'); done(); });
        } else {
            el.select(); document.execCommand('copy'); done();
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
            new window.QRCode(qrEl, { text: res.url, width: 160, height: 160 });
        }).catch(e => { qrEl.textContent = e.message; });
    }

    async function submitPublish() {
        if (!validateSlugUi()) { toast('Đường dẫn chưa hợp lệ.'); return; }
        const slug = $('publishSlugInput').value;
        setBusy(true);
        try {
            const res = await api.publishCard(slug, appState);
            showResult(res, slug);
            toast('Đã xuất bản thiệp!');
        } catch (e) {
            toast(e.message || 'Xuất bản thất bại.');
        } finally {
            setBusy(false);
        }
    }

    function openPublishModal() {
        if (!api.available) { toast(NO_BACKEND); return; }
        const input = $('publishSlugInput');
        input.value = lsGet(LAST_SLUG) || suggestSlug();
        $('publishResult').classList.add('hidden');
        $('publishGuestName').value = '';
        validateSlugUi();
        $('publishModal').classList.remove('hidden');
        input.focus();
    }
    function closePublishModal() { $('publishModal').classList.add('hidden'); }

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
        btn.disabled = !api.available;
        btn.classList.toggle('opacity-50', !api.available);
        btn.classList.toggle('cursor-not-allowed', !api.available);
        btn.title = api.available
            ? 'Xuất bản thiệp lên máy chủ để gửi link cho khách'
            : 'Cần chạy backend và mở trang qua http://localhost:8000 để xuất bản (đang mở bằng file:// hoặc chưa có máy chủ).';
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
