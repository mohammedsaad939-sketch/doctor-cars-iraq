import { useState } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Btn, Input } from "../utils/components";

const OWNER = {
  name: "Mohammed Saad",
  nameAr: "محمد سعد",
  signature: "10007",
  year: "2025",
};

const translateAuthError = (msg = "") => {
  const map = {
    "Invalid login credentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "User already registered": "هذا البريد الإلكتروني مسجّل مسبقاً، حاول تسجيل الدخول",
    "Password should be at least 6 characters": "كلمة المرور يجب أن تكون ٦ أحرف على الأقل",
    "Email not confirmed": "الرجاء تأكيد بريدك الإلكتروني أولاً (تحقق من صندوق الوارد)",
  };
  return map[msg] || msg || "حدث خطأ غير متوقع، حاول مرة أخرى";
};

const AuthScreen = ({ onLogin, signUp, signIn, authError, signInWithOAuth }) => {
  const [mode, setMode] = useState("login");
  const [userType, setUserType] = useState("buyer");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState(() => new URLSearchParams(window.location.search).get("ref") || "");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(null);

  const handleForgot = async () => {
    if (!forgotEmail.trim()) return;
    setForgotSubmitting(true);
    setForgotMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), { redirectTo: window.location.origin });
    if (error) {
      setForgotMsg({ ok: false, text: error.message });
    } else {
      setForgotMsg({ ok: true, text: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. تحقق من صندوق الوارد." });
    }
    setForgotSubmitting(false);
  };

  const userTypes = [
    { id: "buyer", label: "مشتري", icon: "🛒" },
    { id: "seller", label: "بائع", icon: "🏪" },
    { id: "wholesale", label: "جملة", icon: "📦" },
    { id: "workshop", label: "ورشة", icon: "🔧" },
  ];

  const handleSubmit = async () => {
    setLocalError(null);
    if (!email || !password) {
      setLocalError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setSubmitting(true);
    if (mode === "login") {
      const res = await signIn({ email, password });
      if (!res.success) setLocalError(translateAuthError(res.error));
    } else {
      const res = await signUp({ fullName: name, phone, email, password, role: userType, referredBy: refCode.trim() || null });
      if (!res.success) {
        setLocalError(translateAuthError(res.error));
      } else {
        setLocalError(
          "تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد التسجيل قبل تسجيل الدخول."
        );
      }
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, #0F1F3D 0%, ${T.navy} 60%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "inherit" }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", boxShadow: `0 0 40px ${T.gold}44` }}>🚗</div>
        <h1 style={{ margin: 0, color: T.gold, fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>دكتور السيارات</h1>
        <p style={{ margin: "6px 0 0", color: T.textSecondary, fontSize: 13 }}>Doctor Cars Iraq</p>
      </div>

      <div style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 24, padding: 28, width: "100%", maxWidth: 400 }}>
        {forgotMode ? (
          <>
            <h3 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 17, fontWeight: 800 }}>إعادة تعيين كلمة المرور</h3>
            <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13 }}>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
            <Input label="البريد الإلكتروني" value={forgotEmail} onChange={setForgotEmail} placeholder="example@email.com" icon="✉️" type="email" />
            {forgotMsg && (
              <div style={{ background: forgotMsg.ok ? `${T.green}1A` : `${T.red}1A`, border: `1px solid ${forgotMsg.ok ? T.green : T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: forgotMsg.ok ? T.green : T.red, fontSize: 13, lineHeight: 1.6 }}>
                {forgotMsg.text}
              </div>
            )}
            <Btn onClick={handleForgot} fullWidth size="lg" disabled={forgotSubmitting || !forgotEmail.trim()}>
              {forgotSubmitting ? "جارٍ الإرسال..." : "إرسال رابط التعيين"}
            </Btn>
            <button onClick={() => { setForgotMode(false); setForgotMsg(null); setForgotEmail(""); }} style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", color: T.gold, fontSize: 13, cursor: "pointer" }}>
              ← رجوع
            </button>
          </>
        ) : (
        <>
        {/* Mode Toggle */}
        <div style={{ display: "flex", background: T.navyLight, borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
              background: mode === m ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : "transparent",
              color: mode === m ? T.navy : T.textSecondary, fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>{m === "login" ? "تسجيل الدخول" : "حساب جديد"}</button>
          ))}
        </div>

        {mode === "register" && (
          <>
            <Input label="الاسم الكامل" value={name} onChange={setName} placeholder="ادخل اسمك الكامل" icon="👤" />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>نوع الحساب</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {userTypes.map(u => (
                  <button key={u.id} onClick={() => setUserType(u.id)} style={{
                    padding: "10px 8px", borderRadius: 10, border: `2px solid ${userType === u.id ? T.gold : T.navyBorder}`,
                    background: userType === u.id ? `${T.gold}15` : "transparent",
                    color: userType === u.id ? T.gold : T.textSecondary, fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>{u.icon} {u.label}</button>
                ))}
              </div>
            </div>
          </>
        )}

        <Input label="البريد الإلكتروني" value={email} onChange={setEmail} placeholder="example@email.com" icon="✉️" type="email" />
        <Input label="رقم الهاتف" value={phone} onChange={setPhone} placeholder="07XXXXXXXXX" icon="📱" type="tel" />
        <Input label="كلمة المرور" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒" type="password" />

        {(localError || authError) && (
          <div style={{
            background: localError?.includes("تم إنشاء") ? `${T.green}1A` : `${T.red}1A`,
            border: `1px solid ${localError?.includes("تم إنشاء") ? T.green : T.red}44`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 14,
            color: localError?.includes("تم إنشاء") ? T.green : T.red, fontSize: 13, lineHeight: 1.6,
          }}>
            {localError || authError}
          </div>
        )}

        {mode === "register" && (
          <>
            <Input label="كود الإحالة (اختياري)" value={refCode} onChange={setRefCode} placeholder="أدخل كود من صديق..." icon="🎁" />
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
              <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: T.gold }} />
              <label htmlFor="agree" style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
                أوافق على <span style={{ color: T.gold }}>شروط الاستخدام</span> و<span style={{ color: T.gold }}>سياسة الخصوصية</span>
              </label>
            </div>
          </>
        )}

        <Btn onClick={handleSubmit} fullWidth size="lg" disabled={(mode === "register" && !agreed) || submitting}>
          {submitting ? "جارٍ التحقق..." : mode === "login" ? "دخول" : "إنشاء الحساب"}
        </Btn>

        {mode === "login" && (
          <button onClick={() => { setForgotMode(true); setForgotMsg(null); setForgotEmail(email); }} style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", color: T.gold, fontSize: 13, cursor: "pointer" }}>
            نسيت كلمة المرور؟
          </button>
        )}

        <div style={{ position: "relative", textAlign: "center", margin: "20px 0" }}>
          <div style={{ height: 1, background: T.navyBorder, position: "absolute", top: "50%", width: "100%" }} />
          <span style={{ position: "relative", background: T.navyCard, padding: "0 12px", color: T.textMuted, fontSize: 12 }}>أو</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn variant="ghost" size="sm" icon="🔵" fullWidth onClick={() => signInWithOAuth("google")}>الدخول بحساب Google</Btn>
          <Btn variant="ghost" size="sm" icon="📘" fullWidth onClick={() => signInWithOAuth("facebook")}>الدخول بحساب Facebook</Btn>
          <Btn variant="ghost" size="sm" icon="🍎" fullWidth disabled>الدخول بحساب Apple (قريباً)</Btn>
        </div>
        </>
        )}
      </div>

      <p style={{ color: T.textMuted, fontSize: 11, marginTop: 24, textAlign: "center", lineHeight: 1.6, maxWidth: 320 }}>
        🔒 بياناتك محمية عبر اتصال مشفّر (HTTPS). نحترم خصوصيتك ولا نشارك بياناتك مع أي طرف ثالث.
      </p>
      <p style={{ color: T.textMuted, fontSize: 10, marginTop: 14, textAlign: "center", opacity: 0.7 }}>
        © {OWNER.year} {OWNER.nameAr} ({OWNER.name}) — جميع الحقوق محفوظة | توقيع: {OWNER.signature}
      </p>
    </div>
  );
};

export default AuthScreen;
