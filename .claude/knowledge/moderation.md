# Moderation

See also the `automotive-admin` skill for coding rules; this doc is the domain-fact reference.

## Principle
Every moderation-relevant entity (listing, review, seller application) should have **one** status
field driving what's visible to buyers, not several independent booleans that can drift out of
sync with each other.

## Auditability
Moderation decisions (who approved/rejected what, when, and ideally why) should be recorded in an
append-only log table, not just overwritten on the entity itself — this matters both for seller
trust disputes and for detecting a compromised/malicious admin account.

## Enforcement
Moderation actions are admin-privileged and must be enforced via RLS keyed on `profiles.is_admin`
(see `automotive-security`), never only via the client-side `AdminScreen` gating in `App.jsx`.
