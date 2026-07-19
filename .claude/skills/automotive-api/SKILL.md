---
name: automotive-api
description: Conventions for talking to Supabase from the client: query shape, realtime channels, error handling, and the data-fetching hooks layer.
license: Complete terms in LICENSE.txt
---

# Automotive API

## Purpose
Standardize how screens call Supabase so every data-fetching call looks and behaves the same way — column selection, error handling, realtime subscription cleanup — since there is no server-side API layer to enforce this centrally.

## Scope
- Every `supabase.from(...)` call across screens
- `supabase.channel(...)` realtime subscriptions (e.g. `App.jsx`'s notifications channel)
- `utils/hooks.js` (the one existing shared data helper, `getCategories`)

## Responsibilities
- Keep realtime channel subscriptions paired with cleanup (`supabase.removeChannel`) in every `useEffect` that opens one, exactly as `App.jsx`'s notifications effect already does.
- Grow `utils/hooks.js` as the shared home for reusable data-fetching helpers instead of letting every screen hand-roll its own copy of the same query.
- Keep column selection explicit (`select("id,name,...")`) rather than `select("*")` for anything rendered in a list.

## Architecture
Data access is entirely client-driven: React `useEffect` calls `supabase.from(table).select(...)` and stores the result in local state. Realtime updates use Supabase's Postgres change-stream (`.channel(...).on("postgres_changes", ...)`). There is no query cache/library (no React Query/SWR) — each screen manages its own loading/error/data triad by hand.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Name realtime channels uniquely per subscriber context (the existing convention is `notif-${uid}`) to avoid cross-user channel collisions.

## Folder Structure
```
utils/hooks.js        # shared data-fetching helpers (grow this)
utils/supabase.js     # re-export of the client
supabaseClient.js      # actual client construction
```

## Workflow
- 1. Prefer extending `utils/hooks.js` with a new helper over inlining a fresh `useEffect` + `supabase.from` in a screen, once a query pattern is used by 2+ screens.
- 2. Any `useEffect` that opens a realtime channel must return a cleanup function calling `supabase.removeChannel(channel)`.
- 3. Select only the columns actually rendered; add `.limit()`/pagination for anything that lists more than a screenful of rows.
- 4. Always check `error` (see `automotive-security`) before consuming `data`.

## Performance Rules
- Reuse the module-level caching pattern from `getCategories` for other rarely-changing reference data instead of refetching per mount.
- Batch independent queries with `Promise.all` when a screen needs several unrelated datasets on mount.

## Security Rules
- Every query is subject to RLS — never assume a `.select()` on the client is "safe" just because the UI hides certain rows; the database must also refuse to return them.

## Review Rules
- Flag any realtime subscription without a corresponding `removeChannel` cleanup.
- Flag `select("*")` on any list-rendering query.

## Do
- Clean up every channel subscription.
- Push reusable queries into `utils/hooks.js`.
- Use `maybeSingle()` for expected-empty single-row lookups, `single()` only when a missing row is truly exceptional.

## Don't
- Don't leave a `supabase.channel` subscribed after the component using it unmounts.
- Don't copy-paste the same 5-line query into three different screens instead of sharing a helper.

## Common Mistakes
- Forgetting the cleanup return in a realtime `useEffect`, leaking a subscription every time the component remounts.
- Using `single()` where zero rows is a normal, expected outcome, causing an unhandled/console-noisy error instead of a clean empty state.

## Checklist
- Realtime channel has cleanup.
- Column selection is explicit and minimal.
- Repeated query patterns extracted to utils/hooks.js.
- single() vs maybeSingle() used correctly.

## Prompt Templates
- "Extract the notifications unread-count query + realtime subscription from App.jsx into a reusable useUnreadNotifications() hook in utils/hooks.js."

## Real Examples
```js
// Realtime subscription with correct cleanup (pattern from App.jsx)
useEffect(() => {
  if (!session?.user) return;
  const uid = session.user.id;
  const channel = supabase.channel(`notif-${uid}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` }, fetchUnread)
    .subscribe();
  return () => supabase.removeChannel(channel);
}, [session?.user?.id]);
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
