import { useState } from "react";
import { supabase } from "./supabaseClient";
import { resizeAndCompressImage, generateThumbnail } from "./utils/imageProcessing";
import { validateVehicleImageFile, isValidVinFormat } from "./utils/validators";
import { requestStatusTransition, VEHICLE_STATUS } from "./utils/vehicleStatus";
import { ROLES, isAtLeast } from "./utils/roles";

const BUCKET = "vehicle-listings";

// Vehicle-listing CRUD + status-lifecycle + image-upload actions, following
// the same "check error before reporting success" / "return {success,error}"
// conventions as useAuth.js/useProfile.js rather than introducing a new
// shape for this module.
export function useVehicleListings(session, role) {
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const uid = session?.user?.id;

  /**
   * Pre-check for a duplicate VIN (fast UX feedback). The real, authoritative
   * protection is the unique index in supabase/migrations — this is not a
   * select-then-decide substitute for it, just an earlier error message.
   */
  const checkDuplicateVin = async (vin, excludeId = null) => {
    if (!vin || !isValidVinFormat(vin)) return { duplicate: false };
    let query = supabase.from("vehicle_listings").select("id").eq("vin", vin.trim().toUpperCase()).limit(1);
    if (excludeId) query = query.neq("id", excludeId);
    const { data, error } = await query;
    if (error) return { duplicate: false, error: error.message };
    return { duplicate: (data || []).length > 0 };
  };

  /**
   * Validates, compresses, and uploads each file (plus a generated
   * thumbnail) to the vehicle-listings bucket under the owner's folder.
   * Returns parallel `images`/`thumbnails` URL arrays in the same order the
   * files were given — images[0]/thumbnails[0] is the cover.
   */
  const uploadListingImages = async (files) => {
    if (!uid) return { success: false, error: "لا توجد جلسة نشطة" };
    setUploadingImages(true);
    try {
      const images = [];
      const thumbnails = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { valid, error: validationError } = validateVehicleImageFile(file);
        if (!valid) return { success: false, error: validationError };

        const [fullBlob, thumbBlob] = await Promise.all([
          resizeAndCompressImage(file),
          generateThumbnail(file),
        ]);
        const basePath = `${uid}/${Date.now()}_${i}`;

        const { error: fullErr } = await supabase.storage.from(BUCKET).upload(`${basePath}.jpg`, fullBlob, { contentType: "image/jpeg" });
        if (fullErr) return { success: false, error: fullErr.message };
        const { error: thumbErr } = await supabase.storage.from(BUCKET).upload(`${basePath}_thumb.jpg`, thumbBlob, { contentType: "image/jpeg" });
        if (thumbErr) return { success: false, error: thumbErr.message };

        images.push(supabase.storage.from(BUCKET).getPublicUrl(`${basePath}.jpg`).data.publicUrl);
        thumbnails.push(supabase.storage.from(BUCKET).getPublicUrl(`${basePath}_thumb.jpg`).data.publicUrl);
      }
      return { success: true, images, thumbnails };
    } catch (e) {
      return { success: false, error: e.message || "فشل رفع الصور" };
    } finally {
      setUploadingImages(false);
    }
  };

  /** Uploads a single video file (no compression — raw upload). */
  const uploadListingVideo = async (file) => {
    if (!uid || !file) return { success: false, error: "لا يوجد ملف" };
    const path = `${uid}/video/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) return { success: false, error: error.message };
    return { success: true, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
  };

  /** Uploads one or more supporting documents (registration papers, etc.). */
  const uploadListingDocuments = async (files) => {
    if (!uid) return { success: false, error: "لا توجد جلسة نشطة" };
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${uid}/docs/${Date.now()}_${i}_${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (error) return { success: false, error: error.message };
      urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }
    return { success: true, urls };
  };

  const createListing = async (fields) => {
    if (!uid) return { success: false, error: "لا توجد جلسة نشطة" };
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("vehicle_listings")
        .insert({ ...fields, owner_id: uid, status: VEHICLE_STATUS.DRAFT })
        .select()
        .single();
      if (error) {
        const isDuplicateVin = error.code === "23505" && (error.message || "").includes("vin");
        return { success: false, error: isDuplicateVin ? "رقم الشاصي (VIN) مستخدم مسبقاً في إعلان آخر" : error.message };
      }
      return { success: true, data };
    } finally {
      setSaving(false);
    }
  };

  const updateListing = async (id, fields) => {
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("vehicle_listings")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        const isDuplicateVin = error.code === "23505" && (error.message || "").includes("vin");
        return { success: false, error: isDuplicateVin ? "رقم الشاصي (VIN) مستخدم مسبقاً في إعلان آخر" : error.message };
      }
      return { success: true, data };
    } finally {
      setSaving(false);
    }
  };

  const deleteListing = async (id) => {
    const { error } = await supabase.from("vehicle_listings").delete().eq("id", id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  /**
   * Validates the requested lifecycle transition (utils/vehicleStatus.js)
   * before writing it, and auto-flags Verified-Dealer-and-above listings as
   * priority on publish (the "Verified Dealer: priority publishing"
   * permission — a real, visible effect: priority listings sort first in
   * VehicleListingsScreen's published feed).
   */
  const changeStatus = async (listing, toStatus) => {
    const { valid, error } = requestStatusTransition(listing, toStatus);
    if (!valid) return { success: false, error };
    const fields = { status: toStatus };
    if (toStatus === VEHICLE_STATUS.PUBLISHED) {
      fields.priority = isAtLeast(role, ROLES.VERIFIED_DEALER);
    }
    return updateListing(listing.id, fields);
  };

  return {
    saving,
    uploadingImages,
    checkDuplicateVin,
    uploadListingImages,
    uploadListingVideo,
    uploadListingDocuments,
    createListing,
    updateListing,
    deleteListing,
    changeStatus,
  };
}
