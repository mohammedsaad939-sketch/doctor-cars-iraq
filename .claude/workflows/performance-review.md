# Workflow: Performance Review

## When to use
A new screen/feature is added, or `SellerDashScreen.jsx`/`AuctionsScreen.jsx`/similar large files
grow further.

## Steps
1. Run `.claude/hooks/performance-scan.sh` for a bundle-size + oversized-file report.
2. For a new screen: is it needed on first paint, or can it be `React.lazy`-loaded?
3. For a screen making 2+ Supabase calls on mount: can independent calls be parallelized with
   `Promise.all`?
4. For a growing large file: propose a split into sub-components with colocated data fetching.
5. Measure before/after — never claim a performance win without a number (bundle size, call count).

## Skills/Agents involved
`performance`, `automotive-performance`.
