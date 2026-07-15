import { useState } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, Input, Btn } from "../utils/components";

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

export default PartRequestScreen;
