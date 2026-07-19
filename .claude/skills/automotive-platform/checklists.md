# Automotive Platform — Review Checklist

## Core Checklist
- [ ] New screen id added consistently to `renderScreen`, `SCREEN_ICONS`, `SCREEN_TITLES`, and `screensWithBack` (if it needs a back button).
- [ ] Screen only receives the props it uses.
- [ ] No direct Supabase admin-bypass logic added to `App.jsx`.
- [ ] `npm run build` passes.
- [ ] RTL layout verified for the new screen (test with `lang="ar"`, the default).

## Do
- [ ] Keep new screens self-contained: fetch their own screen-specific data, accept only shared state as props.
- [ ] Reuse `navigate(screen, meta)` for all cross-screen transitions instead of inventing a second navigation mechanism.
- [ ] Default every new screen's text to Arabic; add English strings only where the `en` toggle is actually wired end-to-end.

## Don't (verify avoided)
- [ ] Avoided: Don't add a screen id in one lookup table (icons/titles/back-list) without adding it to the others.
- [ ] Avoided: Don't call `supabase` directly from `App.jsx` for screen-specific data — that belongs inside the screen.
- [ ] Avoided: Don't block `serviceWorker.register` or `beforeinstallprompt` handling with unhandled promise rejections.

## Common Mistakes to Re-check
- [ ] Not repeating: Adding a new screen id to `SCREEN_TITLES` but forgetting `screensWithBack`, leaving the screen without a way to navigate back.
- [ ] Not repeating: Spelling a screen id differently between the `case` label and the lookup tables (see the real `sellerPublic`/`sellerProfile` drift found in the audit).
- [ ] Not repeating: Fetching `session`/`profile` again inside a screen instead of receiving it as a prop from `App.jsx`, causing two sources of truth.
