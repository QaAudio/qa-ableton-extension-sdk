# qa-ableton-extension-sdk — Agent Guide

Package: `@quantumaudio/ableton-extension-sdk`. Vue 3 + CSS UI kit for Ableton extension webviews.

## Layout

```
qa-ableton-extension-sdk/
├── src/
│   ├── components/     # Vue SFCs + component CSS
│   ├── theme/          # tokens, provider, theme.css
│   ├── composables/    # useTheme, useParamDrag, useParamKeyboard
│   ├── lib/            # param.ts (normalize, formatters)
│   ├── audio/          # peaks.ts, waveform-draw.ts
│   └── index.ts
├── examples/           # static HTML demos + examples/vue/ Vite gallery
├── docs/screenshots/   # README captures (npm run screenshots)
└── package.json        # exports point at src/ (no dist)
```

## Commands

```bash
npm run typecheck       # vue-tsc --noEmit
npm run dev:examples    # Vue layout gallery (:5199)
npm run screenshots     # rebuild gallery + capture docs/screenshots/
```

## Conventions

- Ship **source** via `package.json` `exports` — consumers bundle with esbuild/Vite.
- No `@ableton-extensions/sdk` in this package.
- Component CSS colocated (`button.css`, `knob.css`, …); shared tokens in `src/theme/tokens.css`.
- `peerDependencies.vue` ^3.5 — do not bundle Vue into this lib.
- Music controls use `useParamDrag` + `useParamKeyboard` + `src/lib/param.ts` helpers.
- Waveform rendering is canvas-based via `src/audio/waveform-draw.ts`.

## Adding a component

1. SFC under `src/components/` + optional CSS file
2. Export from `src/components/index.ts`
3. Import CSS in `src/styles.css`; add `package.json` export if standalone import is useful
4. Add or extend an `examples/*.html` demo and/or a layout under `examples/vue/src/layouts/`
5. Register new layout id in `examples/vue/src/App.vue` **and** `scripts/capture-screenshots.mjs`
6. Run `npm run screenshots`; add README gallery row + component reference entry
7. JSDoc on exported APIs (`@example` on non-obvious entry points)

Security / publish: `.cursor/skills/security-guidelines/SKILL.md`.
