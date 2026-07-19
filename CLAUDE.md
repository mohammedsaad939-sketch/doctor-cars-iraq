# Doctor Cars Iraq — Claude Code Project Guide

دكتور السيارات: an Iraqi parts/vehicle marketplace SPA — React 18 + Vite, Supabase backend (Postgres
+ Auth + Realtime), Arabic-RTL-first with an English toggle, deployed on Vercel. No TypeScript, no
server-side API layer — Postgres RLS is the only access-control boundary. See `docs/ARCHITECTURE.md`
and `docs/AUDIT.md` for the full picture.

## Start here
- `docs/AUDIT.md` — full repository audit + prioritized improvement plan.
- `docs/ARCHITECTURE.md` / `docs/FOLDER_STRUCTURE.md` / `docs/CODING_STANDARDS.md` / `docs/DEVELOPER_GUIDE.md`
- `docs/AUTHENTICATION.md` — the Authentication & User Management module (sign up/in/out, email
  verification, forgot/reset password, sessions, profile, avatar upload, and the
  Guest/User/Dealer/Verified Dealer/Admin/Super Admin role hierarchy in `utils/roles.js`).
- `CONTRIBUTING.md` — how to propose and land a change.
- `.github/copilot-instructions.md` — the six most common review-flagged bug patterns in this repo;
  treat these as blocking review items.

## Skills (`.claude/skills/`)
One skill per domain, each with `SKILL.md` (purpose/scope/standards/rules), `README.md`,
`LICENSE.txt`, `examples.md`, and `checklists.md`:

`automotive-platform` · `vehicle-data` · `dealership-management` · `marketplace-rules` ·
`automotive-security` · `automotive-api` · `automotive-search` · `automotive-payments` ·
`automotive-notifications` · `automotive-performance` · `automotive-testing` · `automotive-uiux` ·
`automotive-admin` · `automotive-seo` · `automotive-ai` · `frontend-design` (from anthropics/skills)

Load the relevant skill before making a domain-specific change — each documents the exact files it
owns and the mistakes already found in this codebase.

## Agents (`.claude/agents/`)
Role-based agents, each an `AGENT.md` (responsibilities/input/output/skills used/decision &
escalation rules) + `README.md`: `architect` · `frontend` · `backend` · `database` · `security` ·
`performance` · `testing` · `reviewer` · `documentation` · `seo` · `devops` ·
`automotive-expert` · `payments` · `search` · `admin`.

## Hooks (`.claude/hooks/`)
Real, runnable scripts — not placeholders. `pre-commit`/`post-commit` are wired as actual git hooks
(`core.hooksPath` is set to `.claude/hooks` for this repo). `pre-build`/`post-build`/`pre-test`/
`post-test` are wired via npm's lifecycle convention (`package.json`'s `prebuild`/`postbuild`/
`pretest`/`posttest`). `review.sh` (also `npm run review`) runs the full gate: lint + test + build +
heuristic security/performance scans. See `.claude/hooks/README.md` for exactly how each is wired.

## Workflows (`.claude/workflows/`)
Step-by-step playbooks: `feature-development` · `bug-fix` · `release` · `hotfix` · `deployment` ·
`testing` · `security-review` · `performance-review` · `refactor` · `documentation`.

## Templates (`.claude/templates/`)
`feature` · `component` · `page` · `api` · `database` · `repository` · `pull-request` · `issue` ·
`documentation` · `architecture-decision`. The `pull-request`/`issue` templates are also live at
`.github/pull_request_template.md` and `.github/ISSUE_TEMPLATE/` so GitHub uses them directly.

## Automotive Knowledge (`.claude/knowledge/`)
Domain reference facts (schema-as-inferred, VIN validation, dealer management, comparison, search
filters, specifications, inspection, marketplace rules, fraud detection, image validation, pricing,
financing, insurance, reservations, vehicle/listing status, moderation, analytics) — several of
these document features **not yet built** and say so explicitly; don't treat their presence as a
claim the feature exists.

## Non-negotiables
1. Every Supabase write checks `error` before reporting success.
2. Every new RLS policy ships with its matching `GRANT`.
3. Client-side role/admin checks (`profile?.is_admin`) are UX only — the real boundary is RLS.
4. Unique-constrained writes use insert-then-catch, never select-then-decide.
5. `npm run review` (lint + test + build + scans) should pass before opening a PR.
