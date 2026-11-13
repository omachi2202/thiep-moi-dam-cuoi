// 7. RUNTIME DÙNG CHUNG: ĐẾM NGƯỢC, NHẠC NỀN, HOA RƠI, POPUP QR, REVEAL, MOUNT SECTION
// Xuất window.CardRuntime = { init(rootEl, state, ctx), destroy() } và giữ các hàm toàn cục G2.
// Dùng ở editor, trang khách và bản export. Không đọc DOM sidebar/inspector của editor.
let countdownInterval = null;

(function () {
    let _state = null;      // state truyền vào init (ưu tiên hơn appState toàn cục)
    let _ctx = null;
    let _root = null;
    let _observer = null;   // IntersectionObserver của scroll-reveal
    let _cleanups = [];     // hàm dọn do mount() của section trả về
    let _toastTimer = null;
    let _fallKey = null;    // chế độ rơi đang chạy (khởi tạo một lần)

    function getState() {
        if (_state) return _state;
        return (typeof appState !== 'undefined') ? appState : null;
    }

    function byId(id) { return document.getElementById(id); }

    // ---------- Toast ----------
    function showToast(msg) {
        const toast = byId('toastNotification');
        const msgEl = byId('toastMessage');
        if (!toast || !msgEl) return;
        msgEl.textContent = msg;
        toast.classList.remove('translate-y-20', 'opacity-0');
        if (_toastTimer) clearTimeout(_toastTimer);
        _toastTimer = setTimeout(() => {
            toast.classList.add('translate-y-20', 'opacity-0');
        }, 2400);
    }

    // ---------- Đếm ngược ----------
    function pad2(n) { return String(n).padStart(2, '0'); }

    function calcParts(iso) {
        const target = new Date(iso).getTime();
        const diff = Math.max(0, (isNaN(target) ? Date.now() : target) - Date.now());
        return {
            days: pad2(Math.floor(diff / 86400000)),
            hours: pad2(Math.floor((diff / 3600000) % 24)),
            mins: pad2(Math.floor((diff / 60000) % 60)),
            secs: pad2(Math.floor((diff / 1000) % 60))
        };
    }

    const CD_LABELS = [['days', 'Ngày'], ['hours', 'Giờ'], ['mins', 'Phút'], ['secs', 'Giây']];

    // Slot [data-slot="countdown"]: nếu rỗng thì dựng 4 ô số, rồi cập nhật theo data-cd
    function fillSlot(slot, parts) {
        if (!slot.querySelector('[data-cd]')) {
            const st = getState();
            const color = st && st.globalStyle ? st.globalStyle.primaryColor : '#8c6239';
            slot.innerHTML = '<div class="grid grid-cols-4 gap-2 text-center">' + CD_LABELS.map(function (p) {
                return '<div class="rounded-xl py-3 text-white shadow" style="background-color:' + color + '">' +
                    '<div data-cd="' + p[0] + '" class="text-2xl font-bold">00</div>' +
                    '<div class="text-[10px] uppercase tracking-wider opacity-90">' + p[1] + '</div></div>';
            }).join('') + '</div>';
        }
        slot.querySelectorAll('[data-cd]').forEach(function (el) {
            el.textContent = parts[el.getAttribute('data-cd')] || '00';
        });
    }

    function updateCountdownDisplay() {
        const st = getState();
        if (!st || !st.sections) return;
        const scope = _root || document;

        // Cách mới: slot theo từng section
        scope.querySelectorAll('[data-slot="countdown"]').forEach(function (slot) {
            const holder = slot.closest('[data-section-id]');
            const sid = holder ? holder.getAttribute('data-section-id') : 'countdown';
            const sec = st.sections.find(function (s) { return s.id === sid; });
            if (!sec || !sec.data) return;
            fillSlot(slot, calcParts(sec.data.weddingIsoDate));
        });

        // Cách cũ: phần tử theo id
        const legacy = byId('cd-days') || byId('cd-hours') || byId('cd-mins') || byId('cd-secs');
        if (legacy) {
            const sec = st.sections.find(function (s) { return s.id === 'countdown'; });
            if (sec && sec.visible !== false && sec.data) {
                const p = calcParts(sec.data.weddingIsoDate);
                [['cd-days', p.days], ['cd-hours', p.hours], ['cd-mins', p.mins], ['cd-secs', p.secs]].forEach(function (x) {
                    const el = byId(x[0]);
                    if (el) el.textContent = x[1];
                });
            }
        }
    }

    function startCountdownTimer() {
        if (countdownInterval) clearInterval(countdownInterval);
        updateCountdownDisplay();
        countdownInterval = setInterval(updateCountdownDisplay, 1000);
    }

    // ---------- Nhạc nền ----------
    function toggleAudioPlayback() {
        const audio = byId('weddingAudio');
        const btn = byId('floatingMusicBtn');
        const icon = byId('musicIcon');
        if (!audio || !btn || !icon) return;
        if (audio.paused) {
            audio.play().then(function () {
                btn.classList.add('spin-music');
                icon.className = 'fa-solid fa-compact-disc text-base';
                showToast('Đang phát nhạc nền thiệp cưới ♫');
            }).catch(function () {
                showToast('Không thể phát đường dẫn nhạc này.');
            });
        } else {
            audio.pause();
            btn.classList.remove('spin-music');
            icon.className = 'fa-solid fa-music text-sm';
        }
    }

    // ---------- Hiệu ứng rơi ----------
    const FALL_SYMBOLS = {
        hearts: ['🌸', '💮', '💗'],
        petals: ['🌸', '🌺', '🍃'],
        snow: ['❄️', '❅', '❆'],
        stars: ['✨', '⭐', '💛'],
        sparkles: ['✨', '⭐', '💛']   // giá trị cũ
    };

    function buildFalling(mode) {
        const container = byId('fallingContainer');
        if (!container) return;
        container.innerHTML = '';
        _fallKey = mode;
        const symbols = FALL_SYMBOLS[mode];
        if (!mode || mode === 'none' || !symbols) return;
        for (let i = 0; i < 12; i++) {
            const span = document.createElement('span');
            span.className = 'petal';
            span.textContent = symbols[i % symbols.length];
            span.style.left = (Math.random() * 92) + '%';
            span.style.fontSize = (10 + Math.random() * 8) + 'px';
            span.style.animationDuration = (6 + Math.random() * 7) + 's';
            span.style.animationDelay = (Math.random() * 5) + 's';
            container.appendChild(span);
        }
    }

    // Gọi tường minh (đổi hiệu ứng, reset): luôn dựng lại
    function initFallingEffect() {
        const st = getState();
        buildFalling(st && st.globalStyle ? st.globalStyle.fallingEffect : 'none');
    }

    // ---------- Popup QR mừng cưới ----------
    function openGiftModal(side) {
        const st = getState();
        if (!st || !st.bankInfo || !st.bankInfo[side]) return;
        const info = st.bankInfo[side];
        const modal = byId('giftModal');
        if (!modal) return;
        const primary = st.globalStyle ? st.globalStyle.primaryColor : '#8c6239';

        const badge = byId('giftModalBadge');
        const copyBtn = byId('giftModalCopyBtn');
        if (badge) badge.style.backgroundColor = primary;
        if (copyBtn) copyBtn.style.backgroundColor = primary;
        byId('giftModalTitle').textContent = side === 'groom' ? 'Gửi Mừng Cưới Nhà Trai' : 'Gửi Mừng Cưới Nhà Gái';
        byId('giftModalBank').textContent = info.bank;
        byId('giftModalAcc').textContent = info.acc;
        byId('giftModalOwner').textContent = info.owner;

        const qrUrl = 'https://img.vietqr.io/image/' + encodeURIComponent(String(info.bank).trim()) + '-' +
            encodeURIComponent(String(info.acc).trim()) + '-compact2.png?accountName=' +
            encodeURIComponent(String(info.owner).trim());
        byId('giftModalQrImg').src = qrUrl;

        modal.classList.remove('hidden');
    }

    function closeGiftModal() {
        const modal = byId('giftModal');
        if (modal) modal.classList.add('hidden');
    }

    function copyBankAccount() {
        const accEl = byId('giftModalAcc');
        if (!accEl) return;
        const acc = accEl.textContent;
        const tempInput = document.createElement('input');
        tempInput.value = acc;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast('Đã sao chép STK: ' + acc);
    }

    function handleRsvpSubmit(e) {
        e.preventDefault();
        showToast('Cảm ơn bạn đã gửi lời chúc & xác nhận tham dự!');
        if (e.target && typeof e.target.reset === 'function') e.target.reset();
    }

    // ---------- Scroll-reveal (chỉ invite/export) ----------
    function setupReveal(root) {
        const items = root.querySelectorAll('[class*="reveal-"]');
        if (!items.length) return;
        if (typeof IntersectionObserver !== 'function') {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }
        _observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add('is-visible');
                    _observer.unobserve(en.target);
                }
            });
        }, { threshold: 0.12 });
        items.forEach(function (el) { _observer.observe(el); });
    }

    // ---------- Vòng đời ----------
    function destroy() {
        if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
        if (_observer) { _observer.disconnect(); _observer = null; }
        _cleanups.forEach(function (fn) { try { fn(); } catch (e) { /* bỏ qua */ } });
        _cleanups = [];
    }

    function init(rootEl, state, ctx) {
        destroy(); // idempotent: gỡ interval/observer/mount cũ trước khi gắn lại
        _root = rootEl || document;
        _state = state || null;
        _ctx = ctx || { appState: state, mode: 'editor', guestName: '', slug: null };
        const mode = _ctx.mode || 'editor';
        const st = getState();

        // Section.mount cho từng phần tử [data-section-id]
        const types = window.SECTION_TYPES || {};
        if (st && st.sections) {
            st.sections.forEach(function (sec) {
                const def = types[sec.type || sec.id];
                if (!def || typeof def.mount !== 'function') return;
                const el = _root.querySelector('[data-section-id="' + sec.id + '"]');
                if (!el) return;
                try {
                    const clean = def.mount(el, sec, _ctx);
                    if (typeof clean === 'function') _cleanups.push(clean);
                } catch (err) {
                    if (window.console) console.error('mount lỗi:', sec.id, err);
                }
            });
        }

        startCountdownTimer();

        if (mode !== 'editor') {
            // Bản khách/export: đồng bộ nhạc + màu nút, hiệu ứng rơi, reveal
            const g = st && st.globalStyle ? st.globalStyle : null;
            const audio = byId('weddingAudio');
            if (audio && g && g.audioUrl && audio.getAttribute('src') !== g.audioUrl) audio.src = g.audioUrl;
            const musicBtn = byId('floatingMusicBtn');
            if (musicBtn && g) musicBtn.style.backgroundColor = g.primaryColor;
            if (g && _fallKey !== g.fallingEffect) buildFalling(g.fallingEffect);
            setupReveal(_root);
        } else if (_fallKey === null) {
            // Editor: chỉ dựng hiệu ứng rơi lần đầu; đổi hiệu ứng đã có initFallingEffect()
            initFallingEffect();
        }
    }

    window.CardRuntime = { init: init, destroy: destroy };
    window.showToast = showToast;
    window.startCountdownTimer = startCountdownTimer;
    window.updateCountdownDisplay = updateCountdownDisplay;
    window.toggleAudioPlayback = toggleAudioPlayback;
    window.initFallingEffect = initFallingEffect;
    window.openGiftModal = openGiftModal;
    window.closeGiftModal = closeGiftModal;
    window.copyBankAccount = copyBankAccount;
    window.handleRsvpSubmit = handleRsvpSubmit;
})();
