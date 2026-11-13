// Thao tác trên danh sách section: đổi vị trí, ẩn/hiện, áp preset (T7 thêm add/duplicate/delete)
function moveSection(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= appState.sections.length) return;
    const temp = appState.sections[index];
    appState.sections[index] = appState.sections[targetIndex];
    appState.sections[targetIndex] = temp;
    renderAll();
    showToast("Đã thay đổi vị trí phần!");
}

function toggleSectionVisibility(secId) {
    const sec = appState.sections.find(s => s.id === secId);
    if (sec) {
        sec.visible = !sec.visible;
        renderAll();
        showToast(sec.visible ? `Đã hiện: ${sec.name}` : `Đã ẩn: ${sec.name}`);
    }
}

function applyThemePreset(presetName) {
    const presets = THEME_PRESETS;
    const p = presets[presetName];
    if (!p) return;
    Object.assign(appState.globalStyle, p);
    syncLeftControlsWithState();
    renderWeddingCanvas();
    showToast("Đã áp dụng bộ phối màu & phông chữ mới!");
}
