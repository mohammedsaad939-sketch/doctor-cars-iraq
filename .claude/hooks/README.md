# Hooks

Real, runnable scripts for this project's lifecycle stages. Unlike a generic checklist, every
script here does something functional against the tooling added in this change (ESLint, Vitest,
Vite build).

## How each hook is actually wired

| Hook | Mechanism | Auto-runs when |
|---|---|---|
| `pre-commit.sh` | Native git hook (`git config core.hooksPath .claude/hooks`, already set for this repo) | `git commit` |
| `post-commit.sh` | Native git hook | after `git commit` |
| `pre-build.sh` | npm lifecycle (`"prebuild"` in `package.json`) | `npm run build` |
| `post-build.sh` | npm lifecycle (`"postbuild"`) | after `npm run build` |
| `pre-test.sh` | npm lifecycle (`"pretest"`) | `npm test` |
| `post-test.sh` | npm lifecycle (`"posttest"`) | after `npm test` |
| `pre-deploy.sh` | Manual / CI step | run before pushing to the Vercel-deployed branch |
| `post-deploy.sh` | Manual / CI step | run with the deployed URL after Vercel finishes |
| `review.sh` | Manual (`npm run review`) or CI | aggregate lint+test+build+scans |
| `security-scan.sh` | Manual, or called by `review.sh` | heuristic scan for the 6 patterns in `.github/copilot-instructions.md` |
| `performance-scan.sh` | Manual, or called by `review.sh` | bundle size + oversized-screen report |
| `lint.sh` | Manual, or called by `pre-commit.sh`/`review.sh` | thin wrapper for `npm run lint` |

Since `pre-commit`/`post-commit` are real git hook names, they run automatically once
`core.hooksPath` points here (already configured for this repo's local clone — a fresh clone
would need to run `git config core.hooksPath .claude/hooks` once). `pre-build`/`post-build`/
`pre-test`/`post-test` use npm's built-in `pre<script>`/`post<script>` convention, so they run
automatically for anyone who runs `npm run build` / `npm test` in this repo — no extra setup.

`pre-deploy`/`post-deploy`/`review`/`security-scan`/`performance-scan` are not tied to an
automatic trigger in this repo (there is no CI pipeline yet — deploys are triggered by Vercel's
GitHub integration on push). Run them manually, or wire `review.sh`/`pre-deploy.sh` into a CI
workflow if one is added later (see `.claude/workflows/deployment.md`).

## Relationship to Claude Code's own hooks

These are plain shell scripts, not Claude Code `PreToolUse`/`PostToolUse` hooks configured in
`.claude/settings.json` — that mechanism intercepts the coding agent's own tool calls, which is a
different concern from this project's git/build/test lifecycle. If you want the agent itself to
run `lint.sh` automatically after every file edit, that would be configured separately in
`.claude/settings.json`; it is intentionally not auto-wired here to avoid surprising, hard-to-debug
interference with normal edits.
