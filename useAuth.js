import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { resolveRole, ROLES } from "./utils/roles";

// هذا الـ hook يدير حالة تسجيل الدخول الحقيقية بالكامل:
// - يتحقق إذا كان هناك مستخدم مسجّل دخول مسبقاً عند فتح التطبيق
// - يوفر دوال: تسجيل دخول، إنشاء حساب، تسجيل خروج، إعادة تعيين كلمة المرور
// - يجلب صف "profiles" المرتبط بكل مستخدم (الاسم، النوع، المدينة...)
// - يحسب الدور الفعلي (role) عبر utils/roles.js اعتماداً على profiles + sellers
export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sellerVerified, setSellerVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  // True while the user is in the middle of a "reset password" flow (i.e. they
  // followed the email link and Supabase issued a recovery session). The app
  // should show the ResetPasswordScreen instead of treating this as a normal
  // sign-in — see App.jsx.
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error) setProfile(data);

    // A "verified dealer" is a dealer-type profile whose seller row is verified.
    // Fetched separately since it lives in a different table (sellers), and only
    // when relevant, to avoid an extra round-trip for plain buyer accounts.
    if (!error && data?.role && ["seller", "trader", "workshop"].includes(data.role)) {
      const { data: sellerRow } = await supabase
        .from("sellers")
        .select("verified, is_verified")
        .eq("owner_id", userId)
        .maybeSingle();
      setSellerVerified(!!(sellerRow?.verified || sellerRow?.is_verified));
    } else {
      setSellerVerified(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // عند تحميل التطبيق: هل يوجد جلسة محفوظة؟
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // الاستماع لأي تغيير لاحق (دخول/خروج) من أي مكان في التطبيق
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // The user followed a "reset password" email link. Supabase has already
        // exchanged the recovery token for a session; don't route them into the
        // app as a normal sign-in until they've set a new password.
        setPasswordRecovery(true);
      }
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setSellerVerified(false);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async ({ fullName, phone, email, password, role, referredBy = null }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role, referred_by: referredBy },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  };

  const signIn = async ({ email, password }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // تسجيل دخول عبر مزوّد خارجي (Google, Facebook, Apple)
  // يفتح صفحة المزوّد، وبعد الموافقة يُرجع المستخدم تلقائياً لموقعنا مسجّلاً دخوله
  const signInWithOAuth = async (provider) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setAuthError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  // Sends a password-reset email. Supabase redirects the user back to this app
  // with a recovery session, which the onAuthStateChange listener above catches
  // via the PASSWORD_RECOVERY event.
  const resetPasswordForEmail = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // Sets a new password for the current (recovery or normal) session.
  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    setPasswordRecovery(false);
    return { success: true };
  };

  // Re-sends the signup confirmation email — used when a login attempt fails
  // with "Email not confirmed".
  const resendVerificationEmail = async (email) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const role = resolveRole({ session, profile, sellerVerified });

  return {
    session,
    profile,
    role,
    loading,
    authError,
    passwordRecovery,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    resetPasswordForEmail,
    updatePassword,
    resendVerificationEmail,
    refreshProfile: () => session?.user && fetchProfile(session.user.id),
  };
}

export { ROLES };
