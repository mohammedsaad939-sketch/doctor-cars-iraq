# Dealer Management

Reference facts for the `dealership-management` skill and `SellerDashScreen.jsx`/
`SellerPublicScreen.jsx`.

## Seller types (from `MOCK.sellers.type`)
- `مفرد` (individual/retail shop)
- `جملة` (wholesaler)
- `وكالة` (official agency/dealership)

## Trust signals
- `verified` (bool) — badge shown via `sellerVerified` on products.
- `rating`, `sales` (lifetime sales count), `products` (active listing count), `since` (member
  since year).

## Dashboard vs. public storefront
- Dashboard (`SellerDashScreen`): owner-only, full inventory/order/stats management.
- Public storefront (`SellerPublicScreen`): buyer-facing, read-only, narrow column selection only
  (see `automotive-security`/`dealership-management` for the exact boundary).

## Onboarding (not yet implemented)
A real dealer-onboarding flow (KYC/verification documents, business registration) is not present in
this codebase yet — `verified` appears to be a boolean flag with no visible verification workflow.
Flag this gap before treating `verified` as a strong trust signal in any new fraud-sensitive feature.
