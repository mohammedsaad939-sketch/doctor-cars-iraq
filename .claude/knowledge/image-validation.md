# Image Validation

Reference for any screen accepting product/vehicle images (seller listing creation, ad management).

## Current state
`utils/components.jsx#isImageUrl` only checks `typeof v === "string" && v.startsWith("http")` — a
presence/shape check, not a content validation. Product `images` may be a single string or an
array (code guards both — see `vehicle-data` skill).

## Recommended validation (not yet implemented)
- Validate uploaded file MIME type and size limits before upload (client-side UX check) AND
  server-side (Supabase Storage policies) — never trust client-side-only validation.
- Consider basic content moderation (NSFW/irrelevant-image detection) for user-submitted listing
  photos before they go live, gated through the moderation queue (`moderation.md`).
- Strip EXIF geolocation metadata from uploaded photos before storage, for seller privacy.
