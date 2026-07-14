// v-redeploy
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "./supabaseClient";
import { T, toWhatsAppNumber, relativeTime } from "./utils/theme";
import { Badge, Stars, isImageUrl, Btn, Card, Input, Modal, Tabs, Section, AdCarousel, ProductCard, MOCK } from "./utils/components";
import HomeScreen from "./screens/HomeScreen";
import ShopScreen from "./screens/ShopScreen";
import ProductDetailScreen from "./screens/ProductDetailScreen";
import AuctionsScreen from "./screens/AuctionsScreen";
import SellerDashScreen from "./screens/SellerDashScreen";
// ═══════════════════════════════════════════════════════
// OWNERSHIP — دكتور السيارات (Doctor Cars Iraq)
// تطبيق iOS / Android / Web
// المالك: Mohammed Saad — التوقيع: 10007
// ═══════════════════════════════════════════════════════
const OWNER = {
  name: "Mohammed Saad",
  nameAr: "محمد سعد",
  signature: "10007",
  year: "2025",
};




// ═══════════════════════════════════════════════════════
// SCREENS
// ═══════════════════════════════════════════════════════

// ── AUTH SCREEN ──────────────────────────────────────
// ترجمة أخطاء Supabase الشائعة للعربية
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





// ── DIAGNOSIS SCREEN ──────────────────────────────────────
const DiagnosisScreen = ({ onCartAdd, session }) => {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualVehicle, setManualVehicle] = useState({ brand: "", model: "", year: "" });
  const [garageVehicles, setGarageVehicles] = useState([]);
  const [garageLoading, setGarageLoading] = useState(true);
  const [symptoms, setSymptoms] = useState([]);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const uid = session?.user?.id;
    if (!uid) { setGarageLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("vehicles").select("id,brand,model,year,mileage_km").eq("owner_id", uid).order("created_at", { ascending: false });
      setGarageVehicles(data || []);
      setGarageLoading(false);
    })();
  }, [session?.user?.id]);

  const allSymptoms = [
    "صوت غريب عند الفرملة", "اهتزاز عند القيادة", "دخان من المحرك",
    "صوت طقطقة", "مشكلة في التبريد", "عدم الاشتغال",
    "ضوء تحذيري", "استهلاك زيت زائد", "تسريب سوائل",
    "مشكلة في الكهرباء", "تسريب وقود", "مشكلة في الفرامل"
  ];

  const toggleSymptom = (s) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const manualReady = manualMode && manualVehicle.brand.trim() && manualVehicle.model.trim();
  const step1Ready = manualMode ? manualReady : !!vehicle;

  const runDiagnosis = async () => {
    setLoading(true);
    const vehicleDesc = manualMode
      ? `${manualVehicle.brand} ${manualVehicle.model} ${manualVehicle.year}`
      : garageVehicles.find(v => v.id === vehicle) ? `${garageVehicles.find(v => v.id === vehicle).brand} ${garageVehicles.find(v => v.id === vehicle).model} ${garageVehicles.find(v => v.id === vehicle).year}` : vehicle;
    const symptomsList = symptoms.length > 0 ? `الأعراض: ${symptoms.join("، ")}` : "";
    const userInput = `${vehicleDesc ? `السيارة: ${vehicleDesc}. ` : ""}${symptomsList}${description ? `. ${description}` : ""}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "", "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: `أنت خبير ميكانيكي سيارات محترف. المستخدم يصف مشكلة في سيارته: "${userInput}"\n\nقدم تشخيصاً مختصراً وعملياً باللغة العربية يتضمن:\n1. الأسباب المحتملة (2-3 أسباب)\n2. مدى خطورة المشكلة (عالية/متوسطة/منخفضة)\n3. هل يمكن الاستمرار بالقيادة؟\n4. التوصية: إصلاح فوري أم يمكن الانتظار؟\n\nكن مباشراً ومفيداً. لا تطول.` }]
        })
      });
      const data = await response.json();
      const diagnosis = data?.content?.[0]?.text || null;
      if (!diagnosis) throw new Error("empty");
      setResult({ text: diagnosis, isRealAI: true });
    } catch {
      setResult({ text: "تعذر الاتصال بخدمة التشخيص. حاول مرة أخرى.", isRealAI: true, isError: true });
    }
    setLoading(false);
    setStep(3);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 8px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🤖 تشخيص الأعطال الذكي</h2>
      <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13 }}>مدعوم بالذكاء الاصطناعي</p>

      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? T.gold : T.navyBorder, transition: "background 0.3s" }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>الخطوة ١: حدد سيارتك</h3>

          {/* Toggle: garage vs manual */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={() => setManualMode(false)} style={{
              flex: 1, background: !manualMode ? `${T.gold}22` : T.navyCard,
              border: `2px solid ${!manualMode ? T.gold : T.navyBorder}`,
              borderRadius: 10, padding: "9px 8px", color: !manualMode ? T.gold : T.textSecondary,
              fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>🚗 من الكراج</button>
            <button onClick={() => setManualMode(true)} style={{
              flex: 1, background: manualMode ? `${T.gold}22` : T.navyCard,
              border: `2px solid ${manualMode ? T.gold : T.navyBorder}`,
              borderRadius: 10, padding: "9px 8px", color: manualMode ? T.gold : T.textSecondary,
              fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>✏️ إدخال يدوي</button>
          </div>

          {!manualMode ? (
            garageLoading ? (
              <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>
            ) : garageVehicles.length === 0 ? (
              <Card style={{ textAlign: "center", padding: 20, marginBottom: 16 }}>
                <p style={{ color: T.textMuted, margin: "0 0 8px", fontSize: 13 }}>لا توجد مركبات في الكراج</p>
                <p style={{ color: T.textMuted, margin: 0, fontSize: 12 }}>أضف مركبتك أولاً أو استخدم الإدخال اليدوي</p>
              </Card>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {garageVehicles.map(v => (
                  <button key={v.id} onClick={() => setVehicle(v.id)} style={{
                    background: vehicle === v.id ? `${T.gold}22` : T.navyCard,
                    border: `2px solid ${vehicle === v.id ? T.gold : T.navyBorder}`,
                    borderRadius: 14, padding: 14, cursor: "pointer", textAlign: "right"
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🚗</div>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{v.brand} {v.model}</div>
                    <div style={{ color: T.textSecondary, fontSize: 12 }}>{v.year || "—"}{v.mileage_km ? ` | ${Number(v.mileage_km).toLocaleString("ar-IQ")} كم` : ""}</div>
                  </button>
                ))}
              </div>
            )
          ) : (
            <div style={{ marginBottom: 16 }}>
              <Input label="الشركة المصنعة *" value={manualVehicle.brand} onChange={v => setManualVehicle(p => ({ ...p, brand: v }))} placeholder="مثال: Toyota, Kia" icon="🏭" />
              <Input label="الموديل *" value={manualVehicle.model} onChange={v => setManualVehicle(p => ({ ...p, model: v }))} placeholder="مثال: Camry, Elantra" icon="🚗" />
              <Input label="سنة الصنع" value={manualVehicle.year} onChange={v => setManualVehicle(p => ({ ...p, year: v }))} placeholder="مثال: 2020" type="number" icon="📅" />
            </div>
          )}

          <Btn fullWidth onClick={() => setStep(2)} disabled={!step1Ready}>التالي →</Btn>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>الخطوة ٢: الأعراض والوصف</h3>
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: T.textSecondary, fontSize: 13, marginBottom: 10 }}>اختر الأعراض التي تلاحظها:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allSymptoms.map(s => (
                <button key={s} onClick={() => toggleSymptom(s)} style={{
                  background: symptoms.includes(s) ? `${T.gold}22` : T.navyCard,
                  border: `1px solid ${symptoms.includes(s) ? T.gold : T.navyBorder}`,
                  borderRadius: 20, padding: "7px 14px", color: symptoms.includes(s) ? T.gold : T.textSecondary,
                  fontFamily: "inherit", fontWeight: 600, fontSize: 12, cursor: "pointer",
                }}>{symptoms.includes(s) ? "✓ " : ""}{s}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: T.textSecondary, fontSize: 13, display: "block", marginBottom: 6, fontWeight: 600 }}>اشرح المشكلة بكلماتك:</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="مثال: عند الفرملة أسمع صوت طقطقة من الأمام..."
              style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 12, padding: 14, color: T.textPrimary, fontSize: 14, fontFamily: "inherit", minHeight: 100, resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setStep(1)}>← رجوع</Btn>
            <Btn fullWidth onClick={runDiagnosis} disabled={symptoms.length === 0 && !description} icon="🤖">
              {loading ? "جارٍ التشخيص..." : "ابدأ التشخيص"}
            </Btn>
          </div>
          {loading && (
            <div style={{ marginTop: 16, textAlign: "center" }}>
              <div style={{ display: "inline-flex", gap: 6, alignItems: "center", color: T.gold, fontSize: 13 }}>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚙️</span>
                الذكاء الاصطناعي يحلل الأعراض...
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && result && (
        <div>
          <Card style={{ marginBottom: 16, background: result.isError ? `${T.red}11` : `${T.green}11`, border: `1px solid ${result.isError ? T.red : T.green}33` }}>
            <h4 style={{ margin: "0 0 8px", color: result.isError ? T.red : T.green }}>
              {result.isError ? "⚠️ خطأ في الاتصال" : "💡 تشخيص الذكاء الاصطناعي"}
            </h4>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result.text}</p>
          </Card>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" fullWidth onClick={() => { setStep(1); setResult(null); setSymptoms([]); setDescription(""); }}>تشخيص جديد</Btn>
            <Btn fullWidth icon="🏪">أقرب ورشة</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// ── EMERGENCY SCREEN ──────────────────────────────────────
const EmergencyScreen = ({ session, profile }) => {
  const [requestForm, setRequestForm] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", location: "", notes: "", vehicle_brand: "", vehicle_model: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const openForm = (service) => {
    setFormData({ name: profile?.full_name || "", phone: profile?.phone || "", location: "", notes: "", vehicle_brand: "", vehicle_model: "" });
    setSubmitSuccess(false);
    setRequestForm(service);
  };

  const handleSubmit = async () => {
    if (!formData.phone.trim() || !formData.location.trim()) return;
    setSubmitting(true);
    await supabase.from("part_requests").insert({
      user_id: session?.user?.id || null,
      part_name: requestForm.name,
      description: formData.notes.trim() || null,
      location: formData.location.trim(),
      contact_phone: formData.phone.trim(),
      contact_name: formData.name.trim() || null,
    });
    setSubmitting(false);
    setSubmitSuccess(true);
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        window.open(`https://maps.google.com?q=${pos.coords.latitude},${pos.coords.longitude}`);
        setFormData(f => ({ ...f, location: `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}` }));
      }, () => window.open("https://maps.google.com"));
    } else {
      window.open("https://maps.google.com");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Modal isOpen={!!requestForm} onClose={() => setRequestForm(null)} title={`طلب: ${requestForm?.name || ""}`}>
        {submitSuccess ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: T.green, fontSize: 15, fontWeight: 700, margin: 0 }}>تم إرسال طلبك! سيتواصل معك أقرب مزود خدمة</p>
          </div>
        ) : (
          <>
            <Input label="الاسم" value={formData.name} onChange={v => setFormData(f => ({ ...f, name: v }))} placeholder="اسمك" icon="👤" />
            <Input label="رقم الهاتف *" value={formData.phone} onChange={v => setFormData(f => ({ ...f, phone: v }))} placeholder="07xxxxxxxxx" icon="📱" type="tel" />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الموقع *</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} placeholder="العنوان أو الإحداثيات" style={{ flex: 1, background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
                <button onClick={handleLocation} style={{ background: `${T.blue}22`, border: `1px solid ${T.blue}44`, borderRadius: 10, padding: "10px 12px", color: T.blue, fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>📍 موقعي</button>
              </div>
            </div>
            <Input label="ملاحظات" value={formData.notes} onChange={v => setFormData(f => ({ ...f, notes: v }))} placeholder="تفاصيل إضافية..." icon="📝" />
            <Btn fullWidth onClick={handleSubmit} disabled={submitting || !formData.phone.trim() || !formData.location.trim()} variant="primary">
              {submitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
            </Btn>
          </>
        )}
      </Modal>

      <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 16, padding: 20, marginBottom: 20, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🚨</div>
        <h2 style={{ margin: "0 0 6px", color: T.red, fontSize: 20, fontWeight: 900 }}>خدمات الطوارئ</h2>
        <p style={{ margin: 0, color: T.textSecondary, fontSize: 13 }}>متاحة على مدار الساعة ٢٤/٧</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {MOCK.emergencyServices.map(service => (
          <Card key={service.id} style={{ border: service.available ? `1px solid ${T.navyBorder}` : `1px solid ${T.textMuted}33`, opacity: service.available ? 1 : 0.6 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${T.red}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{service.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>{service.name}</h4>
                  <Badge color={service.available ? T.green : T.textMuted} small>{service.available ? "متاح" : "غير متاح"}</Badge>
                </div>
                <p style={{ margin: "4px 0", color: T.textSecondary, fontSize: 12 }}>⏱️ الوصول: {service.eta} | ⭐ {service.rating}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <span style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>💰 {service.price}</span>
                  <button
                    disabled={!service.available}
                    onClick={() => openForm(service)}
                    style={{
                      background: `linear-gradient(135deg, ${T.red}, #DC2626)`,
                      border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff",
                      fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: service.available ? "pointer" : "not-allowed",
                    }}
                  >اطلب الآن</button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: `${T.blue}11`, border: `1px solid ${T.blue}33` }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🗺️</div>
          <p style={{ color: T.textSecondary, margin: 0, fontSize: 13 }}>الخريطة التفاعلية<br /><span style={{ fontSize: 11 }}>تحديد موقعك وأقرب الخدمات</span></p>
          <Btn size="sm" variant="blue" style={{ marginTop: 10 }} icon="📍" onClick={handleLocation}>تحديد موقعي</Btn>
        </div>
      </Card>
    </div>
  );
};

// ── MY GARAGE SCREEN ──────────────────────────────────────
const GarageScreen = ({ session }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [maintenance, setMaintenance] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [form, setForm] = useState({ brand: "", model: "", year: "", color: "", plate_number: "", chassis_number: "", import_origin: "" });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteVehicleMsg, setDeleteVehicleMsg] = useState(null);

  const uid = session?.user?.id;

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("vehicles").select("*").eq("owner_id", uid).order("created_at", { ascending: false });
      setVehicles(data || []);
      setLoading(false);
    })();
  }, [uid]);

  useEffect(() => {
    const v = vehicles[activeIdx];
    if (!v) { setMaintenance([]); return; }
    setMaintenanceLoading(true);
    (async () => {
      const { data } = await supabase.from("vehicle_maintenance_records").select("*").eq("vehicle_id", v.id).order("service_date", { ascending: false });
      setMaintenance(data || []);
      setMaintenanceLoading(false);
    })();
  }, [vehicles, activeIdx]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(file => setImagePreviews(prev => [...prev, URL.createObjectURL(file)]));
  };

  const closeModal = () => {
    setShowAddVehicle(false);
    imagePreviews.forEach(u => URL.revokeObjectURL(u));
    setImageFiles([]);
    setImagePreviews([]);
    setSaveError(null);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المركبة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);
    if (error) {
      const msg = (error.code === "23503" || error.message.includes("violates foreign key") || error.message.includes("foreign key"))
        ? "لا يمكن حذف هذه المركبة لأنها مرتبطة بمزاد فعّال"
        : `فشل الحذف: ${error.message}`;
      setDeleteVehicleMsg({ isError: true, text: msg });
      setTimeout(() => setDeleteVehicleMsg(null), 4000);
      return;
    }
    setVehicles(prev => {
      const remaining = prev.filter(v => v.id !== vehicleId);
      setActiveIdx(i => Math.max(0, Math.min(i, remaining.length - 1)));
      return remaining;
    });
    setDeleteVehicleMsg({ isError: false, text: "تم حذف المركبة بنجاح" });
    setTimeout(() => setDeleteVehicleMsg(null), 3000);
  };

  const handleAddVehicle = async () => {
    if (!form.brand.trim() || !form.model.trim()) { setSaveError("الشركة المصنعة والموديل مطلوبان"); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const imageUrls = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const path = `${uid}/${Date.now()}_${i}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("vehicle-images").upload(path, file, { upsert: false });
        if (upErr) throw new Error(`فشل رفع الصورة: ${upErr.message}`);
        const { data: urlData } = supabase.storage.from("vehicle-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
      const { data: inserted, error } = await supabase.from("vehicles").insert({
        owner_id: uid,
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year ? Number(form.year) : null,
        color: form.color.trim() || null,
        plate_number: form.plate_number.trim() || null,
        chassis_number: form.chassis_number.trim() || null,
        import_origin: form.import_origin || null,
        images: imageUrls,
      }).select().single();
      if (error) throw new Error(error.message);
      setVehicles(prev => [inserted, ...prev]);
      setActiveIdx(0);
      setForm({ brand: "", model: "", year: "", color: "", plate_number: "", chassis_number: "", import_origin: "" });
      closeModal();
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!uid) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <p style={{ color: T.textSecondary }}>سجّل دخولك لإدارة مركباتك</p>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: T.textMuted }}>جارٍ التحميل...</div>;

  const vehicle = vehicles[activeIdx] || null;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🚗 مركبتي</h2>
        <Btn size="sm" onClick={() => { setSaveError(null); setShowAddVehicle(true); }} icon="+">إضافة</Btn>
      </div>

      {deleteVehicleMsg && (
        <div style={{ background: deleteVehicleMsg.isError ? `${T.red}22` : `${T.green}22`, border: `1px solid ${deleteVehicleMsg.isError ? T.red : T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: deleteVehicleMsg.isError ? T.red : T.green, fontSize: 13, fontWeight: 700 }}>
          {deleteVehicleMsg.isError ? "⚠️ " : "✓ "}{deleteVehicleMsg.text}
        </div>
      )}

      {vehicles.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
          <p style={{ color: T.textSecondary, margin: "0 0 16px" }}>لا توجد مركبات مسجلة بعد</p>
          <Btn size="sm" onClick={() => setShowAddVehicle(true)}>أضف مركبتك الأولى</Btn>
        </Card>
      ) : (
        <>
          {vehicles.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 16, overflowX: "auto" }}>
              {vehicles.map((v, i) => (
                <button key={v.id} onClick={() => setActiveIdx(i)} style={{
                  flex: "0 0 auto", minWidth: 120,
                  background: activeIdx === i ? `${T.gold}22` : T.navyCard,
                  border: `2px solid ${activeIdx === i ? T.gold : T.navyBorder}`,
                  borderRadius: 14, padding: 12, cursor: "pointer", textAlign: "right"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>🚗</div>
                  <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{v.brand} {v.model}</div>
                  <div style={{ color: T.textSecondary, fontSize: 11 }}>{v.year || "—"}</div>
                </button>
              ))}
            </div>
          )}

          {vehicle && (
            <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${T.navyLight}, ${T.navyCard})` }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
                {vehicle.images && vehicle.images.length > 0
                  ? <img src={vehicle.images[0]} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover" }} />
                  : <div style={{ fontSize: 48 }}>🚗</div>}
                <div>
                  <h3 style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 18, fontWeight: 900 }}>{vehicle.brand} {vehicle.model}</h3>
                  <p style={{ margin: "0 0 4px", color: T.textSecondary, fontSize: 13 }}>
                    {vehicle.year || "—"}{vehicle.color ? ` | ${vehicle.color}` : ""}
                  </p>
                  {vehicle.plate_number && <Badge color={T.blue}>{vehicle.plate_number}</Badge>}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {vehicle.import_origin && (
                  <div style={{ background: T.navyMid, borderRadius: 10, padding: 10 }}>
                    <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 4 }}>أصل الاستيراد</div>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{vehicle.import_origin === "american" ? "وارد أمريكي" : "وارد خليجي"}</div>
                  </div>
                )}
                {vehicle.mileage_km != null && (
                  <div style={{ background: T.navyMid, borderRadius: 10, padding: 10 }}>
                    <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 4 }}>المسافة المقطوعة</div>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{Number(vehicle.mileage_km).toLocaleString("ar-IQ")} كم</div>
                  </div>
                )}
                {vehicle.last_maintenance_date && (
                  <div style={{ background: T.navyMid, borderRadius: 10, padding: 10 }}>
                    <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 4 }}>آخر صيانة</div>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{vehicle.last_maintenance_date}</div>
                  </div>
                )}
                {vehicle.chassis_number && (
                  <div style={{ background: T.navyMid, borderRadius: 10, padding: 10 }}>
                    <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 4 }}>رقم الشاصي</div>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 11 }}>{vehicle.chassis_number}</div>
                  </div>
                )}
              </div>
              {vehicle.images && vehicle.images.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
                  {vehicle.images.map((url, i) => (
                    <img key={i} src={url} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                <Btn size="sm" variant="danger" onClick={() => handleDeleteVehicle(vehicle.id)}>🗑️ حذف المركبة</Btn>
              </div>
            </Card>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
            {[["تشخيص", "🤖"], ["ورشة", "🏪"], ["طوارئ", "🚨"], ["تذكير", "⏰"]].map(([label, icon]) => (
              <button key={label} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 12, padding: "12px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ color: T.textSecondary, fontSize: 10, fontWeight: 600 }}>{label}</span>
              </button>
            ))}
          </div>

          <Section title="سجل الصيانة">
            {maintenanceLoading ? (
              <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>
            ) : maintenance.length === 0 ? (
              <Card style={{ textAlign: "center", padding: 24 }}>
                <p style={{ color: T.textMuted, margin: 0, fontSize: 13 }}>لا يوجد سجل صيانة بعد</p>
              </Card>
            ) : (
              maintenance.map(record => (
                <Card key={record.id} style={{ marginBottom: 10, display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.blue}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔧</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{record.service_type}</div>
                    <div style={{ color: T.textSecondary, fontSize: 12 }}>{record.workshop_name || "—"} | {record.service_date}</div>
                    {record.notes && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>{record.notes}</div>}
                  </div>
                  {record.cost != null && (
                    <div style={{ color: T.gold, fontWeight: 800, fontSize: 14, textAlign: "center" }}>
                      {Number(record.cost).toLocaleString("ar-IQ")}
                      <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 400 }}>د.ع</div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </Section>
        </>
      )}

      <Modal isOpen={showAddVehicle} onClose={closeModal} title="إضافة مركبة جديدة">
        <Input label="الشركة المصنعة *" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} placeholder="مثال: Toyota, Kia, Hyundai" icon="🏭" />
        <Input label="الموديل *" value={form.model} onChange={v => setForm(f => ({ ...f, model: v }))} placeholder="مثال: Camry, Elantra" icon="🚗" />
        <Input label="سنة الصنع" value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} placeholder="مثال: 2020" type="number" icon="📅" />
        <Input label="اللون" value={form.color} onChange={v => setForm(f => ({ ...f, color: v }))} placeholder="مثال: أبيض، رمادي" icon="🎨" />
        <Input label="رقم اللوحة" value={form.plate_number} onChange={v => setForm(f => ({ ...f, plate_number: v }))} placeholder="مثال: بغداد - أ 12345" icon="🔖" />
        <Input label="رقم الشاصي" value={form.chassis_number} onChange={v => setForm(f => ({ ...f, chassis_number: v }))} placeholder="VIN / رقم الشاصي" icon="🔢" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>أصل الاستيراد</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ val: "american", label: "وارد أمريكي" }, { val: "gulf", label: "وارد خليجي" }].map(opt => (
              <button key={opt.val} onClick={() => setForm(f => ({ ...f, import_origin: f.import_origin === opt.val ? "" : opt.val }))} style={{
                flex: 1, background: form.import_origin === opt.val ? `${T.gold}22` : T.navyLight,
                border: `2px solid ${form.import_origin === opt.val ? T.gold : T.navyBorder}`,
                borderRadius: 10, padding: "10px 8px", color: form.import_origin === opt.val ? T.gold : T.textSecondary,
                fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>{opt.label}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>صور المركبة (اختياري)</label>
          {imagePreviews.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {imagePreviews.map((url, i) => <img key={i} src={url} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover" }} />)}
            </div>
          )}
          <label style={{ display: "block", background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: 12, textAlign: "center", cursor: "pointer", color: T.textMuted, fontSize: 13 }}>
            📷 اضغط لإضافة صور
            <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: "none" }} />
          </label>
        </div>
        {saveError && <p style={{ color: T.red, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{saveError}</p>}
        <Btn fullWidth onClick={handleAddVehicle} disabled={saving}>{saving ? "جارٍ الحفظ..." : "إضافة المركبة"}</Btn>
      </Modal>
    </div>
  );
};


// ── SELLER PUBLIC SCREEN ──────────────────────────────────────
const SellerPublicScreen = ({ sellerId, onProductView, onCartAdd, session, onNavigate, favSet, onFavToggle }) => {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseRate, setResponseRate] = useState(null);

  useEffect(() => {
    if (!sellerId) return;
    (async () => {
      const [{ data: s }, { data: prods }] = await Promise.all([
        supabase.from("sellers").select("id, store_name, verified, is_verified, rating, seller_type, specialty, phone, whatsapp, created_at, owner_id, response_rate").eq("id", sellerId).single(),
        supabase.from("products").select("*, categories(name)").eq("seller_id", sellerId).eq("status", "active").order("created_at", { ascending: false }),
      ]);
      setSeller(s);
      setProducts((prods || []).map(p => ({ ...p, image: Array.isArray(p.images) ? (p.images[0] || "📦") : (p.images || "📦"), category: p.categories?.name || "", oldPrice: p.old_price || null, rating: p.rating || 0, reviews: 0, discount_percent: p.discount_percent || 0, discount_ends_at: p.discount_ends_at || null })));
      if (s?.response_rate != null) {
        setResponseRate(s.response_rate);
      } else if (s?.owner_id) {
        const { data: msgs } = await supabase.from("messages").select("id, is_read").eq("receiver_id", s.owner_id).limit(100);
        if (msgs && msgs.length > 0) {
          const replied = msgs.filter(m => m.is_read).length;
          setResponseRate(Math.round((replied / msgs.length) * 100));
        }
      }
      if (s?.id) supabase.from("product_views").insert({ seller_id: s.id, viewed_at: new Date().toISOString() }).then(() => {});
      setLoading(false);
    })();
  }, [sellerId]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>جارٍ التحميل...</div>;
  if (!seller) return <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>البائع غير موجود</div>;

  return (
    <div style={{ padding: 16 }}>
      <Card style={{ textAlign: "center", marginBottom: 20, background: `linear-gradient(135deg, ${T.navyLight}, ${T.navyCard})` }}>
        <div style={{ width: 70, height: 70, borderRadius: 20, background: T.navyMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px" }}>🏪</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
          <h3 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 900 }}>{seller.store_name}</h3>
          {(seller.verified || seller.is_verified) && <Badge color={T.green}>✓ موثق</Badge>}
        </div>
        <p style={{ margin: "0 0 10px", color: T.textSecondary, fontSize: 13 }}>{seller.specialty || seller.seller_type || ""}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            [seller.rating?.toFixed(1) || "—", "التقييم"],
            [products.length.toLocaleString("ar-IQ"), "المنتجات"],
            [responseRate != null ? `${responseRate}%` : "—", "الاستجابة"],
          ].map(([v, l]) => (
            <div key={l} style={{ background: T.navyMid, borderRadius: 10, padding: 10 }}>
              <div style={{ color: T.gold, fontWeight: 900, fontSize: 16 }}>{v}</div>
              <div style={{ color: T.textMuted, fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "center" }}>
          {seller.whatsapp || seller.phone ? <Btn size="sm" variant="green" icon="📱" onClick={() => { const n = toWhatsAppNumber(seller.whatsapp || seller.phone); if (n) window.open(`https://wa.me/${n}`); }}>واتساب</Btn> : null}
          {seller.phone ? <Btn size="sm" variant="ghost" icon="📞" onClick={() => window.open(`tel:${seller.phone}`, "_self")}>اتصال</Btn> : null}
          {session?.user && seller.owner_id ? <Btn size="sm" variant="ghost" icon="💬" onClick={() => { if (onNavigate) onNavigate("messages"); }}>رسالة</Btn> : null}
        </div>
      </Card>
      <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 15, fontWeight: 800 }}>منتجات المتجر ({products.length})</h4>
      {products.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 32 }}><div style={{ fontSize: 40, marginBottom: 10 }}>📦</div><p style={{ color: T.textMuted, margin: 0 }}>لا توجد منتجات منشورة</p></Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {products.map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} isFav={favSet?.has(String(p.id))} onFavToggle={onFavToggle} />)}
        </div>
      )}
    </div>
  );
};

// ── CAR PRICE ESTIMATOR SCREEN ──────────────────────────────────────
const CarPriceEstimatorScreen = ({ session, onCartAdd, onProductView }) => {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState("good");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);

  const CONDITIONS = { excellent: 1.15, good: 1.0, fair: 0.82, poor: 0.65 };
  const CONDITION_LABELS = { excellent: "ممتازة", good: "جيدة", fair: "مقبولة", poor: "ضعيفة" };

  const estimate = async () => {
    if (!brand.trim() || !model.trim() || !year) return;
    setLoading(true);
    setResult(null);
    const { data } = await supabase.from("products").select("price, name").ilike("name", `%${brand.trim()}%`).eq("status", "active").limit(50);
    const prices = (data || []).map(p => p.price).filter(p => p > 0);
    if (prices.length < 2) {
      setResult({ min: 8000000, max: 25000000, avg: 15000000, factor: CONDITIONS[condition], count: 0 });
    } else {
      const sorted = [...prices].sort((a, b) => a - b);
      const f = CONDITIONS[condition];
      setResult({ min: Math.round(sorted[0] * f), max: Math.round(sorted[sorted.length - 1] * f), avg: Math.round((prices.reduce((s, p) => s + p, 0) / prices.length) * f), factor: f, count: prices.length });
    }
    setSimilarProducts((data || []).slice(0, 4));
    if (session?.user?.id) {
      supabase.from("car_price_estimates").insert({ user_id: session.user.id, brand: brand.trim(), model: model.trim(), year: parseInt(year), mileage: mileage ? parseInt(mileage) : null, condition, estimated_min: result?.min, estimated_max: result?.max }).then(() => {});
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🚗 تقدير سعر السيارة</h2>
      <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13 }}>احصل على تقدير لقيمة سيارتك في السوق العراقي</p>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="الماركة *" value={brand} onChange={setBrand} placeholder="Toyota" />
          <Input label="الموديل *" value={model} onChange={setModel} placeholder="Camry" />
          <Input label="سنة الصنع *" type="number" value={year} onChange={setYear} placeholder="2019" />
          <Input label="المسافة (كم)" type="number" value={mileage} onChange={setMileage} placeholder="85000" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 8, fontWeight: 600 }}>حالة السيارة</label>
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(CONDITION_LABELS).map(([k, v]) => (
              <button key={k} onClick={() => setCondition(k)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: `2px solid ${condition === k ? T.gold : T.navyBorder}`, background: condition === k ? `${T.gold}15` : "transparent", color: condition === k ? T.gold : T.textSecondary, fontFamily: "inherit", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{v}</button>
            ))}
          </div>
        </div>
        <Btn fullWidth onClick={estimate} disabled={!brand.trim() || !model.trim() || !year || loading}>{loading ? "جارٍ التقدير..." : "احسب القيمة"}</Btn>
      </Card>
      {result && (
        <Card style={{ marginTop: 16, background: `linear-gradient(135deg, ${T.navyLight}, ${T.navyCard})`, border: `1px solid ${T.gold}44` }}>
          <h4 style={{ margin: "0 0 14px", color: T.gold, fontSize: 15, fontWeight: 800 }}>نتيجة التقدير</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[["الحد الأدنى", result.min], ["المتوسط", result.avg], ["الحد الأعلى", result.max]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center", background: T.navyMid, borderRadius: 10, padding: 10 }}>
                <div style={{ color: T.gold, fontWeight: 900, fontSize: 13 }}>{v.toLocaleString("ar-IQ")}</div>
                <div style={{ color: T.textMuted, fontSize: 10 }}>د.ع</div>
                <div style={{ color: T.textSecondary, fontSize: 10 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 12 }}>
            بناءً على {result.count} منتج مشابه · معامل الحالة: ×{result.factor}
          </div>
          <Btn fullWidth variant="primary" icon="📋" onClick={() => {}} size="sm">اعرض سيارتك للبيع</Btn>
        </Card>
      )}
      {similarProducts.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 14, fontWeight: 800 }}>منتجات مشابهة</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {similarProducts.map(p => (
              <Card key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: T.textPrimary, fontSize: 13, flex: 1 }}>{p.name}</span>
                <span style={{ color: T.gold, fontWeight: 800, fontSize: 13 }}>{p.price?.toLocaleString("ar-IQ")} د.ع</span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── COMPARISON SCREEN ──────────────────────────────────────
const ComparisonScreen = ({ compareList, onClear, onRemove, onCartAdd }) => {
  if (compareList.length === 0) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>⊕</div>
      <p style={{ color: T.textMuted, margin: 0 }}>لم تختر منتجات للمقارنة بعد</p>
    </div>
  );

  const attrs = ["name", "price", "category", "city", "condition", "stock"];
  const attrLabels = { name: "الاسم", price: "السعر", category: "الفئة", city: "المدينة", condition: "الحالة", stock: "المخزون" };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>⊕ مقارنة المنتجات</h2>
        <Btn size="sm" variant="danger" onClick={onClear}>مسح الكل</Btn>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 360 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 10px", color: T.textMuted, fontSize: 12, textAlign: "right", background: T.navyLight, borderRadius: "8px 0 0 8px", width: 80 }}>الخاصية</th>
              {compareList.map(p => (
                <th key={p.id} style={{ padding: "8px 10px", color: T.textPrimary, fontSize: 12, background: T.navyLight, textAlign: "center", minWidth: 120 }}>
                  <div style={{ marginBottom: 4 }}>{typeof p.image === "string" && p.image.startsWith("http") ? <img src={p.image} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 8 }} /> : <span style={{ fontSize: 24 }}>{p.image || "📦"}</span>}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textPrimary }}>{p.name?.substring(0, 20)}</div>
                  <button onClick={() => onRemove(p.id)} style={{ background: `${T.red}22`, border: "none", borderRadius: 6, padding: "2px 6px", color: T.red, fontSize: 10, cursor: "pointer", marginTop: 4 }}>✕ إزالة</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attrs.map((attr, i) => (
              <tr key={attr} style={{ background: i % 2 === 0 ? T.navyCard : T.navyMid }}>
                <td style={{ padding: "10px 10px", color: T.textMuted, fontSize: 12, fontWeight: 700 }}>{attrLabels[attr]}</td>
                {compareList.map(p => {
                  const val = attr === "price" ? `${p.price?.toLocaleString("ar-IQ")} د.ع` : String(p[attr] || "—");
                  const isMin = attr === "price" && compareList.every(pp => pp.price >= p.price);
                  return <td key={p.id} style={{ padding: "10px 10px", color: isMin ? T.green : T.textPrimary, fontWeight: isMin ? 800 : 400, fontSize: 13, textAlign: "center" }}>{val}</td>;
                })}
              </tr>
            ))}
            <tr>
              <td style={{ padding: "10px 10px" }}></td>
              {compareList.map(p => <td key={p.id} style={{ padding: "10px 10px", textAlign: "center" }}><button onClick={() => onCartAdd(p)} style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, border: "none", borderRadius: 8, padding: "6px 12px", color: T.navy, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+سلة</button></td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── ADMIN DASHBOARD SCREEN ──────────────────────────────────────
const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [adminUpdateMsg, setAdminUpdateMsg] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(null);
  const [openRequestsCount, setOpenRequestsCount] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [promotedProducts, setPromotedProducts] = useState([]);
  const [promotedLoading, setPromotedLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== "users" || users.length > 0) return;
    setUsersLoading(true);
    supabase.from("profiles").select("id, full_name, is_admin, created_at").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setUsers(data || []); setUsersLoading(false); });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "violations" || openRequestsCount !== null) return;
    supabase.from("part_requests").select("id", { count: "exact", head: true }).eq("status", "open")
      .then(({ count }) => setOpenRequestsCount(count || 0));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "verification" || pendingSellers.length > 0) return;
    setSellersLoading(true);
    supabase.from("sellers").select("id, store_name, seller_type, created_at, is_verified, verified").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setPendingSellers(data || []); setSellersLoading(false); });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "promotions" || promotedProducts.length > 0) return;
    setPromotedLoading(true);
    supabase.from("products").select("id, name, is_promoted, seller_id, sellers(store_name)").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setPromotedProducts(data || []); setPromotedLoading(false); });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "subscriptions" || subscriptions.length > 0) return;
    setSubscriptionsLoading(true);
    supabase.from("sellers").select("id, store_name, plan, max_products, seller_type").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setSubscriptions(data || []); setSubscriptionsLoading(false); });
  }, [activeTab]);

  const handleVerifySeller = async (sellerId, approve) => {
    await supabase.from("sellers").update({ is_verified: approve, verified: approve }).eq("id", sellerId);
    setPendingSellers(prev => prev.map(s => s.id === sellerId ? { ...s, is_verified: approve, verified: approve } : s));
    setVerifyMsg(approve ? "تم توثيق البائع ✓" : "تم رفض التوثيق");
    setTimeout(() => setVerifyMsg(""), 3000);
  };

  const handleTogglePromoted = async (productId, current) => {
    await supabase.from("products").update({ is_promoted: !current }).eq("id", productId);
    setPromotedProducts(prev => prev.map(p => p.id === productId ? { ...p, is_promoted: !current } : p));
  };

  const handleAdminToggle = async (userId, makeAdmin) => {
    setShowUserMenu(null);
    await supabase.from("profiles").update({ is_admin: makeAdmin }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: makeAdmin } : u));
    setAdminUpdateMsg(makeAdmin ? "تم منح صلاحيات المشرف" : "تم إلغاء صلاحيات المشرف");
    setTimeout(() => setAdminUpdateMsg(""), 3000);
  };

  const filteredUsers = users.filter(u => !userSearch || (u.full_name || "").toLowerCase().includes(userSearch.toLowerCase()));

  const systemStats = [
    { label: "المستخدمون النشطون", value: "٨٤,٣٢١", icon: "👥", color: T.blue },
    { label: "البائعون الموثقون", value: "١,٢٤٠", icon: "🏪", color: T.green },
    { label: "المنتجات المنشورة", value: "٤٥,٦٠٠", icon: "📦", color: T.gold },
    { label: "المخالفات المكتشفة", value: "١٢", icon: "🚫", color: T.red },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>🛡️</span>
        <div>
          <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>لوحة الإدارة</h2>
          <p style={{ margin: 0, color: T.textMuted, fontSize: 11 }}>صلاحيات كاملة | آخر دخول: الآن</p>
        </div>
      </div>

      {/* System Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {systemStats.map(stat => (
          <Card key={stat.label} style={{ border: `1px solid ${stat.color}33` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ color: stat.color, fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ color: T.textMuted, fontSize: 11 }}>{stat.label}</div>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[{ id: "overview", label: "نظرة عامة" }, { id: "users", label: "المستخدمون" }, { id: "verification", label: "التوثيق" }, { id: "promotions", label: "المنشورات" }, { id: "subscriptions", label: "الاشتراكات" }, { id: "violations", label: "المخالفات" }, { id: "finance", label: "المالية" }]}
        active={activeTab} onChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <div>
          {/* AI Monitoring */}
          <Card style={{ marginBottom: 16, background: `${T.purple}11`, border: `1px solid ${T.purple}33` }}>
            <h4 style={{ margin: "0 0 12px", color: T.purple, fontSize: 14 }}>🤖 مراقبة الذكاء الاصطناعي</h4>
            {[
              { agent: "وكيل مراقبة المحتوى", status: "نشط", checked: "٢,٣٤٠ إعلان", flagged: "١٢" },
              { agent: "وكيل كشف الاحتيال", status: "نشط", checked: "٨٤,٣٢١ معاملة", flagged: "٣" },
              { agent: "وكيل تحليل السوق", status: "نشط", checked: "تحديث كل ساعة", flagged: "—" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${T.navyBorder}` : "none" }}>
                <div>
                  <div style={{ color: T.textPrimary, fontWeight: 600, fontSize: 13 }}>{a.agent}</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{a.checked}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Badge small color={T.green}>{a.status}</Badge>
                  {a.flagged !== "—" && <div style={{ color: T.red, fontSize: 11, fontWeight: 700, marginTop: 2 }}>⚠️ {a.flagged}</div>}
                </div>
              </div>
            ))}
          </Card>

          {/* Recent Activity */}
          <Section title="النشاط الأخير">
            {[
              { action: "تسجيل بائع جديد", detail: "محل الفيصل للغيار - البصرة", time: "٥ دقائق", type: "new" },
              { action: "رفض إعلان مخالف", detail: "محتوى غير ذي صلة بالسيارات", time: "١٥ دقيقة", type: "violation" },
              { action: "اكتمال مزاد", detail: "تويوتا لاندكروزر - ٣٢,٠٠٠,٠٠٠ د.ع", time: "ساعة", type: "auction" },
              { action: "شكوى مستخدم", detail: "تأخر في التوصيل - طلب #١٠١٥", time: "٢ ساعة", type: "complaint" },
            ].map((act, i) => (
              <Card key={i} style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 20 }}>
                  {{ new: "🆕", violation: "🚫", auction: "🏆", complaint: "⚠️" }[act.type]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{act.action}</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{act.detail} | {act.time}</div>
                </div>
              </Card>
            ))}
          </Section>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          {adminUpdateMsg && <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>✓ {adminUpdateMsg}</div>}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="ابحث عن مستخدم..." style={{ flex: 1, background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
          </div>
          {usersLoading ? <div style={{ textAlign: "center", padding: 32, color: T.textMuted }}>جارٍ التحميل...</div> : filteredUsers.map(user => (
            <Card key={user.id} style={{ marginBottom: 10, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                  <div>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{user.full_name || "بدون اسم"}</div>
                    <div style={{ color: T.textMuted, fontSize: 11 }}>{user.id.slice(0, 8)}…</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {user.is_admin && <Badge small color={T.purple}>مشرف</Badge>}
                  <button onClick={() => setShowUserMenu(showUserMenu === user.id ? null : user.id)} style={{ background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 8, padding: "5px 10px", color: T.textSecondary, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>⋯</button>
                </div>
              </div>
              {showUserMenu === user.id && (
                <div style={{ position: "absolute", top: 48, left: 0, background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: 8, zIndex: 10, minWidth: 160, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                  {!user.is_admin ? (
                    <button onClick={() => handleAdminToggle(user.id, true)} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.gold, fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "8px 12px", cursor: "pointer", textAlign: "right", borderRadius: 8 }}>⭐ جعله مشرفاً</button>
                  ) : (
                    <button onClick={() => handleAdminToggle(user.id, false)} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.red, fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "8px 12px", cursor: "pointer", textAlign: "right", borderRadius: 8 }}>✕ إزالة الصلاحيات</button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === "verification" && (
        <div>
          {verifyMsg && <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>{verifyMsg}</div>}
          {sellersLoading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingSellers.map(s => (
                <Card key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{s.store_name}</div>
                      <div style={{ color: T.textMuted, fontSize: 11 }}>{s.seller_type} · {new Date(s.created_at).toLocaleDateString("ar-IQ")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {(s.is_verified || s.verified) ? <Badge color={T.green}>موثق ✓</Badge> : <Badge color={T.orange}>معلق</Badge>}
                      {!(s.is_verified || s.verified) && <Btn size="sm" variant="green" onClick={() => handleVerifySeller(s.id, true)}>قبول</Btn>}
                      {(s.is_verified || s.verified) && <Btn size="sm" variant="danger" onClick={() => handleVerifySeller(s.id, false)}>إلغاء</Btn>}
                    </div>
                  </div>
                </Card>
              ))}
              {pendingSellers.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>لا توجد طلبات توثيق</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === "promotions" && (
        <div>
          {promotedLoading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {promotedProducts.map(p => (
                <Card key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ color: T.textMuted, fontSize: 11 }}>{p.sellers?.store_name || "—"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {p.is_promoted ? <Badge color={T.purple}>ممول</Badge> : <Badge color={T.textMuted}>عادي</Badge>}
                      <Btn size="sm" variant={p.is_promoted ? "danger" : "ghost"} onClick={() => handleTogglePromoted(p.id, p.is_promoted)}>
                        {p.is_promoted ? "إلغاء التمويل" : "روّج"}
                      </Btn>
                    </div>
                  </div>
                </Card>
              ))}
              {promotedProducts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>لا توجد منتجات</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div>
          {subscriptionsLoading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {subscriptions.map(s => (
                <Card key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{s.store_name}</div>
                      <div style={{ color: T.textMuted, fontSize: 11 }}>حد المنتجات: {s.max_products || "غير محدود"}</div>
                    </div>
                    <Badge color={s.plan === "premium" ? T.gold : s.plan === "pro" ? T.blue : T.textMuted}>
                      {s.plan || "مجاني"}
                    </Badge>
                  </div>
                </Card>
              ))}
              {subscriptions.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>لا توجد اشتراكات</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === "violations" && (
        <div>
          {openRequestsCount !== null && (
            <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12, background: `${T.orange}11`, border: `1px solid ${T.orange}33` }}>
              <span style={{ fontSize: 28 }}>📋</span>
              <div>
                <div style={{ color: T.textPrimary, fontWeight: 800, fontSize: 14 }}>طلبات قطع مفتوحة: {openRequestsCount}</div>
                <div style={{ color: T.textMuted, fontSize: 12 }}>طلبات تحتاج متابعة من فريق الدعم</div>
              </div>
            </Card>
          )}
          <Card style={{ textAlign: "center", padding: 40, background: `${T.red}08`, border: `1px solid ${T.red}22` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", color: T.textPrimary, fontSize: 16, fontWeight: 800 }}>لوحة المخالفات</h3>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>هذه اللوحة قيد التطوير — ستكون متاحة في إصدار قادم</p>
          </Card>
        </div>
      )}

      {activeTab === "finance" && (
        <div>
          <Card style={{ textAlign: "center", padding: 40, background: `${T.gold}08`, border: `1px solid ${T.gold}22` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <h3 style={{ margin: "0 0 8px", color: T.textPrimary, fontSize: 16, fontWeight: 800 }}>اللوحة المالية</h3>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>هذه اللوحة قيد التطوير — ستكون متاحة في إصدار قادم</p>
          </Card>
        </div>
      )}
    </div>
  );
};

// ── NOTIFICATIONS SCREEN ──────────────────────────────────────
const NotificationsScreen = ({ session, onUnreadChange }) => {
  const typeIcon = { new_bid: "🏆", outbid: "⚠️", auction_won: "🎉", auction_ended: "⏰", order_update: "📦", part_request: "🔧", general: "🔔" };
  const typeColor = { new_bid: T.gold, outbid: T.orange, auction_won: T.green, auction_ended: T.blue, order_update: T.blue, part_request: T.purple, general: T.textSecondary };

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!session?.user) { setLoading(false); return; }
    const { data } = await supabase.from("notifications").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20);
    setNotifs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, [session?.user?.id]);

  const markRead = async (notif) => {
    if (notif.is_read) return;
    setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    if (onUnreadChange) {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", session.user.id).eq("is_read", false);
      onUnreadChange(count || 0);
    }
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id).eq("is_read", false);
    if (onUnreadChange) onUnreadChange(0);
  };

  if (!session) {
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: "0 0 20px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>الإشعارات 🔔</h2>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <p style={{ color: T.textSecondary, margin: 0, fontSize: 14 }}>سجّل دخولك لتلقّي الإشعارات</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>الإشعارات 🔔</h2>
        {notifs.some(n => !n.is_read) && (
          <button onClick={markAllRead} style={{ background: "none", border: "none", color: T.gold, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>تحديد الكل كمقروء</button>
        )}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>
      ) : notifs.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ color: T.textSecondary, margin: 0, fontSize: 14 }}>لا توجد إشعارات بعد</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map(notif => {
            const ic = typeIcon[notif.type] || "🔔";
            const cl = typeColor[notif.type] || T.textSecondary;
            return (
              <Card key={notif.id} onClick={() => markRead(notif)} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", background: notif.is_read ? T.navyCard : `${T.navyCard}`, borderRight: `4px solid ${notif.is_read ? T.navyBorder : cl}`, opacity: notif.is_read ? 0.75 : 1 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cl}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                    <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{notif.title}</span>
                    {!notif.is_read && <div style={{ width: 8, height: 8, background: T.blue, borderRadius: "50%", flexShrink: 0, marginTop: 4 }} />}
                  </div>
                  <p style={{ margin: "0 0 4px", color: T.textSecondary, fontSize: 12, lineHeight: 1.5 }}>{notif.body}</p>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{relativeTime(notif.created_at)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── CART SCREEN ──────────────────────────────────────
const CartScreen = ({ session, onNavigate, onCartCountChange, profile }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ buyer_name: "", buyer_phone: "", buyer_address: "", city: "", notes: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const loadCart = async () => {
    if (!session?.user) { setCartLoading(false); return; }
    const { data } = await supabase.from("cart_items").select("*, products(*)").eq("user_id", session.user.id).order("created_at");
    setCartItems(data || []);
    setCartLoading(false);
    if (onCartCountChange) onCartCountChange((data || []).length);
  };

  useEffect(() => { loadCart(); }, [session?.user?.id]);

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    setUpdating(p => ({ ...p, [item.id]: true }));
    if (newQty <= 0) {
      await supabase.from("cart_items").delete().eq("id", item.id);
    } else {
      await supabase.from("cart_items").update({ quantity: newQty }).eq("id", item.id);
    }
    await loadCart();
    setUpdating(p => ({ ...p, [item.id]: false }));
  };

  const removeItem = async (item) => {
    setUpdating(p => ({ ...p, [item.id]: true }));
    try {
      await supabase.from("cart_items").delete().eq("id", item.id);
      await loadCart();
    } finally {
      setUpdating(p => ({ ...p, [item.id]: false }));
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);

  const handleOpenCheckout = () => {
    setCheckoutForm({
      buyer_name: profile?.full_name || "",
      buyer_phone: profile?.phone || "",
      buyer_address: "",
      city: profile?.city || "",
      notes: "",
    });
    setCheckoutError(null);
    setCheckoutSuccess(false);
    setShowCheckout(true);
  };

  const handleConfirmCheckout = async () => {
    if (!checkoutForm.buyer_name.trim() || !checkoutForm.buyer_phone.trim() || !checkoutForm.buyer_address.trim()) {
      setCheckoutError("يرجى تعبئة الاسم ورقم الهاتف والعنوان");
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const uid = session.user.id;
      for (const item of cartItems) {
        if (!item.products) {
          throw new Error(`بيانات المنتج مفقودة — يرجى تحديث السلة وإعادة المحاولة`);
        }
        if (!item.products.seller_id) {
          throw new Error(`المنتج "${item.products.name || item.product_id}" غير مرتبط ببائع — لا يمكن إتمام الطلب`);
        }
      }
      const grouped = {};
      for (const item of cartItems) {
        const sid = item.products.seller_id;
        if (!grouped[sid]) grouped[sid] = [];
        grouped[sid].push(item);
      }
      for (const [sellerId, items] of Object.entries(grouped)) {
        const sellerTotal = items.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0);
        const { data: order, error: orderErr } = await supabase.from("orders").insert({
          buyer_id: uid,
          seller_id: sellerId,
          status: "pending",
          payment_method: "cod",
          total_amount: sellerTotal,
          buyer_name: checkoutForm.buyer_name.trim(),
          buyer_phone: checkoutForm.buyer_phone.trim(),
          buyer_address: checkoutForm.buyer_address.trim(),
          city: checkoutForm.city.trim(),
          notes: checkoutForm.notes.trim(),
        }).select("id").single();
        if (orderErr) throw orderErr;
        const orderItems = items.map(i => ({
          order_id: order.id,
          product_id: i.product_id,
          product_name: i.products?.name || "",
          quantity: i.quantity,
          unit_price: i.products?.price || 0,
        }));
        const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
        if (itemsErr) throw itemsErr;
      }
      await supabase.from("cart_items").delete().eq("user_id", uid);
      setCartItems([]);
      if (onCartCountChange) onCartCountChange(0);
      setCheckoutSuccess(true);
    } catch (err) {
      setCheckoutError(err.message || "حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartLoading) return <div style={{ padding: 32, textAlign: "center", color: T.textMuted }}>جارٍ التحميل...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🛒 سلة التسوق</h2>
      {cartItems.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
          <h3 style={{ color: T.textSecondary, fontWeight: 400, margin: "0 0 16px" }}>السلة فارغة</h3>
          <Btn onClick={() => onNavigate("shop")}>تصفح المنتجات</Btn>
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {cartItems.map(item => {
              const prod = item.products || {};
              const imgSrc = Array.isArray(prod.images) ? prod.images[0] : prod.images;
              return (
                <Card key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", opacity: updating[item.id] ? 0.6 : 1 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, overflow: "hidden" }}>
                    {isImageUrl(imgSrc) ? <img src={imgSrc} alt={prod.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", color: T.textPrimary, fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.name || "منتج"}</p>
                    <p style={{ margin: 0, color: T.gold, fontWeight: 800, fontSize: 14 }}>{((prod.price || 0) * item.quantity).toLocaleString("ar-IQ")} د.ع</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => updateQty(item, -1)} disabled={updating[item.id]} style={{ width: 28, height: 28, borderRadius: 8, background: T.navyLight, border: `1px solid ${T.navyBorder}`, color: T.textPrimary, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ color: T.textPrimary, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item, 1)} disabled={updating[item.id]} style={{ width: 28, height: 28, borderRadius: 8, background: T.navyLight, border: `1px solid ${T.navyBorder}`, color: T.textPrimary, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    <button onClick={() => removeItem(item)} disabled={updating[item.id]} style={{ background: `${T.red}22`, border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: T.textSecondary }}>المجموع الفرعي</span>
              <span style={{ color: T.textPrimary, fontWeight: 700 }}>{total.toLocaleString("ar-IQ")} د.ع</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: T.textSecondary }}>رسوم التوصيل</span>
              <span style={{ color: T.green, fontWeight: 700 }}>مجاني</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: T.textSecondary }}>طريقة الدفع</span>
              <span style={{ color: T.gold, fontWeight: 700 }}>الدفع عند الاستلام</span>
            </div>
            <div style={{ height: 1, background: T.navyBorder, margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: T.textPrimary, fontWeight: 800, fontSize: 16 }}>الإجمالي</span>
              <span style={{ color: T.gold, fontWeight: 900, fontSize: 18 }}>{total.toLocaleString("ar-IQ")} د.ع</span>
            </div>
          </Card>

          <Btn fullWidth size="lg" icon="💳" onClick={handleOpenCheckout}>متابعة للدفع</Btn>
        </>
      )}

      {showCheckout && (
        <Modal title="تأكيد الطلب" onClose={() => setShowCheckout(false)}>
          {checkoutSuccess ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
              <h3 style={{ color: T.green, margin: "0 0 8px" }}>تم تقديم طلبك بنجاح!</h3>
              <p style={{ color: T.textSecondary, margin: "0 0 20px" }}>سيتواصل معك البائع قريباً</p>
              <Btn onClick={() => { setShowCheckout(false); onNavigate("myOrders"); }}>عرض طلباتي</Btn>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="الاسم الكامل *" value={checkoutForm.buyer_name} onChange={v => setCheckoutForm(f => ({ ...f, buyer_name: v }))} placeholder="اسمك الكامل" />
              <Input label="رقم الهاتف *" value={checkoutForm.buyer_phone} onChange={v => setCheckoutForm(f => ({ ...f, buyer_phone: v }))} placeholder="07XXXXXXXXX" />
              <Input label="العنوان التفصيلي *" value={checkoutForm.buyer_address} onChange={v => setCheckoutForm(f => ({ ...f, buyer_address: v }))} placeholder="المحلة، الزقاق، رقم الدار..." />
              <div>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>المدينة</label>
                <select value={checkoutForm.city} onChange={e => setCheckoutForm(f => ({ ...f, city: e.target.value }))} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "11px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                  <option value="">اختر المدينة</option>
                  {["بغداد", "البصرة", "أربيل", "النجف", "كربلاء", "الموصل", "الديوانية", "الحلة", "كركوك"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Input label="ملاحظات" value={checkoutForm.notes} onChange={v => setCheckoutForm(f => ({ ...f, notes: v }))} placeholder="أي تعليمات خاصة..." />
              {checkoutError && <p style={{ color: T.red, fontSize: 13, margin: 0, fontWeight: 600 }}>⚠️ {checkoutError}</p>}
              <Btn fullWidth size="lg" onClick={handleConfirmCheckout} disabled={checkoutLoading} icon="✅">
                {checkoutLoading ? "جارٍ التأكيد..." : "تأكيد الطلب"}
              </Btn>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

// ── ACADEMY SCREEN ──────────────────────────────────────
const REAL_COURSES = [
  {
    id: 1,
    title: "Automobile Engineering",
    provider: "NPTEL / IIT India",
    level: "متوسط",
    url: "https://nptel.ac.in/courses/107106088",
    summary: {
      ar: "دورة هندسية من معهد IIT الهندي تشرح الأنظمة الأساسية للسيارة: المحرك، نقل الحركة، التعليق، والفرامل، مع الأساس الرياضي لكل نظام. مناسبة لمن يريد فهماً تقنياً عميقاً.",
      en: "An engineering course from IIT (India) covering the core systems of a car — engine, transmission, suspension, and brakes — with the mathematical foundation behind each. Suited for those wanting a deep technical understanding.",
      ku: "کۆرسێکی ئەندازیاری لە IIT (ھیندستان) کە سیستەمە سەرەکیەکانی ئۆتۆمبێل ڕوون دەکاتەوە: ماتۆر، گواستنەوەی هێز، سەسپینشن، و بریك، لەگەڵ بنەمای بیرکاری بۆ هەر سیستەمێک.",
    },
  },
  {
    id: 2,
    title: "Electric Cars: Technology, Business and Policy",
    provider: "Coursera / TU Delft",
    level: "مبتدئ",
    url: "https://online-learning.tudelft.nl/programs/electric-cars/",
    summary: {
      ar: "دورة من جامعة دلفت الهولندية تشرح كيف تعمل السيارة الكهربائية: المحرك الكهربائي، البطارية، الشحن، ومستقبل التنقل الكهربائي.",
      en: "A course from TU Delft (Netherlands) explaining how electric cars work — the electric motor, battery, charging, and the future of electric mobility.",
      ku: "کۆرسێک لە زانکۆی دێلفت (هۆلەندا) کە ڕوون دەکاتەوە چۆن ئۆتۆمبێلی کارەبایی کاردەکات: ماتۆری کارەبایی، باتری، شارژکردن، و داهاتووی گواستنەوەی کارەبایی.",
    },
  },
  {
    id: 3,
    title: "Self-Driving Cars Specialization",
    provider: "Coursera / University of Toronto",
    level: "متقدم",
    url: "https://www.coursera.org/specializations/self-driving-cars",
    summary: {
      ar: "دورة من جامعة تورنتو الكندية تشرح المكونات الأساسية لتقنية القيادة الذاتية: الحساسات، أنظمة الأمان، والتحكم بالمركبة.",
      en: "A course from the University of Toronto introducing the core components of self-driving car technology — sensors, safety systems, and vehicle control.",
      ku: "کۆرسێک لە زانکۆی تورۆنتۆ (کانادا) کە بنەمای تەکنەلۆجیای لێخوڕینی خۆکار ڕوون دەکاتەوە: سێنسەرەکان، سیستەمی سەلامەتی، و کۆنترۆڵی ئۆتۆمبێل.",
    },
  },
  {
    id: 4,
    title: "Internal Combustion Engines",
    provider: "MIT OpenCourseWare",
    level: "متقدم",
    url: "https://ocw.mit.edu/courses/2-61-internal-combustion-engines-spring-2008/",
    summary: {
      ar: "محاضرات من معهد MIT الأمريكي الشهير تشرح كيف يعمل محرك السيارة من الداخل: الاحتراق، الأداء، والكفاءة.",
      en: "Lectures from the renowned MIT explaining how a car engine works internally — the combustion cycle, performance, and efficiency.",
      ku: "وتارەکان لە MIT ناودارکراو کە ڕوون دەکاتەوە چۆن ماتۆری ئۆتۆمبێل لە ناوەوە کاردەکات: سووڕی شیاندن، کارایی، و بەرهەمداریتی.",
    },
  },
  {
    id: 5,
    title: "Car Mechanics and Vehicle Maintenance",
    provider: "Alison",
    level: "مبتدئ",
    url: "https://alison.com/tag/automotive",
    summary: {
      ar: "دورة عملية مجانية تشرح أساسيات صيانة السيارة: المحرك، الفرامل، ونصائح مهمة عند شراء سيارة.",
      en: "A free practical course covering car maintenance basics — engine, brakes, and important tips when buying a car.",
      ku: "کۆرسێکی کرداری بەخۆڕایی کە بنەماکانی چاکسازی ئۆتۆمبێل ڕوون دەکاتەوە: ماتۆر، بریك، و ئامۆژگاری گرنگ لە کاتی کڕینی ئۆتۆمبێل.",
    },
  },
  {
    id: 6,
    title: "How Cars Work — Engineering Explained",
    provider: "YouTube / Engineering Explained",
    level: "مبتدئ",
    url: "https://www.youtube.com/@EngineeringExplained/playlists",
    summary: {
      ar: "قناة يوتيوب مشهورة عالمياً (أكثر من مليوني مشترك) تشرح كيف تعمل أجزاء السيارة المختلفة بطريقة مبسطة ومرئية.",
      en: "A globally popular YouTube channel (2M+ subscribers) explaining how different car parts work in a simple, visual way.",
      ku: "کانالێکی یوتیوبی ناودار لە جیهان (زیاتر لە ٢ ملیۆن بەشداربوو) کە چۆنیەتی کارکردنی بەشە جۆراوجۆرەکانی ئۆتۆمبێل بە شێوەیەکی سادە و بینراو ڕوون دەکاتەوە.",
    },
  },
];

const AcademyScreen = () => {
  const levelColor = { "مبتدئ": T.green, "متوسط": T.orange, "متقدم": T.red };
  const detectLang = () => {
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    if (nav.startsWith("ar")) return "ar";
    if (nav.startsWith("ku")) return "ku";
    return "en";
  };
  const [courseLang, setCourseLang] = useState(detectLang);
  const langs = [
    { key: "ar", label: "عربي" },
    { key: "en", label: "English" },
    { key: "ku", label: "کوردی" },
  ];
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🎓 الأكاديمية التعليمية</h2>
      <p style={{ margin: "0 0 6px", color: T.textSecondary, fontSize: 13 }}>دورات خارجية مجانية موثّقة في ميكانيك السيارات والهندسة</p>
      <p style={{ margin: "0 0 12px", color: T.textMuted, fontSize: 11 }}>المحتوى باللغة الإنجليزية — يفتح في نافذة خارجية</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {langs.map(l => (
          <button key={l.key} onClick={() => setCourseLang(l.key)} style={{
            padding: "4px 12px", borderRadius: 20, border: "1px solid",
            borderColor: courseLang === l.key ? T.blue : T.border,
            background: courseLang === l.key ? T.blue : "transparent",
            color: courseLang === l.key ? "#fff" : T.textSecondary,
            fontSize: 12, cursor: "pointer", fontWeight: courseLang === l.key ? 700 : 400,
          }}>{l.label}</button>
        ))}
      </div>

      <Section title="الدورات المتاحة">
        {REAL_COURSES.map(course => (
          <Card key={course.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Badge small color={levelColor[course.level]}>{course.level}</Badge>
              <div style={{ display: "flex", gap: 6 }}>
                <Badge small color={T.green}>مجاني</Badge>
                <Badge small color={T.blue}>خارجي</Badge>
              </div>
            </div>
            <h4 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 14, fontWeight: 800, lineHeight: 1.4 }}>{course.title}</h4>
            <p style={{ margin: "0 0 6px", color: T.textSecondary, fontSize: 12 }}>🏫 {course.provider}</p>
            <p style={{ margin: "0 0 14px", color: T.textMuted, fontSize: 12, lineHeight: 1.5, direction: courseLang === "en" ? "ltr" : "rtl", textAlign: courseLang === "en" ? "left" : "right" }}>{(course.summary && (course.summary[courseLang] || course.summary.ar)) || ""}</p>
            <a href={course.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
              <Btn fullWidth size="sm" icon="🔗">ابدأ الدورة</Btn>
            </a>
          </Card>
        ))}
      </Section>
    </div>
  );
};

// ── MY ORDERS SCREEN ──────────────────────────────────────
const ORDER_STEPS = [
  { key: "pending", label: "استلام الطلب", icon: "📋" },
  { key: "confirmed", label: "تم التأكيد", icon: "✅" },
  { key: "shipped", label: "في الطريق", icon: "🚚" },
  { key: "delivered", label: "تم التسليم", icon: "📦" },
];

const OrderStepper = ({ status }) => {
  const stepKeys = ORDER_STEPS.map(s => s.key);
  const currentIdx = status === "cancelled" ? -1 : stepKeys.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", margin: "12px 0 6px", gap: 0 }}>
      {ORDER_STEPS.map((step, i) => {
        const done = currentIdx >= i && currentIdx !== -1;
        const active = currentIdx === i && currentIdx !== -1;
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 44 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: done ? T.green : T.navyLight, border: `2px solid ${done ? T.green : active ? T.gold : T.navyBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "all 0.3s" }}>
                {done ? "✓" : step.icon}
              </div>
              <div style={{ color: done ? T.green : T.textMuted, fontSize: 9, marginTop: 3, textAlign: "center", whiteSpace: "nowrap" }}>{step.label}</div>
            </div>
            {i < ORDER_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: done && currentIdx > i ? T.green : T.navyBorder, margin: "0 2px", marginBottom: 14, transition: "all 0.3s" }} />}
          </div>
        );
      })}
    </div>
  );
};

const MyOrdersScreen = ({ session }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusMap = {
    pending: { label: "قيد الانتظار", color: T.orange },
    confirmed: { label: "تم التأكيد", color: T.blue },
    shipped: { label: "تم الشحن", color: T.gold },
    delivered: { label: "تم التسليم", color: T.green },
    cancelled: { label: "ملغي", color: T.red },
  };

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const { data } = await supabase.from("orders").select("*, order_items(*)").eq("buyer_id", session.user.id).order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [session?.user?.id]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>📦 طلباتي</h2>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <p style={{ color: T.textMuted, margin: 0 }}>لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map(order => {
            const status = statusMap[order.status] || { label: order.status, color: T.textMuted };
            const itemNames = order.order_items?.map(i => i.product_name).join("، ") || "—";
            const date = new Date(order.created_at).toLocaleDateString("ar-IQ");
            return (
              <Card key={order.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>{date}</span>
                  <Badge color={status.color}>{status.label}</Badge>
                </div>
                <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>{itemNames}</p>
                {order.status !== "cancelled" && <OrderStepper status={order.status} />}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>الكمية: {order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0}</span>
                  <span style={{ color: T.gold, fontWeight: 800 }}>{order.total_amount?.toLocaleString("ar-IQ")} د.ع</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── FAVORITES SCREEN ──────────────────────────────────────
const FavoritesScreen = ({ session, onProductView, onCartAdd, favSet, onFavToggle }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) { setLoading(false); return; }
    supabase.from("favorites").select("product_id, products(*, categories(name))").eq("user_id", session.user.id)
      .then(({ data }) => {
        setItems((data || []).map(row => {
          const p = row.products;
          if (!p) return null;
          return { ...p, image: Array.isArray(p.images) ? (p.images[0] || "📦") : (p.images || "📦"), category: p.categories?.name || "", oldPrice: p.old_price || null, rating: p.rating || 0, reviews: 0, discount_percent: p.discount_percent || 0, discount_ends_at: p.discount_ends_at || null };
        }).filter(Boolean));
        setLoading(false);
      });
  }, [session?.user?.id]);

  if (!session?.user) return <div style={{ padding: 32, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div><p style={{ color: T.textSecondary }}>سجّل دخولك لحفظ المفضلة</p></div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>❤️ مفضلاتي</h2>
      {loading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
        : items.length === 0 ? <Card style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 40, marginBottom: 10 }}>💔</div><p style={{ color: T.textMuted, margin: 0 }}>لا توجد منتجات في مفضلاتك بعد</p></Card>
        : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {items.map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} isFav={favSet?.has(String(p.id))} onFavToggle={(id) => { onFavToggle(id); setItems(prev => prev.filter(x => String(x.id) !== String(id))); }} />)}
          </div>
      }
    </div>
  );
};

// ── MY REVIEWS SCREEN ──────────────────────────────────────
const MyReviewsScreen = ({ session }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    if (!session?.user?.id) { setLoading(false); return; }
    supabase.from("product_reviews").select("*, products(name)").eq("user_id", session.user.id).order("created_at", { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false); });
  };

  useEffect(() => { fetchReviews(); }, [session?.user?.id]);

  const handleDelete = async (reviewId) => {
    await supabase.from("product_reviews").delete().eq("id", reviewId);
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  if (!session?.user) return <div style={{ padding: 32, textAlign: "center" }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div><p style={{ color: T.textSecondary }}>سجّل دخولك أولاً</p></div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>⭐ مراجعاتي</h2>
      {loading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
        : reviews.length === 0 ? <Card style={{ textAlign: "center", padding: 40 }}><div style={{ fontSize: 40, marginBottom: 10 }}>💬</div><p style={{ color: T.textMuted, margin: 0 }}>لم تكتب أي مراجعات بعد</p></Card>
        : reviews.map(r => (
          <Card key={r.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{r.products?.name || "—"}</div>
                <Stars rating={r.rating} size={12} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: T.textMuted, fontSize: 11 }}>{relativeTime(r.created_at)}</span>
                <button onClick={() => handleDelete(r.id)} style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "4px 10px", color: T.red, fontFamily: "inherit", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>حذف</button>
              </div>
            </div>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.6 }}>{r.comment}</p>
          </Card>
        ))
      }
    </div>
  );
};

// ── MESSAGES SCREEN ──────────────────────────────────────
const MessagesScreen = ({ session, msgContext, onClearMsgContext }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (msgContext) { setActiveConv(msgContext); if (onClearMsgContext) onClearMsgContext(); }
  }, []);

  useEffect(() => {
    if (!session?.user?.id || activeConv) return;
    const uid = session.user.id;
    supabase.from("messages")
      .select("*, sender:sender_id(id,full_name), receiver:receiver_id(id,full_name), products(name)")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const convMap = {};
        (data || []).forEach(msg => {
          const partner = msg.sender_id === uid ? msg.receiver : msg.sender;
          if (!partner) return;
          const pid = partner.id;
          if (!convMap[pid]) convMap[pid] = { partner, lastMsg: msg, unread: 0, productName: msg.products?.name };
          if (msg.receiver_id === uid && !msg.is_read) convMap[pid].unread++;
        });
        setConversations(Object.values(convMap));
        setLoading(false);
      });
  }, [session?.user?.id, activeConv]);

  useEffect(() => {
    if (!activeConv || !session?.user?.id) return;
    const uid = session.user.id;
    const pid = activeConv.partnerId;
    supabase.from("messages")
      .select("*")
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${pid}),and(sender_id.eq.${pid},receiver_id.eq.${uid})`)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));
    supabase.from("messages").update({ is_read: true }).eq("sender_id", pid).eq("receiver_id", uid).eq("is_read", false);
    const channel = supabase.channel(`msgs-${uid}-${pid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${uid}` }, payload => {
        const m = payload.new;
        if (m.sender_id === pid) {
          setMessages(prev => [...prev, m]);
          supabase.from("messages").update({ is_read: true }).eq("id", m.id);
        }
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeConv?.partnerId]);

  const sendMessage = async () => {
    if (!msgText.trim() || sending || !session?.user?.id) return;
    setSending(true);
    const uid = session.user.id;
    const { data, error } = await supabase.from("messages").insert({ sender_id: uid, receiver_id: activeConv.partnerId, product_id: activeConv.productId || null, content: msgText.trim() }).select().single();
    if (!error && data) setMessages(prev => [...prev, data]);
    setMsgText("");
    setSending(false);
  };

  if (!session?.user?.id) {
    return (
      <div style={{ padding: 16 }}>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <p style={{ color: T.textSecondary, margin: 0 }}>سجّل دخولك لعرض رسائلك</p>
        </Card>
      </div>
    );
  }

  if (activeConv) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
        <div style={{ padding: "10px 16px", background: T.navyCard, borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => { setActiveConv(null); setMessages([]); setLoading(true); }} style={{ background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: T.textPrimary, fontSize: 16 }}>→</button>
          <div>
            <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{activeConv.partnerName}</div>
            {activeConv.productName && <div style={{ color: T.textMuted, fontSize: 11 }}>📦 {activeConv.productName}</div>}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {messages.map((msg, i) => {
            const isMine = msg.sender_id === session.user.id;
            return (
              <div key={msg.id || i} style={{ display: "flex", justifyContent: isMine ? "flex-start" : "flex-end" }}>
                <div style={{ maxWidth: "75%", background: isMine ? T.gold : T.navyCard, color: isMine ? "#000" : T.textPrimary, borderRadius: 12, padding: "8px 12px", fontSize: 13, border: isMine ? "none" : `1px solid ${T.navyBorder}` }}>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3 }}>{relativeTime(msg.created_at)}</div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && <div style={{ textAlign: "center", color: T.textMuted, fontSize: 13, marginTop: 40 }}>ابدأ المحادثة</div>}
        </div>
        <div style={{ padding: "10px 16px", display: "flex", gap: 8, background: T.navyCard, borderTop: `1px solid ${T.navyBorder}` }}>
          <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="اكتب رسالة..." style={{ flex: 1, background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 20, padding: "8px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
          <button onClick={sendMessage} disabled={sending} style={{ background: T.gold, border: "none", borderRadius: 20, padding: "8px 16px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>إرسال</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>رسائلي 💬</h2>
      {loading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div> : conversations.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <p style={{ color: T.textSecondary, margin: 0 }}>لا توجد رسائل بعد</p>
        </Card>
      ) : conversations.map((conv, i) => (
        <Card key={i} style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => setActiveConv({ partnerId: conv.partner.id, partnerName: conv.partner.full_name, productId: conv.lastMsg?.product_id || null, productName: conv.productName || null })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
              <div>
                <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{conv.partner.full_name}</div>
                <div style={{ color: T.textMuted, fontSize: 12 }}>{(conv.lastMsg?.content || "").substring(0, 40)}{(conv.lastMsg?.content || "").length > 40 ? "..." : ""}</div>
                {conv.productName && <div style={{ color: T.blue, fontSize: 11 }}>📦 {conv.productName}</div>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{ color: T.textMuted, fontSize: 10 }}>{relativeTime(conv.lastMsg?.created_at)}</span>
              {conv.unread > 0 && <span style={{ background: T.red, color: "#fff", borderRadius: 10, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>{conv.unread}</span>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ── ADDRESSES SCREEN ──────────────────────────────────────
const AddressesScreen = () => {
  const [toasted, setToasted] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Card style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>📍</div>
        <h3 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>عناويني</h3>
        <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>هذه الميزة ستكون متاحة قريباً. نعمل على إضافتها في التحديث القادم.</p>
        {toasted ? (
          <div style={{ color: T.green, fontWeight: 700, fontSize: 14 }}>سنُعلمك عند الإطلاق ✓</div>
        ) : (
          <Btn onClick={() => setToasted(true)}>إشعاري عند الإطلاق</Btn>
        )}
      </Card>
    </div>
  );
};

// ── PAYMENTS SCREEN ──────────────────────────────────────
const PaymentsScreen = () => {
  const [toasted, setToasted] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Card style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>💳</div>
        <h3 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>طرق الدفع</h3>
        <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>هذه الميزة ستكون متاحة قريباً. نعمل على إضافتها في التحديث القادم.</p>
        {toasted ? (
          <div style={{ color: T.green, fontWeight: 700, fontSize: 14 }}>سنُعلمك عند الإطلاق ✓</div>
        ) : (
          <Btn onClick={() => setToasted(true)}>إشعاري عند الإطلاق</Btn>
        )}
      </Card>
    </div>
  );
};

// ── PROFILE SCREEN ──────────────────────────────────────
const ProfileScreen = ({ onLogout, onNavigate, profile, session }) => {
  const [ordersCount, setOrdersCount] = useState(null);
  const [reviewsCount, setReviewsCount] = useState(null);
  const [favCount, setFavCount] = useState(null);
  const [msgsUnread, setMsgsUnread] = useState(null);
  useEffect(() => {
    if (!session?.user) return;
    const uid = session.user.id;
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("buyer_id", uid)
      .then(({ count }) => setOrdersCount(count || 0));
    supabase.from("product_reviews").select("id", { count: "exact", head: true }).eq("user_id", uid)
      .then(({ count }) => setReviewsCount(count || 0));
    supabase.from("user_favorites_count").select("count").eq("user_id", uid).single()
      .then(({ data }) => setFavCount(data?.count || 0));
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", uid).eq("is_read", false)
      .then(({ count }) => setMsgsUnread(count || 0));
  }, [session?.user?.id]);
  const menuItems = [
    { icon: "🚗", label: "مركباتي", action: () => onNavigate("garage") },
    { icon: "📦", label: "طلباتي", action: () => onNavigate("myOrders") },
    { icon: "❤️", label: "مفضلاتي", action: () => onNavigate("favorites") },
    { icon: "⭐", label: "مراجعاتي", action: () => onNavigate("myReviews") },
    { icon: "💬", label: "رسائلي", badge: msgsUnread, action: () => onNavigate("messages") },
    { icon: "💳", label: "طرق الدفع", action: () => onNavigate("payments") },
    { icon: "📍", label: "عناويني", action: () => onNavigate("addresses") },
    { icon: "🔒", label: "الأمان والخصوصية", action: () => {} },
    { icon: "📜", label: "شروط الاستخدام", action: () => {} },
    { icon: "🛡️", label: "سياسة الخصوصية", action: () => {} },
    { icon: "🆘", label: "الدعم والمساعدة", action: () => {} },
  ];

  const roleLabels = { buyer: "مشتري", seller: "بائع", wholesale: "تاجر جملة", workshop: "ورشة", admin: "إدارة" };

  return (
    <div style={{ padding: 16 }}>
      {/* Profile Card */}
      <Card style={{ textAlign: "center", marginBottom: 20, background: `linear-gradient(135deg, ${T.navyLight}, ${T.navyCard})` }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 12px" }}>👤</div>
        <h3 style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 18, fontWeight: 900 }}>{profile?.full_name || "مستخدم جديد"}</h3>
        <p style={{ margin: "0 0 8px", color: T.textSecondary, fontSize: 13 }}>📱 {profile?.phone || "—"} | 📍 {profile?.city || "غير محدد"}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <Badge color={T.blue}>{roleLabels[profile?.role] || "مشتري"}</Badge>
          {profile?.verified ? <Badge color={T.green}>موثق ✓</Badge> : <Badge color={T.textMuted}>غير موثق</Badge>}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[
            [ordersCount != null ? ordersCount.toLocaleString("ar-IQ") : "٠", "طلباتي"],
            [reviewsCount != null ? reviewsCount.toLocaleString("ar-IQ") : "٠", "مراجعاتي"],
            [favCount != null ? favCount.toLocaleString("ar-IQ") : "٠", "مفضلاتي"],
          ].map(([v, l]) => (
            <div key={l} style={{ flex: 1, background: T.navyMid, borderRadius: 10, padding: 10 }}>
              <div style={{ color: T.gold, fontWeight: 900, fontSize: 18 }}>{v}</div>
              <div style={{ color: T.textMuted, fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
        {profile?.referral_code && (
          <div style={{ marginTop: 14, background: T.navyMid, borderRadius: 12, padding: "10px 14px", border: `1px solid ${T.gold}44` }}>
            <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 4 }}>كود الإحالة الخاص بك</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ color: T.gold, fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>{profile.referral_code}</span>
              <button onClick={() => navigator.clipboard?.writeText(profile.referral_code)} style={{ background: `${T.gold}22`, border: `1px solid ${T.gold}44`, borderRadius: 8, padding: "4px 10px", color: T.gold, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>نسخ</button>
              <button onClick={() => { const msg = `انضم لدكتور السيارات! كود الإحالة: ${profile.referral_code}`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`); }} style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 8, padding: "4px 10px", color: T.green, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>مشاركة</button>
            </div>
            {profile.referral_points > 0 && <div style={{ color: T.purple, fontSize: 12, marginTop: 6 }}>⭐ نقاطك: {profile.referral_points}</div>}
          </div>
        )}
      </Card>

      {/* Menu Items */}
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {menuItems.map((item, i) => (
          <button key={i} onClick={item.action} style={{
            width: "100%", background: "none", border: "none", padding: "14px 16px",
            borderBottom: i < menuItems.length - 1 ? `1px solid ${T.navyBorder}` : "none",
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            textAlign: "right", fontFamily: "inherit",
          }}>
            <span style={{ fontSize: 20, minWidth: 24 }}>{item.icon}</span>
            <span style={{ flex: 1, color: T.textPrimary, fontSize: 14, fontWeight: 600 }}>{item.label}</span>
            {item.badge > 0 && <span style={{ background: T.red, color: "#fff", borderRadius: 10, padding: "2px 7px", fontSize: 11, fontWeight: 700, marginLeft: 4 }}>{item.badge}</span>}
            <span style={{ color: T.textMuted }}>←</span>
          </button>
        ))}
      </Card>

      <button onClick={onLogout} style={{ width: "100%", marginTop: 16, background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 12, padding: "14px 0", color: T.red, fontFamily: "inherit", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
        🚪 تسجيل الخروج
      </button>

      <p style={{ textAlign: "center", color: T.textMuted, fontSize: 11, marginTop: 16, lineHeight: 1.8 }}>
        دكتور السيارات - Doctor Cars Iraq<br />
        الإصدار ١.٠.٠ | جميع الحقوق محفوظة © {OWNER.year}<br />
        <span style={{ color: T.textMuted, opacity: 0.8 }}>مالك التطبيق: {OWNER.nameAr} ({OWNER.name})</span><br />
        <span style={{ fontSize: 10, opacity: 0.6 }}>توقيع المالك: {OWNER.signature}</span>
      </p>
    </div>
  );
};

// ── PART REQUEST SCREEN ──────────────────────────────────────
const PartRequestScreen = ({ session, profile }) => {
  const [submitted, setSubmitted] = useState(false);
  const [carBrand, setCarBrand] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carYear, setCarYear] = useState("");
  const [partName, setPartName] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("بغداد");
  const [contactPhone, setContactPhone] = useState(profile?.phone || "");
  const [submitting, setSubmitting] = useState(false);
  const [reqError, setReqError] = useState(null);

  const handleSubmit = async () => {
    if (!carBrand.trim() || !carModel.trim() || !partName.trim()) return;
    setSubmitting(true);
    setReqError(null);
    const payload = {
      user_id: session.user.id,
      car_brand: carBrand.trim(),
      car_model: carModel.trim(),
      part_name: partName.trim(),
      ...(carYear ? { car_year: parseInt(carYear) } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(city ? { city } : {}),
      ...(contactPhone.trim() ? { contact_phone: contactPhone.trim() } : {}),
    };
    const { error } = await supabase.from("part_requests").insert(payload);
    if (error) {
      setReqError(error.message);
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 8px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>📋 طلب قطعة</h2>
      <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13 }}>لم تجد ما تبحث عنه؟ أرسل طلبك لجميع البائعين</p>

      {!session ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <p style={{ color: T.textSecondary, margin: 0, fontSize: 14 }}>يجب تسجيل الدخول أولاً</p>
        </Card>
      ) : submitted ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h3 style={{ margin: "0 0 8px", color: T.green }}>تم إرسال طلبك بنجاح!</h3>
          <p style={{ color: T.textSecondary, margin: "0 0 20px", lineHeight: 1.6 }}>
            سيتواصل معك البائعون المناسبون.
          </p>
          <Btn onClick={() => { setSubmitted(false); setCarBrand(""); setCarModel(""); setCarYear(""); setPartName(""); setDescription(""); setContactPhone(profile?.phone || ""); }} variant="secondary">طلب جديد</Btn>
        </Card>
      ) : (
        <>
          <Input label="ماركة السيارة *" value={carBrand} onChange={setCarBrand} placeholder="مثال: Toyota" icon="🚗" />
          <Input label="موديل السيارة *" value={carModel} onChange={setCarModel} placeholder="مثال: Camry" icon="🚘" />
          <Input label="سنة الصنع" value={carYear} onChange={setCarYear} placeholder="مثال: 2018" icon="📅" type="number" />
          <Input label="اسم القطعة *" value={partName} onChange={setPartName} placeholder="مثال: فلتر زيت، تيل فرامل..." icon="🔧" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>وصف إضافي</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="أي تفاصيل إضافية عن القطعة..."
              style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 12, padding: 14, color: T.textPrimary, fontSize: 14, fontFamily: "inherit", minHeight: 80, resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>المدينة</label>
            <select value={city} onChange={e => setCity(e.target.value)} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "11px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
              {["بغداد", "البصرة", "أربيل", "النجف", "كربلاء", "الموصل", "الديوانية", "الحلة", "كركوك"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Input label="رقم التواصل" value={contactPhone} onChange={setContactPhone} placeholder="07XXXXXXXXX" icon="📱" type="tel" />
          {reqError && (
            <div style={{ background: `${T.red}1A`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: T.red, fontSize: 13 }}>
              {reqError}
            </div>
          )}
          <Btn fullWidth size="lg" onClick={handleSubmit} disabled={!carBrand.trim() || !carModel.trim() || !partName.trim() || submitting} icon="📤">
            {submitting ? "جارٍ الإرسال..." : "إرسال الطلب للبائعين"}
          </Btn>
        </>
      )}
    </div>
  );
};

// ── ROLE SELECTION SCREEN ──────────────────────────────────────
const RoleSelectionScreen = ({ session, onComplete }) => {
  const [step, setStep] = useState("choose");
  const [storeName, setStoreName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const user = session?.user;

  const finish = async (role, sellerPayload = null) => {
    setSaving(true);
    setError(null);
    const { error: pErr } = await supabase.from("profiles").update({ role }).eq("id", user.id);
    if (pErr) { setError(pErr.message); setSaving(false); return; }
    if (sellerPayload) {
      const { data: existing } = await supabase.from("sellers").select("id").eq("owner_id", user.id).maybeSingle();
      let sErr;
      if (existing) {
        ({ error: sErr } = await supabase.from("sellers").update(sellerPayload).eq("id", existing.id));
      } else {
        ({ error: sErr } = await supabase.from("sellers").insert({ owner_id: user.id, ...sellerPayload }));
      }
      if (sErr) { setError(sErr.message); setSaving(false); return; }
    }
    sessionStorage.setItem("role_selected", "1");
    setSaving(false);
    onComplete();
  };

  const roleCards = [
    { role: "buyer", icon: "🛒", title: "مشتري", desc: "أبحث عن قطع غيار وخدمات لسيارتي", color: T.blue },
    { role: "seller", icon: "🏪", title: "بائع", desc: "أبيع قطع غيار وخدمات عبر المنصة", color: T.green },
    { role: "trader", icon: "🏭", title: "تاجر", desc: "مستودع جملة وتوريد بكميات كبيرة", color: T.purple },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: T.navy, fontFamily: "'Cairo','Tajawal',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {step === "choose" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
              <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 22, fontWeight: 900 }}>ما دورك في المنصة؟</h2>
              <p style={{ margin: "8px 0 0", color: T.textSecondary, fontSize: 14 }}>اختر نوع حسابك لتحصل على تجربة مخصصة</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {roleCards.map(card => (
                <button key={card.role} onClick={() => {
                  if (card.role === "buyer") finish("user");
                  else setStep(card.role + "_form");
                }} style={{ background: T.navyCard, border: `2px solid ${card.color}44`, borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", textAlign: "right", width: "100%" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${card.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{card.icon}</div>
                  <div>
                    <div style={{ color: T.textPrimary, fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{card.title}</div>
                    <div style={{ color: T.textSecondary, fontSize: 13 }}>{card.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => { sessionStorage.setItem("role_selected", "1"); onComplete(); }} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", padding: "10px 0", fontFamily: "inherit" }}>تخطي الآن</button>
          </>
        )}

        {step === "seller_form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏪</div>
              <h3 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>إعداد متجرك</h3>
            </div>
            <Input label="اسم المتجر *" value={storeName} onChange={setStoreName} placeholder="مثال: محل الفارس لقطع الغيار" icon="🏪" />
            {error && <div style={{ color: T.red, fontSize: 13, marginBottom: 12, background: `${T.red}22`, padding: "10px 14px", borderRadius: 10 }}>⚠️ {error}</div>}
            <Btn fullWidth variant="primary" onClick={() => {
              if (!storeName.trim()) { setError("اسم المتجر مطلوب"); return; }
              finish("seller", { store_name: storeName.trim(), seller_type: "retail" });
            }} disabled={saving}>{saving ? "جارٍ الحفظ..." : "إنشاء المتجر"}</Btn>
            <button onClick={() => setStep("choose")} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", padding: "10px 0 0", fontFamily: "inherit" }}>← رجوع</button>
          </>
        )}

        {step === "trader_form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏭</div>
              <h3 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>إعداد مستودعك</h3>
            </div>
            <Input label="اسم المستودع *" value={storeName} onChange={setStoreName} placeholder="مثال: مستودع الخليج للجملة" icon="🏭" />
            <Input label="تخصص البضاعة *" value={specialty} onChange={setSpecialty} placeholder="مثال: زيوت وفلاتر، إطارات، بطاريات" icon="📦" />
            {error && <div style={{ color: T.red, fontSize: 13, marginBottom: 12, background: `${T.red}22`, padding: "10px 14px", borderRadius: 10 }}>⚠️ {error}</div>}
            <Btn fullWidth variant="primary" onClick={() => {
              if (!storeName.trim()) { setError("اسم المستودع مطلوب"); return; }
              if (!specialty.trim()) { setError("تخصص البضاعة مطلوب"); return; }
              finish("trader", { store_name: storeName.trim(), seller_type: "wholesale", specialty: specialty.trim() });
            }} disabled={saving}>{saving ? "جارٍ الحفظ..." : "إنشاء المستودع"}</Btn>
            <button onClick={() => setStep("choose")} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", padding: "10px 0 0", fontFamily: "inherit" }}>← رجوع</button>
          </>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function DoctorCarsApp() {
  const { session, profile, loading, authError, signUp, signIn, signOut, signInWithOAuth } = useAuth();
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartBadgeCount, setCartBadgeCount] = useState(0);
  const [cartToast, setCartToast] = useState(null);
  const [prevScreen, setPrevScreen] = useState("home");
  const [roleDone, setRoleDone] = useState(!!sessionStorage.getItem("role_selected"));
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favSet, setFavSet] = useState(new Set());
  const [msgContext, setMsgContext] = useState(null);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareBar, setShowCompareBar] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang === "en" ? "en" : "ar";
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
  }, [lang]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const handler = (e) => { e.preventDefault(); setPwaPrompt(e); setShowPwaBanner(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleCompare = (product) => {
    const pid = String(product.id);
    setCompareList(prev => {
      if (prev.some(p => String(p.id) === pid)) return prev.filter(p => String(p.id) !== pid);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
    setShowCompareBar(true);
  };

  const compareSet = new Set(compareList.map(p => String(p.id)));

  const navigate = (screen, meta = null) => {
    setPrevScreen(currentScreen);
    if (screen === "shop" && meta) setSelectedCategory(meta);
    else if (screen !== "shop") setSelectedCategory(null);
    if (screen === "sellerPublic" && meta?.sellerId) setSelectedSellerId(meta.sellerId);
    setCurrentScreen(screen);
  };

  const handleProductView = (product) => {
    setSelectedProduct(product);
    navigate("productDetail");
  };

  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (!session?.user) { setCartBadgeCount(0); return; }
    supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", session.user.id)
      .then(({ count }) => setCartBadgeCount(count || 0));
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) { setFavSet(new Set()); return; }
    supabase.from("favorites").select("product_id").eq("user_id", session.user.id)
      .then(({ data }) => setFavSet(new Set((data || []).map(r => String(r.product_id)))));
  }, [session?.user?.id]);

  const toggleFavorite = async (productId) => {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    const pid = String(productId);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pid);
    if (!isUUID) return;
    if (favSet.has(pid)) {
      setFavSet(prev => { const n = new Set(prev); n.delete(pid); return n; });
      await supabase.from("favorites").delete().eq("user_id", uid).eq("product_id", pid);
    } else {
      setFavSet(prev => new Set([...prev, pid]));
      await supabase.from("favorites").insert({ user_id: uid, product_id: pid });
    }
  };

  useEffect(() => {
    if (!session?.user) { setUnreadNotifCount(0); return; }
    const uid = session.user.id;
    const fetchUnread = () =>
      supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("is_read", false)
        .then(({ count }) => setUnreadNotifCount(count || 0));
    fetchUnread();
    const channel = supabase.channel(`notif-${uid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` }, fetchUnread)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session?.user?.id]);

  const handleCartAdd = async (product) => {
    if (!session?.user) {
      setCartToast({ msg: "يرجى تسجيل الدخول أولاً لإضافة المنتجات للسلة", isError: true });
      setTimeout(() => setCartToast(null), 3000);
      return;
    }
    const pid = product.id;
    const isUUID = pid && typeof pid === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(pid);
    if (!isUUID) {
      setCartToast({ msg: "هذا المنتج غير متوفر في المتجر الإلكتروني حالياً", isError: true });
      setTimeout(() => setCartToast(null), 3000);
      return;
    }
    const uid = session.user.id;
    const { error: insertError } = await supabase.from("cart_items").insert({ user_id: uid, product_id: pid, quantity: 1 });
    if (insertError) {
      const isUniqueViolation = insertError.code === "23505" || (insertError.message || "").includes("duplicate");
      if (!isUniqueViolation) {
        setCartToast({ msg: insertError.message || "حدث خطأ أثناء إضافة المنتج للسلة", isError: true });
        setTimeout(() => setCartToast(null), 3000);
        return;
      }
      const { data: row, error: fetchError } = await supabase.from("cart_items").select("id, quantity")
        .eq("user_id", uid).eq("product_id", pid).single();
      if (fetchError || !row) {
        setCartToast({ msg: "حدث خطأ أثناء تحديث الكمية في السلة", isError: true });
        setTimeout(() => setCartToast(null), 3000);
        return;
      }
      const { error: updateError } = await supabase.from("cart_items").update({ quantity: row.quantity + 1 }).eq("id", row.id);
      if (updateError) {
        setCartToast({ msg: updateError.message || "حدث خطأ أثناء تحديث الكمية في السلة", isError: true });
        setTimeout(() => setCartToast(null), 3000);
        return;
      }
    }
    const { count } = await supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", uid);
    setCartBadgeCount(count || 0);
    setCartToast({ msg: "تمت إضافة المنتج للسلة ✓" });
    setTimeout(() => setCartToast(null), 2000);
  };

  const bottomNav = [
    { id: "home", label: "الرئيسية", icon: "🏠" },
    { id: "shop", label: "المتجر", icon: "🛍️" },
    { id: "auctions", label: "المزادات", icon: "🏆" },
    { id: "garage", label: "مركبتي", icon: "🚗" },
    { id: "profile", label: "حسابي", icon: "👤" },
  ];

  if (loading) {
    return (
      <div dir="rtl" style={{
        minHeight: "100vh", background: T.navy, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", fontFamily: "'Cairo', 'Tajawal', sans-serif", gap: 12,
      }}>
        <div style={{ fontSize: 40 }}>🚗</div>
        <span style={{ color: T.textSecondary, fontSize: 13 }}>جارٍ التحميل...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Segoe UI', sans-serif" }}>
        <AuthScreen signUp={signUp} signIn={signIn} authError={authError} signInWithOAuth={signInWithOAuth} />
      </div>
    );
  }

  const showRoleSelection = session && profile && profile.role === "user" && !roleDone;
  if (showRoleSelection) {
    return (
      <div dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Segoe UI', sans-serif" }}>
        <RoleSelectionScreen session={session} onComplete={() => setRoleDone(true)} />
      </div>
    );
  }

  const screensWithBack = ["productDetail", "notifications", "cart", "diagnosis", "emergency", "request", "academy", "sellerDash", "admin", "sellerProfile", "myOrders", "favorites", "myReviews", "messages", "addresses", "payments", "sellerPublic", "comparison", "priceEstimator"];

  const renderScreen = () => {
    switch (currentScreen) {
      case "home": return <HomeScreen onNavigate={navigate} onProductView={handleProductView} onCartAdd={handleCartAdd} cartCount={cartBadgeCount} notifCount={unreadNotifCount} profile={profile} session={session} favSet={favSet} onFavToggle={toggleFavorite} />;
      case "shop": return <ShopScreen onProductView={handleProductView} onCartAdd={handleCartAdd} initialCategory={selectedCategory} favSet={favSet} onFavToggle={toggleFavorite} onCompare={handleCompare} compareSet={compareSet} />;
      case "auctions": return <AuctionsScreen onNavigate={navigate} session={session} />;
      case "garage": return <GarageScreen session={session} />;
      case "profile": return <ProfileScreen onLogout={signOut} onNavigate={navigate} profile={profile} session={session} />;
      case "productDetail": return <ProductDetailScreen product={selectedProduct} onBack={() => navigate(prevScreen)} onCartAdd={handleCartAdd} session={session} profile={profile} favSet={favSet} onFavToggle={toggleFavorite} onNavigate={navigate} onMsgContext={setMsgContext} />;
      case "messages": return <MessagesScreen session={session} msgContext={msgContext} onClearMsgContext={() => setMsgContext(null)} />;
      case "addresses": return <AddressesScreen />;
      case "payments": return <PaymentsScreen />;
      case "notifications": return <NotificationsScreen session={session} onUnreadChange={setUnreadNotifCount} />;
      case "cart": return <CartScreen session={session} onNavigate={navigate} onCartCountChange={setCartBadgeCount} profile={profile} />;
      case "diagnosis": return <DiagnosisScreen onCartAdd={handleCartAdd} session={session} />;
      case "emergency": return <EmergencyScreen session={session} profile={profile} />;
      case "request": return <PartRequestScreen session={session} profile={profile} />;
      case "academy": return <AcademyScreen />;
      case "sellerDash": return <SellerDashScreen session={session} profile={profile} />;
      case "myOrders": return <MyOrdersScreen session={session} />;
      case "favorites": return <FavoritesScreen session={session} onProductView={handleProductView} onCartAdd={handleCartAdd} favSet={favSet} onFavToggle={toggleFavorite} />;
      case "myReviews": return <MyReviewsScreen session={session} />;
      case "admin": return profile?.is_admin ? <AdminScreen /> : <HomeScreen onNavigate={navigate} onProductView={handleProductView} onCartAdd={handleCartAdd} cartCount={cartBadgeCount} profile={profile} session={session} favSet={favSet} onFavToggle={toggleFavorite} />;
      case "sellerPublic": return <SellerPublicScreen sellerId={selectedSellerId} onProductView={handleProductView} onCartAdd={handleCartAdd} session={session} onNavigate={navigate} favSet={favSet} onFavToggle={toggleFavorite} />;
      case "comparison": return <ComparisonScreen compareList={compareList} onClear={() => setCompareList([])} onRemove={(id) => setCompareList(prev => prev.filter(p => String(p.id) !== String(id)))} onCartAdd={handleCartAdd} />;
      case "priceEstimator": return <CarPriceEstimatorScreen session={session} onCartAdd={handleCartAdd} onProductView={handleProductView} />;
      default: return <HomeScreen onNavigate={navigate} onProductView={handleProductView} onCartAdd={handleCartAdd} cartCount={cartBadgeCount} profile={profile} session={session} favSet={favSet} onFavToggle={toggleFavorite} />;
    }
  };

  const showBackHeader = screensWithBack.includes(currentScreen);

  const SCREEN_ICONS = { productDetail: "🔧", notifications: "🔔", cart: "🛒", diagnosis: "🤖", emergency: "🚨", request: "📋", academy: "🎓", sellerDash: "🏪", admin: "🛡️", sellerProfile: "🏬", myOrders: "📦", favorites: "❤️", myReviews: "⭐", messages: "💬", addresses: "📍", payments: "💳", sellerPublic: "🏬", comparison: "⊕", priceEstimator: "💰" };
  const SCREEN_TITLES = { productDetail: "تفاصيل المنتج", notifications: "الإشعارات", cart: "السلة", diagnosis: "تشخيص الأعطال", emergency: "خدمات الطوارئ", request: "طلب قطعة", academy: "الأكاديمية", sellerDash: "لوحة البائع", admin: "لوحة الإدارة", sellerProfile: "ملف البائع", myOrders: "طلباتي", favorites: "مفضلاتي", myReviews: "مراجعاتي", messages: "رسائلي", addresses: "عناويني", payments: "طرق الدفع", sellerPublic: "ملف المتجر", comparison: "مقارنة المنتجات", priceEstimator: "تقدير السعر" };

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Segoe UI', sans-serif", background: "#060E1F", minHeight: "100vh", minHeight: "100dvh", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.navy}; }
        ::-webkit-scrollbar-thumb { background: ${T.navyBorder}; border-radius: 4px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        select option { background: ${T.navyCard}; }
      `}</style>

      {/* PWA INSTALL BANNER */}
      {showPwaBanner && pwaPrompt && (
        <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 999, background: T.gold, color: T.navy, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", fontSize: 13, fontWeight: 700 }}>
          <span>📲 ثبّت التطبيق على جهازك!</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { pwaPrompt.prompt(); setShowPwaBanner(false); }} style={{ background: T.navy, color: T.gold, border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12 }}>تثبيت</button>
            <button onClick={() => setShowPwaBanner(false)} style={{ background: "none", border: "none", color: T.navy, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>✕</button>
          </div>
        </div>
      )}

      {/* TOP HEADER for sub-screens */}
      {showBackHeader && (
        <div style={{ position: "sticky", top: 0, zIndex: 100, background: `${T.navy}EE`, backdropFilter: "blur(10px)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.navyBorder}` }}>
          <button onClick={() => navigate(prevScreen)} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textPrimary, fontSize: 18 }}>→</button>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
            <span style={{ fontSize: 18 }}>{SCREEN_ICONS[currentScreen]}</span>
            <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 16 }}>{SCREEN_TITLES[currentScreen]}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setLang(l => { const next = l === "ar" ? "en" : "ar"; localStorage.setItem("lang", next); return next; })} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 8, height: 32, padding: "0 8px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: T.textPrimary, fontFamily: "inherit" }}>{lang === "ar" ? "EN" : "AR"}</button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={{ paddingBottom: showBackHeader ? 20 : 90, minHeight: "100vh", paddingTop: showPwaBanner && pwaPrompt ? 44 : 0 }}>
        {renderScreen()}
      </main>

      {/* FLOATING COMPARISON BAR */}
      {compareList.length > 0 && !showBackHeader && (
        <div style={{ position: "fixed", bottom: 155, left: "50%", transform: "translateX(-50%)", zIndex: 200, background: T.navyCard, border: `1px solid ${T.gold}`, borderRadius: 16, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px #0008" }}>
          <span style={{ color: T.gold, fontWeight: 700, fontSize: 12 }}>⊕ مقارنة ({compareList.length}/3)</span>
          <div style={{ display: "flex", gap: 6 }}>
            {compareList.map(p => (
              <div key={p.id} style={{ position: "relative" }}>
                <span style={{ fontSize: 10, color: T.textSecondary, background: T.navyLight, borderRadius: 6, padding: "2px 6px", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{p.name?.slice(0, 8)}</span>
                <button onClick={() => setCompareList(prev => prev.filter(x => String(x.id) !== String(p.id)))} style={{ position: "absolute", top: -6, left: -4, background: T.red, border: "none", borderRadius: "50%", width: 14, height: 14, cursor: "pointer", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>✕</button>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("comparison")} style={{ background: T.gold, color: T.navy, border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 11 }}>قارن</button>
          <button onClick={() => setCompareList([])} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 13 }}>✕</button>
        </div>
      )}

      {/* SHORTCUT TOOLBAR (floating) */}
      {!showBackHeader && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 101, display: "flex", gap: 8, background: `${T.navyCard}CC`, backdropFilter: "blur(10px)", border: `1px solid ${T.navyBorder}`, borderRadius: 20, padding: "6px 10px" }}>
          {[
            { icon: "🤖", screen: "diagnosis", label: "تشخيص" },
            { icon: "🚨", screen: "emergency", label: "طوارئ" },
            { icon: "📋", screen: "request", label: "اطلب قطعة" },
            { icon: "🎓", screen: "academy", label: "الأكاديمية" },
            { icon: "💰", screen: "priceEstimator", label: "تقدير السعر" },
          ].map(item => (
            <button key={item.screen} onClick={() => navigate(item.screen)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 8px" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ color: T.textMuted, fontSize: 9, fontFamily: "inherit" }}>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* BOTTOM NAV */}
      {!showBackHeader && (
        <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: `${T.navyMid}F0`, backdropFilter: "blur(12px)", borderTop: `1px solid ${T.navyBorder}`, display: "flex", padding: "8px 0 12px", zIndex: 100 }}>
          {bottomNav.map(item => {
            const isActive = currentScreen === item.id;
            return (
              <button key={item.id} onClick={() => navigate(item.id)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 0", transition: "all 0.2s", position: "relative" }}>
                {item.id === "shop" && cartBadgeCount > 0 && (
                  <span style={{ position: "absolute", top: 2, right: "50%", transform: "translateX(8px)", minWidth: 16, height: 16, background: T.gold, color: T.navy, borderRadius: 8, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{cartBadgeCount}</span>
                )}
                <span style={{ fontSize: 22, opacity: isActive ? 1 : 0.5, transform: isActive ? "scale(1.2)" : "scale(1)", transition: "all 0.2s", display: "block" }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: isActive ? T.gold : T.textMuted, fontFamily: "inherit", fontWeight: isActive ? 700 : 400, transition: "color 0.2s" }}>{item.label}</span>
                {isActive && <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.gold, marginTop: 1 }} />}
              </button>
            );
          })}
        </nav>
      )}

      {/* CART TOAST */}
      {cartToast && (
        <div style={{ position: "fixed", bottom: 120, left: "50%", transform: "translateX(-50%)", zIndex: 500, background: cartToast.isError ? T.red : T.green, color: "#fff", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", boxShadow: "0 4px 16px #0006" }}>
          {cartToast.msg}
        </div>
      )}

    </div>
  );
}
