import { describe, it, expect } from "vitest";
import { ROLES, resolveRole, isAtLeast, hasAnyRole } from "./roles";

describe("resolveRole", () => {
  it("returns GUEST when there is no session", () => {
    expect(resolveRole({ session: null, profile: null })).toBe(ROLES.GUEST);
    expect(resolveRole({})).toBe(ROLES.GUEST);
  });

  it("returns USER for a plain authenticated buyer profile", () => {
    const session = { user: { id: "u1" } };
    expect(resolveRole({ session, profile: { role: "user" } })).toBe(ROLES.USER);
  });

  it("returns USER when profile is still loading (null)", () => {
    const session = { user: { id: "u1" } };
    expect(resolveRole({ session, profile: null })).toBe(ROLES.USER);
  });

  it("returns DEALER for an unverified seller/trader/workshop profile", () => {
    const session = { user: { id: "u1" } };
    expect(resolveRole({ session, profile: { role: "seller" }, sellerVerified: false })).toBe(ROLES.DEALER);
    expect(resolveRole({ session, profile: { role: "trader" }, sellerVerified: false })).toBe(ROLES.DEALER);
    expect(resolveRole({ session, profile: { role: "workshop" }, sellerVerified: false })).toBe(ROLES.DEALER);
  });

  it("returns VERIFIED_DEALER when the seller row is verified", () => {
    const session = { user: { id: "u1" } };
    expect(resolveRole({ session, profile: { role: "seller" }, sellerVerified: true })).toBe(ROLES.VERIFIED_DEALER);
  });

  it("returns ADMIN when is_admin is set, regardless of role", () => {
    const session = { user: { id: "u1" } };
    expect(resolveRole({ session, profile: { role: "user", is_admin: true } })).toBe(ROLES.ADMIN);
    expect(resolveRole({ session, profile: { role: "seller", is_admin: true }, sellerVerified: true })).toBe(ROLES.ADMIN);
  });

  it("returns SUPER_ADMIN when is_super_admin is set, taking priority over is_admin", () => {
    const session = { user: { id: "u1" } };
    expect(resolveRole({ session, profile: { is_super_admin: true, is_admin: true } })).toBe(ROLES.SUPER_ADMIN);
    expect(resolveRole({ session, profile: { is_super_admin: true, is_admin: false } })).toBe(ROLES.SUPER_ADMIN);
  });
});

describe("isAtLeast", () => {
  it("ranks the hierarchy correctly", () => {
    expect(isAtLeast(ROLES.SUPER_ADMIN, ROLES.ADMIN)).toBe(true);
    expect(isAtLeast(ROLES.ADMIN, ROLES.SUPER_ADMIN)).toBe(false);
    expect(isAtLeast(ROLES.VERIFIED_DEALER, ROLES.DEALER)).toBe(true);
    expect(isAtLeast(ROLES.DEALER, ROLES.VERIFIED_DEALER)).toBe(false);
    expect(isAtLeast(ROLES.USER, ROLES.USER)).toBe(true);
    expect(isAtLeast(ROLES.GUEST, ROLES.USER)).toBe(false);
  });

  it("is false for an unknown role", () => {
    expect(isAtLeast("bogus", ROLES.USER)).toBe(false);
    expect(isAtLeast(ROLES.ADMIN, "bogus")).toBe(false);
  });
});

describe("hasAnyRole", () => {
  it("checks exact membership, not hierarchy", () => {
    expect(hasAnyRole(ROLES.DEALER, [ROLES.DEALER, ROLES.VERIFIED_DEALER])).toBe(true);
    expect(hasAnyRole(ROLES.VERIFIED_DEALER, [ROLES.DEALER])).toBe(false);
    expect(hasAnyRole(ROLES.ADMIN, [])).toBe(false);
  });
});
