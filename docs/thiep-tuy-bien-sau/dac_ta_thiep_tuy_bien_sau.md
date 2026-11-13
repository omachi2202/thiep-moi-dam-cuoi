# Đặc tả & giao kèo chung — Thiệp tuỳ biến sâu

Nguồn yêu cầu: `PLAN_THUC_HIEN.md`. Luật: `.agents/rules/`. Mọi phiếu phải tuân theo giao kèo dưới đây; muốn đổi giao kèo thì dừng và báo.

## G1. Tệp & thứ tự nạp (T1 tạo sẵn đủ, tệp chưa làm để stub có comment `// TODO T<n>`)
```
css/app.css  css/invite.css
js/state.js  js/api.js  js/runtime.js
js/sections/{hero,family,events,countdown,rsvp,album,story,video,map,dresscode,wishes,gift,thanks}.js
js/render.js  js/store.js  js/section_ops.js  js/editor.js
```
`index.html` nạp đúng thứ tự trên (sau CDN). `invite.html` nạp `state.js, api.js, runtime.js, sections/*.js, render.js` (không nạp store/section_ops/editor).

## G2. Hàm toàn cục (chủ sở hữu → người dùng)
| Hàm / biến | Tệp | Phiếu tạo | Ghi chú |
|---|---|---|---|
| `DEFAULT_STATE, FONT_OPTIONS, THEME_PRESETS` | state.js | T1 (T7 mở rộng presets, T13 thêm globalStyle) | |
| `SECTION_TYPES, registerSection(def), migrate(state), escapeHtml(s), safeUrl(u)` | state.js | T3 | `safeUrl` trả '' nếu không phải http(s)/data:image/`/uploads/` |
| `renderAll(), renderSectionListSidebar(), renderWeddingCanvas(), renderRightInspector()` | render.js | T1, T3 lặp registry | |
| `renderCardHtml(state, ctx) → string` | render.js | T3 | HTML các section hiển thị, không dấu vết editor khi `mode !== 'editor'` |
| `CardRuntime.init(rootEl, state, ctx)`, `CardRuntime.destroy()` | runtime.js | T4 | init gọi `SECTION_TYPES[t].mount` cho từng section |
| `toggleAudioPlayback, openGiftModal, closeGiftModal, copyBankAccount, showToast` | runtime.js | T1 (giữ tên toàn cục) | markup có `onclick` gọi các hàm này |
| `commitState(label, opts)` | store.js | T6 | `opts.skipInspector` thay `fromInspector`; trước T6, store.js stub: `commitState = (l,o)=>renderAll(o)` |
| `undo(), redo(), exportStateJson(), importStateJson(file), restoreDraft()` | store.js | T6 | |
| `addSection(type), duplicateSection(id), deleteSection(id), moveSection(i,dir), toggleSectionVisibility(id), applyThemePreset(name)` | section_ops.js | T1 chuyển move/toggle/applyThemePreset vào; T7 thêm phần còn lại | |
| `updateSectionField, updateSectionStyle, updateGlobalStyle, updateBankInfo, syncLeftControlsWithState, openExportModal` | editor.js | T1 | |
| `window.api = {available, checkHealth(), uploadFile(file)→Promise<url>, publishCard(slug,state)→Promise<{url,editKey?}>, postRsvp(slug,body), postWish(slug,body), getWishes(slug)}` | api.js | T8 (T1 stub: `available:false`, các hàm reject) | |

## G3. ctx
`{ appState, mode: 'editor'|'invite'|'export', guestName: string, slug: string|null }`.

## G4. Hợp đồng section
Theo `.agents/rules/domain_sections.md` §1–§2. Trường sửa inline: thuộc tính `data-field="<key>"` + `contenteditable` chỉ khi `mode==='editor'`; `render.js` (T3) gắn một listener `focusout` chung gọi `updateSectionField(secId, key, innerText)`.
Slot runtime cố định: countdown section (T3) có `<div data-slot="countdown"></div>` và `<div data-slot="calendar-actions"></div>`.

## G5. globalStyle mới (T13 thêm vào DEFAULT_STATE + migrate; T14 áp class; T15 dùng ở runtime)
| Khoá | Giá trị | Mặc định | Lớp CSS áp lên `#weddingCardFrame` / trang khách |
|---|---|---|---|
| `bgTexture` | none, paper, floral, silk | none | `tex-<v>` |
| `frameStyle` | none, single, double, floral-corner | none | `frame-<v>` |
| `cornerOrnament` | none, leaf, rose | none | `orn-<v>` |
| `revealAnimation` | none, fade-up, zoom, slide | fade-up | mỗi section có `reveal-<v>`; runtime thêm `.is-visible` |
| `fallingEffect` | none, hearts, petals, snow, stars | hearts | (runtime) |
| `introStyle` | none, envelope, curtain | envelope | (runtime, chỉ invite/export) |

Section `style` (T14): `{bgColor, bgImage, bgOverlayOpacity(0–0.9), paddingY('', 'sm','md','lg'), align('', 'left','center','right'), animation(''=theo global|none|fade-up|zoom|slide), ornament('', 'top','bottom','both')}`.

## G6. API
Theo `.agents/rules/domain_backend.md` §3. `api.js` gửi `X-Edit-Key` lấy từ `localStorage['thiep:editKey:<slug>']`.

## G7. Mốc so sánh
Trước T1, phiên chính chụp canvas mặc định (`docs/thiep-tuy-bien-sau/moc/truoc_T1.png`). Sau T1 và T3 chụp lại so sánh.
