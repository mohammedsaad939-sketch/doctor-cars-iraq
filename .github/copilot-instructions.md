# Copilot Review Focus — Doctor Cars Iraq

This project has repeatedly run into a specific set of bug patterns during development. When reviewing a pull request, prioritize flagging these six patterns over generic style comments. Each includes a concrete example of what to flag.

## 1. Success shown without checking the error
Bad (flag this):
```js
await supabase.from("orders").insert({...});
showSuccessToast("تم بنجاح");
```
Good:
```js
const { error } = await supabase.from("orders").insert({...});
if (error) { showErrorToast(error.message); return; }
showSuccessToast("تم بنجاح");
```
Flag any insert/update/delete/upsert call whose `error` result is not checked before showing success, updating a counter/badge, or clearing form/cart state.

## 2. Mock data or fake IDs presented as real
Flag any UI section still using a hardcoded array, hardcoded stat (rating, percentage, revenue, count), or `MOCK.*` reference instead of a live Supabase query. Also flag any code that would insert a non-UUID or otherwise fake foreign key (e.g. product_id) into a real table.

## 3. RLS policy added without a matching GRANT
Bad (flag this):
```sql
alter table public.foo enable row level security;
create policy ... on public.foo for select using (...);
-- no GRANT statement
```
Good:
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON public.foo TO authenticated;
```
A new table with RLS policies but no GRANT to anon/authenticated will fail with "permission denied for table X" even though the policies look correct. Flag any migration that adds RLS policies without a corresponding GRANT.

## 4. Non-atomic check-then-write against a unique constraint
Bad (flag this):
```js
const { data: existing } = await supabase.from("cart_items").select().eq(...).maybeSingle();
if (existing) { update... } else { insert... }
```
Good: a single real `upsert(..., { onConflict: "..." })`, or insert-first with a catch on the unique-violation error code. Flag the select-then-decide pattern against any table with a unique constraint, since concurrent/rapid actions can race.

## 5. Silent data loss via `continue`/skip in a loop
Flag any loop that skips an item missing an expected field (e.g. `if (!sellerId) continue;`) when that silently excludes the item from a multi-step operation (like an order) without telling the user. Prefer aborting with a clear message naming the affected item.

## 6. Dead buttons and missing try/finally on loading state
Flag any onClick handler that is empty (`() => {}`) or a no-op while still being rendered as an active button. Also flag any `setLoading(true)` / `setUpdating(true)` that is not wrapped in try/finally, since an error path can leave the UI stuck in a disabled/loading state forever.
