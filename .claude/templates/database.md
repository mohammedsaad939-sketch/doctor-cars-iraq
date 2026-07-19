# Database (Table) Template

See `.claude/knowledge/vehicle-schema.md` and `automotive-security` before filling this in — this
repo has no migrations, so this template documents intent for whoever applies it to the Supabase
project.

## Table name


## Columns
| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| | | | | |

## RLS policies
```sql
alter table public.<table> enable row level security;
create policy "<policy name>" on public.<table> for <select|insert|update|delete>
  using (...) with check (...);
```

## GRANT (required alongside every policy — Pattern 3 in copilot-instructions.md)
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT <SELECT|INSERT|UPDATE|DELETE> ON public.<table> TO authenticated;
```

## Indexes / constraints
-
