# Dealership Management — Review Checklist

## Core Checklist
- [ ] New dashboard writes scoped to the authenticated seller via RLS.
- [ ] Public storefront query column list reviewed for over-exposure.
- [ ] Large screen file split considered before further growth.
- [ ] Success toasts gated on `!error`.

## Do
- [ ] Show verification/trust badges (`sellerVerified`) directly from the seller row.
- [ ] Keep dashboard and public storefront queries physically separate (different `.select()` calls) even if they hit the same table.

## Don't (verify avoided)
- [ ] Avoided: Don't let a buyer-facing screen request seller fields that aren't meant to be public.
- [ ] Avoided: Don't grow `SellerDashScreen.jsx` further without evaluating a split into tab-scoped sub-components.

## Common Mistakes to Re-check
- [ ] Not repeating: Trusting a `verified` flag passed as a prop instead of re-reading it from the seller's row on the public screen.
- [ ] Not repeating: Adding a new dashboard tab as more inline JSX in the same 949-line file instead of a new component.
