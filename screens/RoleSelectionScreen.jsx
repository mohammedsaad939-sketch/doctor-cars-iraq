import { useState } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Input, Btn } from "../utils/components";

const RoleSelectionScreen = ({ session, onComplete, refreshProfile }) => {
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
    // The app already has the old (pre-role-selection) profile in memory,
    // which would otherwise leave a freshly-onboarded dealer/trader locked out
    // of role-gated screens (e.g. sellerDash) until their next reload.
    await refreshProfile?.();
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

export default RoleSelectionScreen;
