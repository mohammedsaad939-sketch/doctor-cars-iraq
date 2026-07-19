# Automotive Platform — Examples

## Worked Example
```jsx
// Registering a new screen consistently (App.jsx)
case "warrantyClaims":
  return <WarrantyClaimsScreen session={session} profile={profile} onNavigate={navigate} />;
// ...and in the same PR:
const SCREEN_ICONS = { ..., warrantyClaims: "🛡️" };
const SCREEN_TITLES = { ..., warrantyClaims: "مطالبات الضمان" };
const screensWithBack = [..., "warrantyClaims"];
```

## Prompt Templates
- "Add a new screen `<name>` reachable from the shortcut toolbar, following the existing screen-registration pattern in App.jsx."
- "Audit App.jsx's screen lookup tables for id drift like the sellerPublic/sellerProfile mismatch and report any other mismatches."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
