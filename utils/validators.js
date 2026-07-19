const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUUID = (value) => typeof value === "string" && UUID_RE.test(value);

// Deliberately permissive (RFC 5322 is not worth reimplementing client-side) —
// this is a fast-feedback UX check only. Supabase Auth re-validates server-side.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value) => typeof value === "string" && EMAIL_RE.test(value.trim());

// Iraqi mobile numbers: optional +964/964/0 prefix, then a 9-10 digit local number
// (mirrors the normalization already used by utils/theme.js#toWhatsAppNumber).
const IRAQI_PHONE_RE = /^(\+?964|0)?7\d{8,9}$/;

export const isValidIraqiPhone = (value) =>
  typeof value === "string" && IRAQI_PHONE_RE.test(value.replace(/[\s\-()]/g, ""));

/**
 * Scores password strength for signup/reset forms. Returns one of
 * "weak" | "fair" | "strong" plus the individual rule checks, so the UI can
 * show actionable feedback instead of a single pass/fail.
 */
export function getPasswordStrength(password = "") {
  const rules = {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbolOrMixedCase: /[^a-zA-Z0-9]/.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password)),
  };
  const score = Object.values(rules).filter(Boolean).length;
  const level = score >= 4 ? "strong" : score >= 2 && rules.minLength ? "fair" : "weak";
  return { level, rules, isAcceptable: rules.minLength && rules.hasLetter && rules.hasNumber };
}

const DEFAULT_ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Generic client-side pre-check for an image upload (fast feedback only —
 * the real enforcement boundary is always the destination Storage bucket's
 * RLS policies, see supabase/migrations). Shared by avatar upload and
 * vehicle-listing image upload so the two don't duplicate the same checks.
 */
export function validateImageFile(file, { maxBytes = 5 * 1024 * 1024, allowedTypes = DEFAULT_ALLOWED_IMAGE_TYPES } = {}) {
  if (!file) return { valid: false, error: "لم يتم اختيار ملف" };
  if (!allowedTypes.has(file.type)) {
    return { valid: false, error: "صيغة الصورة غير مدعومة (JPG, PNG, WEBP فقط)" };
  }
  if (file.size > maxBytes) {
    return { valid: false, error: `حجم الصورة يجب ألا يتجاوز ${Math.round(maxBytes / (1024 * 1024))} ميجابايت` };
  }
  return { valid: true, error: null };
}

/** Avatar-specific wrapper over validateImageFile (kept for call-site clarity). */
export function validateAvatarFile(file) {
  return validateImageFile(file, { maxBytes: 5 * 1024 * 1024 });
}

// Vehicle listing photos are allowed a bit more headroom than avatars (up to
// 10MB pre-compression — utils/imageProcessing.js compresses before upload).
export function validateVehicleImageFile(file) {
  return validateImageFile(file, { maxBytes: 10 * 1024 * 1024 });
}

/**
 * Validates a listing price. Accepts a number or numeric string; rejects
 * non-numeric input, zero/negative values, and implausibly large fat-finger
 * values (over 10 billion — comfortably above any real IQD or USD car price).
 */
export function isValidPrice(value) {
  const num = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  return typeof num === "number" && Number.isFinite(num) && num > 0 && num <= 10_000_000_000;
}

// ── VIN validation ──────────────────────────────────────────────────────────
// A VIN is always 17 chars, uppercase letters + digits, excluding I/O/Q
// (see .claude/knowledge/vin-validation.md). This format check is the hard,
// blocking requirement for every VIN in this app.
const VIN_FORMAT_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

export function isValidVinFormat(vin) {
  return typeof vin === "string" && VIN_FORMAT_RE.test(vin.trim().toUpperCase());
}

// The position-9 check-digit algorithm below (ISO 3779 transliteration +
// weighted sum mod 11) is a real, correct implementation of the North
// American (NHTSA/SAE J853) VIN check digit — but it is only *meaningful*
// for VINs assigned under that standard. Iraq's used-car market is dominated
// by vehicles imported from the Gulf, Korea, Japan, and Europe, whose VINs
// are valid 17-character ISO 3779 identifiers but were not necessarily
// assigned with a NHTSA-style check digit at position 9. Treating a checksum
// mismatch as a hard rejection would incorrectly block a large share of
// genuine listings in this market — so this is exposed as a soft signal
// (`vinChecksumMatches`) for the UI to show as a hint, never as a blocking
// validation error. `isValidVinFormat` above remains the only hard gate.
const VIN_TRANSLITERATION = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

export function vinChecksumMatches(vin) {
  if (!isValidVinFormat(vin)) return false;
  const chars = vin.trim().toUpperCase().split("");
  const sum = chars.reduce((acc, ch, i) => {
    const value = /[0-9]/.test(ch) ? Number(ch) : VIN_TRANSLITERATION[ch];
    return acc + value * VIN_WEIGHTS[i];
  }, 0);
  const remainder = sum % 11;
  const expected = remainder === 10 ? "X" : String(remainder);
  return chars[8] === expected;
}
