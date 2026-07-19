import { describe, it, expect } from "vitest";
import { isUUID } from "./validators";

describe("isUUID", () => {
  it("accepts a well-formed lowercase UUID", () => {
    expect(isUUID("6f9619ff-8b86-d011-b42d-00cf4fc964ff")).toBe(true);
  });

  it("accepts a well-formed uppercase UUID", () => {
    expect(isUUID("6F9619FF-8B86-D011-B42D-00CF4FC964FF")).toBe(true);
  });

  it("rejects a numeric MOCK-style id", () => {
    expect(isUUID(1)).toBe(false);
    expect(isUUID("1")).toBe(false);
  });

  it("rejects a malformed UUID (wrong segment lengths)", () => {
    expect(isUUID("6f9619ff-8b86-d011-b42d-00cf4fc964f")).toBe(false);
  });

  it("rejects null, undefined, and empty string", () => {
    expect(isUUID(null)).toBe(false);
    expect(isUUID(undefined)).toBe(false);
    expect(isUUID("")).toBe(false);
  });
});
