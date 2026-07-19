import { describe, it, expect } from "vitest";
import {
  VEHICLE_STATUS,
  LIVE_STATUSES,
  isValidStatusTransition,
  nextAllowedStatuses,
  requestStatusTransition,
  getPublishBlockers,
} from "./vehicleStatus";

const COMPLETE_LISTING = {
  status: VEHICLE_STATUS.DRAFT,
  brand: "Toyota",
  model: "Camry",
  year: 2020,
  price: 25000000,
  governorate: "بغداد",
  city: "الكرادة",
  images: ["https://example.com/1.jpg"],
};

describe("isValidStatusTransition", () => {
  it("allows draft -> published and draft -> archived", () => {
    expect(isValidStatusTransition(VEHICLE_STATUS.DRAFT, VEHICLE_STATUS.PUBLISHED)).toBe(true);
    expect(isValidStatusTransition(VEHICLE_STATUS.DRAFT, VEHICLE_STATUS.ARCHIVED)).toBe(true);
  });

  it("rejects a no-op transition", () => {
    expect(isValidStatusTransition(VEHICLE_STATUS.DRAFT, VEHICLE_STATUS.DRAFT)).toBe(false);
  });

  it("rejects sold -> published (must go through archived -> draft first)", () => {
    expect(isValidStatusTransition(VEHICLE_STATUS.SOLD, VEHICLE_STATUS.PUBLISHED)).toBe(false);
  });

  it("allows published -> reserved -> sold and reserved -> published (fell through)", () => {
    expect(isValidStatusTransition(VEHICLE_STATUS.PUBLISHED, VEHICLE_STATUS.RESERVED)).toBe(true);
    expect(isValidStatusTransition(VEHICLE_STATUS.RESERVED, VEHICLE_STATUS.SOLD)).toBe(true);
    expect(isValidStatusTransition(VEHICLE_STATUS.RESERVED, VEHICLE_STATUS.PUBLISHED)).toBe(true);
  });

  it("allows archived -> draft (restore) and nothing else", () => {
    expect(isValidStatusTransition(VEHICLE_STATUS.ARCHIVED, VEHICLE_STATUS.DRAFT)).toBe(true);
    expect(isValidStatusTransition(VEHICLE_STATUS.ARCHIVED, VEHICLE_STATUS.PUBLISHED)).toBe(false);
  });
});

describe("nextAllowedStatuses", () => {
  it("returns the allowed set for a given status", () => {
    expect(nextAllowedStatuses(VEHICLE_STATUS.PUBLISHED).sort()).toEqual(
      [VEHICLE_STATUS.UNPUBLISHED, VEHICLE_STATUS.RESERVED, VEHICLE_STATUS.SOLD, VEHICLE_STATUS.ARCHIVED].sort()
    );
  });

  it("returns an empty array for an unknown status", () => {
    expect(nextAllowedStatuses("bogus")).toEqual([]);
  });
});

describe("requestStatusTransition", () => {
  it("rejects an unknown target status", () => {
    const result = requestStatusTransition(COMPLETE_LISTING, "bogus");
    expect(result.valid).toBe(false);
  });

  it("rejects a disallowed transition", () => {
    const result = requestStatusTransition({ ...COMPLETE_LISTING, status: VEHICLE_STATUS.SOLD }, VEHICLE_STATUS.PUBLISHED);
    expect(result.valid).toBe(false);
  });

  it("rejects publishing a listing missing required fields", () => {
    const result = requestStatusTransition({ status: VEHICLE_STATUS.DRAFT, brand: "Toyota" }, VEHICLE_STATUS.PUBLISHED);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/model/);
  });

  it("rejects publishing a listing with no images", () => {
    const result = requestStatusTransition({ ...COMPLETE_LISTING, images: [] }, VEHICLE_STATUS.PUBLISHED);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/صورة/);
  });

  it("accepts publishing a complete listing with images", () => {
    const result = requestStatusTransition(COMPLETE_LISTING, VEHICLE_STATUS.PUBLISHED);
    expect(result.valid).toBe(true);
  });

  it("accepts a transition that doesn't require the publish checks (e.g. draft -> archived)", () => {
    const result = requestStatusTransition({ status: VEHICLE_STATUS.DRAFT }, VEHICLE_STATUS.ARCHIVED);
    expect(result.valid).toBe(true);
  });
});

describe("getPublishBlockers", () => {
  it("returns an empty array for a complete listing", () => {
    expect(getPublishBlockers(COMPLETE_LISTING)).toEqual([]);
  });

  it("reports missing required fields", () => {
    const blockers = getPublishBlockers({ brand: "Toyota" });
    expect(blockers.some(b => b.includes("model"))).toBe(true);
  });

  it("reports a missing image", () => {
    const blockers = getPublishBlockers({ ...COMPLETE_LISTING, images: [] });
    expect(blockers.some(b => b.includes("صورة"))).toBe(true);
  });

  it("reports both missing fields and missing images together", () => {
    const blockers = getPublishBlockers({});
    expect(blockers.length).toBe(2);
  });

  // This is exactly the scenario that motivated extracting getPublishBlockers
  // out of requestStatusTransition: editing an already-*published* listing
  // down to zero images must be caught even though no status transition is
  // being requested at all (see VehicleFormScreen#handleSubmit).
  it("still catches an incomplete listing when editing (no status transition involved)", () => {
    const publishedListing = { ...COMPLETE_LISTING, status: VEHICLE_STATUS.PUBLISHED };
    const editedFields = { images: [] };
    const blockers = getPublishBlockers({ ...publishedListing, ...editedFields });
    expect(blockers.length).toBeGreaterThan(0);
    expect(LIVE_STATUSES.includes(publishedListing.status)).toBe(true);
  });
});
