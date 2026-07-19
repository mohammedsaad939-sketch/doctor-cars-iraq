# Automotive Payments — Review Checklist

## Core Checklist
- [ ] Cart writes use insert-then-catch-unique-violation.
- [ ] Badge/count state refreshed from server after mutation.
- [ ] No raw payment card fields introduced client-side.
- [ ] Order totals computed/verified server-side at checkout.

## Do
- [ ] Reuse `handleCartAdd`'s atomic-write pattern for every cart mutation.
- [ ] Refresh badge counts from the server after every mutation.

## Don't (verify avoided)
- [ ] Avoided: Don't compute order totals purely client-side and trust them at checkout.
- [ ] Avoided: Don't add raw card-number input fields to `PaymentsScreen` — that requires PCI scope this app doesn't have.

## Common Mistakes to Re-check
- [ ] Not repeating: Reintroducing the select-then-decide race condition for cart writes that `handleCartAdd` already solved once.
- [ ] Not repeating: Letting `cartBadgeCount` drift from reality by incrementing it locally instead of re-querying after a mutation.
