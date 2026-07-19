import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, toWhatsAppNumber } from "../utils/theme";
import { Card, Badge, Btn, Select, Modal } from "../utils/components";
import { VEHICLE_STATUS, VEHICLE_STATUS_LABELS_AR } from "../utils/vehicleStatus";
import { IRAQI_GOVERNORATES } from "../utils/vehicleOptions";

// Public vehicle-showroom browse. Reachable by any authenticated session
// today (see docs/VEHICLE_MANAGEMENT.md for why true pre-login Guest access
// isn't wired into App.jsx's shell in this change) — the RLS policy backing
// this query already allows the `anon` role to read published listings, so
// the backend is Guest-ready independent of the current UI entry point.
const VehicleListingsScreen = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [governorate, setGovernorate] = useState("");
  const [selected, setSelected] = useState(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from("vehicle_listings")
      .select("*, profiles(full_name, phone)")
      .in("status", [VEHICLE_STATUS.PUBLISHED, VEHICLE_STATUS.RESERVED])
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60);
    if (governorate) query = query.eq("governorate", governorate);
    query.then(({ data }) => {
      setListings(data || []);
      setLoading(false);
    });
  }, [governorate]);

  const openDetail = (listing) => {
    setSelected(listing);
    setGalleryIdx(0);
  };

  const contactSeller = (listing) => {
    const num = toWhatsAppNumber(listing.profiles?.phone || "");
    if (!num) return;
    const text = encodeURIComponent(`مرحباً، أنا مهتم بسيارتك ${listing.brand} ${listing.model} ${listing.year || ""} المعروضة في دكتور السيارات.`);
    window.open(`https://wa.me/${num}?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🚙 معرض السيارات</h2>

      <Select label="" value={governorate} onChange={setGovernorate} options={IRAQI_GOVERNORATES} placeholder="كل المحافظات" icon="🗺️" />

      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: T.textMuted }}>جارٍ التحميل...</div>
      ) : listings.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚙</div>
          <p style={{ color: T.textSecondary, margin: 0 }}>لا توجد سيارات معروضة حالياً</p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {listings.map(listing => (
            <Card key={listing.id} onClick={() => openDetail(listing)} style={{ position: "relative" }}>
              {listing.priority && (
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2, background: `${T.gold}22`, color: T.gold, border: `1px solid ${T.gold}44`, borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>⭐ مميز</div>
              )}
              {listing.status === VEHICLE_STATUS.RESERVED && (
                <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2, background: T.blue, color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>محجوزة</div>
              )}
              <div style={{ height: 120, borderRadius: 12, background: T.navyLight, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                {listing.thumbnails?.[0] || listing.images?.[0]
                  ? <img src={listing.thumbnails?.[0] || listing.images[0]} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 36 }}>🚗</span>}
              </div>
              <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{listing.brand} {listing.model}</div>
              <div style={{ color: T.textSecondary, fontSize: 11, marginBottom: 6 }}>{listing.year || "—"} · {listing.city}</div>
              <div style={{ color: T.gold, fontWeight: 800, fontSize: 14 }}>
                {Number(listing.price || 0).toLocaleString("ar-IQ")} {listing.currency}
                {listing.negotiable && <span style={{ color: T.textMuted, fontWeight: 400, fontSize: 10 }}> (قابل للتفاوض)</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.brand} ${selected.model}` : ""}>
        {selected && (
          <>
            {selected.images?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <img src={selected.images[galleryIdx]} alt="" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12 }} />
                {selected.images.length > 1 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                    {selected.images.map((url, i) => (
                      <img key={url} src={selected.thumbnails?.[i] || url} alt="" onClick={() => setGalleryIdx(i)}
                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", cursor: "pointer", border: i === galleryIdx ? `2px solid ${T.gold}` : `1px solid ${T.navyBorder}` }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Badge color={selected.status === VEHICLE_STATUS.RESERVED ? T.blue : T.green}>{VEHICLE_STATUS_LABELS_AR[selected.status]}</Badge>
              <span style={{ color: T.gold, fontWeight: 900, fontSize: 18 }}>
                {Number(selected.price || 0).toLocaleString("ar-IQ")} {selected.currency}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                ["السنة", selected.year], ["الفئة", selected.trim], ["المحرك", selected.engine],
                ["سعة المحرك", selected.engine_size], ["القوة", selected.horsepower ? `${selected.horsepower} حصان` : null],
                ["ناقل الحركة", selected.transmission], ["نوع الوقود", selected.fuel_type], ["نظام الدفع", selected.drive_type],
                ["اللون الخارجي", selected.exterior_color], ["اللون الداخلي", selected.interior_color],
                ["المسافة المقطوعة", selected.mileage ? `${Number(selected.mileage).toLocaleString("ar-IQ")} كم` : null],
                ["الموقع", `${selected.governorate || ""} - ${selected.city || ""}`],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} style={{ background: T.navyMid, borderRadius: 10, padding: 10 }}>
                  <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 4 }}>{label}</div>
                  <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{value}</div>
                </div>
              ))}
            </div>

            {selected.features?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {selected.features.map(f => <Badge key={f} small color={T.blue}>{f}</Badge>)}
              </div>
            )}

            {selected.description && <p style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>{selected.description}</p>}

            {selected.video_url && (
              <video src={selected.video_url} controls style={{ width: "100%", borderRadius: 12, marginBottom: 14 }} />
            )}

            {selected.profiles?.phone && (
              <Btn fullWidth variant="green" icon="💬" onClick={() => contactSeller(selected)}>تواصل عبر واتساب</Btn>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default VehicleListingsScreen;
