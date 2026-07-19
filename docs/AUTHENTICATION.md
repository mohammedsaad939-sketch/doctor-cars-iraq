# Authentication & User Management

This document covers the auth/user-management module: sign up, login, logout, email
verification, forgot/reset password, session management, profile editing, avatar upload, and the
role hierarchy. It builds on the existing Supabase Auth integration rather than replacing it — see
`docs/ARCHITECTURE.md` for how this fits into the rest of the app, and the `automotive-security`
skill (`.claude/skills/automotive-security/`) for the general RLS/error-checking discipline this
module follows.

## Module layout

```
supabaseClient.js          # Supabase client, now with explicit auth options
useAuth.js                  # session bootstrap, sign up/in/out, OAuth, password reset/verify, role
useProfile.js                # profile update + avatar upload (separate from session concerns)
utils/roles.js               # the 6-tier role model — single source of truth
utils/validators.js          # email/password/phone/avatar-file validation (extended, not duplicated)
screens/AuthScreen.jsx        # login / register / forgot-password UI
screens/ResetPasswordScreen.jsx  # new-password UI, shown after the reset-password email link
screens/RoleSelectionScreen.jsx  # post-signup role picker (unchanged flow, now refreshes profile)
screens/ProfileScreen.jsx     # profile overview + edit-profile modal + avatar upload
supabase/migrations/         # is_super_admin/avatar_url columns, RLS, avatars bucket (new)
```

No new top-level folder structure was introduced — this stays consistent with the project's
existing flat `screens/`/`utils/` + root-level hooks convention (see `docs/FOLDER_STRUCTURE.md`).

## Flows

### Sign Up
`AuthScreen` (register mode) → `useAuth#signUp`. Client-side checks email format and password
strength (`utils/validators.js#isValidEmail`/`getPasswordStrength`, minimum 8 chars + a letter +
a number) before calling `supabase.auth.signUp`. The chosen account type (`buyer`/`seller`/
`wholesale`/`workshop`) and an optional referral code are passed through
`options.data` (`raw_user_meta_data`) — previously the referral code was silently dropped; it's now
threaded through alongside the rest. Supabase sends a confirmation email
(`emailRedirectTo` points back at the app).

### Login
`AuthScreen` (login mode) → `useAuth#signIn`. Supabase error messages are translated to Arabic
(`translateAuthError`). A login attempt against an unconfirmed account surfaces a
"Resend verification email" action inline (see Email Verification below).

### Logout
`ProfileScreen`'s logout button → `useAuth#signOut` → `supabase.auth.signOut()`. The
`onAuthStateChange` listener clears `session`/`profile`/`sellerVerified` state.

### Email Verification
Supabase's built-in confirm-email flow (unchanged) plus a new resend action:
`useAuth#resendVerificationEmail(email)` wraps `supabase.auth.resend({ type: "signup", email })`,
surfaced from `AuthScreen` whenever the login error is "Email not confirmed".

### Forgot Password
`AuthScreen`'s "forgot password" panel → `useAuth#resetPasswordForEmail(email)` (previously this
called `supabase.auth.resetPasswordForEmail` directly from the screen — centralized into the hook
so there is one place that owns every auth action, not two). Supabase emails a recovery link
pointing back at the app's origin.

### Reset Password
Following the recovery link brings Supabase back to the app with a recovery session; the
`onAuthStateChange` listener in `useAuth.js` catches the `PASSWORD_RECOVERY` event and sets
`passwordRecovery = true`. `App.jsx` checks this **before** the normal `!session` / main-app
branches and renders `ResetPasswordScreen`, which collects and confirms a new password, then calls
`useAuth#updatePassword` (`supabase.auth.updateUser({ password })`) and clears the recovery flag.

### Session Management
Unchanged mechanism (Supabase's own session persistence + auto-refresh), now with explicit
`supabaseClient.js` options (`persistSession`, `autoRefreshToken`, `detectSessionInUrl` — all
previously implicit defaults) so the intent is documented rather than assumed. `useAuth`'s
`onAuthStateChange` subscription is the single source of truth for `session`/`profile`; no screen
should re-derive session state independently.

### User Profile
`ProfileScreen` now includes an edit-profile modal (name/phone/city) backed by
`useProfile#updateProfile`, reusing the existing `Modal`/`Input`/`Btn` primitives from
`utils/components.jsx` rather than introducing new ones.

### Avatar Upload
`ProfileScreen`'s avatar circle has a camera-icon button opening a native file picker
(`accept="image/jpeg,image/png,image/webp"`). `useProfile#uploadAvatar`:
1. Client-side validates type/size (`utils/validators.js#validateAvatarFile`, ≤5MB).
2. Uploads to the `avatars` Storage bucket at `${uid}/avatar.<ext>` (`upsert: true` — one avatar per
   user, matching the existing `product-images`/`vehicle-images` bucket conventions already used by
   `SellerDashScreen`/`GarageScreen`).
3. Updates `profiles.avatar_url` with the public URL (cache-busted with a `?t=` query param so the
   new image shows immediately).

The real enforcement boundary is the Storage RLS policy in
`supabase/migrations/20260719181229_auth_roles_and_avatars.sql`, which restricts writes to the
user's own folder — client-side validation is fast feedback only (see `automotive-security`).

## Role hierarchy

`utils/roles.js` is the single source of truth — every screen and future feature should call
`resolveRole()`/`isAtLeast()`/`hasAnyRole()` rather than re-deriving privilege from raw profile
fields.

| Role | Derived from | Notes |
|---|---|---|
| **Guest** | no session | Not persisted — `AuthScreen` is shown |
| **User** | `profiles.role = 'user'` (default) | Plain buyer account |
| **Dealer** | `profiles.role` in `seller`/`trader`/`workshop` | Reuses the existing marketplace-operator roles from `RoleSelectionScreen`/`SellerDashScreen` — no new profile-role values introduced |
| **Verified Dealer** | Dealer **and** `sellers.verified`/`is_verified` | Reuses the existing seller-verification flag already toggled from `AdminScreen` |
| **Admin** | `profiles.is_admin` | Existing column, existing `AdminScreen` toggle — unchanged |
| **Super Admin** | `profiles.is_super_admin` | **New** column (this module's only new profile column besides `avatar_url`) |

This deliberately reuses every existing field it can (`role`, `is_admin`, `sellers.verified`)
instead of introducing a second, parallel role system — see `docs/AUDIT.md`'s "no duplicated logic"
principle. `is_super_admin` is the one genuinely new concept, since nothing in the app previously
distinguished "admin" from "the most senior admin."

`App.jsx` uses `isAtLeast(role, ROLES.ADMIN)` to gate the `admin` screen (replacing the previous
`profile?.is_admin` inline check) and `isAtLeast(role, ROLES.DEALER)` to gate `sellerDash` — both
are UX-only gates; the real boundary is the RLS policies in Postgres (see Security below).
`RoleSelectionScreen` now calls `refreshProfile()` after setting a user's role, so a freshly
onboarded dealer isn't locked out of their own dashboard by this gate until their next reload.

## Security

- **RLS is the real boundary**, not the client-side role gates above (per this repo's
  non-negotiable rules — see root `CLAUDE.md`). `supabase/migrations/
  20260719181229_auth_roles_and_avatars.sql` adds:
  - A `profiles` RLS policy allowing a user to select/update their own row, or an admin to
    select/update any row (needed for `AdminScreen`'s existing user list + admin-toggle).
  - A `BEFORE UPDATE` trigger (`prevent_profile_privilege_escalation`) blocking any change to
    `is_admin`/`is_super_admin` unless the **acting** user (not the target row) is already an
    admin/super-admin — this is enforced with a trigger rather than RLS because RLS policies can't
    natively express "most columns are self-editable, but these specific ones need a stricter,
    OLD-vs-NEW-aware check."
  - The `avatars` Storage bucket (public read; insert/update/delete restricted to the uploader's own
    `${uid}/` folder).
  - Every policy ships with its matching `GRANT`, per this repo's non-negotiable rules.
- **Password strength** is enforced client-side (`getPasswordStrength`, min 8 chars + letter +
  number) as fast feedback; Supabase Auth's own server-side minimum still applies regardless.
- **No secrets client-side**: this module adds no new environment variables or keys; it uses the
  existing anon-key Supabase client (`utils/supabase.js`/`supabaseClient.js`).
- **Tabnabbing**: N/A — this module doesn't open new external links; see the existing
  `automotive-security` skill for that rule.

## Migration status

`supabase/migrations/20260719181229_auth_roles_and_avatars.sql` is a reviewable SQL file, **not**
yet applied to any live Supabase project from this change — this repository has no live database
connection available in the environment this module was built in (consistent with the "schema
lives in the Supabase project" note in `docs/AUDIT.md`). Apply it via the Supabase SQL editor or
`supabase db push` before the Super Admin tier or avatar upload will work end-to-end; every
statement is written to be idempotent (`IF NOT EXISTS`/`DROP POLICY IF EXISTS`/`ON CONFLICT`) so it
is safe to run against the existing project without assuming this is the first migration ever
applied.

## Testing

`utils/roles.test.js` and the additions to `utils/validators.test.js` cover the pure, dependency-free
logic (role derivation for all 6 tiers, hierarchy ranking, email/phone/password/avatar-file
validation) per the `automotive-testing` skill's bottom-up approach. Screen-level/integration tests
(mocked-Supabase `useAuth`/`useProfile` behavior, `AuthScreen`/`ResetPasswordScreen` interaction
tests) are a deliberately deferred follow-up, consistent with this repo's existing testing
maturity — see `docs/AUDIT.md` and `.claude/workflows/testing.md`.

## Known follow-ups (not done in this change)

- `AuthScreen`'s `userTypes` includes `workshop` as a signup option, but `RoleSelectionScreen`'s
  post-signup role picker doesn't offer a workshop path — a pre-existing gap, unrelated to this
  module, noted here rather than silently fixed to keep this change scoped to auth/roles.
- Screen-level auth tests (see Testing above).
- Wiring `isAtLeast`/`hasAnyRole` into more screens as role-gated features grow (currently only
  `admin` and `sellerDash` in `App.jsx` use it).
