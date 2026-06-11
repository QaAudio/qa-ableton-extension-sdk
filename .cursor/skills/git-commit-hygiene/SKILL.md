---
name: git-commit-hygiene
description: >-
  Git commit and .gitignore rules for QuantumAudio repos — what to commit, what
  to ignore, submodule vs monorepo commits, and pre-push checks. Use before any
  git add/commit/push in public QaAudio repos, submodules, or after local builds
  that produce dist/ or monorepo-only patches.
---

# Git commit hygiene

Mandatory before **`git add`**, **`git commit`**, or **`git push`** in any QuantumAudio / QaAudio repo. Pair with **submodule-dev** (where to commit) and **security-guidelines** (secrets in diffs).

## Golden rules

1. **Review the full staged diff** — `git diff --cached` (not just `git status` summaries).
2. **Never `git add -A` blindly** after `npm run build` — build output must not land in public repos.
3. **`.gitignore` is plain text** — one pattern per line; never JSON-stringify or quote the whole file.
4. **Commit in the correct repo** — submodule changes go to the submodule remote, then bump the pointer in the monorepo (see **submodule-dev**).
5. **Monorepo-only edits stay out of public repos** — e.g. `file:../../vendor/…` SDK paths, `scripts/patch-monorepo-kernel-sdk.mjs` output.

## Standard `.gitignore`

Every TypeScript npm repo should include at minimum:

```gitignore
node_modules/
dist/
.env
.DS_Store
```

Extensions / apps may add: `*.ablx`, `Telemetry/`, `workspace/`, `.cursor/mcp.json` (local MCP config with secrets).

Verify ignore works: `git check-ignore -v dist/index.js` should match after a local build.

## Never commit (public repos)

| Path / change | Why |
|---------------|-----|
| `dist/`, `*.js` emitted by `tsc` in libraries | Consumers and CI build from `src/`; bloated diffs, stale artifacts |
| `node_modules/` | Lockfile + CI install |
| `.env`, API keys, npm tokens | Secrets |
| `vendor/**/*.tgz`, Ableton SDK archives | License / redistribution |
| `file:…/vendor/…` in `package.json` | Monorepo-local; document SDK install in README instead |
| Accidental `git add` of parent monorepo paths | Wrong repository |
| IDE noise (`.vscode/` unless shared deliberately) | Noise |

## Always commit (when applicable)

| Path | Repo |
|------|------|
| `package-lock.json` | All npm repos |
| `src/`, `tsconfig.json`, `package.json` | Libraries and apps |
| `docs/knowledge/**` + `.qa-index.json` | qa-knowledge (index state, not `dist/`) |
| `AGENTS.md`, `README.md`, `LICENSE` | Public repos |
| `.github/workflows/` | CI definitions |

## Repo-specific traps

### Libraries (`qa-music-ir`, `qa-ableton-mcp-schemas`, `qa-knowledge`, …)

- Run `npm run build` locally for testing — **do not** stage `dist/`.
- If `dist/` was ever committed: `git rm -r --cached dist`, fix `.gitignore`, commit removal.

### `qa-knowledge`

- Corpus + `.qa-index.json` **yes**; `dist/` **no**.
- `docs/knowledge/workspace/` stays ignored.

### `qa-ableton-mcp` kernel

- Public `packages/kernel/package.json` must **not** contain `file:…vendor…` deps.
- Monorepo applies SDK via `npm run postinstall` → `patch-monorepo-kernel-sdk.mjs` (local only — **never push** that patch).

### Monorepo parent

- Submodule pointer commits: `chore(submodule): bump qa-x to <sha> — <summary>`.
- Do not commit submodule **content** from the parent tree without pushing the submodule first.

## Pre-commit checklist

Copy and complete:

```
- [ ] Working directory is the intended repo (submodule cd, not monorepo root for code changes)
- [ ] git status — no surprise untracked build dirs
- [ ] git diff --cached — no dist/, node_modules/, .env, vendor tgz
- [ ] package.json — no file: vendor SDK paths in public repos
- [ ] .gitignore is valid plain text and lists dist/
- [ ] lockfile included if package.json deps changed
- [ ] commit message matches repo (feat/fix/docs/chore)
```

## Pre-push checklist (public / submodule)

```
- [ ] Pushed from inside submodule, on a branch (not detached HEAD)
- [ ] No monorepo-only files in the commit
- [ ] CI-relevant files present (.github/workflows) unchanged or intentionally updated
- [ ] After push: bump monorepo submodule pointer if working from QuantumAudio
```

## Recovery commands

```bash
# Unstage everything
git reset HEAD

# Stop tracking dist but keep on disk
git rm -r --cached dist

# See what would be ignored
git status --ignored

# Submodule: discard local monorepo patch before push (kernel SDK example)
git checkout -- packages/kernel/package.json
# then re-run from monorepo root: npm run postinstall
```

## Agent workflow

When asked to commit:

1. Run `git status` and `git diff --cached` (or `git diff` if nothing staged).
2. If `dist/` or `node_modules/` appear → **stop**, fix `.gitignore`, unstage, rebuild only for local verify.
3. For submodules → commit and push **inside** the submodule path first.
4. Only then update monorepo `.gitmodules` pointer if needed.
