# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repository.

## Project goal

Web app for customizing wedding invitations (thiệp cưới online), in the spirit of ziuwedding.site (default content mirrors its "MM03" template) and Canva's section-based editor. Editor + publishable guest page + RSVP/wishes stored in Excel. UI text and code comments are in Vietnamese — keep new UI copy in Vietnamese.

## Running

No build step, no npm, no bundler (Hiến pháp Điều 2). Front-end is plain `<script>` files; libs load from CDN: Font Awesome 6.5.1 and qrcodejs 1.0.0 (with SRI) are pinned; Tailwind Play CDN (`cdn.tailwindcss.com`) is NOT pinned yet (see docs/backlog.md); Google Fonts. Backend is FastAPI. From the repo root:

```bash
py -m pip install -r server/requirements.txt
py -m uvicorn server.app:app --reload --port 8000   # editor: http://localhost:8000/
py -m pytest server/tests -q
```

`python` on this machine is the Microsoft Store alias — always use `py`. Opening `index.html` via `file://` still edits (base64 images, JSON import/export, local draft) and HTML export works (via `js/export_bundle.js`), but publish, upload and RSVP/wishes submit are disabled (check `window.api.available`).

## File layout and script order

- `index.html` — editor shell (3 panes: sidebar, phone canvas, inspector). `invite.html` — guest page served at `/c/<slug>`.
- `css/app.css` (editor + card), `css/invite.css` (guest page).
- `js/` (all globals on `window`, load order matters, same in `index.html` and `invite.html`):
  `state.js` (DEFAULT_STATE, `migrate`, `SCHEMA_VERSION`, `escapeHtml/safeUrl/safeColor/safeFont`, `sectionVars`, `fieldAttr`) → `api.js` (`window.api`) → `runtime.js` (`CardRuntime`) → `sections/*.js` → `render.js` → editor-only: `store.js`, `section_ops.js`, `editor.js`.
  `invite.html` stops after `render.js` and has its own boot script.
- `js/sections/`: hero, family, events, countdown, rsvp, album, story, video, map, dresscode, wishes, gift, thanks.
- `server/app.py` (routes), `server/excel_store.py` (all xlsx I/O), `server/tests/` (pytest). Runtime data in `data/` (git-ignored): `guests.xlsx`, `cards/<slug>.json`, `uploads/`.

## Section registry

Each section type is exactly one file `js/sections/<type>.js` calling `registerSection({type, label, icon, defaults, renderCanvas(sec, ctx), renderInspector(sec), mount?(root, sec, ctx), migrate?(data), pageTitle?(sec), calendarEvent?(sec)})`. `ctx = {appState, mode, guestName, slug}`, `mode` is `editor | preview | invite | export` (`preview` = editor's "Xem thực tế": rendered like the guest page; compare `mode === 'editor'` rather than listing other modes). `renderCanvas` is pure (no fetch/side effects, no `contenteditable` outside editor mode).

Optional hooks: `pageTitle(sec)` gives the page title (page, export, slug suggestion); `calendarEvent(sec)` returns `{title, location, iso}` (calendar buttons). Runtime/editor/invite read them via `cardPageTitle(state)` / `cardCalendarEvent(state)` in `runtime.js` — the correct way to pull info from sections without comparing `type`. Need new per-type info outside a section file? Add another optional hook (see `.agents/rules/domain_sections.md` §1).

Adding a type = create the file + add a `<script>` tag in **both** `index.html` and `invite.html`. The section file list for export is derived from the registry (`Object.keys(SECTION_TYPES)`), so nothing else is needed. Never branch on `sec.id`/`sec.type` in `render.js`, `editor.js`, `runtime.js`. In sections use `sectionVars(sec, ctx)` for per-section style, `fieldAttr(ctx, key)` for inline-editable fields (`data-field`), and sanitize every user value with `escapeHtml`, URLs with `safeUrl`, colors with `safeColor`, fonts with `safeFont`.

## State, migrate, undo

`appState` = `{schemaVersion, globalStyle, bankInfo, sections[]}`; a section is `{id, type, name, icon, visible, customFont, customTitleSize, customTextColor, style, data}`. Changing a field means updating `DEFAULT_STATE`/section `defaults` **and** `migrate()` (idempotent; bump `SCHEMA_VERSION`, currently 5) so old JSON, drafts and `data/cards/*.json` still open. `migrate` runs on startup, draft restore, JSON import, and in `invite.html` after API load.

All mutations go through a mutator ending in `commitState(label)` (undo snapshot, autosave to localStorage `thiep:draft`, re-render). Never assign `appState` from UI code. Exception (Điều 5): `selectedSectionId` and `isPreviewMode` are UI state and change without `commitState`; read-only pages (`invite.html`, exported file) assign `appState` directly. Undo stack is capped (50 entries / ~30M chars).

## Shared runtime

`js/runtime.js` exposes `CardRuntime.init(rootEl, state, ctx)` / `CardRuntime.destroy()`: countdown, music, falling effect, envelope/curtain intro, gift modal + QR, scroll-reveal, calendar buttons, then each section's `mount()`. The editor calls `destroy()` before every re-`init`. In editor mode there is no intro, no scroll-reveal, no autoplay. In `preview` mode the intro/reveal/falling effect run like the guest page, but the intro overlay lives inside `#weddingCardFrame` (no body scroll lock); `CardRuntime.replayIntro()` replays it. Intro + calendar-button CSS live in `css/app.css` (shared by editor, guest page and export). Interactive logic is written once here — never copy it into template strings.

## Guest page and export

- Guest page `/c/<slug>?khach=<tên>`: `invite.html` fetches `GET /api/cards/<slug>`, `migrate`, renders `mode:'invite'`; guest name is decoded, cut to 60 chars, escaped, replaces `{khach}`.
- Export HTML (`openExportModal` in `editor.js`) builds a self-contained file by inlining CSS + `state/api/runtime/sections/render` JS + `window.__CARD_STATE__` + a bootstrap that reuses the same runtime. Sources come from `fetch` over http, or from `window.__EXPORT_SOURCES` in the generated `js/export_bundle.js` when opened via `file://` (AD-003). **After editing any of `css/app.css`, `js/state.js`, `js/api.js`, `js/runtime.js`, `js/render.js`, `js/sections/*.js`, run `py tools/build_export_bundle.py`** — never edit the bundle by hand; `pytest` (`test_export_bundle_fresh`) fails if it is stale. `.gitattributes` forces LF.
- RSVP/wishes post only via `window.api.postRsvp/postWish/getWishes`.

## Backend

Routes: `GET /api/health`; `GET|PUT /api/cards/{slug}` (first PUT creates and returns `editKey`; later PUTs need `X-Edit-Key`, compared with `secrets.compare_digest`); `POST /api/upload` (≤10MB, image/audio, server-generated name); `POST /api/cards/{slug}/rsvp`, `POST|GET .../wishes`; `GET .../export.xlsx` (edit key); `GET /c/{slug}`; static files (never `data/`, `server/`, `.agents/`, `.claude/`). Slug `^[a-z0-9-]{3,50}$`. The editor keeps edit keys in localStorage (`thiep:editKey:<slug>`). Multi-user mode (AD-004): env `THIEP_CREATE_CODES` (comma list; empty = off) requires `X-Create-Code` to create a card and to upload (or `X-Card-Slug` + `X-Edit-Key`); `THIEP_UPLOAD_QUOTA_MB` (default 2048, 507 when full); `THIEP_TRUST_CF=1` takes client IP from `CF-Connecting-IP` (only behind Cloudflare Tunnel). `GET /api/health` returns `needCreateCode`; `POST /api/cards/{slug}/verify-key` backs the editor's "open published card" flow. Docker: `Dockerfile` + `docs/deploy.md` (portal compose + Tunnel, data at `C:/dev/thiep_data`).

Guest data lives in `data/guests.xlsx` (sheets `RSVP`, `LoiChuc`, `KhachMoi`); all I/O via `excel_store.py` under a module `threading.Lock`, append-only, atomic temp file + `os.replace`; never rename/remove columns. Card JSON is written atomically too. Locks are in-process, so **run a single uvicorn worker** (no `--workers N`).

## Workflow docs

Rules live in `.agents/rules/` (start with `hard_constitution.md`; then `domain_frontend.md`, `domain_sections.md`, `domain_runtime_invite.md`, `domain_backend.md`, `domain_security_storage.md`, `domain_workflow_testing.md`, `domain_subagents_workflow.md`). Agent roster and routing: `.agents/AGENTS.md`; orchestration skill `/dieu-phoi`. Architecture decisions: `docs/quyet_dinh.md`; remaining work: `docs/backlog.md`; current spec: `docs/thiep-tuy-bien-sau/`. The main session only coordinates; code edits go through sub-agents per ticket.
