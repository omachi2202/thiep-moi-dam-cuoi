// 1. DỮ LIỆU GỐC (MÔ PHỎNG CHUẨN ZIUWEDDING.SITE/MM03 - TÙNG & NGỌC)
const DEFAULT_STATE = {
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
        audioUrl: "https://media.vocaroo.com/mp3/15iKnK2wEfyY"
    },
    bankInfo: {
        groom: { bank: "MB", acc: "0988123456", owner: "NGUYEN THANH TUNG" },
        bride: { bank: "VCB", acc: "0123456789", owner: "TRAN KHANH NGOC" }
    },
    sections: [
        {
            id: 'hero',
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
    { label: 'Montserrat (Trẻ trung)', value: "'Montserrat', sans-serif" }
];

// Bộ phối màu & font mẫu (chuyển từ biến cục bộ `presets` của applyThemePreset)
const THEME_PRESETS = {
    classic: {
        scriptFont: "'Philosopher', serif",
        headingFont: "'Philosopher', serif",
        bodyFont: "'Noto Serif', serif",
        primaryColor: "#8c6239",
        bgColor: "#fdfbf7",
        textColor: "#3d312a"
    },
    blush: {
        scriptFont: "'Great Vibes', cursive",
        headingFont: "'Playfair Display', serif",
        bodyFont: "'Montserrat', sans-serif",
        primaryColor: "#be185d",
        bgColor: "#fff9fb",
        textColor: "#4a1d32"
    },
    sage: {
        scriptFont: "'Cormorant Garamond', serif",
        headingFont: "'Cormorant Garamond', serif",
        bodyFont: "'Open Sans', sans-serif",
        primaryColor: "#3f6212",
        bgColor: "#f7faf7",
        textColor: "#263819"
    },
    royal: {
        scriptFont: "'Dancing Script', cursive",
        headingFont: "'Playfair Display', serif",
        bodyFont: "'Noto Serif', serif",
        primaryColor: "#1e3a8a",
        bgColor: "#f8fafc",
        textColor: "#1e293b"
    }
};
