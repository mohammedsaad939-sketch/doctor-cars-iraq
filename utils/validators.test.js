import { describe, it, expect } from "vitest";
import { isUUID, isValidEmail, isValidIraqiPhone, getPasswordStrength, validateAvatarFile } from "./validators";

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

describe("isValidEmail", () => {
  it("accepts a well-formed email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("  user@example.com  ")).toBe(true);
  });

  it("rejects a malformed email", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe("isValidIraqiPhone", () => {
  it("accepts a local 0-prefixed number", () => {
    expect(isValidIraqiPhone("07701234567")).toBe(true);
  });

  it("accepts a 964-prefixed number with or without a leading +", () => {
    expect(isValidIraqiPhone("9647701234567")).toBe(true);
    expect(isValidIraqiPhone("+9647701234567")).toBe(true);
  });

  it("accepts a number with spaces/dashes/parentheses", () => {
    expect(isValidIraqiPhone("077 012-3(4567)")).toBe(true);
  });

  it("rejects a non-Iraqi-mobile-shaped number", () => {
    expect(isValidIraqiPhone("12345")).toBe(false);
    expect(isValidIraqiPhone("0123456789")).toBe(false);
    expect(isValidIraqiPhone("")).toBe(false);
    expect(isValidIraqiPhone(null)).toBe(false);
  });
});

describe("getPasswordStrength", () => {
  it("rates a short password as weak", () => {
    expect(getPasswordStrength("abc").level).toBe("weak");
    expect(getPasswordStrength("abc").isAcceptable).toBe(false);
  });

  it("rates an 8+ char letters-only password as fair, not acceptable", () => {
    const result = getPasswordStrength("abcdefgh");
    expect(result.level).toBe("fair");
    expect(result.isAcceptable).toBe(false);
  });

  it("rates an 8+ char password with a letter and a number as acceptable", () => {
    const result = getPasswordStrength("abcdefg1");
    expect(result.isAcceptable).toBe(true);
  });

  it("rates a long mixed-case+number+symbol password as strong", () => {
    const result = getPasswordStrength("Abcdefg1!");
    expect(result.level).toBe("strong");
    expect(result.isAcceptable).toBe(true);
  });

  it("handles an empty password", () => {
    const result = getPasswordStrength("");
    expect(result.level).toBe("weak");
    expect(result.isAcceptable).toBe(false);
  });
});

describe("validateAvatarFile", () => {
  const makeFile = (type, size) => ({ type, size });

  it("rejects a missing file", () => {
    expect(validateAvatarFile(null).valid).toBe(false);
  });

  it("rejects an unsupported file type", () => {
    const result = validateAvatarFile(makeFile("image/gif", 1000));
    expect(result.valid).toBe(false);
  });

  it("rejects a file over 5MB", () => {
    const result = validateAvatarFile(makeFile("image/png", 6 * 1024 * 1024));
    expect(result.valid).toBe(false);
  });

  it("accepts a well-formed jpeg/png/webp under 5MB", () => {
    expect(validateAvatarFile(makeFile("image/jpeg", 1024)).valid).toBe(true);
    expect(validateAvatarFile(makeFile("image/png", 1024)).valid).toBe(true);
    expect(validateAvatarFile(makeFile("image/webp", 1024)).valid).toBe(true);
  });
});
