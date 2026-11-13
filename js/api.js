// Stub T1: chưa có backend. T8 sẽ hiện thực (fetch tới /api/..., gửi X-Edit-Key).
window.api = {
    available: false,
    checkHealth: () => Promise.reject(new Error('Chưa có backend')),
    uploadFile: (file) => Promise.reject(new Error('Chưa có backend')),
    publishCard: (slug, state) => Promise.reject(new Error('Chưa có backend')),
    postRsvp: (slug, body) => Promise.reject(new Error('Chưa có backend')),
    postWish: (slug, body) => Promise.reject(new Error('Chưa có backend')),
    getWishes: (slug) => Promise.reject(new Error('Chưa có backend'))
};
