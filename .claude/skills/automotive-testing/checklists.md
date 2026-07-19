# Automotive Testing — Review Checklist

## Core Checklist
- [ ] New pure functions have unit tests.
- [ ] Shared UI primitives have smoke tests.
- [ ] Supabase mocked in any screen-level test.
- [ ] `npm test` passes locally before PR.

## Do
- [ ] Start coverage with pure functions, then shared components, then screens.
- [ ] Mock Supabase at the module boundary.

## Don't (verify avoided)
- [ ] Avoided: Don't attempt full end-to-end coverage before unit coverage exists — build the pyramid bottom-up.
- [ ] Avoided: Don't let tests depend on real network calls or a real Supabase project.

## Common Mistakes to Re-check
- [ ] Not repeating: Writing a screen-level test first (high setup cost, brittle) before the cheap, high-value pure-function tests exist.
- [ ] Not repeating: Forgetting to mock the Supabase client, causing tests to hang or fail non-deterministically against network state.
