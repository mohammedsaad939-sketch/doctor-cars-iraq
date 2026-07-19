---
name: dealership-management
description: Seller/dealer onboarding, storefronts, and the seller dashboard (inventory, orders, verification).
license: Complete terms in LICENSE.txt
---

# Dealership Management

## Purpose
Own everything a seller (individual shop, wholesaler, or agency — see `MOCK.sellers.type`) needs to manage their presence on the platform: their public storefront, their dashboard, and their verification/trust signals.

## Scope
- `screens/SellerDashScreen.jsx` (949 lines — the largest screen in the app)
- `screens/SellerPublicScreen.jsx` (public storefront)
- Seller fields surfaced elsewhere: `product.seller`, `product.sellerVerified`

## Responsibilities
- Keep the seller dashboard usable as it grows — it is already the largest file in the repo and a prime candidate for splitting into sub-components (inventory tab, orders tab, stats tab).
- Ensure `sellerVerified`/verified badges are sourced from the seller's real row, never hardcoded in a screen.
- Keep the public storefront (`SellerPublicScreen`) read-only from the buyer's perspective — no dashboard actions should leak into it.

## Architecture
Seller-facing data (dashboard) and buyer-facing data (public storefront) are two different screens reading overlapping Supabase tables from different trust levels. The dashboard must only ever operate on rows owned by the signed-in seller (`user_id`/`seller_id = auth.uid()`); the public screen must only read what's meant to be public.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Distinguish `sellerDash` (owner-only) from `sellerPublic` (buyer-facing) consistently — do not reuse one screen id for both contexts (see the platform skill's note on the `sellerProfile` naming drift).
- Use `seller_id` (not `dealer_id`/`shop_id`) if/when normalizing column names, to match the existing `product.seller`/`sellerVerified` naming already in use.

## Folder Structure
```
screens/SellerDashScreen.jsx   # owner-only dashboard (949 lines — split candidate)
screens/SellerPublicScreen.jsx # public storefront
.claude/knowledge/dealer-management.md
```

## Workflow
- 1. Any new dashboard feature is scoped by `session.user.id` server-side (RLS), never by a client-side `if` alone.
- 2. Public-facing seller data (name, logo, rating, verified badge, product count) is denormalized/read-only; never expose dashboard-only fields (payout info, internal notes) through the public screen's query.
- 3. Before adding another few hundred lines to `SellerDashScreen.jsx`, consider extracting a sub-component (e.g. `SellerInventoryTab.jsx`) with its own colocated data fetching.

## Performance Rules
- `SellerDashScreen` at 949 lines is a strong signal to profile its mount for sequential/waterfall Supabase calls — batch independent queries with `Promise.all` where they don't depend on each other.
- Paginate seller order/inventory lists instead of loading the seller's entire history at once.

## Security Rules
- Every dashboard write (inventory update, order status change) must be scoped by an RLS policy keyed on the seller's own `user_id`, not just filtered client-side.
- Never let the public storefront query accept an arbitrary `seller_id` and return anything beyond public fields — double check `select()` column lists on that screen specifically.

## Review Rules
- Flag any dashboard mutation that doesn't check `error` before showing a success toast (Pattern 1 in `.github/copilot-instructions.md`).
- Flag growth of `SellerDashScreen.jsx` past its current size without at least a note on why it wasn't split.

## Do
- Show verification/trust badges (`sellerVerified`) directly from the seller row.
- Keep dashboard and public storefront queries physically separate (different `.select()` calls) even if they hit the same table.

## Don't
- Don't let a buyer-facing screen request seller fields that aren't meant to be public.
- Don't grow `SellerDashScreen.jsx` further without evaluating a split into tab-scoped sub-components.

## Common Mistakes
- Trusting a `verified` flag passed as a prop instead of re-reading it from the seller's row on the public screen.
- Adding a new dashboard tab as more inline JSX in the same 949-line file instead of a new component.

## Checklist
- New dashboard writes scoped to the authenticated seller via RLS.
- Public storefront query column list reviewed for over-exposure.
- Large screen file split considered before further growth.
- Success toasts gated on `!error`.

## Prompt Templates
- "Split SellerDashScreen.jsx's inventory section into its own component with colocated data fetching, without changing behavior."
- "Review SellerPublicScreen.jsx's Supabase select() and confirm it only returns fields safe for public/buyer viewing."

## Real Examples
```jsx
// Keep public storefront queries narrow and explicit
const { data: seller } = await supabase
  .from("sellers")
  .select("id, name, logo, city, verified, rating, sales, products, since")
  .eq("id", sellerId)
  .single();
// never: .select("*") on a buyer-facing screen
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
