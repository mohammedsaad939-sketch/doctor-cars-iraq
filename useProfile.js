import { useState } from "react";
import { supabase } from "./supabaseClient";
import { validateAvatarFile } from "./utils/validators";

const AVATAR_BUCKET = "avatars";

// Profile-editing and avatar-upload actions, kept separate from useAuth's
// session/sign-in concerns (single responsibility) but sharing the same
// supabase client and the same "check error before reporting success" and
// "narrow, explicit column selection" conventions used across the app.
export function useProfile(session, { onProfileChange } = {}) {
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const updateProfile = async (updates) => {
    if (!session?.user?.id) return { success: false, error: "لا توجد جلسة نشطة" };
    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      onProfileChange?.(data);
      return { success: true, data };
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!session?.user?.id) return { success: false, error: "لا توجد جلسة نشطة" };
    const { valid, error: validationError } = validateAvatarFile(file);
    if (!valid) return { success: false, error: validationError };

    setUploadingAvatar(true);
    try {
      const uid = session.user.id;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      // One object per user (path scoped by uid, matching the storage RLS
      // policy in supabase/migrations) — upsert so re-uploading replaces it
      // instead of accumulating orphaned files.
      const path = `${uid}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) return { success: false, error: uploadError.message };

      const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      // Cache-bust so the new avatar shows immediately (same public path is reused).
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError, data } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", uid)
        .select()
        .single();
      if (updateError) return { success: false, error: updateError.message };

      onProfileChange?.(data);
      return { success: true, url: avatarUrl };
    } finally {
      setUploadingAvatar(false);
    }
  };

  return { updateProfile, uploadAvatar, updating, uploadingAvatar };
}
