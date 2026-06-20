import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// هذا الـ hook يدير حالة تسجيل الدخول الحقيقية بالكامل:
// - يتحقق إذا كان هناك مستخدم مسجّل دخول مسبقاً عند فتح التطبيق
// - يوفر دوال: تسجيل دخول، إنشاء حساب، تسجيل خروج
// - يجلب صف "profiles" المرتبط بكل مستخدم (الاسم، النوع، المدينة...)
export function useAuth() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // عند تحميل التطبيق: هل يوجد جلسة محفوظة؟
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // الاستماع لأي تغيير لاحق (دخول/خروج) من أي مكان في التطبيق
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!error) setProfile(data);
    setLoading(false);
  };

  const signUp = async ({ fullName, phone, email, password, role }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone, role } },
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

  return { session, profile, loading, authError, signUp, signIn, signOut, signInWithOAuth };
}
