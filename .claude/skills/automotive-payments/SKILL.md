---
name: automotive-payments
description: Cart, checkout, and payment-method screens, plus the race-condition-safe cart-write pattern already established in App.jsx.
license: Complete terms in LICENSE.txt
---

# Automotive Payments

## Purpose
Own cart and payment flows end-to-end, keeping the atomic-write discipline that `handleCartAdd` already models, and prepare the ground for real Iraqi payment methods (ZainCash/FastPay/COD) referenced in the project README's roadmap.

## Scope
- `screens/CartScreen.jsx`, `screens/PaymentsScreen.jsx`
- `App.jsx#handleCartAdd`, `cartBadgeCount` effect
- `.claude/knowledge/pricing-rules.md`, `financing.md`, `insurance.md`

## Responsibilities
- Keep cart-item writes atomic against the `(user_id, product_id)` unique constraint using the insert-then-catch-unique-violation pattern, never select-then-branch.
- Keep the cart badge count derived from a fresh `count`-only query after every mutation (as `handleCartAdd` already does), not from local arithmetic that can drift from the server.
- Treat `PaymentsScreen` as currently UI-only (per the README, no real payment gateway is integrated yet) and flag any code that implies a real charge happens without a real gateway integration.

## Architecture
Cart state is not held globally — `cartBadgeCount` in `App.jsx` is a derived count re-fetched from Supabase after every mutation, and `CartScreen` manages its own list of cart rows. There is currently no payment gateway integration; `PaymentsScreen` is UI scaffolding only (see the project README's "steps to a real app" table, which lists ZainCash/FastPay/COD as future work).

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Keep `cart_items` as the table name and `quantity` as the column for cart line quantity, matching the existing pattern.

## Folder Structure
```
screens/CartScreen.jsx
screens/PaymentsScreen.jsx
App.jsx#handleCartAdd / cartBadgeCount
```

## Workflow
- 1. Any cart mutation follows the insert-then-catch-23505 pattern from `handleCartAdd`.
- 2. After any cart mutation, refresh `cartBadgeCount` from a fresh count query rather than incrementing/decrementing a local counter.
- 3. Before wiring a real payment method, confirm PCI-relevant data (card numbers) never touches this client directly — use a hosted payment page/tokenization from the provider, never raw card fields in this repo's forms.

## Performance Rules
- Avoid re-fetching the entire cart list after every single quantity change — update the changed row locally and only resync count/total from the server.

## Security Rules
- Never store raw payment card data in Supabase from this client — any real gateway integration must use tokenization/hosted fields.
- Cart/order totals must be (re)computed server-side (via RLS-protected views or a function) at checkout time — never trust a client-submitted total.

## Review Rules
- Flag any new cart write that reverts to select-then-branch instead of insert-then-catch.
- Flag any payment-related UI that implies a transaction completed without a real gateway call.

## Do
- Reuse `handleCartAdd`'s atomic-write pattern for every cart mutation.
- Refresh badge counts from the server after every mutation.

## Don't
- Don't compute order totals purely client-side and trust them at checkout.
- Don't add raw card-number input fields to `PaymentsScreen` — that requires PCI scope this app doesn't have.

## Common Mistakes
- Reintroducing the select-then-decide race condition for cart writes that `handleCartAdd` already solved once.
- Letting `cartBadgeCount` drift from reality by incrementing it locally instead of re-querying after a mutation.

## Checklist
- Cart writes use insert-then-catch-unique-violation.
- Badge/count state refreshed from server after mutation.
- No raw payment card fields introduced client-side.
- Order totals computed/verified server-side at checkout.

## Prompt Templates
- "Wire PaymentsScreen's 'add payment method' UI to a real Supabase table, keeping it clearly scoped to metadata only (no raw card numbers)."

## Real Examples
```js
// Refresh the badge from the server after any cart mutation, don't do local math
const { count } = await supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", uid);
setCartBadgeCount(count || 0);
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
