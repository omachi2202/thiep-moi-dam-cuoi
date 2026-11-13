function renderAll() {
    renderSectionListSidebar();
    renderWeddingCanvas();
    renderRightInspector();
}

// 3. QUẢN LÝ SIDEBAR TRÁI (DANH SÁCH SECTION, SẮP XẾP, ẨN/HIỆN)
function switchLeftTab(tabName) {
    ['sections', 'theme', 'settings'].forEach(t => {
        document.getElementById(`leftTab-${t}`).classList.toggle('hidden', t !== tabName);
        const btn = document.getElementById(`tabBtn-${t}`);
        if (t === tabName) {
            btn.className = "py-3 flex flex-col items-center gap-1 border-b-2 border-violet-600 text-violet-700 bg-white";
        } else {
            btn.className = "py-3 flex flex-col items-center gap-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800";
        }
    });
}

function renderSectionListSidebar() {
    const container = document.getElementById('sectionListContainer');
    container.innerHTML = appState.sections.map((sec, idx) => {
        const isSelected = sec.id === appState.selectedSectionId;
        return `
        <div onclick="selectSection('${sec.id}')" class="p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${isSelected ? 'bg-violet-50 border-violet-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'} ${!sec.visible ? 'opacity-50' : ''}">
            <div class="flex items-center gap-2.5 overflow-hidden">
                <div class="w-7 h-7 rounded-lg ${isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center shrink-0 text-xs">
                    <i class="fa-solid ${sec.icon}"></i>
                </div>
                <div class="truncate">
                    <div class="text-xs font-semibold text-slate-800 truncate">${sec.name}</div>
                    <div class="text-[10px] text-slate-400">${sec.visible ? 'Đang hiển thị' : 'Đang ẩn'}</div>
                </div>
            </div>
            <div class="flex items-center gap-1 shrink-0" onclick="event.stopPropagation()">
                <button onclick="moveSection(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="w-6 h-6 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 flex items-center justify-center" title="Lên trên">
                    <i class="fa-solid fa-arrow-up text-[10px]"></i>
                </button>
                <button onclick="moveSection(${idx}, 1)" ${idx === appState.sections.length - 1 ? 'disabled' : ''} class="w-6 h-6 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 flex items-center justify-center" title="Xuống dưới">
                    <i class="fa-solid fa-arrow-down text-[10px]"></i>
                </button>
                <button onclick="toggleSectionVisibility('${sec.id}')" class="w-6 h-6 rounded hover:bg-slate-200 ${sec.visible ? 'text-violet-600' : 'text-slate-400'} flex items-center justify-center" title="Ẩn/Hiện phần này">
                    <i class="fa-solid ${sec.visible ? 'fa-eye' : 'fa-eye-slash'} text-xs"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

function selectSection(secId) {
    appState.selectedSectionId = secId;
    renderSectionListSidebar();
    renderRightInspector();

    // Highlight trên khung Canvas
    document.querySelectorAll('.wedding-section').forEach(el => {
        el.classList.toggle('selected-section', el.dataset.sectionId === secId);
    });

    // Cuộn mượt tới section đó
    const targetEl = document.querySelector(`.wedding-section[data-section-id="${secId}"]`);
    if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 4. VẼ KHUNG THIỆP CƯỚI TRỰC TIẾP (CENTER CANVAS)
function generateCalendarHtml(isoDateStr, primaryColor) {
    const d = new Date(isoDateStr || '2026-10-24T16:00:00');
    const year = isNaN(d.getFullYear()) ? 2026 : d.getFullYear();
    const month = isNaN(d.getMonth()) ? 9 : d.getMonth(); // 0-indexed
    const weddingDay = isNaN(d.getDate()) ? 24 : d.getDate();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (CN) -> 6 (T7)
    // Chuyển sang Thứ 2 là đầu tuần (0: T2 ... 6: CN)
    const offset = (firstDayOfMonth + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    let cells = weekDays.map(w => `<div class="font-bold text-[11px] py-1.5 opacity-70">${w}</div>`).join('');

    for (let i = 0; i < offset; i++) {
        cells += `<div></div>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
        if (day === weddingDay) {
            cells += `
            <div class="relative flex items-center justify-center py-1">
                <span class="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md" style="background-color: ${primaryColor};">
                    ${day}
                </span>
                <i class="fa-solid fa-heart text-[9px] absolute -top-0.5 right-1 text-rose-500"></i>
            </div>`;
        } else {
            cells += `<div class="py-1.5 text-xs">${day}</div>`;
        }
    }
    return cells;
}

function renderWeddingCanvas() {
    const frame = document.getElementById('weddingCardFrame');
    const viewport = document.getElementById('sectionsViewport');
    const g = appState.globalStyle;

    frame.style.backgroundColor = g.bgColor;
    frame.style.color = g.textColor;
    frame.style.fontFamily = g.bodyFont;
    document.getElementById('floatingMusicBtn').style.backgroundColor = g.primaryColor;

    viewport.innerHTML = appState.sections
        .filter(sec => sec.visible)
        .map(sec => {
            const isSelected = sec.id === appState.selectedSectionId;
            const secFont = sec.customFont || g.headingFont;
            const secColor = sec.customTextColor || g.textColor;
            const titleSize = sec.customTitleSize ? `${sec.customTitleSize}px` : '28px';

            let innerHtml = '';

            // --- SECTION 1: HERO BANNER ---
            if (sec.id === 'hero') {
                innerHtml = `
                <div class="relative text-center pb-8">
                    <div class="relative h-[470px] overflow-hidden">
                        <img src="${sec.data.heroImage}" alt="Wedding Banner" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/600x800/e2d9d0/5c4938?text=Wedding+Photo'">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                        <div class="absolute bottom-8 inset-x-4 text-white">
                            <p class="tracking-[0.28em] text-xs uppercase mb-2 opacity-90" contenteditable="true" onblur="updateSectionField('hero','tagline',this.innerText)">${sec.data.tagline}</p>
                            <h1 class="font-bold mb-2 drop-shadow" style="font-family: ${sec.customFont || g.scriptFont}; font-size: ${titleSize};" contenteditable="true" onblur="updateSectionField('hero','coupleShortName',this.innerText)">${sec.data.coupleShortName}</h1>
                            <div class="w-16 h-[1px] bg-white/70 mx-auto my-3"></div>
                            <p class="text-xl tracking-[0.2em] font-semibold" style="font-family: ${secFont};" contenteditable="true" onblur="updateSectionField('hero','dateDisplay',this.innerText)">${sec.data.dateDisplay}</p>
                        </div>
                    </div>
                    <p class="text-xs italic mt-4 px-6 opacity-80" style="color: ${secColor};" contenteditable="true" onblur="updateSectionField('hero','subNote',this.innerText)">${sec.data.subNote}</p>
                </div>`;
            }

            // --- SECTION 2: THÔNG TIN GIA ĐÌNH & LỜI MỜI ---
            else if (sec.id === 'family') {
                innerHtml = `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${secColor};">
                    <!-- Nhà Trai & Nhà Gái -->
                    <div class="grid grid-cols-2 gap-4 text-xs border-y border-amber-900/15 py-5">
                        <div class="space-y-1 pr-2 border-r border-amber-900/15">
                            <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${g.primaryColor};">Nhà Trai</p>
                            <p class="whitespace-pre-line font-semibold leading-relaxed" contenteditable="true" onblur="updateSectionField('family','groomParents',this.innerText)">${sec.data.groomParents}</p>
                            <p class="text-[11px] opacity-75" contenteditable="true" onblur="updateSectionField('family','groomAddress',this.innerText)">${sec.data.groomAddress}</p>
                        </div>
                        <div class="space-y-1 pl-2">
                            <p class="font-bold uppercase tracking-wider text-[11px]" style="color: ${g.primaryColor};">Nhà Gái</p>
                            <p class="whitespace-pre-line font-semibold leading-relaxed" contenteditable="true" onblur="updateSectionField('family','brideParents',this.innerText)">${sec.data.brideParents}</p>
                            <p class="text-[11px] opacity-75" contenteditable="true" onblur="updateSectionField('family','brideAddress',this.innerText)">${sec.data.brideAddress}</p>
                        </div>
                    </div>

                    <!-- Lời mời -->
                    <div class="space-y-1.5">
                        <h3 class="font-bold tracking-[0.15em] text-sm" style="font-family: ${secFont}; color: ${g.primaryColor};" contenteditable="true" onblur="updateSectionField('family','inviteHeader',this.innerText)">${sec.data.inviteHeader}</h3>
                        <p class="text-[11px] uppercase tracking-widest opacity-75" contenteditable="true" onblur="updateSectionField('family','inviteSub',this.innerText)">${sec.data.inviteSub}</p>
                    </div>

                    <!-- Tên đầy đủ Cô Dâu & Chú Rể -->
                    <div class="py-2 space-y-1" style="font-family: ${sec.customFont || g.scriptFont}; font-size: ${titleSize};">
                        <div class="font-bold" contenteditable="true" onblur="updateSectionField('family','groomFullName',this.innerText)">${sec.data.groomFullName}</div>
                        <div class="text-base opacity-70">&amp;</div>
                        <div class="font-bold" contenteditable="true" onblur="updateSectionField('family','brideFullName',this.innerText)">${sec.data.brideFullName}</div>
                    </div>

                    <!-- Ảnh tròn cặp đôi -->
                    <div class="w-48 h-60 mx-auto rounded-t-full overflow-hidden border-4 border-white shadow-lg">
                        <img src="${sec.data.coupleAvatar}" alt="Couple" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400x500/e2d9d0/5c4938?text=Couple'">
                    </div>
                </div>`;
            }

            // --- SECTION 3: LỊCH TRÌNH SỰ KIỆN & CHỈ ĐƯỜNG ---
            else if (sec.id === 'events') {
                innerHtml = `
                <div class="py-10 px-6 text-center space-y-6 bg-black/[0.02]" style="color: ${secColor};">
                    <!-- Sự kiện 1: Tiệc Mừng Cưới -->
                    <div class="bg-white/90 rounded-2xl p-6 shadow-sm border border-amber-900/10 space-y-2.5">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${secFont}; font-size: ${titleSize}; color: ${g.primaryColor};" contenteditable="true" onblur="updateSectionField('events','event1Title',this.innerText)">${sec.data.event1Title}</h3>
                        <div class="w-10 h-0.5 mx-auto opacity-40" style="background-color: ${g.primaryColor};"></div>
                        <p class="font-bold text-sm tracking-wide" contenteditable="true" onblur="updateSectionField('events','event1Time',this.innerText)">${sec.data.event1Time}</p>
                        <p class="text-2xl font-bold tracking-wider" style="color: ${g.primaryColor}; font-family: ${secFont};" contenteditable="true" onblur="updateSectionField('events','event1Date',this.innerText)">${sec.data.event1Date}</p>
                        <p class="text-xs italic opacity-75" contenteditable="true" onblur="updateSectionField('events','event1Lunar',this.innerText)">${sec.data.event1Lunar}</p>
                        <p class="text-xs font-medium pt-1" contenteditable="true" onblur="updateSectionField('events','event1Venue',this.innerText)">${sec.data.event1Venue}</p>
                        <div class="pt-2">
                            <a href="${sec.data.event1MapUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white shadow transition hover:opacity-90" style="background-color: ${g.primaryColor};">
                                <i class="fa-solid fa-location-dot"></i> XEM CHỈ ĐƯỜNG
                            </a>
                        </div>
                    </div>

                    <!-- Sự kiện 2: Lễ Thành Hôn -->
                    <div class="bg-white/90 rounded-2xl p-6 shadow-sm border border-amber-900/10 space-y-2.5">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${secFont}; font-size: ${titleSize}; color: ${g.primaryColor};" contenteditable="true" onblur="updateSectionField('events','event2Title',this.innerText)">${sec.data.event2Title}</h3>
                        <div class="w-10 h-0.5 mx-auto opacity-40" style="background-color: ${g.primaryColor};"></div>
                        <p class="font-bold text-sm tracking-wide" contenteditable="true" onblur="updateSectionField('events','event2Time',this.innerText)">${sec.data.event2Time}</p>
                        <p class="text-2xl font-bold tracking-wider" style="color: ${g.primaryColor}; font-family: ${secFont};" contenteditable="true" onblur="updateSectionField('events','event2Date',this.innerText)">${sec.data.event2Date}</p>
                        <p class="text-xs italic opacity-75" contenteditable="true" onblur="updateSectionField('events','event2Lunar',this.innerText)">${sec.data.event2Lunar}</p>
                        <p class="text-xs font-medium pt-1" contenteditable="true" onblur="updateSectionField('events','event2Venue',this.innerText)">${sec.data.event2Venue}</p>
                        <div class="pt-2">
                            <a href="${sec.data.event2MapUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white shadow transition hover:opacity-90" style="background-color: ${g.primaryColor};">
                                <i class="fa-solid fa-location-dot"></i> XEM CHỈ ĐƯỜNG
                            </a>
                        </div>
                    </div>
                </div>`;
            }

            // --- SECTION 4: LỊCH THÁNG & ĐẾM NGƯỢC (COUNTDOWN) ---
            else if (sec.id === 'countdown') {
                const calendarGrid = generateCalendarHtml(sec.data.weddingIsoDate, g.primaryColor);
                innerHtml = `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${secColor};">
                    <div class="space-y-2">
                        <h3 class="font-bold" style="font-family: ${sec.customFont || g.scriptFont}; font-size: ${titleSize}; color: ${g.primaryColor};" contenteditable="true" onblur="updateSectionField('countdown','quoteTitle',this.innerText)">${sec.data.quoteTitle}</h3>
                        <p class="text-xs italic leading-relaxed px-2 opacity-85" contenteditable="true" onblur="updateSectionField('countdown','quoteText',this.innerText)">${sec.data.quoteText}</p>
                    </div>

                    <!-- Tờ lịch tháng -->
                    <div class="bg-white rounded-2xl p-5 shadow-sm border border-amber-900/10">
                        <div class="font-bold text-sm tracking-widest uppercase mb-3 pb-2 border-b border-slate-100" style="color: ${g.primaryColor}; font-family: ${secFont};" contenteditable="true" onblur="updateSectionField('countdown','calendarTitle',this.innerText)">
                            ${sec.data.calendarTitle}
                        </div>
                        <div class="grid grid-cols-7 gap-1 text-center">
                            ${calendarGrid}
                        </div>
                    </div>

                    <!-- Đồng hồ đếm ngược -->
                    <div class="space-y-3 pt-2">
                        <p class="text-xs font-bold tracking-[0.25em] uppercase opacity-75">COUNTDOWN</p>
                        <div class="grid grid-cols-4 gap-2.5">
                            <div class="bg-white rounded-xl py-3 px-2 shadow-sm border border-amber-900/10">
                                <span id="cd-days" class="block text-xl font-bold" style="color: ${g.primaryColor}; font-family: ${secFont};">00</span>
                                <span class="text-[10px] uppercase opacity-70">Ngày</span>
                            </div>
                            <div class="bg-white rounded-xl py-3 px-2 shadow-sm border border-amber-900/10">
                                <span id="cd-hours" class="block text-xl font-bold" style="color: ${g.primaryColor}; font-family: ${secFont};">00</span>
                                <span class="text-[10px] uppercase opacity-70">Giờ</span>
                            </div>
                            <div class="bg-white rounded-xl py-3 px-2 shadow-sm border border-amber-900/10">
                                <span id="cd-mins" class="block text-xl font-bold" style="color: ${g.primaryColor}; font-family: ${secFont};">00</span>
                                <span class="text-[10px] uppercase opacity-70">Phút</span>
                            </div>
                            <div class="bg-white rounded-xl py-3 px-2 shadow-sm border border-amber-900/10">
                                <span id="cd-secs" class="block text-xl font-bold" style="color: ${g.primaryColor}; font-family: ${secFont};">00</span>
                                <span class="text-[10px] uppercase opacity-70">Giây</span>
                            </div>
                        </div>
                    </div>
                </div>`;
            }

            // --- SECTION 5: XÁC NHẬN THAM DỰ (RSVP) & HỘP MỪNG CƯỚI ---
            else if (sec.id === 'rsvp') {
                innerHtml = `
                <div class="py-10 px-6 text-center space-y-5 bg-black/[0.02]" style="color: ${secColor};">
                    <h3 class="font-bold uppercase tracking-wider" style="font-family: ${secFont}; font-size: ${titleSize}; color: ${g.primaryColor};">Xác Nhận Tham Dự</h3>
                    <p class="text-xs leading-relaxed opacity-85" contenteditable="true" onblur="updateSectionField('rsvp','rsvpIntro',this.innerText)">${sec.data.rsvpIntro}</p>

                    <!-- Form RSVP -->
                    <form onsubmit="handleRsvpSubmit(event)" class="bg-white p-5 rounded-2xl shadow-sm border border-amber-900/10 space-y-3 text-left text-xs">
                        <div>
                            <label class="block font-semibold mb-1 opacity-80">Tên của bạn *</label>
                            <input type="text" required placeholder="Nhập họ và tên..." class="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none">
                        </div>
                        <div class="grid grid-cols-2 gap-2.5">
                            <div>
                                <label class="block font-semibold mb-1 opacity-80">Khách của</label>
                                <select class="w-full px-3 py-2.5 rounded-xl border border-slate-200">
                                    <option>Nhà Trai</option>
                                    <option>Nhà Gái</option>
                                </select>
                            </div>
                            <div>
                                <label class="block font-semibold mb-1 opacity-80">Số người đi cùng</label>
                                <select class="w-full px-3 py-2.5 rounded-xl border border-slate-200">
                                    <option>Đi 1 mình</option>
                                    <option>Đi cùng 1 người</option>
                                    <option>Đi cùng gia đình</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block font-semibold mb-1 opacity-80">Lời chúc gửi tới cô dâu & chú rể</label>
                            <textarea rows="2" placeholder="Chúc hai bạn trăm năm hạnh phúc..." class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"></textarea>
                        </div>
                        <button type="submit" class="w-full py-3 rounded-xl font-bold text-white shadow transition hover:opacity-95 text-center" style="background-color: ${g.primaryColor};">
                            GỬI XÁC NHẬN & LỜI CHÚC
                        </button>
                    </form>

                    <!-- 2 Nút Gửi Mừng Cưới Nhà Trai / Nhà Gái -->
                    <div class="pt-2 space-y-2.5">
                        <button onclick="openGiftModal('groom'); event.stopPropagation();" class="w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow flex items-center justify-center gap-2 transition transform hover:scale-[1.01]" style="background-color: ${g.primaryColor};">
                            <i class="fa-solid fa-gift"></i>
                            <span contenteditable="true" onblur="updateSectionField('rsvp','groomBtnText',this.innerText)">${sec.data.groomBtnText}</span>
                        </button>
                        <button onclick="openGiftModal('bride'); event.stopPropagation();" class="w-full py-3 px-4 rounded-xl font-bold text-xs border-2 bg-white shadow-sm flex items-center justify-center gap-2 transition transform hover:scale-[1.01]" style="border-color: ${g.primaryColor}; color: ${g.primaryColor};">
                            <i class="fa-solid fa-heart"></i>
                            <span contenteditable="true" onblur="updateSectionField('rsvp','brideBtnText',this.innerText)">${sec.data.brideBtnText}</span>
                        </button>
                    </div>
                </div>`;
            }

            // --- SECTION 6: ALBUM ẢNH & LỜI CẢM ƠN ---
            else if (sec.id === 'album') {
                const photosGrid = sec.data.photos.map((url, idx) => `
                    <div class="overflow-hidden rounded-xl shadow-sm border border-white aspect-[3/4] bg-slate-100 group">
                        <img src="${url}" alt="Album ${idx + 1}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" onerror="this.src='https://placehold.co/400x500/e2d9d0/5c4938?text=Wedding+Photo'">
                    </div>
                `).join('');

                innerHtml = `
                <div class="py-10 px-6 text-center space-y-6" style="color: ${secColor};">
                    <div class="space-y-1">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${secFont}; font-size: ${titleSize}; color: ${g.primaryColor};" contenteditable="true" onblur="updateSectionField('album','albumTitle',this.innerText)">${sec.data.albumTitle}</h3>
                        <p class="text-[11px] tracking-[0.22em] uppercase opacity-70" contenteditable="true" onblur="updateSectionField('album','albumSubtitle',this.innerText)">${sec.data.albumSubtitle}</p>
                    </div>

                    <!-- Lưới 6 ảnh cưới -->
                    <div class="grid grid-cols-2 gap-2.5">
                        ${photosGrid}
                    </div>

                    <!-- Lời cảm ơn -->
                    <div class="pt-6 border-t border-amber-900/15 space-y-2">
                        <h4 class="text-3xl font-bold" style="font-family: ${g.scriptFont}; color: ${g.primaryColor};">Thank you!</h4>
                        <p class="text-xs leading-relaxed px-2 opacity-85" contenteditable="true" onblur="updateSectionField('album','thankYouText',this.innerText)">${sec.data.thankYouText}</p>
                    </div>

                    <!-- Footer Credit -->
                    <div class="pt-4 text-[10px] tracking-[0.2em] uppercase opacity-50" contenteditable="true" onblur="updateSectionField('album','footerCredit',this.innerText)">
                        ${sec.data.footerCredit}
                    </div>
                </div>`;
            }

            return `
            <section data-section-id="${sec.id}" onclick="selectSection('${sec.id}')" class="wedding-section ${isSelected ? 'selected-section' : ''}">
                <!-- Nhãn công cụ nổi kiểu Canva khi di chuột vào Section -->
                <div class="section-badge absolute top-2 right-2 z-30 items-center gap-1 bg-violet-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md">
                    <i class="fa-solid fa-pen-ruler"></i>
                    <span>${sec.name}</span>
                </div>
                ${innerHtml}
            </section>`;
        }).join('');

    updateCountdownDisplay();
}

// 5. BẢNG THUỘC TÍNH BÊN PHẢI (CONTEXTUAL INSPECTOR CHO TỪNG SECTION)
function renderRightInspector() {
    const sec = appState.sections.find(s => s.id === appState.selectedSectionId);
    if (!sec) return;

    document.getElementById('inspectorTitle').textContent = sec.name;
    document.getElementById('inspectorBadge').textContent = sec.id.toUpperCase();

    const fontOptionsHtml = FONT_OPTIONS.map(opt =>
        `<option value="${opt.value}" ${sec.customFont === opt.value ? 'selected' : ''}>${opt.label}</option>`
    ).join('');

    let specificFieldsHtml = '';

    if (sec.id === 'hero') {
        specificFieldsHtml = `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tên Cặp Đôi (Trang bìa)</label>
                <input type="text" value="${sec.data.coupleShortName}" oninput="updateSectionField('hero','coupleShortName',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Thông điệp</label>
                    <input type="text" value="${sec.data.tagline}" oninput="updateSectionField('hero','tagline',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Ngày hiển thị</label>
                    <input type="text" value="${sec.data.dateDisplay}" oninput="updateSectionField('hero','dateDisplay',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ảnh Bìa Chính (URL hoặc Tải ảnh)</label>
                <input type="text" value="${sec.data.heroImage}" oninput="updateSectionField('hero','heroImage',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300 mb-1.5">
                <label class="w-full py-2 px-3 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-200 cursor-pointer flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-upload"></i> Tải ảnh từ máy tính
                    <input type="file" accept="image/*" class="hidden" onchange="handleLocalImageUpload(event, 'hero', 'heroImage')">
                </label>
            </div>
        `;
    } else if (sec.id === 'family') {
        specificFieldsHtml = `
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Họ tên Chú Rể</label>
                    <input type="text" value="${sec.data.groomFullName}" oninput="updateSectionField('family','groomFullName',this.value,true)" class="w-full px-2.5 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Họ tên Cô Dâu</label>
                    <input type="text" value="${sec.data.brideFullName}" oninput="updateSectionField('family','brideFullName',this.value,true)" class="w-full px-2.5 py-2 rounded-lg border border-slate-300">
                </div>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Phụ huynh Nhà Trai</label>
                <textarea rows="2" oninput="updateSectionField('family','groomParents',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${sec.data.groomParents}</textarea>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Địa chỉ Nhà Trai</label>
                <input type="text" value="${sec.data.groomAddress}" oninput="updateSectionField('family','groomAddress',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Phụ huynh Nhà Gái</label>
                <textarea rows="2" oninput="updateSectionField('family','brideParents',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${sec.data.brideParents}</textarea>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Địa chỉ Nhà Gái</label>
                <input type="text" value="${sec.data.brideAddress}" oninput="updateSectionField('family','brideAddress',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ảnh Cặp Đôi (Khung vòm)</label>
                <input type="text" value="${sec.data.coupleAvatar}" oninput="updateSectionField('family','coupleAvatar',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300 mb-1.5">
                <label class="w-full py-2 px-3 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-semibold border border-violet-200 cursor-pointer flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-upload"></i> Đổi ảnh từ máy tính
                    <input type="file" accept="image/*" class="hidden" onchange="handleLocalImageUpload(event, 'family', 'coupleAvatar')">
                </label>
            </div>
        `;
    } else if (sec.id === 'events') {
        specificFieldsHtml = `
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div class="font-bold text-violet-700">Sự kiện 1 (Tiệc Cưới)</div>
                <input type="text" value="${sec.data.event1Title}" oninput="updateSectionField('events','event1Title',this.value,true)" placeholder="Tên sự kiện" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event1Time}" oninput="updateSectionField('events','event1Time',this.value,true)" placeholder="Giờ & Thứ" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event1Date}" oninput="updateSectionField('events','event1Date',this.value,true)" placeholder="Ngày dương lịch" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event1Lunar}" oninput="updateSectionField('events','event1Lunar',this.value,true)" placeholder="Ngày âm lịch" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event1Venue}" oninput="updateSectionField('events','event1Venue',this.value,true)" placeholder="Địa điểm" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event1MapUrl}" oninput="updateSectionField('events','event1MapUrl',this.value,true)" placeholder="Link Google Maps" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div class="font-bold text-violet-700">Sự kiện 2 (Lễ Thành Hôn)</div>
                <input type="text" value="${sec.data.event2Title}" oninput="updateSectionField('events','event2Title',this.value,true)" placeholder="Tên sự kiện" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event2Time}" oninput="updateSectionField('events','event2Time',this.value,true)" placeholder="Giờ & Thứ" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event2Date}" oninput="updateSectionField('events','event2Date',this.value,true)" placeholder="Ngày dương lịch" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event2Lunar}" oninput="updateSectionField('events','event2Lunar',this.value,true)" placeholder="Ngày âm lịch" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event2Venue}" oninput="updateSectionField('events','event2Venue',this.value,true)" placeholder="Địa điểm" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
                <input type="text" value="${sec.data.event2MapUrl}" oninput="updateSectionField('events','event2MapUrl',this.value,true)" placeholder="Link Google Maps" class="w-full px-2.5 py-1.5 rounded border border-slate-300">
            </div>
        `;
    } else if (sec.id === 'countdown') {
        specificFieldsHtml = `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Ngày & Giờ Cưới (Tự động vẽ Lịch & Đếm ngược)</label>
                <input type="datetime-local" value="${sec.data.weddingIsoDate}" onchange="updateWeddingDateTime(this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Tiêu đề Tháng hiển thị</label>
                <input type="text" value="${sec.data.calendarTitle}" oninput="updateSectionField('countdown','calendarTitle',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Câu trích dẫn (Quote)</label>
                <textarea rows="3" oninput="updateSectionField('countdown','quoteText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${sec.data.quoteText}</textarea>
            </div>
        `;
    } else if (sec.id === 'rsvp') {
        specificFieldsHtml = `
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Lời nhắn xác nhận tham dự</label>
                <textarea rows="3" oninput="updateSectionField('rsvp','rsvpIntro',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${sec.data.rsvpIntro}</textarea>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Chữ trên nút QR Nhà Trai</label>
                <input type="text" value="${sec.data.groomBtnText}" oninput="updateSectionField('rsvp','groomBtnText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Chữ trên nút QR Nhà Gái</label>
                <input type="text" value="${sec.data.brideBtnText}" oninput="updateSectionField('rsvp','brideBtnText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
        `;
    } else if (sec.id === 'album') {
        const photoInputs = sec.data.photos.map((url, i) => `
            <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold text-slate-400 w-4">#${i + 1}</span>
                <input type="text" value="${url}" oninput="updateAlbumPhoto(${i}, this.value)" class="flex-1 px-2 py-1.5 rounded border border-slate-300 text-[11px]">
                <label class="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-600" title="Tải ảnh lên">
                    <i class="fa-solid fa-upload"></i>
                    <input type="file" accept="image/*" class="hidden" onchange="handleAlbumFileUpload(event, ${i})">
                </label>
            </div>
        `).join('');

        specificFieldsHtml = `
            <div>
                <label class="block font-semibold text-slate-700 mb-1.5">Danh sách 6 ảnh trong Album</label>
                <div class="space-y-2">${photoInputs}</div>
            </div>
            <div>
                <label class="block font-semibold text-slate-700 mb-1">Lời cảm ơn cuối thiệp</label>
                <textarea rows="2" oninput="updateSectionField('album','thankYouText',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">${sec.data.thankYouText}</textarea>
            </div>
        `;
    }

    document.getElementById('inspectorContent').innerHTML = `
        <!-- Khối Tùy chỉnh Font & Cỡ chữ riêng cho Section này (Canva Style) -->
        <div class="p-3.5 rounded-xl bg-violet-50/70 border border-violet-200 space-y-3">
            <div class="font-bold text-violet-900 flex items-center gap-1.5">
                <i class="fa-solid fa-font text-violet-600"></i> Kiểu chữ riêng của Phần này
            </div>
            <div>
                <label class="block text-[11px] font-medium text-slate-600 mb-1">Phông chữ Tiêu đề phần này</label>
                <select onchange="updateSectionStyle('${sec.id}', 'customFont', this.value)" class="w-full px-2.5 py-2 rounded-lg border border-slate-300 bg-white">
                    ${fontOptionsHtml}
                </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Cỡ tiêu đề (${sec.customTitleSize}px)</label>
                    <input type="range" min="18" max="48" value="${sec.customTitleSize}" oninput="updateSectionStyle('${sec.id}', 'customTitleSize', this.value)" class="w-full accent-violet-600 mt-1.5">
                </div>
                <div>
                    <label class="block text-[11px] font-medium text-slate-600 mb-1">Màu chữ riêng</label>
                    <div class="flex items-center gap-1.5">
                        <input type="color" value="${sec.customTextColor || appState.globalStyle.textColor}" onchange="updateSectionStyle('${sec.id}', 'customTextColor', this.value)" class="w-8 h-7 rounded border border-slate-300 cursor-pointer">
                        <button onclick="updateSectionStyle('${sec.id}', 'customTextColor', '')" class="text-[10px] text-slate-500 underline">Mặc định</button>
                    </div>
                </div>
            </div>
        </div>

        <hr class="border-slate-200">

        <!-- Nội dung chi tiết của Section -->
        <div class="space-y-3">
            <div class="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Nội dung chi tiết</div>
            ${specificFieldsHtml}
        </div>
    `;
}
