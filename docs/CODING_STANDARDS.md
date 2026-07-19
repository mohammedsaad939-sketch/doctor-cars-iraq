# Coding Standards

These apply repo-wide; domain-specific rules live in the relevant `.claude/skills/` skill.

## Language / stack
- Plain JavaScript + JSX. No TypeScript today — be extra deliberate about prop shapes and add a
  brief comment where a prop's shape isn't obvious from usage.
- React 18 function components + hooks only — no class components.

## Style
- Inline `style={{ }}` objects using `utils/theme.js#T` tokens exclusively for color. Never
  hardcode a hex value that duplicates (or subtly diverges from) an existing token.
- Reuse existing primitives (`Btn`, `Card`, `Badge`, `Input`, `Modal`, `Tabs`, `Section` in
  `utils/components.jsx`) before writing new one-off styled elements.

## Naming
- Components: `PascalCase`, screens suffixed `Screen.jsx`.
- Functions/variables: `camelCase`.
- Supabase columns: `snake_case` in queries, mapped to `camelCase` at the query boundary (see
  `AdCarousel`'s mapping in `utils/components.jsx` for the reference pattern).
- Screen ids: `camelCase`, and must be added consistently to `renderScreen`, `SCREEN_ICONS`,
  `SCREEN_TITLES`, and `screensWithBack` together (see `automotive-platform`).

## Supabase / data
- Explicit column selection (`select("id,name,...")`), not `select("*")`, for anything rendered in
  a list.
- Every `insert`/`update`/`delete`/`upsert` checks its returned `error` before reporting success,
  updating a counter, or clearing state (Pattern 1 in `.github/copilot-instructions.md`).
- Unique-constrained writes use insert-then-catch-unique-violation (see `App.jsx#handleCartAdd`),
  never select-then-decide (Pattern 4).
- Every new RLS policy ships with its matching `GRANT` in the same change (Pattern 3).
- Every realtime `useEffect` returns a cleanup calling `supabase.removeChannel`.

## Error handling / UX
- No dead `onClick={() => {}}` handlers.
- Every `setLoading`/`setUpdating` toggle is wrapped in `try/finally` so a thrown error can't leave
  the UI stuck (Pattern 6).
- User-facing error messages are friendly Arabic strings (see `handleCartAdd`'s pattern), not raw
  Supabase error text.

## i18n
- Default every new screen to Arabic/RTL. Only add English strings where the `en` toggle is
  actually wired end-to-end for that screen — a half-translated screen is worse than an
  Arabic-only one.

## Testing
- New pure utility functions ship with a `*.test.js` in the same PR (see `utils/theme.test.js`,
  `utils/validators.test.js`).
- Mock the Supabase client for any test touching a screen/hook — never hit a real project.

## Linting
- `npm run lint` must exit 0 (errors block; warnings are tracked but not yet blocking — see
  `docs/AUDIT.md` for the current warning inventory and prioritization).

See `.claude/skills/` for domain-specific standards beyond these repo-wide rules.
