# Automotive Security — Review Checklist

## Core Checklist
- [ ] Every write checks `error` before reporting success.
- [ ] New table has both RLS policy and GRANT.
- [ ] Unique-constrained writes use upsert/insert-then-catch.
- [ ] No loop silently skips a required field without user-facing feedback.
- [ ] No dead `onClick={() => {}}`.
- [ ] Loading flags wrapped in try/finally.

## Do
- [ ] Check `error` on every write before reporting success (see `handleCartAdd` in `App.jsx` for the reference pattern).
- [ ] Use insert-then-catch-unique-violation for constrained inserts, mirroring `handleCartAdd`.
- [ ] Wrap loading-state toggles in `try/finally`.

## Don't (verify avoided)
- [ ] Avoided: Don't show a success toast before checking `error`.
- [ ] Avoided: Don't treat a client-side role check as a real permission boundary.
- [ ] Avoided: Don't add an RLS policy without its matching `GRANT`.

## Common Mistakes to Re-check
- [ ] Not repeating: Adding `ENABLE ROW LEVEL SECURITY` + a `CREATE POLICY` and forgetting the `GRANT`, which fails silently as "permission denied for table X" and gets misdiagnosed as an RLS bug when it's a grants bug.
- [ ] Not repeating: Assuming `profile.is_admin` passed down as a prop is trustworthy even after the profile could have been fetched before a role change propagated.
- [ ] Not repeating: Wrapping only the happy path in `try` and leaving `finally` off, so a thrown error leaves a button permanently disabled.
