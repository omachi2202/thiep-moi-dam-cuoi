// 2. KHỞI TẠO ỨNG DỤNG
window.onload = function () {
    syncLeftControlsWithState();
    renderAll();
    initFallingEffect();
    startCountdownTimer();
};

function syncLeftControlsWithState() {
    document.getElementById('globalScriptFont').value = appState.globalStyle.scriptFont;
    document.getElementById('globalHeadingFont').value = appState.globalStyle.headingFont;
    document.getElementById('globalBodyFont').value = appState.globalStyle.bodyFont;
    document.getElementById('inputPrimaryColor').value = appState.globalStyle.primaryColor;
    document.getElementById('inputBgColor').value = appState.globalStyle.bgColor;
    document.getElementById('inputTextColor').value = appState.globalStyle.textColor;
    document.getElementById('selectFallingEffect').value = appState.globalStyle.fallingEffect;
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
    renderWeddingCanvas();
    renderRightInspector();
}

function updateSectionField(secId, fieldKey, value, fromInspector = false) {
    const sec = appState.sections.find(s => s.id === secId);
    if (!sec) return;
    sec.data[fieldKey] = value;
    renderWeddingCanvas();
    if (!fromInspector) {
        renderRightInspector();
    }
}

function updateWeddingDateTime(isoVal) {
    const sec = appState.sections.find(s => s.id === 'countdown');
    if (!sec) return;
    sec.data.weddingIsoDate = isoVal;
    const d = new Date(isoVal);
    if (!isNaN(d.getTime())) {
        sec.data.calendarTitle = `THÁNG ${d.getMonth() + 1} / ${d.getFullYear()}`;
    }
    renderWeddingCanvas();
    renderRightInspector();
    showToast("Đã cập nhật Lịch tháng & Đồng hồ đếm ngược!");
}

function updateAlbumPhoto(index, url) {
    const sec = appState.sections.find(s => s.id === 'album');
    if (sec) {
        sec.data.photos[index] = url;
        renderWeddingCanvas();
    }
}

function handleLocalImageUpload(event, secId, fieldKey) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        updateSectionField(secId, fieldKey, e.target.result, false);
        showToast("Đã tải ảnh lên thành công!");
    };
    reader.readAsDataURL(file);
}

function handleAlbumFileUpload(event, idx) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        updateAlbumPhoto(idx, e.target.result);
        renderRightInspector();
        showToast(`Đã cập nhật ảnh Album #${idx + 1}!`);
    };
    reader.readAsDataURL(file);
}

function updateGlobalStyle(key, val) {
    appState.globalStyle[key] = val;
    if (key === 'audioUrl') {
        const audio = document.getElementById('weddingAudio');
        audio.src = val;
    }
    if (key === 'fallingEffect') {
        initFallingEffect();
    }
    renderWeddingCanvas();
}

function selectPresetAudio(url) {
    document.getElementById('inputAudioUrl').value = url;
    updateGlobalStyle('audioUrl', url);
    showToast("Đã đổi nhạc nền thiệp cưới!");
}

function updateBankInfo(side, field, value) {
    appState.bankInfo[side][field] = value;
}

// 8. CHẾ ĐỘ XEM THỰC TẾ (PREVIEW) & KHÔI PHỤC MẶC ĐỊNH
function setPreviewMode(isPreview) {
    appState.isPreviewMode = isPreview;
    const left = document.getElementById('leftSidebar');
    const right = document.getElementById('rightSidebar');
    const card = document.getElementById('weddingCardFrame');
    const btnEdit = document.getElementById('btnModeEdit');
    const btnPreview = document.getElementById('btnModePreview');

    if (isPreview) {
        left.classList.add('hidden');
        right.classList.add('hidden');
        card.classList.remove('editor-mode');
        btnPreview.className = "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-violet-600 text-white shadow transition";
        btnEdit.className = "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 text-slate-300 hover:text-white transition";
    } else {
        left.classList.remove('hidden');
        right.classList.remove('hidden');
        card.classList.add('editor-mode');
        btnEdit.className = "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-violet-600 text-white shadow transition";
        btnPreview.className = "px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 text-slate-300 hover:text-white transition";
    }
}

function resetToDefault() {
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    syncLeftControlsWithState();
    renderAll();
    initFallingEffect();
    showToast("Đã khôi phục về mẫu gốc MM03!");
}

// 9. TRÌNH XUẤT FILE HTML ĐỘC LẬP (1-CLICK EXPORT STANDALONE WEB PAGE)
function openExportModal() {
    const g = appState.globalStyle;
    const heroSec = appState.sections.find(s => s.id === 'hero');
    const pageTitle = heroSec ? `Thiệp Cưới ${heroSec.data.coupleShortName}` : 'Thiệp Cưới Online';
    const cdSec = appState.sections.find(s => s.id === 'countdown');
    const targetIso = cdSec ? cdSec.data.weddingIsoDate : '2026-10-24T16:00:00';

    // Lấy phần HTML nội dung của các section nhưng loại bỏ các thuộc tính contenteditable và thanh badge công cụ
    const cloneViewport = document.getElementById('sectionsViewport').cloneNode(true);
    cloneViewport.querySelectorAll('.section-badge').forEach(el => el.remove());
    cloneViewport.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    cloneViewport.querySelectorAll('[onblur]').forEach(el => el.removeAttribute('onblur'));
    cloneViewport.querySelectorAll('.wedding-section').forEach(el => {
        el.removeAttribute('onclick');
        el.classList.remove('selected-section');
    });

    const standaloneHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;700&family=Dancing+Script:wght@500;700&family=Great+Vibes&family=Montserrat:wght@400;600;700&family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Open+Sans:wght@400;600&family=Oswald:wght@400;600&family=Philosopher:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body { background-color: #e2e8f0; margin: 0; padding: 0; }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-music { animation: spinSlow 6s linear infinite; }
    </style>
</head>
<body class="min-h-screen flex justify-center">
    <div class="w-full max-w-[430px] min-h-screen shadow-2xl relative overflow-hidden" style="background-color: ${g.bgColor}; color: ${g.textColor}; font-family: ${g.bodyFont};">
        <button id="floatingMusicBtn" onclick="toggleAudioPlayback()" class="fixed bottom-5 left-5 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white" style="background-color: ${g.primaryColor};">
            <i id="musicIcon" class="fa-solid fa-music"></i>
        </button>
        <audio id="weddingAudio" loop preload="auto" src="${g.audioUrl}"></audio>

        <div>${cloneViewport.innerHTML}</div>

        <!-- Popup QR Mừng Cưới -->
        <div id="giftModal" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative">
                <button onclick="document.getElementById('giftModal').classList.add('hidden')" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">✕</button>
                <h4 id="giftModalTitle" class="text-lg font-bold text-slate-800 mb-2">Mừng Cưới</h4>
                <img id="giftModalQrImg" src="" alt="VietQR" class="w-48 h-48 object-contain mx-auto mb-3 border rounded-xl p-2">
                <div class="text-xs space-y-1 text-slate-700 bg-amber-50 p-3 rounded-xl">
                    <p>Ngân hàng: <strong id="giftModalBank"></strong></p>
                    <p>Số TK: <strong id="giftModalAcc"></strong></p>
                    <p>Chủ TK: <strong id="giftModalOwner"></strong></p>
                </div>
            </div>
        </div>
    </div>

    <script>
        const BANK_INFO = ${JSON.stringify(appState.bankInfo)};
        const TARGET_DATE = new Date("${targetIso}").getTime();

        function updateCountdown() {
            const diff = Math.max(0, TARGET_DATE - Date.now());
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff / 3600000) % 24);
            const m = Math.floor((diff / 60000) % 60);
            const s = Math.floor((diff / 1000) % 60);
            if(document.getElementById('cd-days')) document.getElementById('cd-days').textContent = String(d).padStart(2,'0');
            if(document.getElementById('cd-hours')) document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
            if(document.getElementById('cd-mins')) document.getElementById('cd-mins').textContent = String(m).padStart(2,'0');
            if(document.getElementById('cd-secs')) document.getElementById('cd-secs').textContent = String(s).padStart(2,'0');
        }
        setInterval(updateCountdown, 1000);
        updateCountdown();

        function toggleAudioPlayback() {
            const a = document.getElementById('weddingAudio');
            const b = document.getElementById('floatingMusicBtn');
            if (a.paused) { a.play(); b.classList.add('spin-music'); }
            else { a.pause(); b.classList.remove('spin-music'); }
        }

        function openGiftModal(side) {
            const info = BANK_INFO[side];
            document.getElementById('giftModalTitle').textContent = side === 'groom' ? 'Gửi Mừng Cưới Nhà Trai' : 'Gửi Mừng Cưới Nhà Gái';
            document.getElementById('giftModalBank').textContent = info.bank;
            document.getElementById('giftModalAcc').textContent = info.acc;
            document.getElementById('giftModalOwner').textContent = info.owner;
            document.getElementById('giftModalQrImg').src = 'https://img.vietqr.io/image/' + encodeURIComponent(info.bank) + '-' + encodeURIComponent(info.acc) + '-compact2.png?accountName=' + encodeURIComponent(info.owner);
            document.getElementById('giftModal').classList.remove('hidden');
        }

        function handleRsvpSubmit(e) {
            e.preventDefault();
            e.target.innerHTML = '<div class="py-4 text-center font-semibold text-emerald-700">Cảm ơn bạn đã gửi lời chúc và xác nhận tham dự!</div>';
        }
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
