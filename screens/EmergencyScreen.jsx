import { useState } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Modal, Input, Btn, Card, Badge, MOCK } from "../utils/components";

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
        window.open(`https://maps.google.com?q=${pos.coords.latitude},${pos.coords.longitude}`, "_blank", "noopener,noreferrer");
        setFormData(f => ({ ...f, location: `${pos.coords.latitude.toFixed(5)},${pos.coords.longitude.toFixed(5)}` }));
      }, () => window.open("https://maps.google.com", "_blank", "noopener,noreferrer"));
    } else {
      window.open("https://maps.google.com", "_blank", "noopener,noreferrer");
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

export default EmergencyScreen;
