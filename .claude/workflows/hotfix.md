# Workflow: Hotfix

## When to use
A production-breaking bug needs to ship faster than the normal feature-development cycle.

## Steps
1. Branch directly from the deployed commit (not from a long-running feature branch).
2. Make the smallest possible change that fixes the break — resist the urge to refactor
   surrounding code in a hotfix.
3. Run `npm run review` — do not skip lint/test/build even under time pressure; this project has no
   CI gate yet, so this is the only automated safety net.
4. Deploy per the `release` workflow, then immediately run `.claude/hooks/post-deploy.sh <url>`.
5. Follow up with a normal PR (if the hotfix was committed directly) to make sure the change is
   reviewed after the fact, and file a proper regression test if one wasn't feasible under time
   pressure.

## Skills/Agents involved
`reviewer`, `security` (most hotfixes in an app with no server-side API are RLS/data-integrity
issues), `devops`.
