import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, Badge, Btn } from "../utils/components";
import { useVehicleListings } from "../useVehicleListings";
import { VEHICLE_STATUS, VEHICLE_STATUS_LABELS_AR, nextAllowedStatuses } from "../utils/vehicleStatus";
import VehicleFormScreen from "./VehicleFormScreen";

const STATUS_BADGE_COLOR = {
  [VEHICLE_STATUS.DRAFT]: T.textMuted,
  [VEHICLE_STATUS.PUBLISHED]: T.green,
  [VEHICLE_STATUS.UNPUBLISHED]: T.orange,
  [VEHICLE_STATUS.RESERVED]: T.blue,
  [VEHICLE_STATUS.SOLD]: T.purple,
  [VEHICLE_STATUS.ARCHIVED]: T.textMuted,
};

const STATUS_ACTION_LABELS = {
  [VEHICLE_STATUS.DRAFT]: "إرجاع كمسودة",
  [VEHICLE_STATUS.PUBLISHED]: "نشر",
  [VEHICLE_STATUS.UNPUBLISHED]: "إلغاء النشر",
  [VEHICLE_STATUS.RESERVED]: "وضع كمحجوزة",
  [VEHICLE_STATUS.SOLD]: "وضع كمباعة",
  [VEHICLE_STATUS.ARCHIVED]: "أرشفة",
};

// "My Vehicle Listings" — owner-only inventory management (User: own
// vehicles only / Dealer: manage own inventory, per the permission matrix in
// docs/VEHICLE_MANAGEMENT.md). Reuses VehicleFormScreen for both create and
// edit rather than duplicating a second form.
const VehicleManageScreen = ({ session, role }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); // "list" | "create" | "edit"
  const [editingListing, setEditingListing] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const { deleteListing, changeStatus } = useVehicleListings(session, role);

  const uid = session?.user?.id;

  const loadListings = useCallback(async () => {
    if (!uid) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("vehicle_listings")
      .select("*")
      .eq("owner_id", uid)
      .order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  }, [uid]);

  useEffect(() => { loadListings(); }, [loadListings]);

  const flash = (setter, text, isError = false) => {
    setter({ text, isError });
    setTimeout(() => setter(null), 3500);
  };

  const handleStatusChange = async (listing, toStatus) => {
    setActionError(null);
    const res = await changeStatus(listing, toStatus);
    if (!res.success) { flash(setActionError, res.error, true); return; }
    setListings(prev => prev.map(l => (l.id === listing.id ? res.data : l)));
    flash(setActionMsg, `تم تحديث الحالة إلى "${VEHICLE_STATUS_LABELS_AR[toStatus]}"`);
  };

  const handleDelete = async (listing) => {
    if (!window.confirm(`هل أنت متأكد من حذف إعلان "${listing.brand} ${listing.model}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    const res = await deleteListing(listing.id);
    if (!res.success) { flash(setActionError, res.error, true); return; }
    setListings(prev => prev.filter(l => l.id !== listing.id));
    flash(setActionMsg, "تم حذف الإعلان");
  };

  const handleSaved = (savedListing) => {
    setListings(prev => {
      const exists = prev.some(l => l.id === savedListing.id);
      return exists ? prev.map(l => (l.id === savedListing.id ? savedListing : l)) : [savedListing, ...prev];
    });
    setMode("list");
    setEditingListing(null);
    flash(setActionMsg, mode === "create" ? "تم إنشاء الإعلان كمسودة" : "تم حفظ التعديلات");
  };

  if (mode === "create" || mode === "edit") {
    return (
      <VehicleFormScreen
        session={session}
        role={role}
        listing={editingListing}
        onSaved={handleSaved}
        onCancel={() => { setMode("list"); setEditingListing(null); }}
      />
    );
  }

  if (!uid) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
        <p style={{ color: T.textSecondary }}>سجّل دخولك لإدارة إعلانات سياراتك</p>
      </div>
    );
  }

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: T.textMuted }}>جارٍ التحميل...</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🚙 سياراتي المعروضة للبيع</h2>
        <Btn size="sm" icon="+" onClick={() => setMode("create")}>إضافة</Btn>
      </div>

      {actionMsg && (
        <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>✓ {actionMsg.text}</div>
      )}
      {actionError && (
        <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13, fontWeight: 700 }}>⚠️ {actionError.text}</div>
      )}

      {listings.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚙</div>
          <p style={{ color: T.textSecondary, margin: "0 0 16px" }}>لا توجد سيارات معروضة للبيع بعد</p>
          <Btn size="sm" onClick={() => setMode("create")}>أضف سيارتك الأولى</Btn>
        </Card>
      ) : (
        listings.map(listing => (
          <Card key={listing.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              {listing.thumbnails?.[0] || listing.images?.[0]
                ? <img src={listing.thumbnails?.[0] || listing.images[0]} alt="" loading="lazy" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover" }} />
                : <div style={{ width: 64, height: 64, borderRadius: 12, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🚗</div>}
              <div style={{ flex: 1 }}>
                <div style={{ color: T.textPrimary, fontWeight: 800, fontSize: 15 }}>{listing.brand} {listing.model} {listing.trim || ""}</div>
                <div style={{ color: T.textSecondary, fontSize: 12 }}>{listing.year || "—"} · {Number(listing.price || 0).toLocaleString("ar-IQ")} {listing.currency}</div>
              </div>
              <Badge color={STATUS_BADGE_COLOR[listing.status]}>{VEHICLE_STATUS_LABELS_AR[listing.status]}</Badge>
            </div>
            {listing.priority && <Badge small color={T.gold}>⭐ أولوية النشر</Badge>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              <Btn size="sm" variant="ghost" onClick={() => { setEditingListing(listing); setMode("edit"); }}>✏️ تعديل</Btn>
              {nextAllowedStatuses(listing.status).map(toStatus => (
                <Btn key={toStatus} size="sm" variant={toStatus === VEHICLE_STATUS.PUBLISHED ? "primary" : "ghost"} onClick={() => handleStatusChange(listing, toStatus)}>
                  {STATUS_ACTION_LABELS[toStatus]}
                </Btn>
              ))}
              <Btn size="sm" variant="danger" onClick={() => handleDelete(listing)}>🗑️ حذف</Btn>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default VehicleManageScreen;
