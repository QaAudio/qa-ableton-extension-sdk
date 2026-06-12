# Tempo Tap — starter extension

A **complete, commented** Ableton Live extension for beginners. It opens a Live-styled panel (plain HTML — **no Vue**) where you tap in a tempo and apply it to the project.

Full walkthrough: [`docs/quick-start.md`](../../docs/quick-start.md).

## Quick run

1. Install [Ableton Extensions SDK](https://ableton.github.io/extensions-sdk/) tarballs — see [`vendor/README.md`](../../vendor/README.md).
2. Copy `.env.example` → `.env` and set `EXTENSION_HOST_PATH`.
3. From this folder:

```bash
npm install
npm install /path/to/ableton-extensions-sdk-*.tgz
npm install -D /path/to/ableton-extensions-cli-*.tgz
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
| `src/panel-document.ts` | How to inline SDK CSS and build a data-URL webview |
| `ui/panel-body.html` | Your UI markup |
| `build.ts` | esbuild bundles one file for Live |

## Customize

- Rename the extension in `manifest.json`.
- Change `COMMAND_OPEN_PANEL` and add `context.ui.registerContextMenuAction(...)` to open from a right-click menu.
- Copy CSS classes from [`examples/`](../../examples/) static HTML demos.
