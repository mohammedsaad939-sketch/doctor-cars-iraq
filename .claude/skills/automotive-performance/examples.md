# Automotive Performance — Examples

## Worked Example
```jsx
// Lazy-loading a rarely-visited screen
const AdminScreen = React.lazy(() => import("./screens/AdminScreen"));
// ...
<Suspense fallback={<LoadingSpinner />}>
  {currentScreen === "admin" && profile?.is_admin && <AdminScreen />}
</Suspense>
```

## Prompt Templates
- "Convert AdminScreen, SellerDashScreen, and AcademyScreen to React.lazy imports with a shared loading fallback, and report the before/after main bundle size."

## Applying This Skill
1. Re-read the **Scope** and **Responsibilities** in `SKILL.md` for the files this touches.
2. Check `docs/AUDIT.md` for any known issue already logged in this area.
3. Follow the **Workflow** section step by step.
4. Verify against `checklists.md` before opening a PR.
