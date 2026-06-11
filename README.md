# @quantumaudio/ableton-extension-sdk

HTML/CSS/Vue **UI primitives and theming** for [Ableton Live extensions](https://ableton.github.io/extensions-sdk/) built with the Extensions SDK. Dark/light themes, dialogs, toolbars, sliders, and layout helpers that match QuantumAudio extension UX.

License: [Apache-2.0](LICENSE). Ships **TypeScript/Vue source** (no separate build step).

## Install

```bash
npm install @quantumaudio/ableton-extension-sdk
```

**Peer dependency:** `vue` ^3.5 (for Vue components). Plain CSS entry points work without Vue.

Requires **Node ≥ 24** for typechecking.

## Entry points

| Import | Use |
|--------|-----|
| `@quantumaudio/ableton-extension-sdk` | Theme provider, tokens, core exports |
| `@quantumaudio/ableton-extension-sdk/vue` | Vue 3 components (`Button`, `QaDialog`, `Toolbar`, …) |
| `@quantumaudio/ableton-extension-sdk/theme.css` | CSS variables / theme |
| `@quantumaudio/ableton-extension-sdk/styles.css` | Bundled component styles |
| `@quantumaudio/ableton-extension-sdk/button.css` | À la carte CSS |

## Quick start (extension webview)

```ts
import { initTheme } from "@quantumaudio/ableton-extension-sdk";
import "@quantumaudio/ableton-extension-sdk/theme.css";
import "@quantumaudio/ableton-extension-sdk/styles.css";

initTheme(document.documentElement);
```

Vue panel:

```vue
<script setup lang="ts">
import { Button, Panel } from "@quantumaudio/ableton-extension-sdk/vue";
</script>
```

See [`examples/`](examples/) for standalone HTML demos (buttons, dialogs, sliders, toolbar).

## Development

```bash
git clone https://github.com/QaAudio/qa-ableton-extension-sdk.git
cd qa-ableton-extension-sdk
npm ci
npm run typecheck
```

Extensions consume this package from their esbuild bundle (inline HTML via `loader: { ".html": "text" }` per SDK patterns).

## Related projects

| Project | Repo |
|---------|------|
| MCP + Live agent stack | [qa-ableton-mcp](https://github.com/QaAudio/qa-ableton-mcp) |
| Knowledge / SDK docs search | [qa-knowledge](https://github.com/QaAudio/qa-knowledge) + [qa-knowledge-mcp](https://github.com/QaAudio/qa-knowledge-mcp) |

This package does **not** depend on `@ableton-extensions/sdk` — it is UI-only. Your extension brings the SDK.

## Contributing

PRs welcome. Keep CSS token-driven; avoid hard-coded colors outside `src/theme/`. See [AGENTS.md](AGENTS.md).
