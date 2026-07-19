---
name: automotive-uiux
description: The inline-style design-token system, RTL-first Arabic UX, bottom navigation, and PWA install experience.
license: Complete terms in LICENSE.txt
---

# Automotive UI/UX

## Purpose
Own the visual/interaction language of the app: the `T` design-token object, the presentational primitives in `utils/components.jsx`, and the mobile-first, RTL-by-default navigation chrome (bottom nav, shortcut toolbar, back header).

## Scope
- `utils/theme.js#T` (design tokens)
- `utils/components.jsx` (Badge, Stars, Btn, Card, Input, Modal, Tabs, Section, AdCarousel, ProductCard)
- `App.jsx` chrome: bottom nav, shortcut toolbar, back header, PWA banner, cart toast

## Responsibilities
- Keep every new UI surface using the `T` token object for color — never a hardcoded hex value that duplicates (or subtly diverges from) an existing token.
- Keep new interactive primitives consistent with the existing `Btn` variant system (`primary`/`secondary`/`danger`/`ghost`/`blue`/`green`) rather than one-off inline button styles.
- Default every new screen to RTL Arabic; treat the `en` toggle as an explicit, opt-in translation effort per string, not automatic.

## Architecture
There is no CSS-in-JS library (no styled-components/Emotion) and no Tailwind — every style is a plain JS object passed to `style=`. This is inexpensive to start with but has no selector reuse, no pseudo-class support without inline `<style>` blocks (already used sparingly for `:hover`-like effects via transitions), and no design-token type-checking.

## Coding Standards
- Match the existing codebase: plain JS + JSX (no TypeScript), inline `style={}` objects using `utils/theme.js#T`, no CSS framework.
- Prefer small, focused functions/components over adding more branches to already-large files (see `docs/AUDIT.md` for current file-size hotspots).
- Every Supabase write checks its `error` before reporting success (see `automotive-security`).

## Naming Conventions
- Token names in `T` follow `<hue><Modifier>` (e.g. `navy`, `navyDark`, `navyMid`, `navyCard`, `navyLight`, `navyBorder`) — follow this ladder rather than inventing a new naming scheme for a new color.

## Folder Structure
```
utils/theme.js        # T design tokens
utils/components.jsx  # presentational primitives
App.jsx                # navigation chrome
index.css              # minimal global reset
```

## Workflow
- 1. Reach for an existing `T` token before adding a new color; if a genuinely new color is needed, add it to `T` with a name following the existing ladder convention.
- 2. Reach for an existing primitive (`Btn`, `Card`, `Badge`, `Input`, `Modal`, `Tabs`, `Section`) before writing new one-off inline styles that duplicate their behavior.
- 3. Verify new screens in `dir="rtl"` (the default) first; only then check the `en`/LTR toggle if that screen has translated strings.

## Performance Rules
- Avoid recreating large static style objects on every render where they don't depend on props/state (see `automotive-performance`).

## Security Rules
- Sanitize/avoid `dangerouslySetInnerHTML` for any user- or seller-provided text (titles, descriptions) rendered through these primitives.

## Review Rules
- Flag any new hardcoded hex color that isn't in `T` and isn't clearly a one-off (e.g. a brand logo color).
- Flag any new button-like element that doesn't reuse `Btn`.

## Do
- Use `T` tokens exclusively for color.
- Reuse `Btn`/`Card`/`Badge`/`Input`/`Modal`/`Tabs`/`Section` for anything matching their purpose.
- Design and test RTL first.

## Don't
- Don't hardcode a hex color that duplicates an existing `T` token under a different literal value.
- Don't build a new one-off button/card style when `Btn`/`Card` already covers the case.

## Common Mistakes
- Adding a slightly-different hex value for what is effectively the same navy/gold token, causing subtle inconsistency across screens.
- Building and testing a new screen only in English/LTR, then discovering RTL layout breaks (icon/text order, `flex-direction`) after the fact.

## Checklist
- All colors come from T.
- New interactive elements reuse existing primitives where applicable.
- New screen verified in RTL Arabic (default) before LTR.
- No dangerouslySetInnerHTML on untrusted text.

## Prompt Templates
- "Add a new `Chip` primitive to utils/components.jsx following the same styling conventions as Badge, and use it in ShopScreen for active filters."

## Real Examples
```jsx
// Reusing the Btn variant system instead of a one-off style
<Btn variant="danger" size="sm" onClick={handleRemove}>إزالة</Btn>
```

## Best Practices
- Ground every change in what the codebase actually does today (see `docs/AUDIT.md`) rather than an idealized rewrite.
- Prefer additive, reviewable changes over broad refactors when touching shared files like `App.jsx`.
- Cross-reference `.claude/knowledge/` for domain facts (schema, VIN, pricing, moderation, etc.) instead of re-deriving them per PR.
