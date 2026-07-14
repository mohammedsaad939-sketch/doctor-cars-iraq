import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, Btn, Input } from "../utils/components";

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

export default DiagnosisScreen;
