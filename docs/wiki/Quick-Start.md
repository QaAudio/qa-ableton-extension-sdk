# Quick start — build your first Live extension (no Vue required)

This guide is for **music producers and beginners** who want a panel inside Ableton Live that looks native — **without learning Vue** or a heavy front-end framework.

You will:

1. Install the official [Ableton Extensions SDK](https://ableton.github.io/extensions-sdk/) and this UI kit.
2. Run the **starter extension** in [`examples/starter-extension/`](https://github.com/QaAudio/qa-ableton-extension-sdk/tree/main/examples/starter-extension) — a small **Tempo Tap** utility you can **copy as your project template**.
3. Style the panel with plain HTML and CSS from `@quantumaudio/ableton-extension-sdk`.

> **Vue is optional.** Knobs, faders, meters, and waveforms need Vue. Buttons, sliders, labels, and themes work with **plain HTML**.
>
> **`interface.html` and TypeScript ↔ webview wiring:** [Plain-HTML-Webview](Plain-HTML-Webview) (full text: [docs/plain-html-webview.md](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/docs/plain-html-webview.md))

---

## What you are building

| Piece | Role |
|-------|------|
| **Ableton Extensions SDK** | Talks to Live (tempo, tracks, clips, commands). |
| **This package** | Makes your webview look like Live (dark/light theme, sliders, buttons). |
| **`examples/starter-extension/`** | Complete template project — copy it to start a new extension. |

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Live 12.4.5 beta** | Extensions SDK is beta-only. [Sign up for the beta](https://ableton.github.io/extensions-sdk/) and enable **Developer Mode** in Live settings. |
| **Node.js ≥ 24** | Check with `node -v`. |
| **Extensions SDK tarballs** | Download `@ableton-extensions/sdk` and `@ableton-extensions/cli` from Ableton — not on public npm. See [vendor/README.md](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/vendor/README.md). |

---

## 1. Get the code

```bash
git clone https://github.com/QaAudio/qa-ableton-extension-sdk.git
cd qa-ableton-extension-sdk
npm ci
```

**Your own extension:** copy the starter folder:

```bash
cp -r examples/starter-extension ../my-extension
cd ../my-extension
```

---

## 2. Install Ableton's Extensions SDK

Copy Ableton's `.tgz` files into [`vendor/`](https://github.com/QaAudio/qa-ableton-extension-sdk/tree/main/vendor) at the repo root (see [vendor/README.md](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/vendor/README.md)), then:

```bash
cd examples/starter-extension
npm install
```

Or install tarballs from your download folder:

```bash
cd examples/starter-extension
npm install /path/to/ableton-extensions-sdk-1.0.0-beta.0.tgz
npm install -D /path/to/ableton-extensions-cli-1.0.0-beta.0.tgz
npm install
```

---

## 3. Point at Live's Extension Host

Create `examples/starter-extension/.env` (copy from `.env.example`):

```env
EXTENSION_HOST_PATH=C:\Program Files\Ableton\Live 12 Beta\Resources\Extensions\Extension Host.js
```

Use your actual Live beta install path.

---

## 4. Run in Live

With Live open and **Developer Mode** on:

```bash
cd examples/starter-extension
npm start
```

In Live, run command **`quantumaudio.starter.open-tempo-panel`**. The modal lets you tap tempo, fine-tune with a slider, and apply.

---

## 5. Project layout — `interface.html` and `ui/`

Live loads **one file** (`dist/extension.js`). The panel is HTML inlined at build time and shown via `showModalDialog` as a data URL.

```
examples/starter-extension/
├── manifest.json
├── build.ts
├── src/extension.ts         ← activate(), command, Live API
├── src/panel-document.ts    ← full HTML document + inlined SDK CSS
├── src/html.d.ts
└── ui/panel-body.html       ← plain HTML markup (SDK classes)
```

Ableton's examples use a single **`src/interface.html`**. The starter uses **`ui/`** + a document builder — same result, easier to edit markup.

Details: [Plain-HTML-Webview](Plain-HTML-Webview).

---

## 6. Styling without Vue

```html
<html lang="en" class="qa-root" data-qa-theme="dark">
```

```html
<input class="qa-slider" type="range" min="0" max="100" value="50" />
<button type="button" class="qa-button">Apply</button>
```

Inline `theme.css` + `styles.css` from the package in `<style>` (see `panel-document.ts`). Preview: [examples/index.html](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/examples/index.html).

---

## 7. TypeScript ↔ webview

- **Extension → panel:** pass data when building the HTML (`{{PLACEHOLDERS}}`, inline JSON).
- **Panel → extension:** `postMessage({ method: "close_and_send", params: [json] })` from the webview; parse the string returned by `showModalDialog`.
- **Inside the panel:** plain DOM + `qa-*` CSS classes — no Vue.

See [Plain-HTML-Webview](Plain-HTML-Webview) and [`panel-document.ts`](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/examples/starter-extension/src/panel-document.ts).

---

## 8. Package for installation

```bash
npm run package
```

Install the `.ablx` in Live → Settings → Extensions.

---

## Next steps

| Goal | Link |
|------|------|
| Plain HTML / `interface.html` | [Plain-HTML-Webview](Plain-HTML-Webview) |
| [Quick Start (full)](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/docs/quick-start.md) | Repo copy with troubleshooting |
| Component gallery | [qaaudio.github.io/qa-ableton-extension-sdk](https://qaaudio.github.io/qa-ableton-extension-sdk/) |
| README — API reference | [README](https://github.com/QaAudio/qa-ableton-extension-sdk#readme) |
| Ableton Extensions SDK | [ableton.github.io/extensions-sdk](https://ableton.github.io/extensions-sdk/) |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `extensions-cli` not found | Install `@ableton-extensions/cli` tarball. |
| Dev-run cannot find Live | Fix `EXTENSION_HOST_PATH` in `.env`. |
| Panel looks unstyled | Inline `theme.css` + `styles.css` (see `panel-document.ts`). |
| Command does not appear | Rebuild, restart dev-run, confirm Developer Mode. |
