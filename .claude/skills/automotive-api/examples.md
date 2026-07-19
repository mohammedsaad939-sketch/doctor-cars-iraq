# Automotive API — Examples

## Worked Example
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

## Prompt Templates
- "Extract the notifications unread-count query + realtime subscription from App.jsx into a reusable useUnreadNotifications() hook in utils/hooks.js."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
