import { describe, it, expect, vi, afterEach } from "vitest";
import { toWhatsAppNumber, relativeTime } from "./theme";

describe("toWhatsAppNumber", () => {
  it("converts a local 0-prefixed number to a 964-prefixed number", () => {
    expect(toWhatsAppNumber("07701234567")).toBe("9647701234567");
  });

  it("passes through an already-964-prefixed number unchanged", () => {
    expect(toWhatsAppNumber("9647701234567")).toBe("9647701234567");
  });

  it("strips a leading + before normalizing", () => {
    expect(toWhatsAppNumber("+9647701234567")).toBe("9647701234567");
  });

  it("strips spaces, dashes, and parentheses", () => {
    expect(toWhatsAppNumber("077 012-3(4567)")).toBe("9647701234567");
  });

  it("prefixes 964 for a number with neither a 0 nor a 964 prefix", () => {
    expect(toWhatsAppNumber("7701234567")).toBe("9647701234567");
  });

  it("returns an empty string for falsy input", () => {
    expect(toWhatsAppNumber("")).toBe("");
    expect(toWhatsAppNumber(null)).toBe("");
    expect(toWhatsAppNumber(undefined)).toBe("");
  });
});

describe("relativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns an empty string for falsy input", () => {
    expect(relativeTime(null)).toBe("");
    expect(relativeTime(undefined)).toBe("");
    expect(relativeTime("")).toBe("");
  });

  it("reports moments-ago for timestamps under a minute old", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const iso = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(relativeTime(iso)).toBe("منذ لحظات");
  });

  it("reports minutes for timestamps under an hour old", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const iso = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(relativeTime(iso)).toBe("منذ 5 دقيقة");
  });

  it("reports hours for timestamps under a day old", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const iso = new Date(now.getTime() - 3 * 3600 * 1000).toISOString();
    expect(relativeTime(iso)).toBe("منذ 3 ساعة");
  });

  it("reports 'yesterday' for timestamps between 1 and 2 days old", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const iso = new Date(now.getTime() - 30 * 3600 * 1000).toISOString();
    expect(relativeTime(iso)).toBe("أمس");
  });

  it("reports days for timestamps older than 2 days", () => {
    const now = new Date("2026-01-01T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const iso = new Date(now.getTime() - 5 * 86400 * 1000).toISOString();
    expect(relativeTime(iso)).toBe("منذ 5 يوم");
  });
});
