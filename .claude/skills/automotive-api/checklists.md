# Automotive API — Review Checklist

## Core Checklist
- [ ] Realtime channel has cleanup.
- [ ] Column selection is explicit and minimal.
- [ ] Repeated query patterns extracted to utils/hooks.js.
- [ ] single() vs maybeSingle() used correctly.

## Do
- [ ] Clean up every channel subscription.
- [ ] Push reusable queries into `utils/hooks.js`.
- [ ] Use `maybeSingle()` for expected-empty single-row lookups, `single()` only when a missing row is truly exceptional.

## Don't (verify avoided)
- [ ] Avoided: Don't leave a `supabase.channel` subscribed after the component using it unmounts.
- [ ] Avoided: Don't copy-paste the same 5-line query into three different screens instead of sharing a helper.

## Common Mistakes to Re-check
- [ ] Not repeating: Forgetting the cleanup return in a realtime `useEffect`, leaking a subscription every time the component remounts.
- [ ] Not repeating: Using `single()` where zero rows is a normal, expected outcome, causing an unhandled/console-noisy error instead of a clean empty state.
