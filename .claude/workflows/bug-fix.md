# Workflow: Bug Fix

## When to use
A reported defect in existing behavior (e.g. the `AdCarousel` seller-store navigation bug fixed in
this change).

## Steps
1. **Reproduce and root-cause** the bug — trace it to a specific file/line, not just a symptom.
2. **Check `.github/copilot-instructions.md` and `automotive-security`** — many real bugs in this
   codebase match one of the six documented patterns (unchecked error, mock data, missing GRANT,
   select-then-decide race, silent skip, dead handler/stuck loading state).
3. **Write a regression test first** if the bug is in a pure function or a Testing-Library-reachable
   component (`automotive-testing`).
4. **Fix the root cause**, not just the symptom — e.g. fix the wrong screen id AND the missing meta,
   not just one half of the bug.
5. **Run `npm run review`** to confirm the fix doesn't regress lint/build/tests.
6. **Document the fix** in `docs/AUDIT.md` or the owning skill's `examples.md` if it reveals a
   pattern worth remembering.

## Skills/Agents involved
`reviewer`, `testing`, `security` (if the bug is security-relevant), the owning domain skill.
