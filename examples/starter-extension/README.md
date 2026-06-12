# Tempo Tap — starter extension

A **complete, commented** Ableton Live extension for beginners. It opens a Live-styled panel (plain HTML — **no Vue**) where you tap in a tempo and apply it to the project.

**Use this folder as your template** — copy it to start a new extension instead of scaffolding from scratch.

| Guide | Content |
|-------|---------|
| [Quick start](../../docs/quick-start.md) | Install SDK, run in Live, package `.ablx` |
| [Plain HTML webviews](../../docs/plain-html-webview.md) | `interface.html` vs `ui/`, TypeScript ↔ webview, DOM wiring |

## Quick run

1. Copy Ableton's SDK `.tgz` files into [`vendor/`](../../vendor/) — see [`vendor/README.md`](../../vendor/README.md).
2. Copy `.env.example` → `.env` and set `EXTENSION_HOST_PATH`.
3. From this folder:

```bash
npm install
npm start
```

4. In Live (Developer Mode on), run command **`quantumaudio.starter.open-tempo-panel`**.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Dev build + `extensions-cli run` |
| `npm run build:dev` | Bundle to `dist/extension.js` with sourcemaps |
| `npm run build` | Production bundle (minified) |
| `npm run package` | Build + create `.ablx` installer |
| `npm run typecheck` | TypeScript check |

## What to read first

| File | Why |
|------|-----|
| `src/extension.ts` | Entry point — `activate`, command, Live API |
| `src/panel-document.ts` | Builds the full HTML document (like Ableton's `interface.html`) + inlined SDK CSS |
| `ui/panel-body.html` | Your UI markup fragment — edit this for layout and SDK classes |
| `build.ts` | esbuild bundles one file for Live |

This project uses **`ui/panel-body.html`** instead of a single `src/interface.html` so markup stays easy to edit. Both patterns are documented in [plain-html-webview.md](../../docs/plain-html-webview.md).

## Customize

- Rename the extension in `manifest.json`.
- Change `COMMAND_OPEN_PANEL` and add `context.ui.registerContextMenuAction(...)` to open from a right-click menu.
- Copy CSS classes from [`examples/`](../../examples/) static HTML demos.
