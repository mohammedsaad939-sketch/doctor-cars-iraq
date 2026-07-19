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

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Client-side pre-check for avatar uploads (fast feedback only — Supabase
 * Storage policies are the real enforcement boundary, see
 * supabase/migrations for the avatars bucket policies).
 */
export function validateAvatarFile(file) {
  if (!file) return { valid: false, error: "لم يتم اختيار ملف" };
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return { valid: false, error: "صيغة الصورة غير مدعومة (JPG, PNG, WEBP فقط)" };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { valid: false, error: "حجم الصورة يجب ألا يتجاوز 5 ميجابايت" };
  }
  return { valid: true, error: null };
}
