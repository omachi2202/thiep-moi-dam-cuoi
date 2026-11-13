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

        // Slot theo từng section: section chủ lấy qua data-section-id của phần tử bọc slot (không rẽ nhánh theo sec.id)
        scope.querySelectorAll('[data-slot="countdown"]').forEach(function (slot) {
            const holder = slot.closest('[data-section-id]');
            if (!holder) return;
            const sid = holder.getAttribute('data-section-id');
            const sec = st.sections.find(function (s) { return s.id === sid; });
            if (!sec || !sec.data) return;
            const parts = calcParts(sec.data.weddingIsoDate);
            // Section tự dựng ô số có id cd-days/cd-hours/cd-mins/cd-secs trong slot: chỉ cập nhật số
            const own = slot.querySelectorAll('[id^="cd-"]');
            if (own.length) {
                own.forEach(function (el) {
                    const key = el.id.slice(3);
                    if (parts[key] !== undefined) el.textContent = parts[key];
                });
                return;
            }
            fillSlot(slot, parts);
        });
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

    // ---------- Scroll-reveal (chỉ invite/export) ----------
    // CSS (app.css) ẩn `.reveal-on .reveal-x:not(.is-visible)`; runtime thêm .reveal-on lên gốc rồi .is-visible khi cuộn tới
    const REVEAL_SEL = '.reveal-fade-up, .reveal-zoom, .reveal-slide';

    function setupReveal(root) {
        const items = root.querySelectorAll(REVEAL_SEL);
        if (!items.length) return;
        const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || typeof IntersectionObserver !== 'function') {
            items.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }
        root.classList.add('reveal-on');
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

    // ---------- Thay {khach} bằng tên khách (chỉ trên text node, không dùng innerHTML) ----------
    function replaceGuestPlaceholder(root, guestName) {
        const name = String(guestName || '').trim() || 'Quý khách';
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const hits = [];
        let n;
        while ((n = walker.nextNode())) {
            const p = n.parentNode;
            if (p && /^(SCRIPT|STYLE|TEXTAREA)$/i.test(p.nodeName)) continue;
            if (n.nodeValue && n.nodeValue.indexOf('{khach}') !== -1) hits.push(n);
        }
        hits.forEach(function (node) {
            node.nodeValue = node.nodeValue.split('{khach}').join(name);
        });
    }

    // ---------- Lịch: Google Calendar + tệp .ics ----------
    const TZ_OFFSET_HOURS = 7;      // giờ gốc là Asia/Ho_Chi_Minh (UTC+7, không có giờ mùa hè)
    const EVENT_HOURS = 3;          // thời lượng mặc định

    // 'YYYY-MM-DDTHH:mm[:ss]' (giờ Việt Nam) -> Date UTC, hoặc null
    function parseVnLocal(iso) {
        const m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(String(iso || ''));
        if (!m) return null;
        const t = Date.UTC(+m[1], +m[2] - 1, +m[3], (+m[4] || 0) - TZ_OFFSET_HOURS, +m[5] || 0, +m[6] || 0);
        return isNaN(t) ? null : new Date(t);
    }

    function fmtUtc(d) {
        return d.toISOString().replace(/[-:]|\.\d{3}/g, '');   // YYYYMMDDTHHMMSSZ
    }

    function icsEscape(s) {
        return String(s == null ? '' : s)
            .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,')
            .replace(/\r?\n/g, '\\n');
    }

    function buildIcs(title, location, start, end) {
        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Thiep cuoi online//VI',
            'CALSCALE:GREGORIAN',
            'BEGIN:VEVENT',
            'UID:' + fmtUtc(start) + '-' + Math.random().toString(36).slice(2, 10) + '@thiep-cuoi',
            'DTSTAMP:' + fmtUtc(new Date()),
            'DTSTART:' + fmtUtc(start),
            'DTEND:' + fmtUtc(end),
            'SUMMARY:' + icsEscape(title),
            'LOCATION:' + icsEscape(location),
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n') + '\r\n';
    }

    function downloadIcs(text) {
        const blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'thiep-cuoi.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function setupCalendar(root, st) {
        const slots = root.querySelectorAll('[data-slot="calendar-actions"]');
        if (!slots.length || !st || !st.sections) return;
        const primary = (typeof safeColor === 'function' && st.globalStyle)
            ? safeColor(st.globalStyle.primaryColor, '#8c6239') : '#8c6239';
        const evSec = st.sections.find(function (s) { return s.type === 'events' && s.data; });

        slots.forEach(function (slot) {
            slot.textContent = '';
            const holder = slot.closest('[data-section-id]');
            const sid = holder ? holder.getAttribute('data-section-id') : '';
            const sec = st.sections.find(function (s) { return s.id === sid; });
            if (!sec || !sec.data) return;
            const start = parseVnLocal(sec.data.weddingIsoDate);
            if (!start) return;
            const end = new Date(start.getTime() + EVENT_HOURS * 3600000);
            const title = String((evSec && evSec.data.event1Title) || sec.data.quoteTitle || 'Lễ cưới').trim();
            const place = String((evSec && evSec.data.event1Venue) || '').trim();

            const gUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
                '&text=' + encodeURIComponent(title) +
                '&dates=' + fmtUtc(start) + '/' + fmtUtc(end) +
                '&location=' + encodeURIComponent(place);

            const wrap = document.createElement('div');
            wrap.className = 'cal-actions';
            const mk = function (el, icon, label) {
                el.className = 'cal-btn';
                el.style.borderColor = primary;
                el.style.color = primary;
                const i = document.createElement('i');
                i.className = icon;
                el.appendChild(i);
                el.appendChild(document.createTextNode(' ' + label));
                return el;
            };
            const a = mk(document.createElement('a'), 'fa-brands fa-google', 'Thêm vào Google Calendar');
            a.href = gUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            const b = mk(document.createElement('button'), 'fa-solid fa-calendar-plus', 'Tải tệp lịch (.ics)');
            b.type = 'button';
            const onClick = function () { downloadIcs(buildIcs(title, place, start, end)); };
            b.addEventListener('click', onClick);
            wrap.appendChild(a);
            wrap.appendChild(b);
            slot.appendChild(wrap);
            _cleanups.push(function () { b.removeEventListener('click', onClick); });
        });
    }

    // ---------- Intro phong bì / rèm (chỉ invite/export) ----------
    let _introEl = null;
    let _introTimer = null;
    let _prevOverflow = null;

    function unlockScroll() {
        if (_prevOverflow !== null) {
            document.body.style.overflow = _prevOverflow;
            _prevOverflow = null;
        }
    }

    function removeIntro() {
        if (_introTimer) { clearTimeout(_introTimer); _introTimer = null; }
        if (_introEl && _introEl.parentNode) _introEl.parentNode.removeChild(_introEl);
        _introEl = null;
        unlockScroll();
    }

    function resolveIntroStyle(g) {
        const v = g ? g.introStyle : undefined;
        if (v === undefined || v === null || v === '') return 'envelope';   // mặc định
        return (v === 'envelope' || v === 'curtain') ? v : 'none';          // none hoặc giá trị lạ
    }

    function setupIntro(style, g, guestName) {
        if (style === 'none') return;
        const primary = (typeof safeColor === 'function' && g) ? safeColor(g.primaryColor, '#8c6239') : '#8c6239';
        const bg = (typeof safeColor === 'function' && g) ? safeColor(g.bgColor, '#fdfbf7') : '#fdfbf7';
        const el = document.createElement('div');
        el.className = 'intro-overlay intro-' + style;
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-modal', 'true');
        el.setAttribute('aria-label', 'Mở thiệp mời');
        el.style.setProperty('--intro-color', primary);
        el.style.setProperty('--intro-bg', bg);

        const mkEl = function (tag, cls, text) {
            const x = document.createElement(tag);
            if (cls) x.className = cls;
            if (text) x.textContent = text;
            return x;
        };

        if (style === 'curtain') {
            el.appendChild(mkEl('div', 'intro-curtain-panel intro-curtain-l'));
            el.appendChild(mkEl('div', 'intro-curtain-panel intro-curtain-r'));
        }
        const stage = mkEl('div', 'intro-stage');
        if (style === 'envelope') {
            const env = mkEl('div', 'intro-env');
            env.appendChild(mkEl('div', 'intro-env-back'));
            env.appendChild(mkEl('div', 'intro-env-card'));
            env.appendChild(mkEl('div', 'intro-env-front'));
            env.appendChild(mkEl('div', 'intro-env-flap'));
            const seal = mkEl('div', 'intro-env-seal');
            seal.appendChild(mkEl('i', 'fa-solid fa-heart'));
            env.appendChild(seal);
            stage.appendChild(env);
        }
        stage.appendChild(mkEl('p', 'intro-to', 'Thiệp mời dành cho'));
        stage.appendChild(mkEl('p', 'intro-name', String(guestName || '').trim() || 'Quý khách'));   // textContent: không cần escape HTML
        const btn = mkEl('button', 'intro-btn');
        btn.type = 'button';
        btn.appendChild(mkEl('i', 'fa-solid fa-envelope-open-text'));
        btn.appendChild(document.createTextNode(' Mở thiệp'));
        stage.appendChild(btn);
        el.appendChild(stage);

        _prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.body.appendChild(el);
        _introEl = el;

        let opened = false;
        btn.addEventListener('click', function () {
            if (opened) return;
            opened = true;
            el.classList.add('is-opening');
            // Bấm của người dùng -> được phép phát nhạc (vượt chặn autoplay)
            const audio = byId('weddingAudio');
            if (audio && audio.getAttribute('src') && audio.paused) toggleAudioPlayback();
            unlockScroll();
            _introTimer = setTimeout(removeIntro, 1100);
        });
        try { btn.focus(); } catch (e) { /* bỏ qua */ }
    }

    // ---------- Vòng đời ----------
    function destroy() {
        if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
        if (_observer) { _observer.disconnect(); _observer = null; }
        if (_root && _root.classList) _root.classList.remove('reveal-on');
        removeIntro();
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
        setupCalendar(_root, st);

        if (mode !== 'editor') {
            // Bản khách/export: đồng bộ nhạc + màu nút, hiệu ứng rơi, {khach}, reveal, intro
            const g = st && st.globalStyle ? st.globalStyle : null;
            const audio = byId('weddingAudio');
            const audioUrl = g ? (typeof safeUrl === 'function' ? safeUrl(g.audioUrl) : g.audioUrl) : '';
            if (audio && audioUrl && audio.getAttribute('src') !== audioUrl) audio.src = audioUrl;
            const musicBtn = byId('floatingMusicBtn');
            if (musicBtn && g) musicBtn.style.backgroundColor = g.primaryColor;
            if (g && _fallKey !== g.fallingEffect) buildFalling(g.fallingEffect);
            replaceGuestPlaceholder(_root, _ctx.guestName);
            setupReveal(_root);
            setupIntro(resolveIntroStyle(g), g, _ctx.guestName);
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
})();
