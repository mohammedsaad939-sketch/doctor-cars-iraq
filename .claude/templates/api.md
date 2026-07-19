# API (Supabase Query) Template

This project has no server-side API layer — "API" here means a Supabase client-side query pattern.
See `automotive-api` and `automotive-security` before filling this in.

## Table(s) queried


## Columns selected (explicit list, not `*`)


## Filters / RLS assumptions
(What RLS policy makes this safe if called directly by a malicious client?)

## Error handling
- [ ] `error` checked before using `data` or reporting success

## Realtime?
- [ ] Channel name is unique per subscriber context
- [ ] Cleanup (`supabase.removeChannel`) returned from the `useEffect`

## Caching
- [ ] Reuses `utils/hooks.js` pattern for rarely-changing reference data, if applicable
