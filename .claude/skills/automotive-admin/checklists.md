# Automotive Admin — Review Checklist

## Core Checklist
- [ ] Admin action backed by RLS, not just UI gating.
- [ ] Moderation decisions logged/auditable.
- [ ] Queues paginated.

## Do
- [ ] Pair every admin UI action with an RLS policy.
- [ ] Log moderation decisions for audit purposes.

## Don't (verify avoided)
- [ ] Avoided: Don't rely on the client-side `is_admin` check as the real permission boundary.
- [ ] Avoided: Don't silently overwrite a listing's status without an audit trail.

## Common Mistakes to Re-check
- [ ] Not repeating: Shipping a new admin button whose underlying query has no RLS restriction, so any authenticated (non-admin) user could call it directly.
