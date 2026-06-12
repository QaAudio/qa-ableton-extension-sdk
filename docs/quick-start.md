# Quick start — build your first Live extension (no Vue required)

This guide is for **music producers and beginners** who want a panel inside Ableton Live that looks native — **without learning Vue** or a heavy front-end framework.

You will:

1. Install the official [Ableton Extensions SDK](https://ableton.github.io/extensions-sdk/) and this UI kit.
2. Run the **starter extension** in `examples/starter-extension/` — a small **Tempo Tap** utility you can copy as your project template.
3. Style the panel with plain HTML and CSS from `@quantumaudio/ableton-extension-sdk`.

> **Vue is optional.** Knobs, faders, meters, and waveforms are Vue components. Buttons, sliders, labels, dialogs, and themes work with **plain HTML** — see the static demos in [`examples/`](../examples/).
>
> **Deep dive (interface.html, `ui/` folder, TypeScript ↔ webview):** [plain-html-webview.md](./plain-html-webview.md)

---

## What you are building

| Piece | Role |
|-------|------|
| **Ableton Extensions SDK** | Talks to Live (tempo, tracks, clips, commands). |
| **This package** | Makes your webview look like Live (dark/light theme, sliders, buttons). |
| **`examples/starter-extension/`** | A complete extension project — use it as your **starter template** (manifest, build, HTML panel, dev-run). |

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

**Starting your own extension?** Copy the starter folder instead of wiring files from scratch:

```bash
cp -r examples/starter-extension ../my-extension
cd ../my-extension
```

Then follow steps 2–4 below inside your copy. See [plain-html-webview.md](./plain-html-webview.md) for the full scaffold checklist.

---

## 2. Install Ableton's Extensions SDK

Copy Ableton's `.tgz` files into [`vendor/`](../vendor/) at the repo root (see [`vendor/README.md`](../vendor/README.md)), then install the starter example:

```bash
cd examples/starter-extension
npm install
```

Or install the tarballs directly from wherever you downloaded them:

```bash
cd examples/starter-extension
npm install /path/to/ableton-extensions-sdk-1.0.0-beta.0.tgz
npm install -D /path/to/ableton-extensions-cli-1.0.0-beta.0.tgz
npm install
```

The last `npm install` links `@quantumaudio/ableton-extension-sdk` from the repo root (`file:../..`).

---

## 3. Point at Live's Extension Host

Copy `.env.example` → `.env` in the starter folder, then set:

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

## 5. Project layout — `interface.html` and the `ui/` folder

Live loads **one bundled file** — no `node_modules` at runtime. Your panel HTML is inlined at build time and opened as a **data URL** (`data:text/html,...`).

Ableton's SDK examples use a single file named **`interface.html`**. The starter extension uses a **`ui/`** folder for easier editing — both patterns are equivalent.

```
examples/starter-extension/
├── manifest.json          ← Live reads name, version, entry file
├── build.ts               ← esbuild bundles everything into one .js file
├── src/
│   ├── extension.ts       ← activate() — register command, open panel, set tempo
│   ├── panel-document.ts  ← builds full HTML doc + inlined SDK CSS (like interface.html)
│   └── html.d.ts          ← TypeScript types for .html / .css imports
└── ui/
    └── panel-body.html    ← your markup fragment (plain HTML, SDK classes)
```

| Approach | When to use |
|----------|-------------|
| **`src/interface.html`** | One self-contained file (matches [Ableton modal-dialog](https://ableton.github.io/extensions-sdk/)). |
| **`ui/*.html` + `panel-document.ts`** | Separate markup from TypeScript; inject `{{PLACEHOLDERS}}` and SDK CSS in the builder. |

The build inlines:

- Your TypeScript (`src/extension.ts`)
- Panel HTML (`ui/panel-body.html` or `interface.html`)
- SDK styles (`theme.css` + `styles.css`) as text inside the webview

Full explanation, diagrams, and a from-scratch checklist: **[plain-html-webview.md](./plain-html-webview.md)**.

---

## 6. Styling without Vue

**Step A — load theme tokens** (on the root `<html>`):

```html
<html lang="en" class="qa-root" data-qa-theme="dark">
```

**Step B — use SDK CSS classes** on native elements (not Vue components):

```html
<div class="qa-slider-row">
  <span class="qa-label__text">Amount</span>
  <input class="qa-slider" type="range" min="0" max="100" value="50" />
  <span class="qa-slider-row__value">50%</span>
</div>
<button type="button" class="qa-button">Apply</button>
```

**Step C — inline CSS in the data URL** (required in Live — no `<link href="node_modules/...">`):

```ts
import themeCss from "@quantumaudio/ableton-extension-sdk/theme.css";
import stylesCss from "@quantumaudio/ableton-extension-sdk/styles.css";
// Inject into <style> when building the HTML string (see panel-document.ts)
```

**Step D — theme toggle in plain JS:**

```js
document.documentElement.setAttribute("data-qa-theme", "light");
```

Open [`examples/index.html`](../examples/index.html) in a browser (or serve the repo) to preview buttons, sliders, dialogs, and theme toggle **without Live**. The rename dialog ([`examples/dialog.html`](../examples/dialog.html)) mirrors Ableton's official `interface.html` flow with QA styling.

---

## 7. TypeScript ↔ webview JavaScript

The webview cannot call `context.application` directly. Your extension and the panel communicate in two directions:

### Extension → webview (open with data)

Pass values when building the HTML — placeholders, inline JSON, or attributes:

```ts
// extension.ts
const raw = await context.ui.showModalDialog(
  panelDataUrl(song.tempo),  // panel-document.ts builds the HTML string
  360,
  440,
);
```

```ts
// panel-document.ts — inject Live state into markup
panelBody.replaceAll("{{INITIAL_TEMPO}}", String(tempo));
```

### Webview → extension (user result)

Inside the panel, use **plain DOM** (`getElementById`, `addEventListener`) and send JSON back:

```js
// Inside the webview <script> (see ui/panel-body.html + PANEL_SCRIPT in panel-document.ts)
function closeWith(payload) {
  const message = { method: "close_and_send", params: [JSON.stringify(payload)] };
  if (window.webkit?.messageHandlers?.live) {
    window.webkit.messageHandlers.live.postMessage(message);
  } else if (window.chrome?.webview) {
    window.chrome.webview.postMessage(message);
  }
}

document.getElementById("apply-button").addEventListener("click", () => {
  closeWith({ action: "apply", tempo: Number(tempoSlider.value) });
});
```

Your extension reads the string from `showModalDialog`:

```ts
if (!raw) return;
const parsed = JSON.parse(raw) as { action: string; tempo?: number };
if (parsed.action === "cancel") return;
song.tempo = parsed.tempo!;
```

**You are styling native HTML elements** with `qa-*` classes — not mounting Vue components. Wire sliders, buttons, and inputs with standard browser APIs.

More patterns (keyboard UX, shared types, `build.ts` loaders): **[plain-html-webview.md](./plain-html-webview.md)**.

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
| Plain HTML panels (no Vue) | [plain-html-webview.md](./plain-html-webview.md) |
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

Copies of these guides live on the GitHub wiki:

- [Quick Start](https://github.com/QaAudio/qa-ableton-extension-sdk/wiki/Quick-Start)
- [Plain HTML webviews](https://github.com/QaAudio/qa-ableton-extension-sdk/wiki/Plain-HTML-Webview)
