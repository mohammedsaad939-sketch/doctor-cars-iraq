---
name: automotive-admin
description: Admin screen, moderation queue, and the discipline that client-side admin gating is UX-only.
license: Complete terms in LICENSE.txt
---

# Automotive Admin

## Purpose
Own `AdminScreen` and any admin-only tooling, making sure every admin capability is backed by a real RLS policy keyed on `profiles.is_admin` rather than the client-side check in `App.jsx`.

## Scope
- `screens/AdminScreen.jsx` (298 lines)
- `App.jsx`'s `isAtLeast(role, ROLES.ADMIN)` gating in `renderScreen()` (see `utils/roles.js`)
- `.claude/knowledge/moderation.md`
- `docs/AUTHENTICATION.md` — the Admin/Super Admin tiers and the privilege-escalation trigger

## Responsibilities
- Ensure every admin mutation (approve/reject a listing, ban a user, adjust a fee) is protected by an RLS policy — the `App.jsx` check only prevents non-admins from seeing the *screen*, not from calling the underlying queries.
- Keep moderation actions auditable (who approved/rejected what, when) rather than silent boolean flips.
- Only a Super Admin (`profiles.is_super_admin`) may grant/revoke another user's Super Admin status — enforced by the `prevent_profile_privilege_escalation` trigger in `supabase/migrations/`, not just by hiding the control in `AdminScreen`'s UI.

## Architecture
`AdminScreen` is reached via the same client-side switch as every other screen; there's no separate admin subdomain or server. This means admin "routes" are really just React state, so security must be enforced entirely in Postgres.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Follow the existing repo-wide conventions: PascalCase components, camelCase functions/variables, snake_case Supabase columns mapped to camelCase at the query boundary.

## Folder Structure
```
screens/AdminScreen.jsx
App.jsx#renderScreen (admin case)
.claude/knowledge/moderation.md
```

## Workflow
- 1. For any new admin action, write the RLS policy restricting it to `is_admin = true` rows before wiring the UI.
- 2. Prefer a moderation-log table (actor, action, target, timestamp) over overwriting status fields silently, so decisions are auditable.
- 3. Check `error` before reporting any admin action as successful (Pattern 1).

## Performance Rules
- Paginate moderation queues; don't load the entire pending-listings table into `AdminScreen` at once.

## Security Rules
- Never treat `case "admin": return profile?.is_admin ? <AdminScreen/> : <HomeScreen/>` as sufficient protection — it only changes what renders in this browser tab.
- Any admin bulk action (e.g. "approve all") must still be validated row-by-row server-side, not just permitted because the button was only visible to an admin.

## Review Rules
- Flag any new admin capability that doesn't have a corresponding RLS policy check described in the PR.

## Do
- Pair every admin UI action with an RLS policy.
- Log moderation decisions for audit purposes.

## Don't
- Don't rely on the client-side `is_admin` check as the real permission boundary.
- Don't silently overwrite a listing's status without an audit trail.

## Common Mistakes
- Shipping a new admin button whose underlying query has no RLS restriction, so any authenticated (non-admin) user could call it directly.

## Checklist
- Admin action backed by RLS, not just UI gating.
- Moderation decisions logged/auditable.
- Queues paginated.

## Prompt Templates
- "Add a 'reject listing' admin action to AdminScreen, including the RLS policy restricting it to is_admin users and a moderation_log insert."

## Real Examples
```sql
-- Admin-only update, enforced in Postgres regardless of client UI
create policy "admins can moderate listings"
on public.products for update
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
