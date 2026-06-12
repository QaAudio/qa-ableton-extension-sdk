# Quick start — build your first Live extension (no Vue required)

This guide is for **music producers and beginners** who want a panel inside Ableton Live that looks native — without learning Vue or a heavy front-end framework.

You will:

1. Install the official [Ableton Extensions SDK](https://ableton.github.io/extensions-sdk/) and this UI kit.
2. Run the **starter extension** in `examples/starter-extension/` — a small **Tempo Tap** utility.
3. Style the panel with plain HTML and CSS from `@quantumaudio/ableton-extension-sdk`.

> **Vue is optional.** Knobs, faders, meters, and waveforms are Vue components. Buttons, sliders, labels, dialogs, and themes work with **plain HTML** — see the static demos in [`examples/`](../examples/).

---

## What you are building

| Piece | Role |
|-------|------|
| **Ableton Extensions SDK** | Talks to Live (tempo, tracks, clips, commands). |
| **This package** | Makes your webview look like Live (dark/light theme, sliders, buttons). |
| **`examples/starter-extension/`** | A complete extension project you can copy. |

The starter extension registers a command, opens a styled modal panel, lets you **tap in a tempo**, and applies it to the current Live set.

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Live 12.4.5 beta** | Extensions SDK is beta-only. [Sign up for the beta](https://ableton.github.io/extensions-sdk/) and enable **Developer Mode** in Live settings. |
| **Node.js ≥ 24** | Check with `node -v`. |
| **Extensions SDK tarballs** | Download `@ableton-extensions/sdk` and `@ableton-extensions/cli` from Ableton — not on public npm. See [`vendor/README.md`](../vendor/README.md). |

---

## 1. Get the code

```bash
git clone https://github.com/QaAudio/qa-ableton-extension-sdk.git
cd qa-ableton-extension-sdk
npm install
```

---

## 2. Install Ableton's Extensions SDK

From the folder where you extracted Ableton's SDK download:

```bash
cd examples/starter-extension
npm install /path/to/ableton-extensions-sdk-1.0.0-beta.0.tgz
npm install -D /path/to/ableton-extensions-cli-1.0.0-beta.0.tgz
npm install
```

```bash
npm install ../../../../vendor/extensions-sdk-1.0.0-beta.0/ableton-extensions-sdk-1.0.0-beta.0.tgz
npm install -D ../../../../vendor/extensions-sdk-1.0.0-beta.0/ableton-extensions-cli-1.0.0-beta.0.tgz
```

---

## 3. Point at Live's Extension Host

```env
EXTENSION_HOST_PATH=C:\Program Files\Ableton\Live 12 Beta\Resources\Extensions\Extension Host.js
```

Use your actual Live beta install path. On macOS it is usually under `/Applications/Ableton Live 12 Beta.app/...`.

---

## 4. Run in Live

With Live open and **Developer Mode** on:

```bash
cd examples/starter-extension
npm start
```

This builds `dist/extension.js` and launches Live's Extension Host.

In Live, run the extension command **`quantumaudio.starter.open-tempo-panel`** (from the Extensions / command UI for your build). A modal opens with:

- Current project tempo
- **Tap** — click on the beat to estimate BPM
- **Apply** — writes the new tempo to Live
- Dark / light theme toggle

---

## 5. How the pieces fit together

```
examples/starter-extension/
├── manifest.json          ← Live reads name, version, entry file
├── build.ts               ← esbuild bundles everything into one .js file
├── src/
│   ├── extension.ts       ← activate() — register command, open panel, set tempo
│   ├── panel-document.ts  ← builds HTML + inlined SDK CSS
│   └── html.d.ts          ← TypeScript types for .html imports
└── ui/
    └── panel-body.html    ← your UI markup (plain HTML)
```

Live loads **one bundled file** — no `node_modules` at runtime. The build inlines:

- Your TypeScript (`src/extension.ts`)
- Panel HTML (`ui/panel-body.html`)
- SDK styles (`theme.css` + `styles.css`) as text inside the webview

---

## 6. Styling without Vue

**Step A — load theme tokens** (in your HTML document):

```html
<html lang="en" class="qa-root" data-qa-theme="dark">
```

**Step B — use SDK CSS classes** (same as Live):

```html
<div class="qa-slider-row">
  <span class="qa-label__text">Amount</span>
  <input class="qa-slider" type="range" min="0" max="100" value="50" />
  <span class="qa-slider-row__value">50%</span>
</div>
<button type="button" class="qa-button">Apply</button>
```

**Step C — optional JS helpers** from the main package (not `/vue`):

```js
import { createThemeProvider } from "@quantumaudio/ableton-extension-sdk";
createThemeProvider(document.documentElement, { defaultTheme: "dark" });
```

Open [`examples/index.html`](../examples/index.html) in a browser (or serve the repo) to preview buttons, sliders, dialogs, and theme toggle **without Live**.

---

## 7. Talking to Live from the panel

The webview cannot call `context.application` directly. It sends a result string back to your extension:

```js
// Inside the webview (see ui/panel-body.html in the starter project)
const message = { method: "close_and_send", params: [JSON.stringify({ tempo: 128 })] };
if (window.webkit?.messageHandlers?.live) {
  window.webkit.messageHandlers.live.postMessage(message);
} else if (window.chrome?.webview) {
  window.chrome.webview.postMessage(message);
}
```

Your extension opens the dialog and handles the result:

```ts
const result = await context.ui.showModalDialog(dataUrl, 360, 420);
if (result) {
  const { tempo } = JSON.parse(result) as { tempo: number };
  context.application.song.tempo = tempo;
}
```

---

## 8. Package for installation

```bash
npm run package
```

Install the generated `.ablx` in Live → Settings → Extensions.

---

## Next steps

| Goal | Where to go |
|------|-------------|
| Copy UI patterns | [`examples/`](../examples/) static HTML + [`npm run dev:examples`](../README.md) Vue gallery |
| Official Live API | [Ableton Extensions SDK docs](https://ableton.github.io/extensions-sdk/) |
| Rich layouts (optional Vue) | [`examples/vue/`](../examples/vue/) |
| Full reference | [README](../README.md) component table |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `extensions-cli` not found | Install `@ableton-extensions/cli` tarball (step 2). |
| Dev-run cannot find Live | Fix `EXTENSION_HOST_PATH` in `.env`. |
| Panel looks unstyled | Ensure `theme.css` and `styles.css` are inlined in the HTML (see `src/panel-document.ts`). |
| Command does not appear | Rebuild (`npm run build:dev`), restart dev-run, confirm Developer Mode. |
| `npm install` fails on SDK | SDK is not on npm — use local `.tgz` from Ableton. |

---

## Wiki

A copy of this guide lives on the GitHub wiki: [Quick Start](https://github.com/QaAudio/qa-ableton-extension-sdk/wiki/Quick-Start).
