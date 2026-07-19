# Workflow: Deployment

## When to use
Any time code reaches the branch Vercel auto-deploys from.

## Current setup
- Vercel deploys automatically on push (see `vercel.json` — an SPA rewrite rule only; there is no
  custom build/deploy script here, Vercel auto-detects the Vite project).
- There is no CI pipeline in `.github/` yet — `npm run review` (this change's addition) is the
  closest thing to a pre-deploy gate, and it is manual today.

## Steps
1. Run `.claude/hooks/pre-deploy.sh` locally (or in CI, once one exists) before pushing.
2. Push/merge — Vercel picks up the push automatically.
3. Watch the Vercel deployment (via the GitHub PR check / Vercel dashboard).
4. Run `.claude/hooks/post-deploy.sh <deployed-url>` once ready.
5. If the deploy fails Vercel's build step, reproduce locally with `npm run build` first — Vercel
   auto-detects Vite and should match the local build exactly.

## Follow-up recommendation
Add a real CI workflow (`.github/workflows/ci.yml`) running `npm run review` on every PR once the
team is ready to gate merges on it — not done in this change to avoid introducing a CI system the
user didn't explicitly request, but the scripts it would call already exist.

## Skills/Agents involved
`devops`, `reviewer`.
