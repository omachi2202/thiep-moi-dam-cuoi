// 1. DỮ LIỆU GỐC (MÔ PHỎNG CHUẨN ZIUWEDDING.SITE/MM03 - TÙNG & NGỌC)
const DEFAULT_STATE = {
    schemaVersion: 3,
    selectedSectionId: 'hero',
    isPreviewMode: false,
    globalStyle: {
        scriptFont: "'Philosopher', serif",
        headingFont: "'Philosopher', serif",
        bodyFont: "'Noto Serif', serif",
        primaryColor: "#8c6239",
        bgColor: "#fdfbf7",
        textColor: "#3d312a",
        fallingEffect: "hearts",
        bgTexture: "none",
        frameStyle: "none",
        cornerOrnament: "none",
        revealAnimation: "fade-up",
        introStyle: "envelope",
        audioUrl: "https://media.vocaroo.com/mp3/15iKnK2wEfyY"
    },
    bankInfo: {
        groom: { bank: "MB", acc: "0988123456", owner: "NGUYEN THANH TUNG" },
        bride: { bank: "VCB", acc: "0123456789", owner: "TRAN KHANH NGOC" }
    },
    sections: [
        {
            id: 'hero',
            type: 'hero',
            style: {},
            name: '1. Trang Bìa (Save The Date)',
            icon: 'fa-heart',
            visible: true,
            customFont: '',
            customTitleSize: '36',
            customTextColor: '',
            data: {
                coupleShortName: 'Tùng & Ngọc',
                tagline: 'SAVE OUR DATE',
                dateDisplay: '24.10.2026',
                heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
                subNote: 'Trân trọng báo tin lễ thành hôn của chúng mình'
            }
        },
        {
            id: 'family',
            type: 'family',
            style: {},
            name: '2. Thông Tin Gia Đình & Lời Mời',
            icon: 'fa-users',
            visible: true,
            customFont: '',
            customTitleSize: '28',
            customTextColor: '',
            data: {
                brideParents: 'Ông: Nguyễn Văn Đoàn\nBà: Vũ Thị Đương',
                brideAddress: 'Cẩm Lý, Lục Nam, Bắc Giang',
                groomParents: 'Ông: Nguyễn Văn Thắng\nBà: Lương Thị Tám',
                groomAddress: 'Cẩm Lý, Lục Nam, Bắc Giang',
                inviteHeader: 'TRÂN TRỌNG KÍNH MỜI',
                inviteSub: 'THAM DỰ LỄ CƯỚI CỦA CHÚNG MÌNH',
                groomFullName: 'Nguyễn Thanh Tùng',
                brideFullName: 'Trần Khánh Ngọc',
                coupleAvatar: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=700&q=80'
            }
        },
        {
            id: 'events',
            type: 'events',
            style: {},
            name: '3. Lịch Trình & Chỉ Đường',
            icon: 'fa-location-dot',
            visible: true,
            customFont: '',
            customTitleSize: '22',
            customTextColor: '',
            data: {
                event1Title: 'TIỆC MỪNG CƯỚI',
                event1Time: '16:00 - CHỦ NHẬT',
                event1Date: '24.10.2026',
                event1Lunar: '(Tức ngày 15 tháng 09 năm Bính Ngọ)',
                event1Venue: 'Tại Tư Gia Nhà Gái - Cẩm Lý, Lục Nam, Bắc Giang',
                event1MapUrl: 'https://maps.google.com/?q=Cam+Ly+Luc+Nam+Bac+Giang',
                event2Title: 'LỄ THÀNH HÔN',
                event2Time: '09:00 - THỨ HAI',
                event2Date: '25.10.2026',
                event2Lunar: '(Tức ngày 16 tháng 09 năm Bính Ngọ)',
                event2Venue: 'Tại Tư Gia Nhà Trai - Cẩm Lý, Lục Nam, Bắc Giang',
                event2MapUrl: 'https://maps.google.com/?q=Cam+Ly+Luc+Nam+Bac+Giang'
            }
        },
        {
            id: 'countdown',
            type: 'countdown',
            style: {},
            name: '4. Lịch Tháng & Đếm Ngược',
            icon: 'fa-calendar-check',
            visible: true,
            customFont: '',
            customTitleSize: '24',
            customTextColor: '',
            data: {
                quoteTitle: 'Happy Wedding',
                quoteText: '"It\'s been said that you only truly fall in love once, but don\'t believe it. Every time I see you, I fall in love all over again!"',
                weddingIsoDate: '2026-10-24T16:00:00',
                calendarTitle: 'THÁNG 10 / 2026'
            }
        },
        {
            id: 'rsvp',
            type: 'rsvp',
            style: {},
            name: '5. Xác Nhận Tham Dự & Mừng Cưới',
            icon: 'fa-envelope-open-text',
            visible: true,
            customFont: '',
            customTitleSize: '20',
            customTextColor: '',
            data: {
                rsvpIntro: 'Hãy xác nhận sự có mặt của bạn để chúng mình chuẩn bị đón tiếp một cách chu đáo nhất. Trân trọng!',
                groomBtnText: 'GỬI MỪNG CƯỚI NHÀ TRAI',
                brideBtnText: 'GỬI MỪNG CƯỚI NHÀ GÁI'
            }
        },
        {
            id: 'album',
            type: 'album',
            style: {},
            name: '6. Album Ảnh & Lời Cảm Ơn',
            icon: 'fa-images',
            visible: true,
            customFont: '',
            customTitleSize: '26',
            customTextColor: '',
            data: {
                albumTitle: 'OUR ALBUM',
                albumSubtitle: 'CAPTURED WITH LOVE',
                photos: [
                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80'
                ],
                thankYouText: 'Sự hiện diện của Quý khách là niềm vinh hạnh đối với gia đình chúng tôi. Xin chân thành cảm ơn!',
                footerCredit: 'HIME WEDDING INVITATION'
            }
        }
    ]
};

let appState = JSON.parse(JSON.stringify(DEFAULT_STATE));

// Danh sách các Font chữ cho phép chọn riêng ở từng Section
const FONT_OPTIONS = [
    { label: 'Mặc định theo Giao diện chung', value: '' },
    { label: 'Philosopher (Chuẩn mẫu MM03)', value: "'Philosopher', serif" },
    { label: 'Noto Serif (Cổ điển trang trọng)', value: "'Noto Serif', serif" },
    { label: 'Great Vibes (Chữ ký nghệ thuật)', value: "'Great Vibes', cursive" },
    { label: 'Dancing Script (Bay bổng)', value: "'Dancing Script', cursive" },
    { label: 'Playfair Display (Tạp chí)', value: "'Playfair Display', serif" },
    { label: 'Cormorant Garamond (Tinh tế)', value: "'Cormorant Garamond', serif" },
    { label: 'Oswald (Hiện đại in hoa)', value: "'Oswald', sans-serif" },
    { label: 'Roboto Slab (Rõ nét)', value: "'Roboto Slab', serif" },
    { label: 'Tinos (Cổ điển sắc nét)', value: "'Tinos', serif" },
    { label: 'Open Sans (Dễ đọc, hiện đại)', value: "'Open Sans', sans-serif" },
    { label: 'Montserrat (Trẻ trung)', value: "'Montserrat', sans-serif" }
];

// Bộ phối màu & font mẫu (chuyển từ biến cục bộ `presets` của applyThemePreset)
// Mỗi mẫu: label/desc (hiển thị), màu, 3 font (đều nằm trong FONT_OPTIONS), fallingEffect.
// Tuỳ chọn: bgTexture, frameStyle, cornerOrnament, revealAnimation, introStyle (giá trị theo G5), sectionOrder (mảng id section; id không có trong state bị bỏ qua).
// applyThemePreset chỉ ghi các khoá có mặt trong mẫu.
const THEME_PRESETS = {
    classic: {
        label: 'Cổ điển nâu (MM03)',
        desc: 'Nâu trầm & Kem',
        scriptFont: "'Philosopher', serif",
        headingFont: "'Philosopher', serif",
        bodyFont: "'Noto Serif', serif",
        primaryColor: "#8c6239",
        bgColor: "#fdfbf7",
        textColor: "#3d312a",
        fallingEffect: "hearts",
        bgTexture: "none",
        frameStyle: "none",
        cornerOrnament: "none"
    },
    blush: {
        label: 'Pastel hồng',
        desc: 'Ngọt ngào & Lãng mạn',
        scriptFont: "'Great Vibes', cursive",
        headingFont: "'Playfair Display', serif",
        bodyFont: "'Montserrat', sans-serif",
        primaryColor: "#be185d",
        bgColor: "#fff9fb",
        textColor: "#4a1d32",
        fallingEffect: "petals",
        bgTexture: "floral",
        frameStyle: "none",
        cornerOrnament: "rose"
    },
    sage: {
        label: 'Xanh sage',
        desc: 'Tối giản & Tinh tế',
        scriptFont: "'Cormorant Garamond', serif",
        headingFont: "'Cormorant Garamond', serif",
        bodyFont: "'Open Sans', sans-serif",
        primaryColor: "#3f6212",
        bgColor: "#f7faf7",
        textColor: "#263819",
        fallingEffect: "sparkles",
        bgTexture: "paper",
        frameStyle: "single",
        cornerOrnament: "leaf"
    },
    royal: {
        label: 'Xanh hoàng gia',
        desc: 'Sang trọng & Hiện đại',
        scriptFont: "'Dancing Script', cursive",
        headingFont: "'Playfair Display', serif",
        bodyFont: "'Noto Serif', serif",
        primaryColor: "#1e3a8a",
        bgColor: "#f8fafc",
        textColor: "#1e293b",
        fallingEffect: "stars",
        bgTexture: "silk",
        frameStyle: "double",
        cornerOrnament: "none"
    },
    redtrad: {
        label: 'Đỏ truyền thống',
        desc: 'Đỏ thắm & Vàng kem',
        scriptFont: "'Great Vibes', cursive",
        headingFont: "'Playfair Display', serif",
        bodyFont: "'Noto Serif', serif",
        primaryColor: "#b91c1c",
        bgColor: "#fffaf0",
        textColor: "#4a1212",
        fallingEffect: "hearts",
        bgTexture: "paper",
        frameStyle: "floral-corner",
        cornerOrnament: "rose"
    },
    minimal: {
        label: 'Tối giản trắng đen',
        desc: 'Gọn gàng & Hiện đại',
        scriptFont: "'Cormorant Garamond', serif",
        headingFont: "'Montserrat', sans-serif",
        bodyFont: "'Open Sans', sans-serif",
        primaryColor: "#111111",
        bgColor: "#ffffff",
        textColor: "#222222",
        fallingEffect: "none",
        bgTexture: "none",
        frameStyle: "none",
        cornerOrnament: "none"
    }
};

// 2. REGISTRY SECTION, TIỆN ÍCH CHUNG & MIGRATE (giao kèo G2/G4)
const SCHEMA_VERSION = 3;
window.SECTION_TYPES = Object.create(null);

// Whitelist giá trị G5 của globalStyle (giá trị đầu tiên không phải mặc định; mặc định lấy từ DEFAULT_STATE)
const G5_OPTIONS = {
    bgTexture: ['none', 'paper', 'floral', 'silk'],
    frameStyle: ['none', 'single', 'double', 'floral-corner'],
    cornerOrnament: ['none', 'leaf', 'rose'],
    revealAnimation: ['none', 'fade-up', 'zoom', 'slide'],
    fallingEffect: ['none', 'hearts', 'sparkles', 'petals', 'snow', 'stars'],
    introStyle: ['none', 'envelope', 'curtain']
};
window.G5_OPTIONS = G5_OPTIONS;

// Tra registry an toàn: chỉ trả def hợp lệ (có renderCanvas là hàm), ngược lại null
function getSectionDef(type) {
    const def = window.SECTION_TYPES[type];
    return (def && typeof def.renderCanvas === 'function') ? def : null;
}
window.getSectionDef = getSectionDef;

// Mỗi tệp js/sections/<type>.js gọi đúng một lần để tự đăng ký
function registerSection(def) {
    if (!def || !def.type) return;
    window.SECTION_TYPES[def.type] = def;
}

// Escape dữ liệu người dùng trước khi chèn vào HTML (nội dung và thuộc tính)
function escapeHtml(s) {
    return String(s === undefined || s === null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Chỉ cho http(s), data:image/ và /uploads/; còn lại trả chuỗi rỗng
function safeUrl(u) {
    const s = String(u === undefined || u === null ? '' : u).trim();
    if (/^https?:\/\//i.test(s) || /^data:image\//i.test(s) || /^\/uploads\//.test(s)) return s;
    return '';
}

// Nhạc nền: chỉ cho http(s), data:audio/ và /uploads/; còn lại trả chuỗi rỗng
function safeAudioUrl(u) {
    const s = String(u === undefined || u === null ? '' : u).trim();
    if (/^https?:\/\//i.test(s) || /^data:audio\//i.test(s) || /^\/uploads\//.test(s)) return s;
    return '';
}
window.safeAudioUrl = safeAudioUrl;

// Biến dùng chung cho renderCanvas của các section (giá trị đã escape, dùng được trong thuộc tính style)
// Whitelist giá trị state trước khi chèn vào thuộc tính style= (chống CSS injection)
// Màu: chỉ #rgb/#rrggbb/#rrggbbaa; sai trả fallback.
// Lưu ý: màu không phải #hex (rgb(), tên màu...) từ JSON cũ sẽ về màu mặc định.
function safeColor(c, fallback) {
    const s = String(c === undefined || c === null ? '' : c).trim();
    return /^#[0-9a-f]{3,8}$/i.test(s) ? s : (fallback === undefined ? '' : fallback);
}

// Font: phải thuộc FONT_OPTIONS, THEME_PRESETS hoặc font mặc định của globalStyle; sai trả fallback. Kết quả đã escape.
function safeFont(f, fallback) {
    const allowed = new Set();
    FONT_OPTIONS.forEach(o => { if (o.value) allowed.add(o.value); });
    Object.keys(THEME_PRESETS).forEach(k => {
        const p = THEME_PRESETS[k];
        [p.scriptFont, p.headingFont, p.bodyFont].forEach(v => { if (v) allowed.add(v); });
    });
    const gd = DEFAULT_STATE.globalStyle;
    [gd.scriptFont, gd.headingFont, gd.bodyFont].forEach(v => allowed.add(v));
    return allowed.has(f) ? escapeHtml(f) : escapeHtml(fallback === undefined ? '' : fallback);
}

// Cỡ chữ: số, kẹp 12-72; rỗng/không phải số trả fallback (mặc định 28)
function safeSize(n, fallback) {
    const fb = fallback === undefined ? 28 : fallback;
    if ((typeof n === 'string' && n.trim() === '') || n === null || n === undefined) return fb;
    const x = Number(typeof n === 'string' ? n.trim() : n);
    if (!isFinite(x)) return fb;
    return Math.min(72, Math.max(12, x));
}
window.safeColor = safeColor;
window.safeFont = safeFont;
window.safeSize = safeSize;

function sectionVars(sec, ctx) {
    const g = ctx.appState.globalStyle;
    const gd = DEFAULT_STATE.globalStyle;
    return {
        g: g,
        pc: safeColor(g.primaryColor, gd.primaryColor),
        secFont: safeFont(sec.customFont, '') || safeFont(g.headingFont, gd.headingFont),
        scriptFont: safeFont(sec.customFont, '') || safeFont(g.scriptFont, gd.scriptFont),
        globalScriptFont: safeFont(g.scriptFont, gd.scriptFont),
        secColor: safeColor(sec.customTextColor, '') || safeColor(g.textColor, gd.textColor),
        titleSize: `${safeSize(sec.customTitleSize, 28)}px`
    };
}

// Thuộc tính cho trường sửa inline: chỉ có ở mode editor
function fieldAttr(ctx, key) {
    if (ctx.mode !== 'editor' || (ctx.appState && ctx.appState.isPreviewMode)) return '';
    return `data-field="${escapeHtml(key)}" contenteditable="true"`;
}

function defaultSectionStyle() {
    return { bgColor: '', bgImage: '', bgOverlayOpacity: 0, paddingY: '', align: '', animation: '', ornament: '' };
}

// Chuẩn hoá state cũ/mới về schema hiện tại. Idempotent, sửa trực tiếp và trả về chính state.
function migrate(state) {
    if (!state || typeof state !== 'object') return state;

    state.globalStyle = Object.assign({}, DEFAULT_STATE.globalStyle, (state.globalStyle && typeof state.globalStyle === 'object' && !Array.isArray(state.globalStyle)) ? state.globalStyle : {});
    // Khoá G5: giá trị ngoài whitelist về mặc định
    Object.keys(G5_OPTIONS).forEach(k => {
        if (G5_OPTIONS[k].indexOf(state.globalStyle[k]) < 0) state.globalStyle[k] = DEFAULT_STATE.globalStyle[k];
    });

    const bank = state.bankInfo || {};
    state.bankInfo = {
        groom: Object.assign({}, DEFAULT_STATE.bankInfo.groom, bank.groom || {}),
        bride: Object.assign({}, DEFAULT_STATE.bankInfo.bride, bank.bride || {})
    };

    if (!Array.isArray(state.sections)) state.sections = [];
    state.sections = state.sections.filter(sec => sec && typeof sec === 'object' && !Array.isArray(sec));

    // Chuẩn hoá id: chuỗi khớp ^[a-z0-9_-]{1,40}$, duy nhất; sai/trùng/thiếu thì sinh <type>-<n>
    const ID_RE = /^[a-z0-9_-]{1,40}$/;
    const seen = new Set();
    const bad = [];
    state.sections.forEach(sec => {
        if (!sec.type) sec.type = (typeof sec.id === 'string') ? sec.id : '';
        if (typeof sec.id === 'string' && ID_RE.test(sec.id) && !seen.has(sec.id)) {
            seen.add(sec.id);
        } else {
            bad.push(sec);
        }
    });
    const idMap = new Map();
    bad.forEach(sec => {
        const base = (typeof sec.type === 'string' && /^[a-z]{1,30}$/.test(sec.type)) ? sec.type : 'section';
        let n = 1;
        while (seen.has(`${base}-${n}`)) n++;
        const newId = `${base}-${n}`;
        seen.add(newId);
        if (typeof sec.id === 'string' && !idMap.has(sec.id)) idMap.set(sec.id, newId);
        sec.id = newId;
    });
    if (typeof state.selectedSectionId === 'string' && idMap.has(state.selectedSectionId)) {
        state.selectedSectionId = idMap.get(state.selectedSectionId);
    }
    if (state.sections.length && !seen.has(state.selectedSectionId)) {
        state.selectedSectionId = state.sections[0].id;
    }

    state.sections.forEach(sec => {
        if (sec.visible === undefined) sec.visible = true;
        if (sec.customFont === undefined) sec.customFont = '';
        if (sec.customTitleSize === undefined) sec.customTitleSize = '28';
        if (sec.customTextColor === undefined) sec.customTextColor = '';
        const plain = o => o && typeof o === 'object' && !Array.isArray(o);
        sec.style = Object.assign(defaultSectionStyle(), plain(sec.style) ? sec.style : {});
        if (!plain(sec.data)) sec.data = {};

        const def = getSectionDef(sec.type);
        if (!def) return; // loại lạ: giữ nguyên, không render
        if (!sec.name) sec.name = def.label;
        if (!sec.icon) sec.icon = def.icon;
        if (typeof def.defaults === 'function') {
            const d = def.defaults();
            Object.keys(d).forEach(k => {
                if (sec.data[k] === undefined) sec.data[k] = d[k];
            });
        }
        if (typeof def.migrate === 'function') {
            const out = def.migrate(sec.data);
            if (out) sec.data = out;
        }
    });

    // Không hạ schemaVersion khi state mới hơn mã hiện tại
    if (typeof state.schemaVersion === 'number' && state.schemaVersion > SCHEMA_VERSION) {
        console.warn('migrate: state có schemaVersion ' + state.schemaVersion + ' mới hơn mã hiện tại (' + SCHEMA_VERSION + '), giữ nguyên.');
    } else {
        state.schemaVersion = SCHEMA_VERSION;
    }
    return state;
}
