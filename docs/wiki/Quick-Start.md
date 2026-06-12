# Quick start — build your first Live extension (no Vue required)

This guide is for **music producers and beginners** who want a panel inside Ableton Live that looks native — without learning Vue or a heavy front-end framework.

You will:

1. Install the official [Ableton Extensions SDK](https://ableton.github.io/extensions-sdk/) and this UI kit.
2. Run the **starter extension** in [`examples/starter-extension/`](https://github.com/QaAudio/qa-ableton-extension-sdk/tree/main/examples/starter-extension) — a small **Tempo Tap** utility.
3. Style the panel with plain HTML and CSS from `@quantumaudio/ableton-extension-sdk`.

> **Vue is optional.** Knobs, faders, meters, and waveforms are Vue components. Buttons, sliders, labels, dialogs, and themes work with **plain HTML** — see the static demos in [`examples/`](https://github.com/QaAudio/qa-ableton-extension-sdk/tree/main/examples).

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
| **Extensions SDK tarballs** | Download `@ableton-extensions/sdk` and `@ableton-extensions/cli` from Ableton — not on public npm. See [vendor/README.md](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/vendor/README.md). |

---

## 1. Get the code

```bash
git clone https://github.com/QaAudio/qa-ableton-extension-sdk.git
cd qa-ableton-extension-sdk
npm ci
```

---

## 2. Install Ableton's Extensions SDK

```bash
cd examples/starter-extension
npm install /path/to/ableton-extensions-sdk-1.0.0-beta.0.tgz
npm install -D /path/to/ableton-extensions-cli-1.0.0-beta.0.tgz
npm install
```

The last `npm install` links `@quantumaudio/ableton-extension-sdk` from the repo root (`file:../..`).

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

## 5. Project layout

```
examples/starter-extension/
├── manifest.json
├── build.ts
├── src/extension.ts       ← activate(), command, Live API
├── src/panel-document.ts    ← inline SDK CSS + HTML data URL
└── ui/panel-body.html       ← plain HTML markup
```

Live loads **one bundled file** (`dist/extension.js`) — no `node_modules` at runtime.

---

## 6. Styling without Vue

```html
<html lang="en" class="qa-root" data-qa-theme="dark">
```

```html
<input class="qa-slider" type="range" min="0" max="100" value="50" />
<button type="button" class="qa-button">Apply</button>
```

Preview static demos: [examples/index.html](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/examples/index.html).

---

## 7. Panel ↔ extension messaging

The webview posts `{ method: "close_and_send", params: [jsonString] }` via `webkit.messageHandlers.live` (macOS) or `chrome.webview` (Windows). The extension reads the string from `showModalDialog` and updates `song.tempo`.

See [`src/panel-document.ts`](https://github.com/QaAudio/qa-ableton-extension-sdk/blob/main/examples/starter-extension/src/panel-document.ts) for the full pattern.

---

## 8. Package for installation

```bash
npm run package
```

Install the `.ablx` in Live → Settings → Extensions.

---

## Next steps

- [Component gallery](https://qaaudio.github.io/qa-ableton-extension-sdk/)
- [README — full API reference](https://github.com/QaAudio/qa-ableton-extension-sdk#readme)
- [Ableton Extensions SDK](https://ableton.github.io/extensions-sdk/)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `extensions-cli` not found | Install `@ableton-extensions/cli` tarball. |
| Dev-run cannot find Live | Fix `EXTENSION_HOST_PATH` in `.env`. |
| Panel looks unstyled | Inline `theme.css` + `styles.css` (see `panel-document.ts`). |
| Command does not appear | Rebuild, restart dev-run, confirm Developer Mode. |
