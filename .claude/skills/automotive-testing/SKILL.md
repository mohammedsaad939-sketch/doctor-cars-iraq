---
name: automotive-testing
description: Introducing and growing automated test coverage for a codebase that had zero tests prior to this change.
license: Complete terms in LICENSE.txt
---

# Automotive Testing

## Purpose
Establish the testing pyramid for this app from scratch: unit tests for pure helpers first, then component tests, then a thin layer of integration tests against a mocked Supabase client — without pretending the whole app can be covered in one pass.

## Scope
- `utils/theme.js`, `utils/validators.js` (pure functions — start here)
- `utils/components.jsx` (presentational components — good Testing Library candidates)
- Screens with real business logic (`App.jsx#handleCartAdd`, `toggleFavorite`)

## Responsibilities
- Keep the pure-function layer (`toWhatsAppNumber`, `relativeTime`, UUID validation) fully unit-tested since these require no mocking and regress silently otherwise.
- Grow component tests (React Testing Library) for shared UI primitives (`Btn`, `Card`, `Badge`, `ProductCard`) before attempting full-screen integration tests.
- Mock the Supabase client at the module boundary (`vi.mock("../supabaseClient")`) for any test touching a screen, rather than hitting a real project.

## Architecture
As of this change, the project uses Vitest (already used by/compatible with Vite) with `jsdom` for DOM-dependent tests. There is no end-to-end test runner (Playwright/Cypress) configured yet — recommended as a follow-up once component coverage exists.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Test files live beside their source as `*.test.js`/`*.test.jsx` (Vitest default discovery), e.g. `utils/theme.test.js`.

## Folder Structure
```
utils/theme.test.js        # new — pure function tests
utils/validators.test.js   # new — pure function tests
vitest.config.js            # new — test runner config
```

## Workflow
- 1. New pure utility functions ship with a `*.test.js` in the same PR — no exceptions, since these are the cheapest possible tests to write.
- 2. New shared UI primitives get a smoke test (renders without throwing, key interactions fire the right callback).
- 3. Before testing a screen, mock `supabaseClient.js`'s `supabase` export so tests never depend on network/project state.
- 4. Run `npm test` locally (and via the `pre-test`/`post-test` hooks) before every PR.

## Performance Rules
- Keep the unit-test layer fast (pure functions, mocked network) so it can run on every commit without slowing down the inner dev loop.

## Security Rules
- Never point tests at a real/production Supabase project — always mock the client so tests can't accidentally read or write real user data.

## Review Rules
- Flag any new pure utility function shipped without a test.
- Flag any test that imports the real `supabaseClient.js` without mocking it.

## Do
- Start coverage with pure functions, then shared components, then screens.
- Mock Supabase at the module boundary.

## Don't
- Don't attempt full end-to-end coverage before unit coverage exists — build the pyramid bottom-up.
- Don't let tests depend on real network calls or a real Supabase project.

## Common Mistakes
- Writing a screen-level test first (high setup cost, brittle) before the cheap, high-value pure-function tests exist.
- Forgetting to mock the Supabase client, causing tests to hang or fail non-deterministically against network state.

## Checklist
- New pure functions have unit tests.
- Shared UI primitives have smoke tests.
- Supabase mocked in any screen-level test.
- `npm test` passes locally before PR.

## Prompt Templates
- "Write Vitest unit tests for utils/theme.js's toWhatsAppNumber and relativeTime, covering edge cases like a phone number already starting with 964 or 0."
- "Add a mocked-Supabase test for App.jsx's handleCartAdd covering the unique-violation fallback path."

## Real Examples
```js
import { describe, it, expect } from "vitest";
import { toWhatsAppNumber } from "./theme";

describe("toWhatsAppNumber", () => {
  it("converts a local 0-prefixed number to 964-prefixed", () => {
    expect(toWhatsAppNumber("07701234567")).toBe("9647701234567");
  });
  it("passes through an already-964 number unchanged", () => {
    expect(toWhatsAppNumber("9647701234567")).toBe("9647701234567");
  });
});
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
