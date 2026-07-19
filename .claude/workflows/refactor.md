# Workflow: Refactor

## When to use
Removing duplication, splitting a large file, or improving structure without changing behavior.

## Steps
1. Confirm the refactor is behavior-preserving: run `npm run build` and `npm test` before and after.
2. Prefer small, reviewable refactors (see `docs/AUDIT.md`'s Phase-8 items) over broad rewrites,
   especially for files with no test coverage yet (most screens).
3. If the refactor touches a file with zero tests, consider adding a minimal characterization test
   first (`automotive-testing`) so the refactor has a safety net.
4. Document any behavior clarified/fixed along the way (e.g. dead-code removal) in the PR
   description, distinct from pure structural changes, so reviewers can tell the two apart.

## Skills/Agents involved
`architect` (for structural decisions), `testing`, `reviewer`.
