# Image Validation

Reference for any screen accepting product/vehicle images (seller listing creation, ad management).

## Current state
`utils/components.jsx#isImageUrl` only checks `typeof v === "string" && v.startsWith("http")` — a
presence/shape check, not a content validation. Product `images` may be a single string or an
array (code guards both — see `vehicle-data` skill).

## Implemented (Vehicle Management + Authentication modules)
`utils/validators.js#validateImageFile` is the shared, generic client-side pre-check (MIME type +
size), reused by `validateAvatarFile` (5MB) and `validateVehicleImageFile` (10MB, pre-compression)
rather than duplicated per feature. The real enforcement boundary is always the destination
Storage bucket's RLS policy (`supabase/migrations/`), never the client-side check alone.

For vehicle listings specifically, `utils/imageProcessing.js` compresses every image client-side
(Canvas-based resize to a 1600px-longest-side JPEG) and generates a parallel 320px thumbnail before
upload — see `docs/VEHICLE_MANAGEMENT.md`'s Image system section.

## Still not implemented (recommended follow-ups)
- Content moderation (NSFW/irrelevant-image detection) for user-submitted listing photos before
  they go live, gated through the moderation queue (`moderation.md`).
- Stripping EXIF geolocation metadata from uploaded photos before storage, for seller privacy —
  the current compression pipeline re-encodes via Canvas (which already drops EXIF as a side
  effect of the JPEG re-encode), but this hasn't been verified as an intentional, tested privacy
  guarantee and shouldn't be assumed as one without a dedicated test.
