import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, Badge } from "../utils/components";

const OWNER = {
  name: "Mohammed Saad",
  nameAr: "محمد سعد",
  signature: "10007",
  year: "2025",
};

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
              <button onClick={() => { const msg = `انضم لدكتور السيارات! كود الإحالة: ${profile.referral_code}`; window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer"); }} style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 8, padding: "4px 10px", color: T.green, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>مشاركة</button>
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

export default ProfileScreen;
