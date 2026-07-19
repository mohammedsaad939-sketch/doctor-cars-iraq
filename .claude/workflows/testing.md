# Workflow: Testing

## When to use
Adding or growing test coverage (this project had zero tests before this change).

## Steps
1. **Start with pure functions** (`utils/theme.js`, `utils/validators.js`) — no mocking required,
   highest value per line of test code.
2. **Move to shared UI primitives** (`utils/components.jsx`'s `Btn`/`Card`/`Badge`/etc.) using
   React Testing Library + `jsdom` (already configured in `vitest.config.js`).
3. **Mock the Supabase client** (`vi.mock("../supabaseClient")` or `vi.mock("./supabaseClient")`)
   before testing any screen or hook that touches `supabase.from(...)`.
4. Run `npm test` (wraps `pretest`/`posttest` hooks automatically) locally before every PR.
5. Note deliberately-deferred coverage in the PR description rather than silently skipping it.

## Skills/Agents involved
`testing`, `automotive-testing` skill, `reviewer`.
