import { useState } from "react";
import { T } from "../utils/theme";
import { Card, Btn, Input, Select, Section } from "../utils/components";
import { useVehicleListings } from "../useVehicleListings";
import { isValidVinFormat, vinChecksumMatches, isValidPrice } from "../utils/validators";
import { IRAQI_GOVERNORATES, FUEL_TYPES, TRANSMISSIONS, DRIVE_TYPES, VEHICLE_CONDITIONS, CURRENCIES, VEHICLE_FEATURES } from "../utils/vehicleOptions";
import { LIVE_STATUSES, getPublishBlockers } from "../utils/vehicleStatus";

const REQUIRED_FIELDS = ["brand", "model", "year", "price", "governorate", "city"];

const emptyForm = (listing) => ({
  brand: listing?.brand || "",
  model: listing?.model || "",
  trim: listing?.trim || "",
  year: listing?.year ? String(listing.year) : "",
  vin: listing?.vin || "",
  engine: listing?.engine || "",
  engine_size: listing?.engine_size || "",
  horsepower: listing?.horsepower ? String(listing.horsepower) : "",
  transmission: listing?.transmission || "",
  fuel_type: listing?.fuel_type || "",
  drive_type: listing?.drive_type || "",
  exterior_color: listing?.exterior_color || "",
  interior_color: listing?.interior_color || "",
  mileage: listing?.mileage != null ? String(listing.mileage) : "",
  condition: listing?.condition || "",
  price: listing?.price != null ? String(listing.price) : "",
  negotiable: listing?.negotiable ?? false,
  currency: listing?.currency || "IQD",
  governorate: listing?.governorate || "",
  city: listing?.city || "",
  gps_lat: listing?.gps_lat != null ? String(listing.gps_lat) : "",
  gps_lng: listing?.gps_lng != null ? String(listing.gps_lng) : "",
  description: listing?.description || "",
  features: listing?.features || [],
});

// Create/Edit form for a single vehicle listing. Saving always writes as a
// draft (or preserves the current status when editing) — publishing is a
// separate, explicit action from VehicleManageScreen going through
// utils/vehicleStatus.js#requestStatusTransition, so an incomplete edit never
// accidentally stays live with stale data mid-save.
const VehicleFormScreen = ({ session, role, listing, onSaved, onCancel }) => {
  const isEditing = !!listing;
  const { saving, uploadingImages, checkDuplicateVin, uploadListingImages, uploadListingVideo, uploadListingDocuments, createListing, updateListing } = useVehicleListings(session, role);

  const [form, setForm] = useState(() => emptyForm(listing));
  const [imageItems, setImageItems] = useState(() =>
    (listing?.images || []).map((url, i) => ({ id: url, type: "existing", url, thumbUrl: listing?.thumbnails?.[i] || url }))
  );
  const [videoFile, setVideoFile] = useState(null);
  const [existingVideoUrl] = useState(listing?.video_url || null);
  const [docFiles, setDocFiles] = useState([]);
  const [existingDocs] = useState(listing?.documents || []);
  const [dragIndex, setDragIndex] = useState(null);
  const [error, setError] = useState(null);
  const [vinHint, setVinHint] = useState(null);
  const [locating, setLocating] = useState(false);

  const set = (key) => (value) => setForm(f => ({ ...f, [key]: value }));

  const handleImagesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    setImageItems(prev => [
      ...prev,
      ...files.map((file, i) => ({ id: `new-${Date.now()}-${i}`, type: "new", file, previewUrl: URL.createObjectURL(file) })),
    ]);
  };

  const removeImage = (id) => {
    setImageItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item?.type === "new") URL.revokeObjectURL(item.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const setCover = (id) => {
    setImageItems(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.unshift(item);
      return next;
    });
  };

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    setImageItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
  };

  const toggleFeature = (feature) => {
    setForm(f => ({
      ...f,
      features: f.features.includes(feature) ? f.features.filter(x => x !== feature) : [...f.features, feature],
    }));
  };

  const handleVinBlur = async () => {
    if (!form.vin.trim()) { setVinHint(null); return; }
    if (!isValidVinFormat(form.vin)) {
      setVinHint({ ok: false, text: "رقم الشاصي (VIN) يجب أن يتكون من 17 خانة (بدون الأحرف I أو O أو Q)" });
      return;
    }
    if (!vinChecksumMatches(form.vin)) {
      // Soft hint only -- see utils/validators.js#vinChecksumMatches for why
      // this never blocks submission (most Iraqi-market imports don't use
      // the North American check-digit standard).
      setVinHint({ ok: true, warn: true, text: "تنبيه: رقم التحقق غير مطابق لمعيار أمريكا الشمالية (شائع في السيارات المستوردة من الخليج/اليابان/كوريا) — تحقق من الرقم يدوياً" });
    } else {
      setVinHint({ ok: true, warn: false, text: "✓ تنسيق ورقم التحقق صحيحان" });
    }
    const { duplicate, error: dupErr } = await checkDuplicateVin(form.vin, listing?.id);
    if (dupErr) return;
    if (duplicate) setVinHint({ ok: false, text: "رقم الشاصي (VIN) هذا مستخدم بالفعل في إعلان آخر" });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, gps_lat: String(pos.coords.latitude.toFixed(6)), gps_lng: String(pos.coords.longitude.toFixed(6)) }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const validate = () => {
    const missing = REQUIRED_FIELDS.filter(k => !String(form[k] || "").trim());
    if (missing.length > 0) return "الرجاء تعبئة الحقول المطلوبة (الشركة المصنعة، الموديل، السنة، السعر، المحافظة، المدينة)";
    if (form.vin && !isValidVinFormat(form.vin)) return "رقم الشاصي (VIN) غير صالح";
    if (!isValidPrice(form.price)) return "السعر غير صالح";
    if (form.year && (Number(form.year) < 1950 || Number(form.year) > new Date().getFullYear() + 1)) return "سنة الصنع غير صالحة";
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    if (form.vin) {
      const { duplicate, error: dupErr } = await checkDuplicateVin(form.vin, listing?.id);
      if (!dupErr && duplicate) { setError("رقم الشاصي (VIN) هذا مستخدم بالفعل في إعلان آخر"); return; }
    }

    const newFiles = imageItems.filter(i => i.type === "new").map(i => i.file);
    let uploadedImages = [];
    let uploadedThumbs = [];
    if (newFiles.length > 0) {
      const res = await uploadListingImages(newFiles);
      if (!res.success) { setError(res.error); return; }
      uploadedImages = res.images;
      uploadedThumbs = res.thumbnails;
    }
    let newIdx = 0;
    const finalImages = [];
    const finalThumbnails = [];
    for (const item of imageItems) {
      if (item.type === "existing") {
        finalImages.push(item.url);
        finalThumbnails.push(item.thumbUrl);
      } else {
        finalImages.push(uploadedImages[newIdx]);
        finalThumbnails.push(uploadedThumbs[newIdx]);
        newIdx++;
      }
    }

    let videoUrl = existingVideoUrl;
    if (videoFile) {
      const res = await uploadListingVideo(videoFile);
      if (!res.success) { setError(res.error); return; }
      videoUrl = res.url;
    }

    let documentUrls = existingDocs;
    if (docFiles.length > 0) {
      const res = await uploadListingDocuments(docFiles);
      if (!res.success) { setError(res.error); return; }
      documentUrls = [...existingDocs, ...res.urls];
    }

    const fields = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      trim: form.trim.trim() || null,
      year: Number(form.year),
      vin: form.vin ? form.vin.trim().toUpperCase() : null,
      engine: form.engine.trim() || null,
      engine_size: form.engine_size.trim() || null,
      horsepower: form.horsepower ? Number(form.horsepower) : null,
      transmission: form.transmission || null,
      fuel_type: form.fuel_type || null,
      drive_type: form.drive_type || null,
      exterior_color: form.exterior_color.trim() || null,
      interior_color: form.interior_color.trim() || null,
      mileage: form.mileage ? Number(form.mileage) : null,
      condition: form.condition || null,
      price: Number(String(form.price).replace(/,/g, "")),
      negotiable: !!form.negotiable,
      currency: form.currency,
      governorate: form.governorate,
      city: form.city.trim(),
      gps_lat: form.gps_lat ? Number(form.gps_lat) : null,
      gps_lng: form.gps_lng ? Number(form.gps_lng) : null,
      description: form.description.trim() || null,
      features: form.features,
      images: finalImages,
      thumbnails: finalThumbnails,
      video_url: videoUrl,
      documents: documentUrls,
    };

    // A listing that's currently live (published/reserved) must stay
    // complete while it's live -- the publish-completeness rule isn't just a
    // one-time gate at the moment of publishing (see
    // utils/vehicleStatus.js#getPublishBlockers and LIVE_STATUSES).
    if (isEditing && LIVE_STATUSES.includes(listing.status)) {
      const blockers = getPublishBlockers({ ...listing, ...fields });
      if (blockers.length > 0) {
        setError(`هذا الإعلان منشور حالياً — ${blockers.join(" · ")}، أو قم بإلغاء نشره أولاً من "إدارة سياراتي"`);
        return;
      }
    }

    const res = isEditing ? await updateListing(listing.id, fields) : await createListing(fields);
    if (!res.success) { setError(res.error); return; }
    onSaved(res.data);
  };

  const busy = saving || uploadingImages;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>
        {isEditing ? "تعديل إعلان السيارة" : "إضافة سيارة للبيع"}
      </h2>

      <Section title="المعلومات الأساسية">
        <Input label="الشركة المصنعة *" value={form.brand} onChange={set("brand")} placeholder="Toyota" icon="🏭" />
        <Input label="الموديل *" value={form.model} onChange={set("model")} placeholder="Camry" icon="🚗" />
        <Input label="الفئة (Trim)" value={form.trim} onChange={set("trim")} placeholder="GLE" icon="✨" />
        <Input label="سنة الصنع *" value={form.year} onChange={set("year")} type="number" placeholder="2020" icon="📅" />
        <Input label="رقم الشاصي (VIN)" value={form.vin} onChange={v => { set("vin")(v); setVinHint(null); }} onBlur={handleVinBlur} placeholder="17 خانة" icon="🔢" />
        {vinHint && (
          <div style={{ margin: "-8px 0 14px", fontSize: 11, color: vinHint.ok ? (vinHint.warn ? T.warning : T.green) : T.red }}>{vinHint.text}</div>
        )}
        <Select label="الحالة" value={form.condition} onChange={set("condition")} options={VEHICLE_CONDITIONS} icon="🏷️" />
      </Section>

      <Section title="المواصفات">
        <Input label="نوع المحرك" value={form.engine} onChange={set("engine")} placeholder="V6" icon="⚙️" />
        <Input label="سعة المحرك" value={form.engine_size} onChange={set("engine_size")} placeholder="2.5L" icon="🔧" />
        <Input label="قوة المحرك (حصان)" value={form.horsepower} onChange={set("horsepower")} type="number" placeholder="180" icon="💪" />
        <Select label="ناقل الحركة" value={form.transmission} onChange={set("transmission")} options={TRANSMISSIONS} icon="⚡" />
        <Select label="نوع الوقود" value={form.fuel_type} onChange={set("fuel_type")} options={FUEL_TYPES} icon="⛽" />
        <Select label="نظام الدفع" value={form.drive_type} onChange={set("drive_type")} options={DRIVE_TYPES} icon="🛞" />
        <Input label="اللون الخارجي" value={form.exterior_color} onChange={set("exterior_color")} placeholder="أبيض" icon="🎨" />
        <Input label="اللون الداخلي" value={form.interior_color} onChange={set("interior_color")} placeholder="أسود" icon="🪑" />
        <Input label="المسافة المقطوعة (كم)" value={form.mileage} onChange={set("mileage")} type="number" placeholder="85000" icon="📍" />
      </Section>

      <Section title="السعر">
        <Input label="السعر *" value={form.price} onChange={set("price")} type="number" placeholder="25000000" icon="💰" />
        <Select label="العملة" value={form.currency} onChange={set("currency")} options={CURRENCIES} icon="💱" />
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <input type="checkbox" id="negotiable" checked={form.negotiable} onChange={e => set("negotiable")(e.target.checked)} style={{ accentColor: T.gold }} />
          <label htmlFor="negotiable" style={{ color: T.textSecondary, fontSize: 13, cursor: "pointer" }}>السعر قابل للتفاوض</label>
        </div>
      </Section>

      <Section title="الموقع">
        <Select label="المحافظة *" value={form.governorate} onChange={set("governorate")} options={IRAQI_GOVERNORATES} icon="🗺️" />
        <Input label="المدينة / المنطقة *" value={form.city} onChange={set("city")} placeholder="الكرادة" icon="📍" />
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <div style={{ flex: 1 }}><Input label="خط العرض" value={form.gps_lat} onChange={set("gps_lat")} placeholder="33.3152" icon="📌" /></div>
          <div style={{ flex: 1 }}><Input label="خط الطول" value={form.gps_lng} onChange={set("gps_lng")} placeholder="44.3661" icon="📌" /></div>
        </div>
        <Btn size="sm" variant="ghost" onClick={handleUseMyLocation} disabled={locating}>{locating ? "جارٍ التحديد..." : "📍 استخدم موقعي الحالي"}</Btn>
      </Section>

      <Section title="الوصف والمزايا">
        <textarea value={form.description} onChange={e => set("description")(e.target.value)} placeholder="تفاصيل إضافية عن السيارة..." rows={4}
          style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 14 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {VEHICLE_FEATURES.map(feature => (
            <button key={feature} onClick={() => toggleFeature(feature)} style={{
              padding: "6px 12px", borderRadius: 20, border: `1px solid ${form.features.includes(feature) ? T.gold : T.navyBorder}`,
              background: form.features.includes(feature) ? `${T.gold}22` : "transparent",
              color: form.features.includes(feature) ? T.gold : T.textSecondary, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}>{feature}</button>
          ))}
        </div>
      </Section>

      <Section title="الصور" subtitle="اسحب الصور لإعادة ترتيبها — الصورة الأولى هي صورة الغلاف">
        {imageItems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            {imageItems.map((item, i) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                style={{ position: "relative", width: 84, height: 84, borderRadius: 10, overflow: "hidden", cursor: "grab", border: i === 0 ? `2px solid ${T.gold}` : `1px solid ${T.navyBorder}` }}
              >
                <img src={item.type === "existing" ? item.thumbUrl : item.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {i === 0 && (
                  <div style={{ position: "absolute", bottom: 2, right: 2, background: `${T.gold}22`, color: T.gold, border: `1px solid ${T.gold}44`, borderRadius: 8, padding: "1px 6px", fontSize: 9, fontWeight: 700 }}>غلاف</div>
                )}
                <div style={{ position: "absolute", top: 2, left: 2, display: "flex", gap: 2 }}>
                  <button onClick={() => removeImage(item.id)} title="حذف" style={{ background: T.red, border: "none", borderRadius: "50%", width: 18, height: 18, color: "#fff", fontSize: 10, cursor: "pointer" }}>✕</button>
                </div>
                {i !== 0 && (
                  <button onClick={() => setCover(item.id)} title="اجعلها الغلاف" style={{ position: "absolute", bottom: 2, right: 2, background: `${T.navy}CC`, border: "none", borderRadius: 6, padding: "2px 6px", color: T.gold, fontSize: 9, cursor: "pointer" }}>⭐ غلاف</button>
                )}
              </div>
            ))}
          </div>
        )}
        <label style={{ display: "block", background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: 12, textAlign: "center", cursor: "pointer", color: T.textMuted, fontSize: 13 }}>
          📷 اضغط لإضافة صور (يمكن اختيار أكثر من صورة)
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImagesSelected} style={{ display: "none" }} />
        </label>
      </Section>

      <Section title="فيديو ووثائق (اختياري)">
        <label style={{ display: "block", background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: 12, textAlign: "center", cursor: "pointer", color: T.textMuted, fontSize: 13, marginBottom: 12 }}>
          🎥 {videoFile ? videoFile.name : existingVideoUrl ? "تغيير الفيديو" : "أضف فيديو للسيارة"}
          <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
        </label>
        <label style={{ display: "block", background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: 12, textAlign: "center", cursor: "pointer", color: T.textMuted, fontSize: 13 }}>
          📄 أضف مستندات (استمارة، عقد بيع...)
          <input type="file" multiple onChange={e => setDocFiles(Array.from(e.target.files || []))} style={{ display: "none" }} />
        </label>
        {(existingDocs.length > 0 || docFiles.length > 0) && (
          <div style={{ marginTop: 10, color: T.textSecondary, fontSize: 12 }}>
            {existingDocs.length + docFiles.length} مستند مرفق
          </div>
        )}
      </Section>

      {error && (
        <Card style={{ marginBottom: 16, background: `${T.red}1A`, border: `1px solid ${T.red}44` }}>
          <span style={{ color: T.red, fontSize: 13 }}>⚠️ {error}</span>
        </Card>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <Btn variant="ghost" onClick={onCancel} disabled={busy}>إلغاء</Btn>
        <Btn fullWidth onClick={handleSubmit} disabled={busy}>
          {uploadingImages ? "جارٍ رفع الصور..." : saving ? "جارٍ الحفظ..." : "حفظ كمسودة"}
        </Btn>
      </div>
    </div>
  );
};

export default VehicleFormScreen;
