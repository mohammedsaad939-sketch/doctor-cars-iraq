# Workflow: Security Review

## When to use
Any PR touching Supabase mutations, RLS policies, auth, or admin-gated screens.

## Steps
1. Run `.claude/hooks/security-scan.sh` as a fast heuristic first pass.
2. Walk the diff against the six patterns in `.github/copilot-instructions.md`:
   unchecked error, mock-as-real data, missing GRANT, select-then-decide race, silent skip,
   dead handler/stuck loading state.
3. For any new/changed RLS policy: confirm the matching `GRANT` exists, and confirm the policy is
   scoped correctly (`auth.uid()` ownership checks, `is_admin` checks for privileged actions).
4. For any admin-gated screen/action: confirm the real boundary is the RLS policy, not the
   `profile?.is_admin` client-side check.
5. Record findings using the `security` agent's escalation rules — real exposure risks go to the
   user immediately, not just into a code review comment.

## Skills/Agents involved
`security`, `automotive-security`, `automotive-admin`.
