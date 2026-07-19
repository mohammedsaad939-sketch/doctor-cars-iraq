# Developer Guide

## Prerequisites
- Node.js 18+
- A Supabase project (for real data — the app warns but still runs without one; see
  `supabaseClient.js`)

## Setup
```bash
npm install
cp .env.example .env.local   # if present; otherwise create it (see below)
npm run dev
```

Required env vars (in `.env.local`, gitignored):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Everyday commands
| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build (runs `pre-build`/`post-build` hooks automatically) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint across the repo |
| `npm test` | Vitest unit tests (runs `pretest`/`posttest` hooks automatically) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run review` | Full gate: lint + test + build + heuristic security/performance scans |

## Git hooks
This repo's git hooks path is set to `.claude/hooks` (`git config core.hooksPath .claude/hooks`).
`pre-commit` runs lint + tests automatically; `post-commit` prints a summary. A fresh clone needs to
run the `git config` command once (see `.claude/hooks/README.md`).

## Before opening a PR
1. Run `npm run review`.
2. Verify the change in RTL Arabic (the default) first, then the `en` toggle if you touched
   translated strings.
3. Fill out `.github/pull_request_template.md` (auto-populated by GitHub).
4. Check whether your change touches a domain covered by `.claude/skills/` — read that skill's
   `checklists.md` before requesting review.

## Where things live
See `docs/FOLDER_STRUCTURE.md` for the full map, and `docs/ARCHITECTURE.md` for how the pieces fit
together.

## Adding a new screen
Follow the `automotive-platform` skill's workflow (`.claude/skills/automotive-platform/SKILL.md`)
and `.claude/templates/page.md`.

## Working with Supabase
Follow `automotive-api` and `automotive-security` — every write must check its `error`, every new
table needs RLS **and** a matching `GRANT` (see `.github/copilot-instructions.md` for the six most
common review-flagged patterns in this codebase).

## Testing
Start with pure functions (`utils/theme.test.js`, `utils/validators.test.js` are the reference
examples), then components, then mocked-Supabase screens. See `.claude/workflows/testing.md`.
