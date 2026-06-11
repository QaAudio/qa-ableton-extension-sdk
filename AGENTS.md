# qa-ableton-extension-sdk — Agent Guide

Package: `@quantumaudio/ableton-extension-sdk`. Vue 3 + CSS UI kit for Ableton extension webviews.

## Layout

```
qa-ableton-extension-sdk/
├── src/
│   ├── components/     # Vue SFCs + component CSS
│   ├── theme/          # tokens, provider, theme.css
│   ├── composables/
│   └── index.ts
├── examples/           # static HTML demos (dev reference)
└── package.json        # exports point at src/ (no dist)
```

## Commands

```bash
npm run typecheck    # vue-tsc --noEmit
```

## Conventions

- Ship **source** via `package.json` `exports` — consumers bundle with esbuild/Vite.
- No `@ableton-extensions/sdk` in this package.
- Component CSS colocated (`button.css`, `slider.css`, …); shared tokens in `src/theme/`.
- `peerDependencies.vue` ^3.5 — do not bundle Vue into this lib.

## Adding a component

1. SFC under `src/components/` + optional CSS file
2. Export from `src/components/index.ts`
3. Add CSS export path in `package.json` if standalone import is useful
4. Add or extend an `examples/*.html` demo

Security / publish: `.cursor/skills/security-guidelines/SKILL.md`.
