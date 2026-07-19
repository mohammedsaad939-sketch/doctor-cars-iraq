# Workflow: Release

## When to use
Cutting a release for deployment (this project deploys continuously via Vercel on push to the
default branch, so a "release" here means a deliberate, reviewed batch of changes going live).

## Steps
1. Confirm all target PRs are merged and `npm run review` is green on the release branch/commit.
2. Bump `version` in `package.json` if this release is user-facing enough to warrant it.
3. Run `.claude/hooks/pre-deploy.sh` as the final gate.
4. Push/merge to the branch Vercel deploys from.
5. Once Vercel reports the deployment ready, run `.claude/hooks/post-deploy.sh <url>` as a smoke check.
6. Update `docs/AUDIT.md`'s improvement plan if any deferred item from this release should be
   re-prioritized.

## Skills/Agents involved
`devops`, `reviewer`, `documentation`.
