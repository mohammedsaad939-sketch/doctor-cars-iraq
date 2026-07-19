# Automotive Performance — Review Checklist

## Core Checklist
- [ ] New heavy screens evaluated for lazy-loading.
- [ ] Sequential independent Supabase calls parallelized.
- [ ] Bundle size measured, not assumed, before claiming a win.
- [ ] Lazy boundaries have a Suspense fallback.

## Do
- [ ] Propose `React.lazy` boundaries for rarely-visited screens.
- [ ] Measure before/after bundle size when claiming a performance win.

## Don't (verify avoided)
- [ ] Avoided: Don't treat code-splitting as a security control.
- [ ] Avoided: Don't add new heavy dependencies without checking their bundle-size impact first.

## Common Mistakes to Re-check
- [ ] Not repeating: Assuming inline style objects are the main performance cost when bundle size (all 24 screens eager) is the bigger lever for this app.
- [ ] Not repeating: Lazy-loading a screen without a loading fallback, causing a blank flash on slow connections.
