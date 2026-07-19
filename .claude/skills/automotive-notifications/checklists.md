# Automotive Notifications — Review Checklist

## Core Checklist
- [ ] Unread count query uses head+exact count.
- [ ] Realtime channel cleaned up correctly.
- [ ] New notification types added to the shared map.
- [ ] RLS restricts notifications to their owner.

## Do
- [ ] Reuse the `head:true, count:"exact"` unread-count query pattern.
- [ ] Clean up realtime channels on unmount/user change.

## Don't (verify avoided)
- [ ] Avoided: Don't add a new notification type without updating the icon/label map.
- [ ] Avoided: Don't rely on the client-side realtime filter as a security boundary.

## Common Mistakes to Re-check
- [ ] Not repeating: Adding a new notification `type` that falls through to a default icon/label silently instead of being an intentional addition to the shared map.
- [ ] Not repeating: Forgetting to re-run the unread-count query after marking notifications read, leaving the bottom-nav badge stale.
