# Workflow: Feature Development

## When to use
Adding a new screen, capability, or user-facing behavior (e.g. a warranty-claims screen, a new
seller dashboard tab).

## Steps
1. **Scope it** with the `architect` agent if it touches `App.jsx` navigation/global state or spans
   more than one screen; otherwise scope it directly with the relevant domain skill
   (`vehicle-data`, `dealership-management`, `marketplace-rules`, etc.).
2. **Check `.claude/knowledge/`** for the relevant domain facts (schema, VIN rules, pricing rules)
   before inventing new shapes/rules.
3. **Implement** using the `templates/feature.md` and `templates/component.md`/`templates/page.md`
   templates as a starting checklist, following the owning skill's Coding Standards/Naming
   Conventions.
4. **Register the screen** (if new) per `automotive-platform`'s workflow: add to `renderScreen`,
   `SCREEN_ICONS`, `SCREEN_TITLES`, `screensWithBack`, and wire a navigation entry point.
5. **Write tests** for any new pure logic (`automotive-testing`).
6. **Run the review gate**: `npm run review` (lint + test + build + heuristic scans).
7. **Open a PR** using `templates/pull-request.md`, and request review from the `reviewer` agent's
   checklist plus the owning domain skill's checklist.

## Skills/Agents involved
`architect`, `frontend`, the relevant domain skill, `testing`, `reviewer`.
