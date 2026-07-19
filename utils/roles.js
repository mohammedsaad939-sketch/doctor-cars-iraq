// Canonical authorization role hierarchy for Doctor Cars Iraq.
//
// This derives a single, ranked role from existing Supabase fields rather than
// introducing a second, parallel role column: Guest/User are derived purely from
// session + profiles.role; Dealer/Verified Dealer reuse the existing
// profiles.role ("seller"/"trader"/"workshop") and sellers.verified/is_verified
// columns already used by SellerDashScreen/AdminScreen; Admin reuses the existing
// profiles.is_admin column; Super Admin is the one new column this module adds
// (profiles.is_super_admin — see supabase/migrations).
export const ROLES = Object.freeze({
  GUEST: "guest",
  USER: "user",
  DEALER: "dealer",
  VERIFIED_DEALER: "verified_dealer",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
});

// Ordered lowest to highest privilege — used by isAtLeast() for role-gating.
const ROLE_RANK = {
  [ROLES.GUEST]: 0,
  [ROLES.USER]: 1,
  [ROLES.DEALER]: 2,
  [ROLES.VERIFIED_DEALER]: 3,
  [ROLES.ADMIN]: 4,
  [ROLES.SUPER_ADMIN]: 5,
};

// profiles.role values that represent a marketplace-operator ("dealer") account,
// per the existing RoleSelectionScreen/SellerDashScreen conventions.
const DEALER_PROFILE_ROLES = new Set(["seller", "trader", "workshop"]);

export const ROLE_LABELS_AR = Object.freeze({
  [ROLES.GUEST]: "زائر",
  [ROLES.USER]: "مستخدم",
  [ROLES.DEALER]: "تاجر",
  [ROLES.VERIFIED_DEALER]: "تاجر موثّق",
  [ROLES.ADMIN]: "مشرف",
  [ROLES.SUPER_ADMIN]: "مشرف عام",
});

/**
 * Resolves the effective, ranked role for the current user.
 *
 * @param {object} params
 * @param {object|null} params.session - Supabase auth session (null/undefined => guest).
 * @param {object|null} params.profile - The profiles row for session.user (may still be loading).
 * @param {boolean} [params.sellerVerified] - sellers.verified/is_verified for this user's seller
 *   row, if any (fetched separately since it lives in a different table — see useAuth.js).
 * @returns {string} one of ROLES.*
 */
export function resolveRole({ session, profile, sellerVerified = false } = {}) {
  if (!session?.user) return ROLES.GUEST;
  if (profile?.is_super_admin) return ROLES.SUPER_ADMIN;
  if (profile?.is_admin) return ROLES.ADMIN;
  if (profile?.role && DEALER_PROFILE_ROLES.has(profile.role)) {
    return sellerVerified ? ROLES.VERIFIED_DEALER : ROLES.DEALER;
  }
  return ROLES.USER;
}

/** True if `role` is at or above `minimum` in the privilege hierarchy. */
export function isAtLeast(role, minimum) {
  const roleRank = ROLE_RANK[role];
  const minRank = ROLE_RANK[minimum];
  if (roleRank === undefined || minRank === undefined) return false;
  return roleRank >= minRank;
}

/** True if `role` is exactly one of `allowed` (no hierarchy — exact membership). */
export function hasAnyRole(role, allowed = []) {
  return allowed.includes(role);
}
