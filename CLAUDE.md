# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project goal

A web app for customizing wedding invitations (thiệp cưới online), in the spirit of ziuwedding.site (the default content mirrors its "MM03" template) and Canva's section-based editor. UI text and code comments are in Vietnamese — keep new UI copy in Vietnamese.

## Running

No build, package manager, lint, or tests. The whole app is a single file, `index.html`, using CDN Tailwind (`cdn.tailwindcss.com`), Font Awesome 6.5.1, and Google Fonts. Open it directly in a browser or serve the folder statically:

```bash
python -m http.server 8000
```

## Architecture (`index.html`)

Three-pane editor: left sidebar (section list + global style/bank/audio controls), center phone-width canvas (`#weddingCardFrame` → `#sectionsViewport`), right inspector for the selected section.

**State-driven re-render.** A single `appState` (deep copy of `DEFAULT_STATE`) holds everything: `globalStyle` (fonts, colors, falling effect, audio URL), `bankInfo` (groom/bride), and an ordered `sections` array. Each section has `id`, `name`, `icon`, `visible`, per-section overrides (`customFont`, `customTitleSize`, `customTextColor`), and a `data` object of editable fields. UI is regenerated from state as HTML template strings:
- `renderAll()` = `renderSectionListSidebar()` + `renderWeddingCanvas()` + `renderRightInspector()`.
- `renderWeddingCanvas()` and `renderRightInspector()` each branch on `sec.id` (`hero`, `family`, `events`, `countdown`, `rsvp`, `album`). Adding a section type means adding a `DEFAULT_STATE.sections` entry **and** a branch in both renderers.
- Mutations go through `updateSectionField` / `updateSectionStyle` / `updateGlobalStyle` / `updateBankInfo`, which mutate `appState` then re-render. Canvas text is inline-editable via `contenteditable` + `onblur="updateSectionField(...)"`; `fromInspector=true` skips re-rendering the inspector so the input being typed in keeps focus.
- Left-sidebar form controls are static HTML synced from state by `syncLeftControlsWithState()` (call it after replacing `appState`, e.g. in `resetToDefault`).

**Export.** `openExportModal()` clones the rendered `#sectionsViewport`, strips editor-only artifacts (`.section-badge`, `contenteditable`, `onblur`, `onclick`, `selected-section`), and wraps it in a standalone HTML string with its own minimal `<script>` (countdown, audio toggle, gift modal, RSVP). Runtime behavior therefore exists twice — in the editor script and inside the export template string (note the escaped `<\/script>`). Changes to interactive behavior or the font list must be mirrored in both.

**Limitations to be aware of:** no persistence (no localStorage/backend — state is lost on reload); uploaded images are stored as base64 data URLs in state; RSVP submit only shows a toast.
