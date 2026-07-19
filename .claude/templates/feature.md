# Feature Template

## Feature name


## Problem / user need


## Scope
- Screens touched:
- Skills relevant: (see `.claude/skills/`)
- New Supabase table/columns needed? (see `vehicle-data`, `automotive-api`)

## Design
- New screen id(s) (if any), following `automotive-platform` naming conventions:
- Props each new screen needs:
- Navigation entry points:

## Data
- Query shape (explicit column list, not `select("*")`):
- RLS policy + GRANT needed (if a new table):

## Testing plan
- Pure functions to unit test:
- Components to smoke-test:
- Manual verification (RTL Arabic first, then `en` toggle):

## Rollout
- Feature flag / gradual rollout needed? (default: no, this app has no flag system yet)
