// Section: Video (YouTube hoặc MP4), tỉ lệ 16:9
(function () {
    // Trả { kind: 'youtube', src } | { kind: 'mp4', src } | null
    function parseVideoUrl(raw) {
        const s = String(raw === undefined || raw === null ? '' : raw).trim();
        if (!s) return null;
        let m = s.match(/^https?:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([A-Za-z0-9_-]{11})(?:[&#]|$)/i)
            || s.match(/^https?:\/\/(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})(?:[/?&#]|$)/i)
            || s.match(/^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{11})(?:[/?&#]|$)/i);
        if (m) return { kind: 'youtube', src: 'https://www.youtube-nocookie.com/embed/' + m[1] };
        if ((/^https?:\/\//i.test(s) || /^\/uploads\//.test(s)) && /\.mp4(?:[?#][^\s]*)?$/i.test(s) && !/[\s"'<>]/.test(s)) {
            return { kind: 'mp4', src: s };
        }
        return null;
    }
    window.parseVideoUrl = parseVideoUrl;

    registerSection({
        type: 'video',
        label: 'Video',
        icon: 'fa-circle-play',
        defaults: () => ({
            title: 'OUR VIDEO',
            subtitle: 'KHOẢNH KHẮC CỦA CHÚNG MÌNH',
            url: ''
        }),
        migrate(data) {
            if (typeof data.title !== 'string') data.title = 'OUR VIDEO';
            if (typeof data.subtitle !== 'string') data.subtitle = '';
            if (typeof data.url !== 'string') data.url = '';
            return data;
        },
        renderCanvas(sec, ctx) {
            const v = sectionVars(sec, ctx);
            const d = sec.data;
            const parsed = parseVideoUrl(d.url);
            let player;
            if (parsed && parsed.kind === 'youtube') {
                player = `<iframe src="${escapeHtml(parsed.src)}" title="Video" class="absolute inset-0 w-full h-full" frameborder="0" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
            } else if (parsed && parsed.kind === 'mp4') {
                player = `<video src="${escapeHtml(parsed.src)}" class="absolute inset-0 w-full h-full bg-black" controls playsinline preload="metadata"></video>`;
            } else {
                const msg = String(d.url || '').trim()
                    ? 'Đường dẫn video không hợp lệ. Chỉ hỗ trợ YouTube hoặc tệp .mp4.'
                    : 'Chưa có video. Dán đường dẫn YouTube hoặc .mp4.';
                player = `<div class="absolute inset-0 flex items-center justify-center text-center px-4 text-xs bg-slate-100 text-slate-500"><span><i class="fa-solid fa-triangle-exclamation mr-1"></i>${escapeHtml(msg)}</span></div>`;
            }
            return `
                <div class="py-10 px-6 text-center space-y-5" style="color: ${v.secColor};">
                    <div class="space-y-1">
                        <h3 class="font-bold tracking-widest uppercase" style="font-family: ${v.secFont}; font-size: ${v.titleSize}; color: ${v.pc};" ${fieldAttr(ctx, 'title')}>${escapeHtml(d.title)}</h3>
                        <p class="text-[11px] tracking-[0.22em] uppercase opacity-70" ${fieldAttr(ctx, 'subtitle')}>${escapeHtml(d.subtitle)}</p>
                    </div>
                    <div class="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-white bg-black/5">
                        ${player}
                    </div>
                </div>`;
        },
        renderInspector(sec) {
            const d = sec.data;
            const id = escapeHtml(sec.id);
            const bad = String(d.url || '').trim() && !parseVideoUrl(d.url);
            return `
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Tiêu đề</label>
                    <input type="text" value="${escapeHtml(d.title)}" oninput="updateSectionField('${id}','title',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Tiêu đề phụ</label>
                    <input type="text" value="${escapeHtml(d.subtitle)}" oninput="updateSectionField('${id}','subtitle',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                </div>
                <div>
                    <label class="block font-semibold text-slate-700 mb-1">Đường dẫn video (YouTube hoặc .mp4)</label>
                    <input type="text" value="${escapeHtml(d.url)}" placeholder="https://www.youtube.com/watch?v=..." oninput="updateSectionField('${id}','url',this.value,true)" class="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs">
                    <p class="text-[11px] mt-1 ${bad ? 'text-red-600' : 'text-slate-400'}">${bad ? 'Đường dẫn chưa hợp lệ.' : 'Hỗ trợ YouTube (watch, youtu.be, embed, shorts) và tệp .mp4 (http/https hoặc /uploads/).'}</p>
                </div>
            `;
        }
    });
})();
