---
name: security-guidelines
description: >-
  Supply-chain, secrets, CI hardening, and npm release integrity for QuantumAudio
  public repos. Mandatory pre-publish check when bumping deps, adding CI, or
  running npm publish. Copied into every extracted @quantumaudio repo.
---

# Security guidelines

Apply before **every dependency bump**, **CI change**, or **`npm publish`**. Pair with **submodule-dev** when landing releases from the monorepo.

## Supply chain

- Commit **lockfiles**; review lockfile diffs on every dep bump (not just `package.json`).
- **No `postinstall` / `preinstall`** scripts in our published packages.
- Pin **exact versions** for build tooling in CI (`npm ci`, not `npm install`).
- Before adding a dependency, check: maintainer reputation, weekly downloads, install scripts, typosquat risk, and whether the API surface justifies the trust.
- Prefer well-known packages; avoid transitive bloat for one helper call.

## Secrets

- **Never** commit tokens, API keys, or `.env` files.
- CI secrets: scoped npm tokens, `OPENROUTER_API_KEY` / `QDRANT_API_KEY` only in org/repo secrets — not in workflow files.
- npm: org-scoped publish token, **2FA** on npm account and org.
- Redact secrets from CI logs; do not echo env vars in workflows.

## CI hardening

Every workflow must include a least-privilege `permissions` block, for example:

```yaml
permissions:
  contents: read
```

Release/publish jobs may add `id-token: write` (OIDC provenance) and `contents: write` only where needed.

- **Pin GitHub Actions to full commit SHAs**, not floating tags (`uses: actions/checkout@<sha>`).
- **Fork PRs**: no access to org secrets; use `pull_request` with `pull_request_target` only when you understand the risk (default: avoid).
- Use `npm ci` in CI; cache `~/.npm` keyed on lockfile hash.

## Release integrity

- Publish from CI with **`npm publish --provenance`** (OIDC) when the registry supports it.
- Tag releases in git (`vX.Y.Z`); tag must match `package.json` version.
- Enforce **2FA** on the GitHub org and npm `@quantumaudio` scope.
- Changelog or release notes for any public API or wire-format change.

## Pre-publish checklist

```
- [ ] Lockfile reviewed; no unexpected install scripts
- [ ] No secrets in diff or workflow env literals
- [ ] CI permissions minimal; actions pinned to SHAs
- [ ] Version bumped; git tag planned
- [ ] npm publish --provenance (from CI or documented exception)
- [ ] Dependent repos' version ranges updated if needed
```

## Vendor SDK (Ableton extensions)

- **Do not** commit or redistribute Ableton's beta `.tgz` in public repos.
- Document install: user obtains `@ableton-extensions/sdk` / `cli` from Ableton; CI may use a secret-stored copy or skip kernel bundle jobs on forks.
