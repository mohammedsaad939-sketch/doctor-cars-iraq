---
name: automotive-notifications
description: In-app notifications, unread counts, and realtime updates via Supabase Postgres change streams.
license: Complete terms in LICENSE.txt
---

# Automotive Notifications

## Purpose
Own the notification center: unread-count tracking, realtime delivery, and the notification screen itself, keeping the realtime-subscription-with-cleanup discipline already established in `App.jsx`.

## Scope
- `screens/NotificationsScreen.jsx`
- `App.jsx` unread-count effect + `notif-${uid}` realtime channel

## Responsibilities
- Keep unread-count fetching and realtime subscription paired with proper cleanup on every mount/unmount and user-id change.
- Keep notification types (`order`, `auction`, `message`, `service` per `MOCK.notifications`) as a small, well-known enum rather than free-text types that screens have to guess how to render.

## Architecture
Unread count is fetched once on mount and then kept live via a Supabase Realtime channel listening for `INSERT` events on the `notifications` table filtered by `user_id`. `NotificationsScreen` itself manages marking notifications read and reports back to `App.jsx` via `onUnreadChange`.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Keep notification `type` values as a closed set (`order`, `auction`, `message`, `service`, …) documented in one place so icon/label lookups don't need a fallback for unknown types.

## Folder Structure
```
screens/NotificationsScreen.jsx
App.jsx#unreadNotifCount effect
```

## Workflow
- 1. New notification types are added to the shared type→icon/label map first, then produced by whatever feature triggers them.
- 2. Any screen that needs unread count reads it via `onUnreadChange`/props from `App.jsx`, not via a second independent query.
- 3. Mark-as-read operations must check `error` before updating local read state (Pattern 1).

## Performance Rules
- Use `head: true, count: "exact"` for unread-count queries (already the pattern) instead of fetching full rows just to count them.

## Security Rules
- The realtime filter (`user_id=eq.${uid}`) must be backed by an RLS policy that actually restricts `notifications` reads to the owning user — a client-side filter alone does not stop another client from subscribing to someone else's channel/table.

## Review Rules
- Flag any new notification-producing feature that doesn't reuse the existing `notifications` table/shape.
- Flag any mark-as-read call that updates local state before confirming no error.

## Do
- Reuse the `head:true, count:"exact"` unread-count query pattern.
- Clean up realtime channels on unmount/user change.

## Don't
- Don't add a new notification type without updating the icon/label map.
- Don't rely on the client-side realtime filter as a security boundary.

## Common Mistakes
- Adding a new notification `type` that falls through to a default icon/label silently instead of being an intentional addition to the shared map.
- Forgetting to re-run the unread-count query after marking notifications read, leaving the bottom-nav badge stale.

## Checklist
- Unread count query uses head+exact count.
- Realtime channel cleaned up correctly.
- New notification types added to the shared map.
- RLS restricts notifications to their owner.

## Prompt Templates
- "Add a new notification type `price_drop` end-to-end: schema note, icon/label map entry, and a trigger point when a followed product's price drops."

## Real Examples
```js
const fetchUnread = () =>
  supabase.from("notifications").select("id", { count: "exact", head: true })
    .eq("user_id", uid).eq("is_read", false)
    .then(({ count }) => setUnreadNotifCount(count || 0));
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
