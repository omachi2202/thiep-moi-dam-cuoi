// 7. ĐỒNG HỒ ĐẾM NGƯỢC, NHẠC NỀN, HOA RƠI & POPUP QR (hành vi tương tác của thiệp)
let countdownInterval = null;

function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    document.getElementById('toastMessage').textContent = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2400);
}

function startCountdownTimer() {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateCountdownDisplay, 1000);
}

function updateCountdownDisplay() {
    const sec = appState.sections.find(s => s.id === 'countdown');
    if (!sec || !sec.visible) return;

    const target = new Date(sec.data.weddingIsoDate).getTime();
    const now = new Date().getTime();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    const elD = document.getElementById('cd-days');
    const elH = document.getElementById('cd-hours');
    const elM = document.getElementById('cd-mins');
    const elS = document.getElementById('cd-secs');

    if (elD) elD.textContent = String(days).padStart(2, '0');
    if (elH) elH.textContent = String(hours).padStart(2, '0');
    if (elM) elM.textContent = String(mins).padStart(2, '0');
    if (elS) elS.textContent = String(secs).padStart(2, '0');
}

function toggleAudioPlayback() {
    const audio = document.getElementById('weddingAudio');
    const btn = document.getElementById('floatingMusicBtn');
    const icon = document.getElementById('musicIcon');
    if (audio.paused) {
        audio.play().then(() => {
            btn.classList.add('spin-music');
            icon.className = 'fa-solid fa-compact-disc text-base';
            showToast("Đang phát nhạc nền thiệp cưới ♫");
        }).catch(() => {
            showToast("Không thể phát đường dẫn nhạc này.");
        });
    } else {
        audio.pause();
        btn.classList.remove('spin-music');
        icon.className = 'fa-solid fa-music text-sm';
    }
}

function initFallingEffect() {
    const container = document.getElementById('fallingContainer');
    container.innerHTML = '';
    const mode = appState.globalStyle.fallingEffect;
    if (mode === 'none') return;

    const symbols = mode === 'hearts' ? ['🌸', '💮', '💗'] : ['✨', '⭐', '💛'];
    for (let i = 0; i < 12; i++) {
        const span = document.createElement('span');
        span.className = 'petal';
        span.textContent = symbols[i % symbols.length];
        span.style.left = `${Math.random() * 92}%`;
        span.style.fontSize = `${10 + Math.random() * 8}px`;
        span.style.animationDuration = `${6 + Math.random() * 7}s`;
        span.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(span);
    }
}

function openGiftModal(side) {
    const info = appState.bankInfo[side];
    const modal = document.getElementById('giftModal');
    const primary = appState.globalStyle.primaryColor;

    document.getElementById('giftModalBadge').style.backgroundColor = primary;
    document.getElementById('giftModalCopyBtn').style.backgroundColor = primary;
    document.getElementById('giftModalTitle').textContent = side === 'groom' ? 'Gửi Mừng Cưới Nhà Trai' : 'Gửi Mừng Cưới Nhà Gái';
    document.getElementById('giftModalBank').textContent = info.bank;
    document.getElementById('giftModalAcc').textContent = info.acc;
    document.getElementById('giftModalOwner').textContent = info.owner;

    const qrUrl = `https://img.vietqr.io/image/${encodeURIComponent(info.bank.trim())}-${encodeURIComponent(info.acc.trim())}-compact2.png?accountName=${encodeURIComponent(info.owner.trim())}`;
    document.getElementById('giftModalQrImg').src = qrUrl;

    modal.classList.remove('hidden');
}

function closeGiftModal() {
    document.getElementById('giftModal').classList.add('hidden');
}

function copyBankAccount() {
    const acc = document.getElementById('giftModalAcc').textContent;
    const tempInput = document.createElement('input');
    tempInput.value = acc;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(`Đã sao chép STK: ${acc}`);
}

function handleRsvpSubmit(e) {
    e.preventDefault();
    showToast("Cảm ơn bạn đã gửi lời chúc & xác nhận tham dự!");
    e.target.reset();
}
