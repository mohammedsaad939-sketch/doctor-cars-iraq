// Single source of truth for vehicle-listing lifecycle status, mirroring the
// pattern established by utils/roles.js for the Authentication module: one
// ranked/validated enum instead of overlapping booleans (per the existing
// .claude/knowledge/vehicle-status.md recommendation).
export const VEHICLE_STATUS = Object.freeze({
  DRAFT: "draft",
  PUBLISHED: "published",
  UNPUBLISHED: "unpublished",
  RESERVED: "reserved",
  SOLD: "sold",
  ARCHIVED: "archived",
});

export const VEHICLE_STATUS_LABELS_AR = Object.freeze({
  [VEHICLE_STATUS.DRAFT]: "مسودة",
  [VEHICLE_STATUS.PUBLISHED]: "منشور",
  [VEHICLE_STATUS.UNPUBLISHED]: "غير منشور",
  [VEHICLE_STATUS.RESERVED]: "محجوز",
  [VEHICLE_STATUS.SOLD]: "مباع",
  [VEHICLE_STATUS.ARCHIVED]: "مؤرشف",
});

// Explicit allow-list of status transitions. Anything not listed here is
// rejected by requestStatusTransition() below — this is the single place
// that decides what "Publish"/"Unpublish"/"Archive"/etc. are allowed to do,
// so the UI (VehicleManageScreen) and any future caller never have to
// re-derive or duplicate this logic.
const ALLOWED_TRANSITIONS = {
  [VEHICLE_STATUS.DRAFT]: [VEHICLE_STATUS.PUBLISHED, VEHICLE_STATUS.ARCHIVED],
  [VEHICLE_STATUS.PUBLISHED]: [VEHICLE_STATUS.UNPUBLISHED, VEHICLE_STATUS.RESERVED, VEHICLE_STATUS.SOLD, VEHICLE_STATUS.ARCHIVED],
  [VEHICLE_STATUS.UNPUBLISHED]: [VEHICLE_STATUS.PUBLISHED, VEHICLE_STATUS.ARCHIVED],
  [VEHICLE_STATUS.RESERVED]: [VEHICLE_STATUS.PUBLISHED, VEHICLE_STATUS.SOLD, VEHICLE_STATUS.ARCHIVED],
  [VEHICLE_STATUS.SOLD]: [VEHICLE_STATUS.ARCHIVED],
  [VEHICLE_STATUS.ARCHIVED]: [VEHICLE_STATUS.DRAFT],
};

/** Whether `from` -> `to` is an allowed lifecycle transition. */
export function isValidStatusTransition(from, to) {
  if (from === to) return false;
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
}

/** The set of statuses a listing in `status` may transition to right now. */
export function nextAllowedStatuses(status) {
  return ALLOWED_TRANSITIONS[status] || [];
}

// Minimum fields required before a listing may move out of DRAFT — enforced
// by requestStatusTransition() so an incomplete listing can't go live, and
// re-checked by getPublishBlockers() whenever an already-live listing is
// edited, so completeness is an ongoing invariant, not just a one-time gate
// at the moment of publishing.
const REQUIRED_TO_PUBLISH = ["brand", "model", "year", "price", "governorate", "city"];

// Statuses in which a listing is currently visible/live to buyers -- editing
// one of these must not be allowed to leave it incomplete (see
// VehicleFormScreen#handleSubmit, which calls getPublishBlockers on save
// whenever the listing being edited is in one of these statuses).
export const LIVE_STATUSES = [VEHICLE_STATUS.PUBLISHED, VEHICLE_STATUS.RESERVED];

/**
 * Returns a list of human-readable reasons `listing` does not (yet) satisfy
 * the minimum-completeness rule for being published, or an empty array if it
 * does. Pure — used both by requestStatusTransition (gating the publish
 * action itself) and directly by VehicleFormScreen (gating edits to a
 * listing that is already live), so the rule is defined exactly once.
 */
export function getPublishBlockers(listing) {
  const missing = REQUIRED_TO_PUBLISH.filter(field => {
    const value = listing?.[field];
    return value === null || value === undefined || value === "";
  });
  const blockers = [];
  if (missing.length > 0) {
    blockers.push(`أكمل الحقول المطلوبة: ${missing.join(", ")}`);
  }
  if (!Array.isArray(listing?.images) || listing.images.length === 0) {
    blockers.push("أضف صورة واحدة على الأقل");
  }
  return blockers;
}

/**
 * Validates a requested status change against both the transition graph and
 * (when moving toward PUBLISHED) the minimum-completeness rule. Returns
 * { valid, error } rather than throwing, matching this codebase's
 * check-the-result convention (see automotive-security).
 */
export function requestStatusTransition(listing, toStatus) {
  const fromStatus = listing?.status || VEHICLE_STATUS.DRAFT;
  if (!Object.values(VEHICLE_STATUS).includes(toStatus)) {
    return { valid: false, error: "حالة غير معروفة" };
  }
  if (!isValidStatusTransition(fromStatus, toStatus)) {
    return { valid: false, error: `لا يمكن تغيير الحالة من "${VEHICLE_STATUS_LABELS_AR[fromStatus]}" إلى "${VEHICLE_STATUS_LABELS_AR[toStatus]}"` };
  }
  if (toStatus === VEHICLE_STATUS.PUBLISHED) {
    const blockers = getPublishBlockers(listing);
    if (blockers.length > 0) {
      return { valid: false, error: `${blockers.join(" · ")} قبل النشر` };
    }
  }
  return { valid: true, error: null };
}
