import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Modal, Input, Btn, Card, Badge, Section } from "../utils/components";

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

export default GarageScreen;
