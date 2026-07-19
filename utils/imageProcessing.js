// Client-side image compression + thumbnail generation for vehicle-listing
// photos, using only browser-native Canvas/Image APIs — no new dependency,
// consistent with automotive-performance's "check bundle-size impact before
// adding a dependency" rule.
//
// The pure, dependency-free math (computeScaledDimensions) is split out from
// the DOM-dependent I/O (loadImage/compressImageFile/generateThumbnail) so
// the sizing logic can be unit-tested without needing a real image decoder
// (jsdom does not decode image bytes) — see automotive-testing's
// bottom-up-from-pure-functions approach.

/**
 * Given an image's natural width/height, returns the dimensions it should be
 * resized to so its longest side is at most `maxDimension`, preserving
 * aspect ratio. Never upscales.
 */
export function computeScaledDimensions(width, height, maxDimension) {
  if (width <= 0 || height <= 0 || maxDimension <= 0) {
    return { width: 0, height: 0 };
  }
  const longest = Math.max(width, height);
  if (longest <= maxDimension) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxDimension / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("تعذّرت قراءة الصورة"));
    img.src = url;
  });
}

/**
 * Re-encodes `file` as a JPEG scaled to at most `maxDimension` on its
 * longest side, at `quality` (0-1). Resolves to a Blob ready for upload.
 */
export async function resizeAndCompressImage(file, { maxDimension = 1600, quality = 0.82 } = {}) {
  const img = await loadImage(file);
  try {
    const { width, height } = computeScaledDimensions(img.naturalWidth, img.naturalHeight, maxDimension);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("فشل ضغط الصورة");
    return blob;
  } finally {
    URL.revokeObjectURL(img.src);
  }
}

/** Convenience wrapper: generates a small thumbnail-sized JPEG. */
export function generateThumbnail(file, { size = 320, quality = 0.75 } = {}) {
  return resizeAndCompressImage(file, { maxDimension: size, quality });
}
