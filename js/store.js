// Stub T1: T6 sẽ hiện thực commitState (snapshot undo, autosave, render), undo/redo, nhập/xuất JSON.
// Chưa thay lời gọi trong mutator; hiện chỉ render lại toàn bộ.
window.commitState = (label, opts = {}) => renderAll();
