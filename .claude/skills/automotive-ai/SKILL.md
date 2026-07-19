---
name: automotive-ai
description: Guardrails for the AI-flavored features in the app: fault diagnosis and price estimation.
license: Complete terms in LICENSE.txt
---

# Automotive AI

## Purpose
Own the guardrails for `DiagnosisScreen` (fault diagnosis) and `CarPriceEstimatorScreen` (price estimation) so these features are honest about their confidence and never presented as authoritative mechanical or financial advice without a disclaimer.

## Scope
- `screens/DiagnosisScreen.jsx` (191 lines)
- `screens/CarPriceEstimatorScreen.jsx` (95 lines)

## Responsibilities
- Ensure diagnosis output is presented as a starting point for a real mechanic/workshop visit, not a certain diagnosis — pair every result with a clear disclaimer and a path to `EmergencyScreen`/workshop booking for anything safety-related.
- Ensure price estimates are presented as a range/estimate tied to visible inputs (make/model/year/condition/km), not a single confident number with no basis shown.
- If/when a real LLM call backs either screen, keep prompts and any generated text server-side or otherwise not exposing API keys client-side.

## Architecture
These screens currently operate on rule-based/mock logic rather than a live LLM integration (no AI SDK dependency is declared in `package.json`). If a real model integration is added, it must not ship a provider API key in client-side code — proxy through a server/edge function.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Follow the existing repo-wide conventions: PascalCase components, camelCase functions/variables, snake_case Supabase columns mapped to camelCase at the query boundary.

## Folder Structure
```
screens/DiagnosisScreen.jsx
screens/CarPriceEstimatorScreen.jsx
```

## Workflow
- 1. Any AI-generated diagnosis or price estimate ships with a visible disclaimer and, for diagnosis, a next step toward a real workshop/mechanic.
- 2. Any real model integration proxies through a backend/edge function — never embed a provider API key in this Vite client bundle (it would be publicly readable).
- 3. Log inputs/outputs only with user consent and never include PII beyond what's needed for the estimate/diagnosis.

## Performance Rules
- If a real model call is added, show a clear loading state — LLM latency is much higher than a typical Supabase query and the existing loading patterns (spinner/skeleton) should be reused.

## Security Rules
- Never ship a raw AI provider API key in client-side code (anything in the Vite bundle is public) — proxy calls through a server-side function.
- Treat diagnosis/price-estimate inputs as user data subject to the same RLS/privacy discipline as everything else if persisted.

## Review Rules
- Flag any AI-feature PR that presents a generated result without a disclaimer.
- Flag any client-side code that would embed a model provider's secret key.

## Do
- Disclaim AI-generated diagnosis/estimates clearly.
- Proxy any real model calls through a backend.

## Don't
- Don't present a diagnosis/price estimate as certain/authoritative.
- Don't embed provider API keys client-side.

## Common Mistakes
- Shipping a confident-sounding single-number price estimate with no visible basis (inputs used) or range.
- Adding a "quick fix" that calls an AI provider directly from the browser with an embedded key.

## Checklist
- Disclaimer shown alongside AI-generated content.
- No provider API key in client bundle.
- Diagnosis links to a real next step (workshop/emergency) for anything safety-relevant.

## Prompt Templates
- "Add a disclaimer and a 'book a workshop visit' CTA to DiagnosisScreen's result view."

## Real Examples
```jsx
<p style={{ color: T.textMuted, fontSize: 11 }}>
  ⚠️ هذا تشخيص أولي تقريبي وليس بديلاً عن فحص فني مختص.
</p>
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
