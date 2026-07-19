---
name: automotive-security
description: Supabase RLS/GRANT discipline, auth boundaries, admin gating, and the error-checking patterns already codified in this repo's Copilot review focus.
license: Complete terms in LICENSE.txt
---

# Automotive Security

## Purpose
Be the enforcement point for the six bug patterns already documented in `.github/copilot-instructions.md`, plus general Supabase/RLS discipline, since this app has no server-side API layer — Postgres RLS is the entire security boundary.

## Scope
- Every Supabase mutation (`insert`/`update`/`delete`/`upsert`) across all screens
- `useAuth.js` (session lifecycle)
- `profile.is_admin` gating in `App.jsx`/`AdminScreen`
- Any new SQL migration (even though migrations live outside this repo, review guidance applies)

## Responsibilities
- Enforce: every `insert`/`update`/`delete`/`upsert` result's `error` is checked before any success toast, counter update, or state clear (Pattern 1).
- Enforce: no UI surfaces `MOCK`/hardcoded stats as if they were live data (Pattern 2).
- Enforce: any new RLS policy ships with the matching `GRANT` to `anon`/`authenticated` (Pattern 3).
- Enforce: unique-constraint writes use insert-then-catch or real `upsert(..., { onConflict })`, never select-then-decide (Pattern 4).
- Enforce: loops never silently `continue`/skip an item with a missing required field without telling the user (Pattern 5).
- Enforce: no dead `onClick={() => {}}` handlers, and every `setLoading`/`setUpdating` flag is wrapped in `try/finally` (Pattern 6).

## Architecture
There is no backend in this repo — the React app talks to Postgres directly through Supabase's client SDK using the public anon key. That means: (1) RLS policies are the only thing standing between a user and someone else's data, (2) client-side checks like `profile?.is_admin` are UX-only, and (3) any "business logic" that must not be bypassable (bid validation, payment amounts, discount caps) has to live in a Postgres function/trigger/check-constraint, not in `App.jsx`.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Keep `is_admin` as a boolean on `profiles`, gated by RLS — do not introduce a second parallel admin flag anywhere client-side.

## Folder Structure
```
useAuth.js                       # session/profile bootstrap
App.jsx                          # client-side admin gating (UX only, not security)
.github/copilot-instructions.md  # canonical list of the 6 review patterns
.claude/knowledge/fraud-detection.md
.claude/knowledge/moderation.md
```

## Workflow
- 1. Before writing a mutation, ask: what RLS policy makes this safe if a malicious client called this exact query directly?
- 2. After writing a mutation, check the returned `error` before doing anything else with the result.
- 3. For any new table, write the `GRANT` alongside the `CREATE POLICY` in the same migration.
- 4. For any unique-constrained insert, use `upsert` or insert-then-catch — never select-then-branch.

## Performance Rules
- Security checks (RLS) run in Postgres and are effectively free from the client's perspective — don't try to "optimize" by skipping a query's `.eq("user_id", uid)` filter just because a policy also enforces it; both together are defense-in-depth and self-documenting.

## Security Rules
- RLS + GRANT is the whole security model here — treat every new table as insecure by default until both are verified.
- Never log or surface raw Supabase error objects containing potentially sensitive detail to end users; map to a friendly Arabic message (as `handleCartAdd` already does) while still checking the error.
- Admin screens/actions must be re-validated by RLS keyed on `profiles.is_admin`, not only hidden behind `profile?.is_admin ? ... : ...` in `App.jsx`.

## Review Rules
- Treat the six patterns in `.github/copilot-instructions.md` as blocking review items, not style nits.
- Any PR touching a `.insert(`/`.update(`/`.delete(`/`.upsert(` call must show the `error` being checked in the same diff hunk.

## Do
- Check `error` on every write before reporting success (see `handleCartAdd` in `App.jsx` for the reference pattern).
- Use insert-then-catch-unique-violation for constrained inserts, mirroring `handleCartAdd`.
- Wrap loading-state toggles in `try/finally`.

## Don't
- Don't show a success toast before checking `error`.
- Don't treat a client-side role check as a real permission boundary.
- Don't add an RLS policy without its matching `GRANT`.

## Common Mistakes
- Adding `ENABLE ROW LEVEL SECURITY` + a `CREATE POLICY` and forgetting the `GRANT`, which fails silently as "permission denied for table X" and gets misdiagnosed as an RLS bug when it's a grants bug.
- Assuming `profile.is_admin` passed down as a prop is trustworthy even after the profile could have been fetched before a role change propagated.
- Wrapping only the happy path in `try` and leaving `finally` off, so a thrown error leaves a button permanently disabled.

## Checklist
- Every write checks `error` before reporting success.
- New table has both RLS policy and GRANT.
- Unique-constrained writes use upsert/insert-then-catch.
- No loop silently skips a required field without user-facing feedback.
- No dead `onClick={() => {}}`.
- Loading flags wrapped in try/finally.

## Prompt Templates
- "Review this diff against the six patterns in .github/copilot-instructions.md and flag any violation."
- "Write the RLS policy and matching GRANT for a new `bids` table scoped to authenticated users inserting their own bids only."

## Real Examples
```js
// Reference pattern already in App.jsx#handleCartAdd — reuse this shape everywhere
const { error: insertError } = await supabase.from("cart_items").insert({ user_id: uid, product_id: pid, quantity: 1 });
if (insertError) {
  const isUniqueViolation = insertError.code === "23505" || (insertError.message || "").includes("duplicate");
  if (!isUniqueViolation) { /* surface error, return */ }
  // fall through to the update-quantity path
}
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
