// v-redeploy
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "./supabaseClient";
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
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════
const T = {
  navy: "#060E1F",
  navyMid: "#0A1628",
  navyCard: "#0F1F3D",
  navyLight: "#162040",
  navyBorder: "#1E3A6E",
  gold: "#F59E0B",
  goldLight: "#FCD34D",
  goldDark: "#D97706",
  blue: "#3B82F6",
  blueDark: "#1D4ED8",
  green: "#10B981",
  red: "#EF4444",
  orange: "#F97316",
  purple: "#8B5CF6",
  textPrimary: "#E8EAED",
  textSecondary: "#8B9DC3",
  textMuted: "#4B6080",
};

// ═══════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════
const MOCK = {
  products: [
    { id: 1, name: "فلتر هواء تويوتا كامري 2018-2022", price: 15000, oldPrice: 22000, category: "فلاتر", seller: "محل النجار للغيار", sellerVerified: true, rating: 4.8, reviews: 124, city: "بغداد", image: "🔧", condition: "جديد", stock: 12, partNo: "TYT-AF-2022" },
    { id: 2, name: "طقم فرامل كيا سيراتو أمامية", price: 45000, oldPrice: 60000, category: "فرامل", seller: "الخليج لقطع الغيار", sellerVerified: true, rating: 4.6, reviews: 89, city: "البصرة", image: "⚙️", condition: "جديد", stock: 5, partNo: "KIA-BR-001" },
    { id: 3, name: "بطارية Varta 74Ah", price: 85000, oldPrice: null, category: "بطاريات", seller: "البطاريات الممتازة", sellerVerified: false, rating: 4.9, reviews: 203, city: "أربيل", image: "🔋", condition: "جديد", stock: 30, partNo: "VAR-74-AGM" },
    { id: 4, name: "إطارات Bridgestone 205/55R16", price: 120000, oldPrice: 145000, category: "إطارات", seller: "مركز الإطارات الوطني", sellerVerified: true, rating: 4.7, reviews: 67, city: "النجف", image: "🛞", condition: "جديد", stock: 8, partNo: "BRG-205-55-16" },
    { id: 5, name: "زيت موتور Shell Helix 5W-30", price: 35000, oldPrice: 40000, category: "زيوت", seller: "مستودع النفط العراقي", sellerVerified: true, rating: 4.5, reviews: 312, city: "بغداد", image: "🛢️", condition: "جديد", stock: 50, partNo: "SHL-HX-5W30" },
    { id: 6, name: "كاميرا خلفية Honda Civic", price: 28000, oldPrice: null, category: "إكسسوار", seller: "الإلكترونيات الحديثة", sellerVerified: false, rating: 4.3, reviews: 45, city: "كربلاء", image: "📷", condition: "جديد", stock: 15, partNo: "HND-CAM-CV" },
  ],
  categories: [
    { id: 1, name: "قطع الغيار", icon: "🔧", color: T.blue, count: 15420 },
    { id: 2, name: "الإطارات", icon: "🛞", color: T.green, count: 3200 },
    { id: 3, name: "البطاريات", icon: "🔋", color: T.gold, count: 890 },
    { id: 4, name: "الزيوت", icon: "🛢️", color: T.orange, count: 1100 },
    { id: 5, name: "إكسسوارات", icon: "✨", color: T.purple, count: 4500 },
    { id: 6, name: "العدد والأدوات", icon: "🔩", color: T.red, count: 2300 },
    { id: 7, name: "خدمات الورش", icon: "🏪", color: "#06B6D4", count: 720 },
    { id: 8, name: "السيارات", icon: "🚗", color: "#EC4899", count: 1850 },
    { id: 9, name: "المزادات", icon: "🏆", color: T.gold, count: 340 },
    { id: 10, name: "الجملة", icon: "📦", color: "#14B8A6", count: 980 },
    { id: 11, name: "الطوارئ", icon: "🚨", color: T.red, count: 150 },
    { id: 12, name: "الأكاديمية", icon: "🎓", color: "#8B5CF6", count: 210 },
  ],
  auctions: [
    { id: 1, title: "تويوتا لاندكروزر 2019 - حالة ممتازة", currentBid: 32000000, minBid: 500000, bids: 47, timeLeft: "02:14:33", image: "🚙", category: "سيارات", seller: "معرض النخيل" },
    { id: 2, title: "هيونداي إيلانترا 2021 - فل كامل", currentBid: 18500000, minBid: 250000, bids: 23, timeLeft: "05:42:10", image: "🚗", category: "سيارات", seller: "معرض الفرات" },
    { id: 3, title: "كومبرسر صناعي 150 ليتر", currentBid: 850000, minBid: 50000, bids: 12, timeLeft: "01:05:55", image: "⚙️", category: "معدات", seller: "أدوات المحترفين" },
  ],
  sellers: [
    { id: 1, name: "محل النجار للغيار", logo: "🏪", city: "بغداد", verified: true, rating: 4.8, sales: 2340, products: 450, type: "مفرد", since: "2015" },
    { id: 2, name: "الخليج لقطع الغيار", logo: "🏬", city: "البصرة", verified: true, rating: 4.7, sales: 5120, products: 890, type: "جملة", since: "2010" },
    { id: 3, name: "وكالة تويوتا العراق", logo: "🏢", city: "بغداد", verified: true, rating: 4.9, sales: 12000, products: 2300, type: "وكالة", since: "2005" },
  ],
  workshops: [
    { id: 1, name: "ورشة الأستاذ أحمد", type: "ميكانيك", city: "بغداد", rating: 4.9, distance: "1.2 كم", available: true, phone: "07701234567" },
    { id: 2, name: "مركز كهرباء السيارات المتقدم", type: "كهرباء", city: "بغداد", rating: 4.7, distance: "2.8 كم", available: true, phone: "07801234567" },
    { id: 3, name: "مركز السمكرة والصبغ الحديث", type: "سمكرة وصبغ", city: "بغداد", rating: 4.5, distance: "4.1 كم", available: false, phone: "07901234567" },
  ],
  emergencyServices: [
    { id: 1, name: "سطحة الإنقاذ العراقي", icon: "🚛", type: "سطحة وسحب", available: true, eta: "12 دقيقة", rating: 4.8, price: "15,000-25,000 د.ع" },
    { id: 2, name: "بطاريات متنقلة - طوارئ 24/7", icon: "🔋", type: "بطارية متنقلة", available: true, eta: "8 دقائق", rating: 4.9, price: "10,000 د.ع" },
    { id: 3, name: "ميكانيكي الطوارئ", icon: "🔧", type: "ميكانيك متنقل", available: true, eta: "20 دقيقة", rating: 4.6, price: "حسب الحالة" },
    { id: 4, name: "تبديل الإطارات الطارئ", icon: "🛞", type: "إطارات متنقل", available: false, eta: "—", rating: 4.7, price: "8,000 د.ع" },
  ],
  vehicles: [
    { id: 1, make: "Toyota", model: "Camry", year: 2019, plate: "بغداد - أ 12345", color: "أبيض", lastService: "2024-09-15", nextService: "2025-03-15", km: 85000, status: "جيدة" },
    { id: 2, make: "Hyundai", model: "Elantra", year: 2021, plate: "بغداد - ب 54321", color: "رمادي", lastService: "2024-11-01", nextService: "2025-05-01", km: 42000, status: "تحتاج صيانة" },
  ],
  notifications: [
    { id: 1, type: "order", title: "تم شحن طلبك", body: "طلب #1023 - فلتر هواء في الطريق إليك", time: "منذ 5 دقائق", read: false },
    { id: 2, type: "auction", title: "مزاد ينتهي قريباً", body: "المزاد على لاندكروزر 2019 ينتهي خلال ساعتين", time: "منذ 20 دقيقة", read: false },
    { id: 3, type: "message", title: "رسالة من البائع", body: "أرسل لك البائع النجار تأكيداً للطلب", time: "منذ ساعة", read: true },
    { id: 4, type: "service", title: "تذكير صيانة", body: "كامري 2019 - موعد تغيير الزيت قريب", time: "منذ يوم", read: true },
  ],
  courses: [
    { id: 1, title: "أساسيات ميكانيك السيارات", instructor: "م. كريم المهندس", students: 1240, rating: 4.9, lessons: 24, duration: "12 ساعة", price: 75000, level: "مبتدئ" },
    { id: 2, title: "تشخيص أعطال الكهرباء", instructor: "م. علي الكهربائي", students: 890, rating: 4.7, lessons: 18, duration: "9 ساعة", price: 95000, level: "متوسط" },
    { id: 3, title: "إدارة محلات قطع الغيار", instructor: "أ. محمد التاجر", students: 560, rating: 4.8, lessons: 15, duration: "8 ساعة", price: 120000, level: "متقدم" },
  ],
  marketStats: [
    { label: "قطع الغيار الأكثر طلباً", value: "فلاتر الزيت", icon: "🔧" },
    { label: "السيارة الأكثر انتشاراً", value: "تويوتا كورولا", icon: "🚗" },
    { label: "المحافظة الأكثر نشاطاً", value: "بغداد", icon: "📍" },
    { label: "متوسط سعر القطعة", value: "47,000 د.ع", icon: "💰" },
  ],
};

// ═══════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════
const Badge = ({ children, color = T.gold, small = false }) => (
  <span style={{
    background: `${color}22`, color, border: `1px solid ${color}44`,
    borderRadius: 20, padding: small ? "1px 8px" : "3px 10px",
    fontSize: small ? 10 : 11, fontWeight: 700, display: "inline-block",
    whiteSpace: "nowrap"
  }}>{children}</span>
);

const Stars = ({ rating, size = 12 }) => {
  const full = Math.floor(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= full ? T.gold : T.navyBorder }}>★</span>
      ))}
    </span>
  );
};

const isImageUrl = (v) => typeof v === "string" && v.startsWith("http");

const toWhatsAppNumber = (phone) => {
  if (!phone) return "";
  let d = String(phone).replace(/[\s\-()]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("964")) return d;
  if (d.startsWith("0")) return "964" + d.slice(1);
  return "964" + d;
};

const relativeTime = (iso) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return "منذ لحظات";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 172800) return "أمس";
  return `منذ ${Math.floor(diff / 86400)} يوم`;
};

const Btn = ({ children, onClick, variant = "primary", size = "md", disabled = false, fullWidth = false, icon = null }) => {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, color: T.navy, border: "none" },
    secondary: { background: "transparent", color: T.gold, border: `1px solid ${T.gold}` },
    danger: { background: `${T.red}22`, color: T.red, border: `1px solid ${T.red}44` },
    ghost: { background: `${T.textSecondary}11`, color: T.textPrimary, border: `1px solid ${T.navyBorder}` },
    blue: { background: `linear-gradient(135deg, ${T.blue}, ${T.blueDark})`, color: "#fff", border: "none" },
    green: { background: `linear-gradient(135deg, ${T.green}, #059669)`, color: "#fff", border: "none" },
  };
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 12, borderRadius: 8 },
    md: { padding: "10px 18px", fontSize: 14, borderRadius: 10 },
    lg: { padding: "14px 24px", fontSize: 16, borderRadius: 12 },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...styles[variant], ...sizes[size],
      fontFamily: "inherit", fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1, width: fullWidth ? "100%" : "auto",
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
      transition: "all 0.2s", outline: "none", whiteSpace: "nowrap",
    }}>{icon && <span>{icon}</span>}{children}</button>
  );
};

const Card = ({ children, style = {}, onClick = null }) => (
  <div onClick={onClick} style={{
    background: T.navyCard, border: `1px solid ${T.navyBorder}`,
    borderRadius: 16, padding: 16, cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s", ...style,
  }}>{children}</div>
);

const Input = ({ label, value, onChange, placeholder = "", type = "text", icon = null }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>{label}</label>}
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`,
          borderRadius: 10, padding: `11px ${icon ? 42 : 14}px 11px 14px`, color: T.textPrimary,
          fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
        }} />
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: T.navyMid, border: `1px solid ${T.navyBorder}`, borderRadius: 20, padding: 24, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textSecondary, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Tabs = ({ tabs, active, onChange }) => (
  <div style={{ display: "flex", gap: 8, padding: "4px", background: T.navyLight, borderRadius: 12, marginBottom: 20, overflowX: "auto" }}>
    {tabs.map(tab => (
      <button key={tab.id} onClick={() => onChange(tab.id)} style={{
        flex: 1, minWidth: "fit-content", padding: "8px 14px", borderRadius: 10, border: "none",
        background: active === tab.id ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : "transparent",
        color: active === tab.id ? T.navy : T.textSecondary,
        fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}>{tab.label}</button>
    ))}
  </div>
);

const Section = ({ title, subtitle, action, children }) => (
  <div style={{ marginBottom: 28 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
      <div>
        <h3 style={{ margin: 0, color: T.textPrimary, fontSize: 17, fontWeight: 800 }}>{title}</h3>
        {subtitle && <p style={{ margin: "3px 0 0", color: T.textSecondary, fontSize: 12 }}>{subtitle}</p>}
      </div>
      {action && <button onClick={action.onClick} style={{ background: "none", border: "none", color: T.gold, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{action.label} ←</button>}
    </div>
    {children}
  </div>
);

// ═══════════════════════════════════════════════════════
// AD CAROUSEL
// ═══════════════════════════════════════════════════════
const AdCarousel = ({ onProductView, onNavigate }) => {
  const [ads, setAds] = useState([]);
  const [idx, setIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    supabase.from("ads").select("id,title,image_url,link_type,link_target_id,external_url").order("sort_order", { ascending: true }).then(({ data }) => {
      setAds(data || []);
    });
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % ads.length), 5000);
    return () => clearInterval(t);
  }, [ads.length]);

  const handleTap = async (ad) => {
    if (ad.link_type === "external" && ad.external_url) {
      window.open(ad.external_url, "_blank");
    } else if (ad.link_type === "product" && ad.link_target_id) {
      const { data } = await supabase.from("products").select("*, categories(name)").eq("id", ad.link_target_id).maybeSingle();
      if (data) onProductView({ ...data, image: Array.isArray(data.images) ? (data.images[0] || "📦") : (data.images || "📦"), category: data.categories?.name || "", oldPrice: data.old_price || null, rating: data.rating || 0, reviews: 0 });
    } else if (ad.link_type === "seller_store") {
      onNavigate("sellerProfile");
    }
  };

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) setIdx(i => dx > 0 ? (i + 1) % ads.length : (i - 1 + ads.length) % ads.length);
    setTouchStartX(null);
  };

  if (ads.length === 0) return null;
  const ad = ads[idx];

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        onClick={() => handleTap(ad)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ position: "relative", width: "100%", height: 190, borderRadius: 16, overflow: "hidden", cursor: "pointer", background: T.navyCard }}
      >
        {ad.image_url && (
          <img src={ad.image_url} alt={ad.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)", padding: "20px 16px 12px" }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{ad.title}</span>
        </div>
      </div>
      {ads.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
          {ads.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 18 : 7, height: 7, borderRadius: 4, background: i === idx ? T.gold : T.navyBorder, transition: "all 0.3s", cursor: "pointer" }} />
          ))}
        </div>
      )}
    </div>
  );
};

// PRODUCT CARD
// ═══════════════════════════════════════════════════════
const ProductCard = ({ product, onView, onCart, isFav, onFavToggle, onCompare, inCompare }) => {
  const isDiscounted = product.discount_percent > 0 && (!product.discount_ends_at || new Date(product.discount_ends_at) > new Date());
  const discountedPrice = isDiscounted ? Math.round(product.price * (1 - product.discount_percent / 100) / 100) * 100 : null;
  return (
    <Card style={{ position: "relative" }} onClick={() => onView(product)}>
      {product.is_promoted && (
        <div style={{ position: "absolute", top: 12, right: onFavToggle ? 36 : 12, background: `linear-gradient(135deg, ${T.purple}, #6D28D9)`, color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 10, fontWeight: 700, zIndex: 2 }}>ممول</div>
      )}
      {(isDiscounted || product.oldPrice) && (
        <div style={{ position: "absolute", top: 12, left: 12, background: T.red, color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700, zIndex: 2 }}>
          {isDiscounted ? `خصم ${product.discount_percent}%` : `-${Math.round((1 - product.price / product.oldPrice) * 100)}%`}
        </div>
      )}
      {onFavToggle && (
        <button onClick={e => { e.stopPropagation(); onFavToggle(product.id); }} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", fontSize: 20, cursor: "pointer", zIndex: 2, lineHeight: 1, padding: 0 }}>
          {isFav ? "❤️" : "🤍"}
        </button>
      )}
      <div style={{ fontSize: 48, textAlign: "center", marginBottom: 10, background: `${T.navyLight}`, borderRadius: 12, overflow: "hidden", height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isImageUrl(product.image) ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : product.image}
      </div>
      <div style={{ marginBottom: 6 }}>
        <Badge small>{product.category}</Badge>
      </div>
      <h4 style={{ margin: "6px 0", color: T.textPrimary, fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{product.name}</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Stars rating={product.rating} />
        <span style={{ color: T.textMuted, fontSize: 11 }}>({product.reviews})</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <span style={{ color: T.gold, fontWeight: 800, fontSize: 15 }}>{(discountedPrice || product.price).toLocaleString("ar-IQ")} د.ع</span>
        {(discountedPrice || product.oldPrice) && <span style={{ color: T.textMuted, fontSize: 12, textDecoration: "line-through" }}>{product.price.toLocaleString("ar-IQ")}</span>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: T.textSecondary, fontSize: 11 }}>📍 {product.city}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {onCompare && (
            <button onClick={e => { e.stopPropagation(); onCompare(product); }} title="قارن" style={{
              background: inCompare ? `${T.blue}33` : T.navyLight, border: `1px solid ${inCompare ? T.blue : T.navyBorder}`,
              borderRadius: 8, padding: "6px 8px", color: inCompare ? T.blue : T.textMuted, fontWeight: 700, fontSize: 11, cursor: "pointer"
            }}>⊕</button>
          )}
          <button onClick={e => { e.stopPropagation(); onCart(product); }} style={{
            background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, border: "none",
            borderRadius: 8, padding: "6px 12px", color: T.navy, fontWeight: 700, fontSize: 12, cursor: "pointer"
          }}>+سلة</button>
        </div>
      </div>
    </Card>
  );
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

// ── HOME SCREEN ──────────────────────────────────────
const HomeScreen = ({ onNavigate, onProductView, onCartAdd, cartCount, notifCount = 0, profile, session, favSet, onFavToggle }) => {
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeAuction, setActiveAuction] = useState(0);
  const [cityFilter, setCityFilter] = useState("الكل");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [personalListings, setPersonalListings] = useState([]);
  const [personalListingsLoading, setPersonalListingsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishForm, setPublishForm] = useState({ title: "", description: "", price: "", category_id: "", city: "", contact_phone: "" });
  const [publishCategories, setPublishCategories] = useState([]);
  const [publishImageFile, setPublishImageFile] = useState(null);
  const [publishImagePreview, setPublishImagePreview] = useState(null);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [homeCategories, setHomeCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [marketStats, setMarketStats] = useState(null);
  const [topSellers, setTopSellers] = useState([]);
  const [liveAuctions, setLiveAuctions] = useState([]);

  useEffect(() => {
    const fetchLive = () => {
      supabase.from("auctions").select("title, current_price, ends_at").eq("status", "live").order("ends_at", { ascending: true }).limit(5)
        .then(({ data }) => setLiveAuctions(data || []));
    };
    fetchLive();
    const t = setInterval(fetchLive, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      setFeaturedLoading(true);
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(4);
      setFeaturedProducts((data || []).map(p => ({
        ...p,
        image: Array.isArray(p.images) ? (p.images[0] || "📦") : (p.images || "📦"),
        category: p.categories?.name || "",
        oldPrice: p.old_price || null,
        rating: p.rating || 0,
        reviews: 0,
        discount_percent: p.discount_percent || 0,
        discount_ends_at: p.discount_ends_at || null,
      })));
      setFeaturedLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setPersonalListingsLoading(true);
      const { data } = await supabase
        .from("personal_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);
      setPersonalListings(data || []);
      setPersonalListingsLoading(false);
    })();
  }, []);

  useEffect(() => {
    supabase.from("categories").select("id,name").order("sort_order").then(({ data }) => {
      if (data) setPublishCategories(data);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const { data: cats } = await supabase.from("categories").select("id,name").order("sort_order");
      if (!cats) return;
      setHomeCategories(cats);
      const counts = {};
      await Promise.all(cats.map(async (cat) => {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id)
          .eq("status", "active");
        counts[cat.id] = count || 0;
      }));
      setCategoryCounts(counts);
    })();
  }, []);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("sellers").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("auctions").select("id", { count: "exact", head: true }),
    ]).then(([{ count: products }, { count: sellers }, { count: orders }, { count: auctions }]) => {
      setMarketStats({ products: products || 0, sellers: sellers || 0, orders: orders || 0, auctions: auctions || 0 });
    });
    supabase.from("sellers").select("id, store_name, specialty, seller_type, phone, is_verified").limit(4).then(({ data }) => {
      setTopSellers(data || []);
    });
  }, []);

  const handlePublishSubmit = async () => {
    if (!publishForm.title.trim() || !publishForm.price || !publishForm.contact_phone.trim()) {
      setPublishError("يرجى ملء الحقول المطلوبة: العنوان والسعر ورقم الهاتف");
      return;
    }
    setPublishLoading(true);
    setPublishError(null);
    let imageUrl = null;
    if (publishImageFile) {
      const canvas = document.createElement("canvas");
      const img = new Image();
      await new Promise(resolve => {
        img.onload = () => {
          const MAX = 1000;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
            else { width = Math.round(width * MAX / height); height = MAX; }
          }
          canvas.width = width; canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve();
        };
        img.src = URL.createObjectURL(publishImageFile);
      });
      const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", 0.78));
      const path = `personal/${session.user.id}/${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, blob, { contentType: "image/jpeg" });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }
    const { error: insErr } = await supabase.from("personal_listings").insert({
      user_id: session.user.id,
      title: publishForm.title.trim(),
      description: publishForm.description.trim() || null,
      price: Number(publishForm.price),
      category_id: publishForm.category_id ? Number(publishForm.category_id) : null,
      city: publishForm.city.trim() || null,
      contact_phone: publishForm.contact_phone.trim(),
      images: imageUrl ? [imageUrl] : [],
      status: "active",
    });
    setPublishLoading(false);
    if (insErr) { setPublishError(insErr.message); return; }
    setPublishSuccess(true);
    const { data: refreshed } = await supabase.from("personal_listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(10);
    setPersonalListings(refreshed || []);
  };

  const openPublish = () => {
    setPublishForm({ title: "", description: "", price: "", category_id: "", city: profile?.city || "", contact_phone: profile?.phone || "" });
    setPublishImageFile(null);
    setPublishImagePreview(null);
    setPublishError(null);
    setPublishSuccess(false);
    setShowPublishModal(true);
  };

  useEffect(() => {
    if (!searchText.trim()) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("*, sellers(store_name), categories(name)")
        .ilike("name", `%${searchText.trim()}%`)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);
      setSearchResults((data || []).map(p => ({
        ...p,
        image: Array.isArray(p.images) ? (p.images[0] || "📦") : (p.images || "📦"),
        category: p.categories?.name || "",
        oldPrice: p.old_price || null,
        rating: p.rating || 0,
        reviews: 0,
      })));
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(180deg, ${T.navyMid} 0%, transparent 100%)`, padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, color: T.textMuted, fontSize: 12 }}>أهلاً بك 👋</p>
            <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>{profile?.full_name || "زائر"}</h2>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => onNavigate("notifications")} style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}>
              🔔
              {notifCount > 0 && <span style={{ position: "absolute", top: 4, right: 4, minWidth: 16, height: 16, background: T.red, color: "#fff", borderRadius: 8, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{notifCount > 99 ? "99+" : notifCount}</span>}
            </button>
            <button onClick={() => onNavigate("cart")} style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}>
              🛒
              {cartCount > 0 && <span style={{ position: "absolute", top: 5, right: 5, width: 18, height: 18, background: T.gold, color: T.navy, borderRadius: "50%", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</div>
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onFocus={() => setShowSearch(true)}
            placeholder="ابحث عن قطعة، سيارة، خدمة..."
            style={{
              width: "100%", background: T.navyCard, border: `2px solid ${searchText ? T.gold : T.navyBorder}`,
              borderRadius: 14, padding: "13px 46px 13px 70px", color: T.textPrimary,
              fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
          />
          <button onClick={() => setShowSearch(true)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, border: "none", borderRadius: 9, padding: "6px 12px", color: T.navy, fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>بحث</button>
        </div>

        {/* QUICK FILTERS */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 4 }}>
          {["الكل", "بغداد", "البصرة", "أربيل", "النجف", "كربلاء", "الموصل"].map(city => (
            <button key={city} onClick={() => setCityFilter(city === "الكل" ? "الكل" : city)} style={{ background: cityFilter === city || (city === "الكل" && cityFilter === "الكل") ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.navyCard, border: `1px solid ${cityFilter === city ? "transparent" : T.navyBorder}`, borderRadius: 20, padding: "6px 14px", color: cityFilter === city ? T.navy : T.textSecondary, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              {city}
            </button>
          ))}
        </div>
      </div>

      {searchText.length >= 2 && (
        <div style={{ padding: "0 16px" }}>
          {searchLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted, fontSize: 13 }}>جاري البحث...</div>
          ) : searchResults.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 16 }}>
              {searchResults.map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} isFav={favSet?.has(String(p.id))} onFavToggle={onFavToggle} />)}
            </div>
          ) : (
            <Card style={{ textAlign: "center", padding: 32, marginTop: 16 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <p style={{ color: T.textSecondary, margin: 0 }}>لا توجد نتائج لـ "{searchText}"</p>
              <Btn variant="secondary" size="sm" style={{ marginTop: 12 }} onClick={() => onNavigate("request")}>اطلب القطعة</Btn>
            </Card>
          )}
        </div>
      )}

      {searchText.length < 2 && (
      <div style={{ padding: "0 16px" }}>
        {/* AD CAROUSEL */}
        <AdCarousel onProductView={onProductView} onNavigate={onNavigate} />

        {/* HERO BANNER */}
        <div style={{ background: `linear-gradient(135deg, #0F2A5E, #1A3A7A)`, borderRadius: 20, padding: 20, marginBottom: 20, border: `1px solid ${T.navyBorder}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, left: -20, width: 120, height: 120, background: `${T.gold}15`, borderRadius: "50%", filter: "blur(30px)" }} />
          <Badge color={T.green}>🆕 جديد</Badge>
          <h2 style={{ margin: "10px 0 6px", color: T.textPrimary, fontSize: 20, fontWeight: 900 }}>خصم 30% على فلاتر الزيت</h2>
          <p style={{ margin: "0 0 16px", color: T.textSecondary, fontSize: 13 }}>عرض محدود حتى نهاية الشهر على جميع الفلاتر</p>
          <Btn size="sm" onClick={() => onNavigate("shop")}>تسوق الآن</Btn>
          <div style={{ position: "absolute", bottom: 10, left: 20, fontSize: 60, opacity: 0.3 }}>🔧</div>
        </div>

        {/* ACTIVE AUCTION TICKER */}
        {liveAuctions.length > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${T.gold}22, ${T.goldDark}11)`, border: `1px solid ${T.gold}44`, borderRadius: 14, padding: "12px 16px", marginBottom: 20, cursor: "pointer", overflowX: "auto" }} onClick={() => onNavigate("auctions")}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ width: 8, height: 8, background: T.red, borderRadius: "50%", animation: "pulse 1s infinite", flexShrink: 0 }} />
              <span style={{ color: T.gold, fontWeight: 800, fontSize: 13 }}>🏆 مزادات مباشرة</span>
            </div>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
              {liveAuctions.map((a, i) => (
                <div key={i} style={{ flexShrink: 0, background: T.navyCard, borderRadius: 10, padding: "8px 12px", minWidth: 160, border: `1px solid ${T.gold}33` }}>
                  <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🔴 {a.title}</div>
                  <div style={{ color: T.gold, fontWeight: 900, fontSize: 13 }}>{(a.current_price || 0).toLocaleString("ar-IQ")} د.ع</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES GRID */}
        {(() => {
          const CAT_ICONS = ["🔧", "🚗", "🛞", "⚡", "🔩", "🛡️", "⚙️", "🔌", "🛢️", "🔦", "🪛", "🔑"];
          const CAT_COLORS = [T.gold, T.blue, T.green, T.red, T.orange, "#9B59B6", "#1ABC9C", "#E67E22", "#3498DB", "#E74C3C", "#2ECC71", "#F39C12"];
          return (
            <Section title="الأقسام" subtitle="تصفح جميع الخدمات" action={{ label: "الكل", onClick: () => onNavigate("shop") }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {homeCategories.slice(0, 8).map((cat, i) => (
                  <button key={cat.id} onClick={() => onNavigate("shop", cat.name)} style={{
                    background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 14,
                    padding: "12px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    cursor: "pointer", transition: "all 0.2s",
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `${CAT_COLORS[i % CAT_COLORS.length]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{CAT_ICONS[i % CAT_ICONS.length]}</div>
                    <span style={{ color: T.textPrimary, fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{cat.name}</span>
                    <span style={{ color: T.textMuted, fontSize: 9 }}>{(categoryCounts[cat.id] || 0).toLocaleString("ar-IQ")}</span>
                  </button>
                ))}
              </div>
            </Section>
          );
        })()}

        {/* EMERGENCY QUICK ACCESS */}
        <div style={{ background: `${T.red}15`, border: `1px solid ${T.red}33`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: T.red, fontWeight: 800, fontSize: 15 }}>🚨 خدمات الطوارئ</span>
            <button onClick={() => onNavigate("emergency")} style={{ background: T.red, border: "none", borderRadius: 8, padding: "6px 12px", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>اطلب الآن</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["🚛 سطحة", "🔋 بطارية", "🔧 ميكانيك", "🛞 إطار"].map(s => (
              <button key={s} onClick={() => onNavigate("emergency")} style={{ background: `${T.red}22`, border: `1px solid ${T.red}33`, borderRadius: 10, padding: "6px 10px", color: T.textPrimary, fontFamily: "inherit", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{s}</button>
            ))}
          </div>
        </div>

        {/* PUBLISH YOUR GOODS BANNER */}
        {session && (
          <div style={{ background: `linear-gradient(135deg, ${T.navyCard}, ${T.navyLight})`, border: `1px solid ${T.gold}44`, borderRadius: 16, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: T.gold, fontWeight: 800, fontSize: 15 }}>🛍️ نشر بضاعتك</div>
              <div style={{ color: T.textSecondary, fontSize: 12, marginTop: 2 }}>بيع أي شيء مباشرةً للمشترين</div>
            </div>
            <Btn size="sm" variant="primary" onClick={openPublish}>نشر الآن</Btn>
          </div>
        )}

        {/* FEATURED PRODUCTS */}
        <Section title="منتجات مميزة" subtitle="أفضل العروض اليوم" action={{ label: "الكل", onClick: () => onNavigate("shop") }}>
          {featuredLoading ? (
            <div style={{ textAlign: "center", padding: 32, color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>
          ) : featuredProducts.length === 0 ? (
            <Card style={{ textAlign: "center", padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🛍️</div>
              <p style={{ color: T.textSecondary, margin: 0 }}>لا توجد عروض مميزة حالياً</p>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} isFav={favSet?.has(String(p.id))} onFavToggle={onFavToggle} />)}
            </div>
          )}
        </Section>

        {/* PERSONAL LISTINGS */}
        {(personalListingsLoading || personalListings.length > 0) && (
          <Section title="بيع شخصي" subtitle="بضاعة من الأفراد مباشرةً">
            {personalListingsLoading ? (
              <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {personalListings.map(listing => (
                  <Card key={listing.id} onClick={() => setSelectedListing(listing)} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, background: T.navyLight, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {isImageUrl(listing.images?.[0]) ? <img src={listing.images[0]} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏷️"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{listing.title}</span>
                        <Badge small color={T.orange}>بيع شخصي</Badge>
                      </div>
                      <div style={{ color: T.gold, fontWeight: 800, fontSize: 13 }}>{Number(listing.price).toLocaleString("ar-IQ")} د.ع</div>
                      {listing.city && <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>📍 {listing.city}</div>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* AI DIAGNOSIS BANNER */}
        <div style={{ background: `linear-gradient(135deg, #1A0D4A, #2D1B69)`, border: `1px solid ${T.purple}44`, borderRadius: 20, padding: 20, marginBottom: 20, position: "relative", overflow: "hidden" }} onClick={() => onNavigate("diagnosis")}>
          <div style={{ position: "absolute", top: -10, left: -10, width: 100, height: 100, background: `${T.purple}20`, borderRadius: "50%", filter: "blur(20px)" }} />
          <Badge color={T.purple}>🤖 ذكاء اصطناعي</Badge>
          <h3 style={{ margin: "10px 0 6px", color: T.textPrimary, fontSize: 17, fontWeight: 800 }}>تشخيص الأعطال الذكي</h3>
          <p style={{ margin: "0 0 14px", color: T.textSecondary, fontSize: 13 }}>صف مشكلة سيارتك واحصل على تشخيص فوري</p>
          <Btn variant="ghost" size="sm" icon="🤖" onClick={() => onNavigate("diagnosis")}>ابدأ التشخيص</Btn>
        </div>

        {/* TOP SELLERS */}
        <Section title="أفضل البائعين" subtitle="موثقون ومعتمدون">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topSellers.map(seller => (
              <Card key={seller.id} style={{ display: "flex", alignItems: "center", gap: 14 }} onClick={() => onNavigate("sellerPublic", { sellerId: seller.id })}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🏪</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{seller.store_name || "—"}</span>
                    {seller.is_verified && <Badge small color={T.green}>✓</Badge>}
                  </div>
                  <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>{seller.specialty || seller.seller_type || ""}</div>
                </div>
                <button onClick={e => { e.stopPropagation(); const num = toWhatsAppNumber(seller.phone); if (num) window.open(`https://wa.me/${num}`); }} style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "6px 12px", color: T.green, fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>تواصل</button>
              </Card>
            ))}
            {topSellers.length === 0 && <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>}
          </div>
        </Section>

        {/* MARKET STATS */}
        <Section title="إحصائيات السوق" subtitle="تحليل ذكي للسوق العراقي">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {marketStats ? [
              { icon: "📦", value: marketStats.products.toLocaleString("ar-IQ"), label: "منتج نشط" },
              { icon: "🏪", value: marketStats.sellers.toLocaleString("ar-IQ"), label: "بائع" },
              { icon: "🛒", value: marketStats.orders.toLocaleString("ar-IQ"), label: "طلب" },
              { icon: "🏆", value: marketStats.auctions.toLocaleString("ar-IQ"), label: "مزاد" },
            ].map((stat, i) => (
              <Card key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ color: T.gold, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>{stat.label}</div>
              </Card>
            )) : MOCK.marketStats.map((stat, i) => (
              <Card key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ color: T.gold, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>{stat.label}</div>
              </Card>
            ))}
          </div>
        </Section>
      </div>
      )}

      {/* PUBLISH LISTING MODAL */}
      <Modal isOpen={showPublishModal} onClose={() => !publishLoading && setShowPublishModal(false)} title="نشر بضاعتك 🛍️">
        {publishSuccess ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: T.green, fontSize: 15, fontWeight: 700, margin: 0 }}>تم نشر إعلانك بنجاح!</p>
            <Btn fullWidth variant="secondary" onClick={() => setShowPublishModal(false)} style={{ marginTop: 16 }}>إغلاق</Btn>
          </div>
        ) : (
          <>
            <Input label="عنوان الإعلان *" value={publishForm.title} onChange={v => setPublishForm(p => ({ ...p, title: v }))} placeholder="مثال: كاميرا خلفية هوندا سيفيك" icon="🏷️" />
            <Input label="الوصف" value={publishForm.description} onChange={v => setPublishForm(p => ({ ...p, description: v }))} placeholder="وصف اختياري للبضاعة..." icon="📝" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="السعر * (د.ع)" type="number" value={publishForm.price} onChange={v => setPublishForm(p => ({ ...p, price: v }))} placeholder="25000" />
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>القسم</label>
                <select value={publishForm.category_id} onChange={e => setPublishForm(p => ({ ...p, category_id: e.target.value }))} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "11px 14px", color: T.textPrimary, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none", cursor: "pointer" }}>
                  <option value="">بدون فئة</option>
                  {publishCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="المدينة" value={publishForm.city} onChange={v => setPublishForm(p => ({ ...p, city: v }))} placeholder="بغداد" icon="📍" />
              <Input label="رقم الهاتف *" type="tel" value={publishForm.contact_phone} onChange={v => setPublishForm(p => ({ ...p, contact_phone: v }))} placeholder="07xxxxxxxxx" icon="📱" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>صورة (اختياري)</label>
              {publishImagePreview && <div style={{ marginBottom: 8, borderRadius: 10, overflow: "hidden" }}><img src={publishImagePreview} alt="معاينة" style={{ width: "100%", height: 120, objectFit: "cover" }} /></div>}
              <label style={{ display: "flex", alignItems: "center", gap: 8, background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>📷</span>
                <span style={{ color: T.textSecondary, fontSize: 13 }}>{publishImageFile ? publishImageFile.name : "اختر صورة..."}</span>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (!f) return; setPublishImageFile(f); setPublishImagePreview(URL.createObjectURL(f)); }} />
              </label>
            </div>
            {publishError && <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13 }}>⚠️ {publishError}</div>}
            <Btn fullWidth variant="primary" onClick={handlePublishSubmit} disabled={publishLoading}>
              {publishLoading ? "جارٍ النشر..." : "نشر الإعلان"}
            </Btn>
          </>
        )}
      </Modal>

      {/* PERSONAL LISTING DETAIL MODAL */}
      <Modal isOpen={!!selectedListing} onClose={() => setSelectedListing(null)} title="تفاصيل الإعلان">
        {selectedListing && (
          <>
            {isImageUrl(selectedListing.images?.[0]) && (
              <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                <img src={selectedListing.images[0]} alt={selectedListing.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: T.textPrimary, fontSize: 17, fontWeight: 800, flex: 1 }}>{selectedListing.title}</h3>
              <Badge color={T.orange}>بيع شخصي</Badge>
            </div>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 22, marginBottom: 12 }}>{Number(selectedListing.price).toLocaleString("ar-IQ")} د.ع</div>
            {selectedListing.description && <p style={{ color: T.textSecondary, fontSize: 14, lineHeight: 1.6, margin: "0 0 14px" }}>{selectedListing.description}</p>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {selectedListing.category && <Badge color={T.blue}>🗂️ {selectedListing.category}</Badge>}
              {selectedListing.city && <Badge color={T.textSecondary}>📍 {selectedListing.city}</Badge>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn fullWidth variant="primary" icon="📱" onClick={() => window.open(`tel:${selectedListing.contact_phone}`)}>اتصال</Btn>
              <Btn fullWidth variant="ghost" icon="💬" onClick={() => window.open(`https://wa.me/${toWhatsAppNumber(selectedListing.contact_phone)}`)}>واتساب</Btn>
              <Btn size="sm" variant="secondary" icon="↗️" onClick={() => {
                const text = encodeURIComponent(`شاهد هذا على دكتور السيارات:\n${selectedListing.title} - ${Number(selectedListing.price).toLocaleString("ar-IQ")} د.ع\n${window.location.href}`);
                window.open(`https://wa.me/?text=${text}`);
              }}>مشاركة</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

// ── SHOP SCREEN ──────────────────────────────────────
const ShopScreen = ({ onProductView, onCartAdd, initialCategory = null, favSet, onFavToggle, onCompare, compareSet }) => {
  const [products, setProducts] = useState(MOCK.products);
  useEffect(() => {
    supabase.from("products").select("*, sellers(store_name, verified, is_verified, rating), categories(name)").eq("status", "active").then(({ data, error }) => {
      if (!error && data) {
        setProducts(data.map(p => ({
          id: p.id,
          seller_id: p.seller_id,
          name: p.name,
          price: p.price,
          oldPrice: p.old_price,
          category: p.categories?.name,
          seller: p.sellers?.store_name,
          sellerVerified: p.sellers?.verified || p.sellers?.is_verified,
          rating: p.sellers?.rating || 0,
          reviews: 0,
          city: p.city,
          image: (p.images && p.images[0]) || "🚗",
          condition: p.condition,
          stock: p.stock,
          partNo: p.part_no,
          brand: p.brand,
          model: p.model,
          year: p.year,
          mileage: p.mileage,
          transmission: p.transmission,
          fuel_type: p.fuel_type,
          discount_percent: p.discount_percent || 0,
          discount_ends_at: p.discount_ends_at || null,
          is_promoted: p.is_promoted || false,
        })));
      }
    });
  }, []);

  const [activeCategory, setActiveCategory] = useState(initialCategory || "الكل");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [shopToast, setShopToast] = useState(null);
  const [nearbyCity, setNearbyCity] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  useEffect(() => {
    supabase.from("categories").select("id,name").order("sort_order").then(({ data }) => {
      if (data) setShopCategories(data);
    });
  }, []);

  const IRAQI_CITIES = { "Baghdad": "بغداد", "Basra": "البصرة", "Erbil": "أربيل", "Najaf": "النجف", "Karbala": "كربلاء", "Mosul": "الموصل" };

  const detectNearby = () => {
    if (!navigator.geolocation) { setShopToast("الجهاز لا يدعم تحديد الموقع"); setTimeout(() => setShopToast(null), 2500); return; }
    if (nearbyCity) { setNearbyCity(null); return; }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const d = await r.json();
        const city = d.address?.city || d.address?.state || d.address?.county || "";
        const arCity = IRAQI_CITIES[city] || city || "بغداد";
        setNearbyCity(arCity);
      } catch { setNearbyCity("بغداد"); }
      setNearbyLoading(false);
    }, () => { setNearbyLoading(false); setShopToast("تعذر تحديد الموقع"); setTimeout(() => setShopToast(null), 2500); });
  };

  const categoryTabs = ["الكل", ...shopCategories.map(c => c.name)];
  let filtered = products.filter(p =>
    (activeCategory === "الكل" || p.category === activeCategory) &&
    p.price >= priceRange[0] && p.price <= priceRange[1] &&
    (!activeFilters.has("موثق فقط") || p.sellerVerified) &&
    (!activeFilters.has("جديد") || p.condition === "new") &&
    (!activeFilters.has("متوفر") || p.stock > 0) &&
    (!nearbyCity || (p.city && p.city.includes(nearbyCity)))
  );
  if (sortBy === "promoted") {
    filtered = [...filtered.filter(p => p.is_promoted), ...filtered.filter(p => !p.is_promoted)];
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>المتجر 🛍️</h2>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
        {categoryTabs.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            background: activeCategory === cat ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.navyCard,
            border: `1px solid ${activeCategory === cat ? "transparent" : T.navyBorder}`,
            borderRadius: 20, padding: "8px 16px", color: activeCategory === cat ? T.navy : T.textSecondary,
            fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap"
          }}>{cat}</button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ color: T.textMuted, fontSize: 13 }}>{filtered.length} منتج</span>
          <button onClick={detectNearby} disabled={nearbyLoading} style={{ background: nearbyCity ? `${T.blue}22` : T.navyCard, border: `1px solid ${nearbyCity ? T.blue : T.navyBorder}`, borderRadius: 10, padding: "6px 10px", color: nearbyCity ? T.blue : T.textSecondary, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
            {nearbyLoading ? "⏳" : nearbyCity ? `📍 ${nearbyCity}` : "📍 قريب"}
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "8px 14px", color: T.textSecondary, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>
            ⚙️ فلتر
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "8px 14px", color: T.textSecondary, fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none" }}>
            <option value="default">ترتيب افتراضي</option>
            <option value="promoted">الممولة أولاً</option>
            <option value="price_asc">الأقل سعراً</option>
            <option value="price_desc">الأعلى سعراً</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <Card style={{ marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 12px", color: T.textPrimary }}>الفلاتر المتقدمة</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["موثق فقط", "جديد", "متوفر", "توصيل"].map(f => {
              const isActive = activeFilters.has(f);
              return (
                <button key={f} onClick={() => {
                  if (f === "توصيل") { setShopToast("خاصية التوصيل قريباً!"); setTimeout(() => setShopToast(null), 2500); return; }
                  setActiveFilters(prev => { const next = new Set(prev); isActive ? next.delete(f) : next.add(f); return next; });
                }} style={{ background: isActive ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.navyLight, border: `1px solid ${isActive ? "transparent" : T.navyBorder}`, borderRadius: 20, padding: "6px 14px", color: isActive ? T.navy : T.textSecondary, fontFamily: "inherit", fontWeight: isActive ? 700 : 400, fontSize: 12, cursor: "pointer" }}>{f}</button>
              );
            })}
          </div>
          {shopToast && <div style={{ marginTop: 8, background: `${T.gold}22`, border: `1px solid ${T.gold}44`, borderRadius: 8, padding: "8px 12px", color: T.gold, fontSize: 12, textAlign: "center" }}>{shopToast}</div>}
          <div style={{ marginTop: 14 }}>
            <label style={{ color: T.textSecondary, fontSize: 13, display: "block", marginBottom: 6 }}>
              نطاق السعر: <span style={{ color: T.gold }}>{priceRange[0].toLocaleString("ar-IQ")} - {priceRange[1].toLocaleString("ar-IQ")} د.ع</span>
            </label>
            <input type="range" min={0} max={500000} value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])}
              style={{ width: "100%", accentColor: T.gold }} />
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {filtered.map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} isFav={favSet?.has(String(p.id))} onFavToggle={onFavToggle} onCompare={onCompare} inCompare={compareSet?.has(String(p.id))} />)}
      </div>
    </div>
  );
};

// ── PRODUCT DETAIL SCREEN ──────────────────────────────────────
const ProductDetailScreen = ({ product, onBack, onCartAdd, session, profile, favSet, onFavToggle, onNavigate, onMsgContext }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ buyer_name: "", buyer_phone: "", buyer_address: "", city: "", notes: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerProductCount, setSellerProductCount] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [sellerReviewsLoading, setSellerReviewsLoading] = useState(false);
  const [sellerReviewForm, setSellerReviewForm] = useState({ rating: 5, comment: "" });
  const [sellerReviewSubmitting, setSellerReviewSubmitting] = useState(false);
  const [sellerReviewError, setSellerReviewError] = useState(null);
  const [sellerReviewSuccess, setSellerReviewSuccess] = useState(false);
  const [hasSellerReviewed, setHasSellerReviewed] = useState(false);
  const [discountCountdown, setDiscountCountdown] = useState("");

  useEffect(() => {
    if (!product?.seller_id) return;
    const sid = product.seller_id;
    supabase.from("sellers").select("store_name, verified, is_verified, rating, created_at, phone, whatsapp, owner_id, response_rate, id").eq("id", sid).single()
      .then(({ data }) => setSellerInfo(data || null));
    supabase.from("products").select("id", { count: "exact", head: true }).eq("seller_id", sid)
      .then(({ count }) => setSellerProductCount(count || 0));
  }, [product?.seller_id]);

  useEffect(() => {
    if (!product?.id) return;
    setReviewsLoading(true);
    supabase.from("product_reviews").select("*, profiles(full_name)").eq("product_id", product.id).order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews(data || []);
        if (session?.user?.id) setHasReviewed((data || []).some(r => r.user_id === session.user.id));
        setReviewsLoading(false);
      });
  }, [product?.id]);

  useEffect(() => {
    if (!product?.seller_id) return;
    setSellerReviewsLoading(true);
    supabase.from("seller_reviews").select("*, profiles(full_name)").eq("seller_id", product.seller_id).order("created_at", { ascending: false })
      .then(({ data }) => {
        setSellerReviews(data || []);
        if (session?.user?.id) setHasSellerReviewed((data || []).some(r => r.user_id === session.user.id));
        setSellerReviewsLoading(false);
      });
  }, [product?.seller_id]);

  useEffect(() => {
    if (!product?.discount_ends_at) return;
    const update = () => {
      const diff = new Date(product.discount_ends_at) - new Date();
      if (diff <= 0) { setDiscountCountdown("انتهى العرض"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDiscountCountdown(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [product?.discount_ends_at]);

  const handleSubmitSellerReview = async () => {
    if (!session?.user?.id || !product?.seller_id) return;
    if (!sellerReviewForm.comment.trim()) { setSellerReviewError("يرجى كتابة تعليق"); return; }
    setSellerReviewSubmitting(true);
    setSellerReviewError(null);
    const { error } = await supabase.from("seller_reviews").insert({ seller_id: product.seller_id, user_id: session.user.id, rating: sellerReviewForm.rating, comment: sellerReviewForm.comment.trim() });
    if (error) {
      setSellerReviewError("حدث خطأ، حاول مجدداً");
    } else {
      setSellerReviewSuccess(true);
      setHasSellerReviewed(true);
      setSellerReviews(prev => [{ user_id: session.user.id, rating: sellerReviewForm.rating, comment: sellerReviewForm.comment.trim(), created_at: new Date().toISOString(), profiles: { full_name: profile?.full_name || "أنت" } }, ...prev]);
    }
    setSellerReviewSubmitting(false);
  };

  const handleSubmitReview = async () => {
    if (!session?.user?.id) return;
    if (!reviewForm.comment.trim()) { setReviewError("يرجى كتابة تعليق"); return; }
    setReviewSubmitting(true);
    setReviewError(null);
    const { error } = await supabase.from("product_reviews").insert({ product_id: product.id, user_id: session.user.id, rating: reviewForm.rating, comment: reviewForm.comment.trim() });
    if (error) {
      setReviewError("حدث خطأ، حاول مجدداً");
    } else {
      setReviewSuccess(true);
      setHasReviewed(true);
      setReviews(prev => [{ user_id: session.user.id, rating: reviewForm.rating, comment: reviewForm.comment.trim(), created_at: new Date().toISOString(), profiles: { full_name: profile?.full_name || "أنت" } }, ...prev]);
    }
    setReviewSubmitting(false);
  };

  if (!product) return null;

  const totalAmount = product.price * quantity;

  const handleAddCart = () => {
    onCartAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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

  const handleCheckout = async () => {
    if (!checkoutForm.buyer_phone.trim()) { setCheckoutError("رقم الهاتف مطلوب"); return; }
    if (!checkoutForm.buyer_address.trim()) { setCheckoutError("العنوان التفصيلي مطلوب"); return; }
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const { data: orderData, error: orderError } = await supabase.from("orders").insert({
        buyer_id: session.user.id,
        seller_id: product.seller_id,
        payment_method: "cod",
        total_amount: totalAmount,
        buyer_name: checkoutForm.buyer_name.trim() || null,
        buyer_phone: checkoutForm.buyer_phone.trim(),
        buyer_address: checkoutForm.buyer_address.trim(),
        city: checkoutForm.city.trim() || null,
        notes: checkoutForm.notes.trim() || null,
      }).select().single();
      if (orderError) { setCheckoutError(orderError.message); return; }
      const { error: itemsError } = await supabase.from("order_items").insert({
        order_id: orderData.id,
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
      });
      if (itemsError) { setCheckoutError(itemsError.message); return; }
      setCheckoutSuccess(true);
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{ padding: 0 }}>
      <Modal isOpen={showCheckout} onClose={() => !checkoutLoading && setShowCheckout(false)} title="تأكيد الطلب 🛒">
        {!session ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <p style={{ color: T.textSecondary, fontSize: 14, margin: 0 }}>يرجى تسجيل الدخول أولاً للمتابعة في الشراء</p>
          </div>
        ) : checkoutSuccess ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: T.green, fontSize: 15, fontWeight: 700, margin: 0, lineHeight: 1.7 }}>تم استلام طلبك! سيتواصل معك البائع لتأكيد التوصيل والدفع عند الاستلام</p>
          </div>
        ) : (
          <>
            <div style={{ background: T.navyLight, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: T.textSecondary, fontSize: 13 }}>{product.name}</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>{product.price.toLocaleString("ar-IQ")} د.ع</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: T.textMuted, fontSize: 12 }}>الكمية: {quantity}</span>
                <span style={{ color: T.gold, fontWeight: 900 }}>الإجمالي: {totalAmount.toLocaleString("ar-IQ")} د.ع</span>
              </div>
            </div>
            <Input label="الاسم" value={checkoutForm.buyer_name} onChange={v => setCheckoutForm(p => ({ ...p, buyer_name: v }))} placeholder="اسمك الكريم" icon="👤" />
            <Input label="رقم الهاتف *" value={checkoutForm.buyer_phone} onChange={v => setCheckoutForm(p => ({ ...p, buyer_phone: v }))} placeholder="07xxxxxxxxx" icon="📱" type="tel" />
            <Input label="العنوان التفصيلي *" value={checkoutForm.buyer_address} onChange={v => setCheckoutForm(p => ({ ...p, buyer_address: v }))} placeholder="الحي، الشارع، رقم المنزل" icon="📍" />
            <Input label="المدينة" value={checkoutForm.city} onChange={v => setCheckoutForm(p => ({ ...p, city: v }))} placeholder="بغداد" icon="🌆" />
            <Input label="ملاحظات" value={checkoutForm.notes} onChange={v => setCheckoutForm(p => ({ ...p, notes: v }))} placeholder="أي ملاحظات إضافية..." icon="📝" />
            <div style={{ background: `${T.blue}22`, border: `1px solid ${T.blue}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
              <span style={{ color: T.blue, fontSize: 12, fontWeight: 600 }}>💳 الدفع عند الاستلام (COD)</span>
            </div>
            {checkoutError && (
              <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: T.red, fontSize: 13, fontWeight: 700 }}>
                ⚠️ {checkoutError}
              </div>
            )}
            <Btn fullWidth onClick={handleCheckout} disabled={checkoutLoading} variant="primary">
              {checkoutLoading ? "جارٍ إرسال الطلب..." : "تأكيد الطلب"}
            </Btn>
          </>
        )}
      </Modal>

      {/* Back Header */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: T.textPrimary }}>→</button>
        <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 17, fontWeight: 800 }}>تفاصيل المنتج</h2>
      </div>

      {/* Product Image */}
      <div style={{ background: T.navyCard, textAlign: "center", fontSize: 80, marginBottom: 0, overflow: "hidden", height: isImageUrl(product.image) ? 260 : "auto", padding: isImageUrl(product.image) ? 0 : 40, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {isImageUrl(product.image) ? <img src={product.image} alt={product.name} style={{ width: "100%", height: 260, objectFit: "cover" }} /> : product.image}
        {(() => { const isDisc = product.discount_percent > 0 && (!product.discount_ends_at || new Date(product.discount_ends_at) > new Date()); return isDisc ? <div style={{ position: "absolute", top: 12, left: 12, background: T.red, color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700 }}>خصم {product.discount_percent}%</div> : null; })()}
        {onFavToggle && <button onClick={() => onFavToggle(product.id)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer" }}>{favSet?.has(String(product.id)) ? "❤️" : "🤍"}</button>}
      </div>

      <div style={{ padding: "16px 16px" }}>
        {/* Title & Price */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <Badge small>{product.category}</Badge>
            <h2 style={{ margin: "8px 0 6px", color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>{product.name}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Stars rating={product.rating} size={14} />
              <span style={{ color: T.textSecondary, fontSize: 12 }}>({product.reviews} تقييم)</span>
            </div>
          </div>
        </div>

        {/* Price */}
        {(() => {
          const isDisc = product.discount_percent > 0 && (!product.discount_ends_at || new Date(product.discount_ends_at) > new Date());
          const discP = isDisc ? Math.round(product.price * (1 - product.discount_percent / 100) / 100) * 100 : null;
          return (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ color: T.gold, fontWeight: 900, fontSize: 24 }}>{(discP || product.price).toLocaleString("ar-IQ")} د.ع</span>
                {(discP || product.oldPrice) && <span style={{ color: T.textMuted, fontSize: 16, textDecoration: "line-through" }}>{product.price.toLocaleString("ar-IQ")}</span>}
              </div>
              {isDisc && product.discount_ends_at && discountCountdown && (
                <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "4px 10px", marginTop: 6, display: "inline-block" }}>
                  <span style={{ color: T.red, fontSize: 12, fontWeight: 700 }}>⏱ ينتهي بعد: {discountCountdown}</span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Info Pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <Badge color={T.green}>✓ {product.condition}</Badge>
          <Badge color={T.blue}>📦 متوفر ({product.stock})</Badge>
          <Badge color={T.textSecondary}>🔖 {product.partNo}</Badge>
          <Badge color={T.orange}>📍 {product.city}</Badge>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[{ id: "details", label: "التفاصيل" }, { id: "seller", label: "البائع" }, { id: "reviews", label: "التقييمات" }, { id: "similar", label: "مشابهة" }]}
          active={activeTab} onChange={setActiveTab}
        />

        {activeTab === "details" && (
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["الحالة", product.condition], ["المدينة", product.city], ["الكمية المتاحة", product.stock], ["رقم القطعة", product.partNo], ["التصنيف", product.category], ["التوصيل", "1-3 أيام"]].map(([label, value]) => (
                <div key={label}>
                  <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 3 }}>{label}</div>
                  <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{value}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "seller" && (
          <>
          <Card>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏪</div>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: T.textPrimary, fontWeight: 800, fontSize: 15 }}>{sellerInfo?.store_name || product.seller || "—"}</span>
                  {(sellerInfo?.verified || sellerInfo?.is_verified) && <Badge small color={T.green}>✓ موثق</Badge>}
                </div>
                {sellerInfo?.rating != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Stars rating={sellerInfo.rating} size={12} />
                    <span style={{ color: T.textMuted, fontSize: 12 }}> {sellerInfo.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                ["المنتجات", sellerProductCount != null ? sellerProductCount.toLocaleString("ar-IQ") : "—"],
                ["منذ", sellerInfo?.created_at ? new Date(sellerInfo.created_at).getFullYear().toString() : "—"],
                ["الاستجابة", sellerInfo?.response_rate != null ? `${Math.round(sellerInfo.response_rate)}%` : "—"],
              ].map(([l, v]) => (
                <div key={l} style={{ textAlign: "center", background: T.navyLight, borderRadius: 10, padding: 10 }}>
                  <div style={{ color: T.gold, fontWeight: 800, fontSize: 16 }}>{v}</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn fullWidth size="sm" icon="🏬" variant="blue" onClick={() => { if (onNavigate && sellerInfo?.id) { onNavigate("sellerPublic", { sellerId: sellerInfo.id }); } }}>زيارة المتجر</Btn>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn fullWidth size="sm" icon="💬" variant="ghost" onClick={() => { if (!session?.user?.id) return; if (sellerInfo?.owner_id && onMsgContext) { onMsgContext({ partnerId: sellerInfo.owner_id, partnerName: sellerInfo.store_name || "البائع", productId: product.id, productName: product.name }); if (onNavigate) onNavigate("messages"); } }}>راسل البائع</Btn>
              <Btn fullWidth size="sm" icon="📱" variant="ghost" onClick={() => { const num = toWhatsAppNumber(sellerInfo?.whatsapp || sellerInfo?.phone); if (num) window.open(`https://wa.me/${num}`); }}>واتساب</Btn>
              <Btn fullWidth size="sm" icon="📞" variant="ghost" onClick={() => { const ph = sellerInfo?.phone; if (ph) window.open(`tel:${ph}`, "_self"); }}>اتصال</Btn>
            </div>
          </Card>
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 14, fontWeight: 800 }}>تقييمات البائع</h4>
            {sellerReviews.length > 0 && (
              <Card style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: T.gold }}>{(sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length).toFixed(1)}</div>
                  <div>
                    <Stars rating={Math.round(sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length)} size={13} />
                    <div style={{ color: T.textMuted, fontSize: 12 }}>{sellerReviews.length} تقييم</div>
                  </div>
                </div>
              </Card>
            )}
            {session?.user?.id && !hasSellerReviewed && !sellerReviewSuccess && (
              <Card style={{ marginBottom: 10 }}>
                <h4 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 13 }}>أضف تقييمك للبائع</h4>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(s => <button key={s} onClick={() => setSellerReviewForm(f => ({ ...f, rating: s }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, opacity: s <= sellerReviewForm.rating ? 1 : 0.3, padding: 0 }}>⭐</button>)}
                </div>
                <textarea value={sellerReviewForm.comment} onChange={e => setSellerReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="اكتب تعليقك هنا..." rows={2} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "8px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                {sellerReviewError && <p style={{ color: T.red, fontSize: 12, margin: "0 0 6px" }}>{sellerReviewError}</p>}
                <Btn fullWidth size="sm" onClick={handleSubmitSellerReview} disabled={sellerReviewSubmitting}>{sellerReviewSubmitting ? "جارٍ الإرسال..." : "إرسال التقييم"}</Btn>
              </Card>
            )}
            {sellerReviewSuccess && <Card style={{ textAlign: "center", marginBottom: 10 }}><p style={{ color: T.green, margin: 0, fontWeight: 700 }}>✅ تم إرسال تقييمك!</p></Card>}
            {sellerReviewsLoading ? <div style={{ textAlign: "center", padding: 16, color: T.textMuted }}>جارٍ التحميل...</div> : sellerReviews.map((r, i) => (
              <Card key={r.id || i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{r.profiles?.full_name || "مجهول"}</div>
                      <Stars rating={r.rating} size={10} />
                    </div>
                  </div>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{relativeTime(r.created_at)}</span>
                </div>
                <p style={{ margin: 0, color: T.textSecondary, fontSize: 13 }}>{r.comment}</p>
              </Card>
            ))}
            {!sellerReviewsLoading && sellerReviews.length === 0 && <div style={{ textAlign: "center", padding: 16, color: T.textMuted, fontSize: 13 }}>لا توجد تقييمات بعد</div>}
          </div>
          </>
        )}

        {activeTab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.length > 0 && (
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: T.gold }}>{(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}</div>
                  <div>
                    <Stars rating={Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)} size={14} />
                    <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{reviews.length} تقييم</div>
                  </div>
                </div>
              </Card>
            )}
            {session?.user?.id && !hasReviewed && !reviewSuccess && (
              <Card>
                <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>أضف تقييمك</h4>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, opacity: s <= reviewForm.rating ? 1 : 0.3, padding: 0 }}>⭐</button>
                  ))}
                </div>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="اكتب تعليقك هنا..." rows={3} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
                {reviewError && <p style={{ color: T.red, fontSize: 12, margin: "0 0 8px" }}>{reviewError}</p>}
                <Btn fullWidth onClick={handleSubmitReview} disabled={reviewSubmitting}>{reviewSubmitting ? "جارٍ الإرسال..." : "إرسال التقييم"}</Btn>
              </Card>
            )}
            {reviewSuccess && (
              <Card style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ color: T.green, margin: 0, fontWeight: 700 }}>تم إرسال تقييمك بنجاح!</p>
              </Card>
            )}
            {reviewsLoading ? (
              <div style={{ textAlign: "center", padding: 20, color: T.textMuted }}>جارٍ التحميل...</div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <p style={{ color: T.textMuted, margin: 0 }}>لا توجد تقييمات بعد. كن أول من يقيّم!</p>
              </div>
            ) : reviews.map((review, i) => (
              <Card key={review.id || i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{review.profiles?.full_name || "مجهول"}</div>
                      <Stars rating={review.rating} size={11} />
                    </div>
                  </div>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{relativeTime(review.created_at)}</span>
                </div>
                <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.6 }}>{review.comment}</p>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "similar" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {MOCK.products.slice(1, 3).map(p => <ProductCard key={p.id} product={p} onView={() => {}} onCart={onCartAdd} />)}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ position: "sticky", bottom: 0, background: T.navy, padding: "16px 0 0", marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "8px 12px" }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ background: "none", border: "none", color: T.gold, fontSize: 18, cursor: "pointer" }}>−</button>
              <span style={{ color: T.textPrimary, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ background: "none", border: "none", color: T.gold, fontSize: 18, cursor: "pointer" }}>+</button>
            </div>
            <Btn fullWidth onClick={handleAddCart} icon={added ? "✓" : "🛒"} variant={added ? "green" : "primary"}>
              {added ? "تمت الإضافة!" : "أضف للسلة"}
            </Btn>
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <Btn fullWidth onClick={handleOpenCheckout} variant="blue" icon="🛍️">اشتري الآن</Btn>
            <Btn size="sm" variant="secondary" icon="↗️" onClick={() => {
              const text = encodeURIComponent(`شاهد هذا على دكتور السيارات:\n${product.name} - ${product.price.toLocaleString("ar-IQ")} د.ع\n${window.location.href}`);
              window.open(`https://wa.me/?text=${text}`);
            }}>مشاركة</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── AUCTIONS SCREEN ──────────────────────────────────────
const AuctionsScreen = ({ onNavigate, session }) => {
  const user = session?.user ?? null;
  const [activeTab, setActiveTab] = useState("live");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [bidAmount, setBidAmount] = useState({});
  const [bidState, setBidState] = useState({}); // { [auctionId]: { loading, success, error } }
  const [lastBidsMap, setLastBidsMap] = useState({}); // { [auctionId]: { bidder_id } }
  const [winnerBidsMap, setWinnerBidsMap] = useState({}); // { [auctionId]: winningAmount }
  const [galleryIdx, setGalleryIdx] = useState({}); // { [auctionId]: number }
  const [lightbox, setLightbox] = useState(null); // auctionId or null
  const [userBidsMap, setUserBidsMap] = useState({}); // { [auctionId]: [{ id, amount, created_at }] }
  const [bidDeleteState, setBidDeleteState] = useState({}); // { [bidId]: { loading, error } }
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", starting_price: "", min_increment: "", starts_at: "", ends_at: "", category_id: "", vehicle_id: "" });
  const [auctionCategories, setAuctionCategories] = useState([]);
  const [sellerVehicles, setSellerVehicles] = useState([]);
  const [auctionImageFiles, setAuctionImageFiles] = useState([]);
  const [auctionImagePreviews, setAuctionImagePreviews] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const handleOpenCreate = async () => {
    if (!user) { setCreateError("يجب تسجيل الدخول أولاً"); setShowCreateModal(true); return; }
    setCreateForm({ title: "", description: "", starting_price: "", min_increment: "", starts_at: "", ends_at: "", category_id: "", vehicle_id: "" });
    setCreateError(null);
    setCreateSuccess(false);
    setAuctionImageFiles([]);
    auctionImagePreviews.forEach(u => URL.revokeObjectURL(u));
    setAuctionImagePreviews([]);
    setShowCreateModal(true);
    const [{ data: cats }, { data: veh }] = await Promise.all([
      supabase.from("categories").select("id,name").neq("id", 11).order("sort_order"),
      supabase.from("vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);
    setAuctionCategories(cats || []);
    setSellerVehicles(veh || []);
  };

  const handleCreateAuction = async () => {
    if (!createForm.title.trim()) { setCreateError("اسم المزاد مطلوب"); return; }
    if (!createForm.category_id) { setCreateError("الفئة مطلوبة"); return; }
    const rawPrice = String(createForm.starting_price).replace(/[^0-9.]/g, "");
    if (!rawPrice || isNaN(Number(rawPrice)) || Number(rawPrice) <= 0) { setCreateError("السعر الابتدائي مطلوب"); return; }
    if (!createForm.starts_at) { setCreateError("تاريخ البداية مطلوب"); return; }
    if (!createForm.ends_at) { setCreateError("تاريخ النهاية مطلوب"); return; }
    if (new Date(createForm.ends_at) <= new Date(createForm.starts_at)) { setCreateError("تاريخ النهاية يجب أن يكون بعد البداية"); return; }
    const isCars = String(createForm.category_id) === "8";
    if (isCars && !createForm.vehicle_id) { setCreateError("يجب اختيار مركبة لمزادات السيارات"); return; }
    setCreating(true);
    setCreateError(null);
    const { data: sellerRow } = await supabase.from("sellers").select("id").eq("owner_id", user.id).maybeSingle();
    if (!sellerRow) { setCreateError("يجب أن يكون لديك حساب بائع لإنشاء مزاد"); setCreating(false); return; }
    const startPrice = Number(String(createForm.starting_price).replace(/[^0-9.]/g, ""));
    const status = new Date(createForm.starts_at) <= new Date() ? "live" : "upcoming";
    let images = [];
    if (isCars) {
      const v = sellerVehicles.find(v => v.id === createForm.vehicle_id);
      images = v?.images || [];
    } else if (auctionImageFiles.length > 0) {
      for (let i = 0; i < auctionImageFiles.length; i++) {
        const file = auctionImageFiles[i];
        const path = `auctions/${Date.now()}_${i}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
        if (upErr) { setCreateError(`فشل رفع الصورة: ${upErr.message}`); setCreating(false); return; }
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        images.push(urlData.publicUrl);
      }
    }
    const { error } = await supabase.from("auctions").insert({
      seller_id: sellerRow.id,
      title: createForm.title.trim(),
      description: isCars ? null : (createForm.description.trim() || null),
      starting_price: startPrice,
      current_price: startPrice,
      min_increment: createForm.min_increment ? Number(createForm.min_increment) : 0,
      starts_at: createForm.starts_at,
      ends_at: createForm.ends_at,
      status,
      category_id: Number(createForm.category_id),
      images,
      vehicle_id: isCars ? createForm.vehicle_id : null,
    });
    setCreating(false);
    if (error) {
      const msg = (error.message.includes("vehicle_id") || error.message.includes("trigger"))
        ? "مزادات السيارات تتطلب ربط مركبة. الرجاء اختيار مركبة صحيحة."
        : error.message;
      setCreateError(msg);
      return;
    }
    setCreateSuccess(true);
    auctionImagePreviews.forEach(u => URL.revokeObjectURL(u));
    setAuctionImagePreviews([]);
    setAuctionImageFiles([]);
    setTimeout(() => { setShowCreateModal(false); setCreateSuccess(false); loadAuctions(activeTab); }, 2000);
  };

  const handleBid = async (auctionId) => {
    if (!session?.user?.id) {
      setBidState(p => ({ ...p, [auctionId]: { error: "يجب تسجيل الدخول أولاً للمزايدة" } }));
      return;
    }
    const rawVal = bidAmount[auctionId];
    const amount = Number(rawVal);
    if (!rawVal || !amount || isNaN(amount)) {
      setBidState(p => ({ ...p, [auctionId]: { error: "أدخل مبلغاً صحيحاً للمزايدة" } }));
      return;
    }
    console.log("BID ATTEMPT:", auctionId, session.user.id, amount);
    setBidState(p => ({ ...p, [auctionId]: { loading: true, error: null, success: false } }));
    const { error } = await supabase.from("bids").insert({ auction_id: auctionId, bidder_id: session.user.id, amount });
    if (error) {
      console.error("BID ERROR:", error);
      setBidState(p => ({ ...p, [auctionId]: { error: error.message } }));
    } else {
      setBidState(p => ({ ...p, [auctionId]: { success: true } }));
      setBidAmount(p => ({ ...p, [auctionId]: "" }));
      setTimeout(() => setBidState(p => ({ ...p, [auctionId]: {} })), 3000);
    }
  };

  const handleDeleteBid = async (bidId, auctionId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المزايدة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setBidDeleteState(p => ({ ...p, [bidId]: { loading: true, error: null } }));
    const { error } = await supabase.from("bids").delete().eq("id", bidId);
    if (error) {
      setBidDeleteState(p => ({ ...p, [bidId]: { error: error.message } }));
      setTimeout(() => setBidDeleteState(p => ({ ...p, [bidId]: {} })), 4000);
      return;
    }
    setBidDeleteState(p => ({ ...p, [bidId]: {} }));
    setUserBidsMap(prev => {
      const updated = { ...prev };
      if (updated[auctionId]) updated[auctionId] = updated[auctionId].filter(b => b.id !== bidId);
      return updated;
    });
  };

  // Countdown ticker — runs only on "live" tab
  useEffect(() => {
    if (activeTab !== "live") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activeTab]);

  const formatCountdown = (endsAt) => {
    if (!endsAt) return "—";
    const diff = new Date(endsAt) - now;
    if (diff <= 0) return "انتهى";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Realtime subscription — أشترك عند فتح "مباشر"، وألغِ الاشتراك عند المغادرة
  useEffect(() => {
    if (activeTab !== "live") return;
    const channel = supabase
      .channel("auctions-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "auctions" }, (payload) => {
        setAuctions(prev => prev.map(a =>
          a.id === payload.new.id ? { ...a, current_price: payload.new.current_price } : a
        ));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeTab]);

  const loadWinnerBids = async (auctionsList) => {
    const endedWithWinner = (auctionsList || []).filter(a => a.status === "ended" && a.winner_id);
    if (!endedWithWinner.length) return;
    const ids = endedWithWinner.map(a => a.id);
    const { data: bids } = await supabase.from("bids").select("auction_id, bidder_id, amount")
      .in("auction_id", ids).order("amount", { ascending: false });
    const map = {};
    (bids || []).forEach(b => {
      const auction = endedWithWinner.find(a => a.id === b.auction_id);
      if (auction && b.bidder_id === auction.winner_id && !map[b.auction_id]) {
        map[b.auction_id] = b.amount;
      }
    });
    setWinnerBidsMap(map);
  };

  const loadAuctions = async (tab) => {
    setLoading(true);
    setAuctions([]);

    if (tab === "mine") {
      if (!user) { setLoading(false); return; }
      const { data: myBids } = await supabase.from("bids").select("auction_id").eq("bidder_id", user.id);
      const ids = [...new Set((myBids || []).map(b => b.auction_id))];
      if (!ids.length) { setLoading(false); return; }
      const { data } = await supabase.from("auctions").select("*, sellers(store_name, phone, whatsapp), vehicles(*)").in("id", ids);
      setAuctions(data || []);
      // جلب آخر مزايدة لكل مزاد لمعرفة من هو الأعلى حالياً
      const { data: latestBids } = await supabase
        .from("bids").select("id, auction_id, bidder_id, amount, created_at")
        .in("auction_id", ids).order("created_at", { ascending: false });
      const map = {};
      const myBidsMap = {};
      (latestBids || []).forEach(b => {
        if (!map[b.auction_id]) map[b.auction_id] = b;
        if (b.bidder_id === user.id) {
          if (!myBidsMap[b.auction_id]) myBidsMap[b.auction_id] = [];
          myBidsMap[b.auction_id].push(b);
        }
      });
      setLastBidsMap(map);
      setUserBidsMap(myBidsMap);
      await loadWinnerBids(data || []);
      setLoading(false);
      return;
    }

    let q = supabase.from("auctions").select("*, sellers(store_name, phone, whatsapp), vehicles(*)");
    if (tab === "live")       q = q.eq("status", "live").order("ends_at");
    else if (tab === "upcoming") q = q.eq("status", "upcoming").order("starts_at");
    else if (tab === "ended")    q = q.eq("status", "ended").order("ends_at", { ascending: false });
    const { data } = await q;
    setAuctions(data || []);
    await loadWinnerBids(data || []);
    setLoading(false);
  };

  useEffect(() => { loadAuctions(activeTab); }, [activeTab]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🏆 المزادات</h2>
      <Tabs
        tabs={[{ id: "live", label: "🔴 مباشر" }, { id: "upcoming", label: "⏳ قادم" }, { id: "ended", label: "✅ منتهي" }, { id: "mine", label: "🎯 مزاداتي" }]}
        active={activeTab} onChange={setActiveTab}
      />

      {loading && <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>⏳ جاري التحميل...</div>}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {auctions.length === 0 && activeTab !== "mine" && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{activeTab === "live" ? "🏆" : activeTab === "upcoming" ? "⏳" : "✅"}</div>
              <p style={{ color: T.textSecondary, margin: 0 }}>لا توجد مزادات في هذا القسم حالياً</p>
            </Card>
          )}
          {auctions.length === 0 && activeTab === "mine" && !user && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
              <p style={{ color: T.textSecondary, margin: 0 }}>يجب تسجيل الدخول لعرض مزاداتك</p>
            </Card>
          )}
          {auctions.length === 0 && activeTab === "mine" && user && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <p style={{ color: T.textSecondary, margin: 0 }}>لم تشارك في أي مزاد بعد</p>
            </Card>
          )}

          {auctions.map(auction => {
            const hasVehicle = !!auction.vehicle_id && auction.vehicles;
            const displayImages = hasVehicle ? (auction.vehicles.images || []) : (auction.images || []);
            const firstImg = isImageUrl(displayImages[0]) ? displayImages[0] : null;
            const minRequired = (auction.current_price || auction.starting_price || 0) + (auction.min_increment || 0);
            const lastBid = lastBidsMap[auction.id];
            const isTopBidder = activeTab === "mine" && user && lastBid?.bidder_id === user.id;
            return (
              <Card key={auction.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  {auction.status === "live" ? <Badge color={T.red}>🔴 مباشر</Badge>
                    : auction.status === "upcoming" ? <Badge color={T.gold}>⏳ قادم</Badge>
                    : <Badge color={T.textMuted}>✅ منتهي</Badge>}
                  {auction.status === "live" && (
                    <span style={{ color: T.red, fontWeight: 800, fontFamily: "monospace", fontSize: 18 }}>{formatCountdown(auction.ends_at)}</span>
                  )}
                  {auction.status === "upcoming" && auction.starts_at && (
                    <span style={{ color: T.gold, fontWeight: 700, fontSize: 12 }}>يبدأ: {new Date(auction.starts_at).toLocaleDateString("ar-IQ")}</span>
                  )}
                </div>
                {(() => {
                  const gIdx = galleryIdx[auction.id] || 0;
                  const setG = (n) => setGalleryIdx(p => ({ ...p, [auction.id]: (n + displayImages.length) % displayImages.length }));
                  return displayImages.length > 0 ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 160, background: T.navyLight }}>
                        <img src={displayImages[gIdx]} alt={auction.title} onClick={() => setLightbox(auction.id)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
                        {displayImages.length > 1 && (
                          <>
                            <button onClick={() => setG(gIdx - 1)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                            <button onClick={() => setG(gIdx + 1)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                          </>
                        )}
                      </div>
                      {displayImages.length > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 7 }}>
                          {displayImages.map((_, i) => (
                            <div key={i} onClick={() => setG(i)} style={{ width: gIdx === i ? 16 : 6, height: 6, borderRadius: 3, background: gIdx === i ? T.gold : T.navyBorder, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 48, textAlign: "center", background: T.navyLight, borderRadius: 12, padding: "16px 0", marginBottom: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><span>🚗</span><span style={{ fontSize: 12, color: T.textMuted }}>لا توجد صور متاحة</span></div>
                  );
                })()}
                {hasVehicle && (
                  <div style={{ background: T.navyMid, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ color: T.gold, fontWeight: 800, fontSize: 12, marginBottom: 6 }}>🚗 تفاصيل المركبة</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {auction.vehicles.brand && auction.vehicles.model && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>الموديل</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{auction.vehicles.brand} {auction.vehicles.model}</div></div>
                      )}
                      {auction.vehicles.year && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>سنة الصنع</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{auction.vehicles.year}</div></div>
                      )}
                      {auction.vehicles.chassis_number && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>رقم الشاصي</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 11 }}>{auction.vehicles.chassis_number}</div></div>
                      )}
                      {auction.vehicles.import_origin && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>أصل الاستيراد</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{auction.vehicles.import_origin === "american" ? "وارد أمريكي" : "وارد خليجي"}</div></div>
                      )}
                      {auction.vehicles.mileage_km != null && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>المسافة المقطوعة</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{Number(auction.vehicles.mileage_km).toLocaleString("ar-IQ")} كم</div></div>
                      )}
                    </div>
                  </div>
                )}
                <h3 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 15, fontWeight: 800 }}>{auction.title}</h3>
                {auction.description && <p style={{ margin: "0 0 8px", color: T.textMuted, fontSize: 12 }}>{auction.description}</p>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <p style={{ margin: "0 0 2px", color: T.textMuted, fontSize: 12 }}>السعر الحالي</p>
                    <p style={{ margin: 0, color: T.gold, fontWeight: 900, fontSize: 18 }}>{(auction.current_price || auction.starting_price || 0).toLocaleString("ar-IQ")} د.ع</p>
                  </div>
                  {activeTab === "mine" && (
                    isTopBidder
                      ? <span style={{ background: `${T.green}22`, color: T.green, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✅ أنت الأعلى</span>
                      : <span style={{ background: `${T.red}22`, color: T.red, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>تمت مزايدة أعلى منك</span>
                  )}
                </div>
                {auction.status === "live" && (() => {
                  if (!user) return (
                    <p style={{ margin: 0, color: T.textMuted, fontSize: 13, fontWeight: 600, textAlign: "center", padding: "10px 0" }}>🔒 سجّل دخولك أولاً للمزايدة</p>
                  );
                  const bid = bidState[auction.id] || {};
                  return (
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <input
                          type="number"
                          placeholder={`أدنى: ${minRequired.toLocaleString("ar-IQ")}`}
                          value={bidAmount[auction.id] || ""}
                          onChange={e => setBidAmount(p => ({ ...p, [auction.id]: e.target.value }))}
                          style={{ flex: 1, background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none" }}
                        />
                        <Btn
                          onClick={() => handleBid(auction.id)}
                          variant={bid.success ? "green" : "primary"}
                          disabled={bid.loading}
                          icon={bid.loading ? "⏳" : bid.success ? "✓" : "🏷️"}
                        >
                          {bid.loading ? "..." : bid.success ? "تم!" : "زايد الآن"}
                        </Btn>
                      </div>
                      {bid.error && <p style={{ margin: "4px 0 0", color: T.red, fontSize: 12, fontWeight: 600 }}>{bid.error}</p>}
                      {bid.success && <p style={{ margin: "4px 0 0", color: T.green, fontSize: 12, fontWeight: 700 }}>✓ تمت المزايدة بنجاح!</p>}
                    </div>
                  );
                })()}
                {auction.status === "ended" && (() => {
                  if (!auction.winner_id) {
                    return (
                      <div style={{ background: `${T.navyLight}`, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                        <p style={{ margin: 0, color: T.textMuted, fontSize: 13, fontWeight: 600 }}>🔒 انتهى المزاد بدون أي مزايدات</p>
                      </div>
                    );
                  }
                  const winAmount = winnerBidsMap[auction.id];
                  const isWinner = user && user.id === auction.winner_id;
                  if (isWinner) {
                    return (
                      <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}55`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", color: T.green, fontSize: 15, fontWeight: 800 }}>🎉 لقد فزت بهذا المزاد!</p>
                        {winAmount != null && <p style={{ margin: 0, color: T.green, fontSize: 13, fontWeight: 700 }}>السعر النهائي: {winAmount.toLocaleString("ar-IQ")} د.ع</p>}
                      </div>
                    );
                  }
                  return (
                    <div style={{ background: `${T.navyLight}`, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                      <p style={{ margin: "0 0 4px", color: T.textMuted, fontSize: 13, fontWeight: 600 }}>🔒 انتهى المزاد</p>
                      {winAmount != null && <p style={{ margin: 0, color: T.gold, fontSize: 13, fontWeight: 700 }}>السعر النهائي: {winAmount.toLocaleString("ar-IQ")} د.ع</p>}
                    </div>
                  );
                })()}
                {activeTab === "mine" && auction.status === "ended" && userBidsMap[auction.id]?.length > 0 && (
                  <div style={{ marginTop: 10, background: T.navyMid, borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ margin: "0 0 8px", color: T.textSecondary, fontSize: 12, fontWeight: 700 }}>📋 مزايداتي في هذا المزاد</p>
                    {userBidsMap[auction.id].map(bid => {
                      const ds = bidDeleteState[bid.id] || {};
                      return (
                        <div key={bid.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${T.navyBorder}` }}>
                          <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 700 }}>{bid.amount.toLocaleString("ar-IQ")} د.ع</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {ds.error && <span style={{ color: T.red, fontSize: 11 }}>{ds.error}</span>}
                            <button onClick={() => handleDeleteBid(bid.id, auction.id)} disabled={ds.loading} style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, color: T.red, borderRadius: 7, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                              {ds.loading ? "..." : "🗑️"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {(auction.sellers?.phone || auction.sellers?.whatsapp) && (
                  <div style={{ background: T.navyMid, borderRadius: 10, padding: "10px 12px", marginTop: 10, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                    <span style={{ color: T.textSecondary, fontSize: 12, fontWeight: 700, flexBasis: "100%", textAlign: "center", marginBottom: 4 }}>📞 تواصل مع البائع</span>
                    {auction.sellers.phone && (
                      <a href={`tel:${auction.sellers.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${T.blue}22`, color: T.blue, border: `1px solid ${T.blue}44`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                        📱 اتصال
                      </a>
                    )}
                    {auction.sellers.whatsapp && (
                      <a href={`https://wa.me/${toWhatsAppNumber(auction.sellers.whatsapp)}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#25D36622", color: "#25D366", border: "1px solid #25D36644", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                        💬 واتساب
                      </a>
                    )}
                  </div>
                )}
                {auction.sellers?.store_name && (
                  <p style={{ margin: "8px 0 0", color: T.textMuted, fontSize: 11, textAlign: "center" }}>
                    {auction.min_increment ? `أدنى زيادة: ${auction.min_increment.toLocaleString("ar-IQ")} د.ع | ` : ""}البائع: {auction.sellers.store_name}
                  </p>
                )}
              </Card>
            );
          })}

          {activeTab === "live" && (
            <Card style={{ textAlign: "center", padding: 28, border: `2px dashed ${T.navyBorder}`, background: "transparent" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏷️</div>
              <h4 style={{ margin: "0 0 8px", color: T.textPrimary }}>أنشئ مزادك الخاص</h4>
              <p style={{ margin: "0 0 16px", color: T.textMuted, fontSize: 13 }}>بع سيارتك أو قطعتك عبر المزاد</p>
              <Btn onClick={handleOpenCreate}>إنشاء مزاد جديد</Btn>
            </Card>
          )}
        </div>
      )}

      {lightbox !== null && (() => {
        const lbAuction = auctions.find(a => a.id === lightbox);
        if (!lbAuction) return null;
        const lbHasVehicle = !!lbAuction.vehicle_id && lbAuction.vehicles;
        const lbImages = lbHasVehicle ? (lbAuction.vehicles.images || []) : (lbAuction.images || []);
        const lbIdx = galleryIdx[lightbox] || 0;
        const lbSetG = (n) => setGalleryIdx(p => ({ ...p, [lightbox]: (n + lbImages.length) % lbImages.length }));
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column" }}>
            <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 16, right: 16, zIndex: 10000, background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</button>
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
              <img src={lbImages[lbIdx]} alt={lbAuction.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              {lbImages.length > 1 && (
                <>
                  <button onClick={() => lbSetG(lbIdx - 1)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                  <button onClick={() => lbSetG(lbIdx + 1)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                </>
              )}
            </div>
            {lbImages.length > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 5, padding: "8px 0" }}>
                {lbImages.map((_, i) => (
                  <div key={i} onClick={() => lbSetG(i)} style={{ width: lbIdx === i ? 16 : 6, height: 6, borderRadius: 3, background: lbIdx === i ? T.gold : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }} />
                ))}
              </div>
            )}
            <div style={{ background: T.navyCard, padding: "14px 16px", overflowY: "auto", maxHeight: "35vh" }}>
              <h3 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 15, fontWeight: 800 }}>{lbAuction.title}</h3>
              <p style={{ margin: "0 0 10px", color: T.gold, fontWeight: 900, fontSize: 16 }}>{(lbAuction.current_price || lbAuction.starting_price || 0).toLocaleString("ar-IQ")} د.ع</p>
              {lbHasVehicle && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {lbAuction.vehicles.brand && lbAuction.vehicles.model && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>الموديل</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{lbAuction.vehicles.brand} {lbAuction.vehicles.model}</div></div>
                  )}
                  {lbAuction.vehicles.year && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>سنة الصنع</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{lbAuction.vehicles.year}</div></div>
                  )}
                  {lbAuction.vehicles.chassis_number && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>رقم الشاصي</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 11 }}>{lbAuction.vehicles.chassis_number}</div></div>
                  )}
                  {lbAuction.vehicles.import_origin && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>أصل الاستيراد</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{lbAuction.vehicles.import_origin === "american" ? "وارد أمريكي" : "وارد خليجي"}</div></div>
                  )}
                  {lbAuction.vehicles.mileage_km != null && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>المسافة المقطوعة</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{Number(lbAuction.vehicles.mileage_km).toLocaleString("ar-IQ")} كم</div></div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <Modal isOpen={showCreateModal} onClose={() => { if (!creating) { auctionImagePreviews.forEach(u => URL.revokeObjectURL(u)); setAuctionImagePreviews([]); setAuctionImageFiles([]); setShowCreateModal(false); } }} title="إنشاء مزاد جديد 🏷️">
        {createSuccess ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: T.green, fontWeight: 700, fontSize: 16 }}>تم إنشاء المزاد بنجاح!</p>
          </div>
        ) : (
          <>
            <Input label="عنوان المزاد *" value={createForm.title} onChange={v => setCreateForm(f => ({ ...f, title: v }))} placeholder="مثال: تويوتا كامري 2020 للبيع بالمزاد" />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الفئة *</label>
              <select value={createForm.category_id} onChange={e => setCreateForm(f => ({ ...f, category_id: e.target.value, vehicle_id: "" }))} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box", appearance: "none" }}>
                <option value="">-- اختر الفئة --</option>
                {auctionCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {String(createForm.category_id) === "8" ? (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>المركبة *</label>
                {sellerVehicles.length === 0 ? (
                  <div style={{ background: `${T.gold}11`, border: `1px solid ${T.gold}44`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ margin: "0 0 10px", color: T.textSecondary, fontSize: 13 }}>لا توجد مركبات مسجلة. أضف مركبتك أولاً من شاشة مركبتي.</p>
                    <Btn size="sm" variant="secondary" onClick={() => { setShowCreateModal(false); if (typeof onNavigate === "function") onNavigate("garage"); }}>انتقل إلى مركبتي</Btn>
                  </div>
                ) : (
                  <select value={createForm.vehicle_id} onChange={e => setCreateForm(f => ({ ...f, vehicle_id: e.target.value }))} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box", appearance: "none" }}>
                    <option value="">-- اختر المركبة --</option>
                    {sellerVehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model}{v.year ? ` (${v.year})` : ""}{v.plate_number ? ` — ${v.plate_number}` : ""}</option>)}
                  </select>
                )}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6 }}>الوصف</label>
                  <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="تفاصيل إضافية عن المنتج..." rows={3} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6 }}>صور المزاد</label>
                  <input type="file" accept="image/*" multiple onChange={e => {
                    const files = Array.from(e.target.files);
                    setAuctionImageFiles(prev => [...prev, ...files]);
                    files.forEach(file => setAuctionImagePreviews(prev => [...prev, URL.createObjectURL(file)]));
                    e.target.value = "";
                  }} style={{ display: "none" }} id="auction-img-input" />
                  <label htmlFor="auction-img-input" style={{ display: "inline-block", background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: "10px 18px", color: T.textSecondary, fontSize: 13, cursor: "pointer" }}>+ إضافة صور</label>
                  {auctionImagePreviews.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {auctionImagePreviews.map((url, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img src={url} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
                          <button onClick={() => { URL.revokeObjectURL(url); setAuctionImagePreviews(p => p.filter((_, j) => j !== i)); setAuctionImageFiles(p => p.filter((_, j) => j !== i)); }} style={{ position: "absolute", top: -6, right: -6, background: T.red, color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="السعر الابتدائي (د.ع) *" value={createForm.starting_price} onChange={v => setCreateForm(f => ({ ...f, starting_price: v.replace(/[^0-9]/g, "") }))} placeholder="0" type="number" />
              <Input label="أدنى زيادة (د.ع)" value={createForm.min_increment} onChange={v => setCreateForm(f => ({ ...f, min_increment: v.replace(/[^0-9]/g, "") }))} placeholder="0" type="number" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6 }}>تاريخ ووقت البداية *</label>
              <input type="datetime-local" value={createForm.starts_at} onChange={e => setCreateForm(f => ({ ...f, starts_at: e.target.value }))} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6 }}>تاريخ ووقت النهاية *</label>
              <input type="datetime-local" value={createForm.ends_at} onChange={e => setCreateForm(f => ({ ...f, ends_at: e.target.value }))} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            {createError && <p style={{ color: T.red, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{createError}</p>}
            <div style={{ background: `${T.gold}11`, border: `1px solid ${T.gold}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
              <p style={{ margin: 0, color: T.textSecondary, fontSize: 12, lineHeight: 1.6 }}>تنبيه: لا يمكن حذف المزاد بعد استلام أي مزايدة عليه، حمايةً لحقوق المزايدين. تأكد من جميع التفاصيل قبل النشر.</p>
            </div>
            <Btn fullWidth onClick={handleCreateAuction} disabled={creating || (String(createForm.category_id) === "8" && sellerVehicles.length === 0)}>{creating ? "جارٍ الإنشاء..." : "إنشاء المزاد"}</Btn>
          </>
        )}
      </Modal>
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

// ── SELLER DASHBOARD SCREEN ──────────────────────────────────────
const SellerAnalyticsTab = ({ sellerId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    (async () => {
      const [{ data: viewsData }, { data: topProds }, { count: totalOrders }] = await Promise.all([
        supabase.from("seller_product_analytics").select("*").eq("seller_id", sellerId).limit(10),
        supabase.from("products").select("id,name,stock,price").eq("seller_id", sellerId).eq("status", "active").order("price", { ascending: false }).limit(5),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", sellerId),
      ]);
      setAnalytics({ views: viewsData || [], topProds: topProds || [], totalOrders: totalOrders || 0 });
      setLoading(false);
    })();
  }, [sellerId]);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>;

  return (
    <div>
      <Card style={{ marginBottom: 14, background: `${T.blue}11`, border: `1px solid ${T.blue}33` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ color: T.textMuted, fontSize: 12 }}>إجمالي الطلبات</div><div style={{ color: T.blue, fontWeight: 900, fontSize: 24 }}>{analytics.totalOrders}</div></div>
          <span style={{ fontSize: 32 }}>📦</span>
        </div>
      </Card>
      {analytics.views.length > 0 && (
        <Card style={{ marginBottom: 14 }}>
          <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>📊 إحصائيات المنتجات</h4>
          {analytics.views.map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < analytics.views.length - 1 ? `1px solid ${T.navyBorder}` : "none" }}>
              <span style={{ color: T.textPrimary, fontSize: 13 }}>{row.product_name || row.product_id}</span>
              <span style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>{row.view_count || row.views || 0} مشاهدة</span>
            </div>
          ))}
        </Card>
      )}
      {analytics.topProds.length > 0 && (
        <Card>
          <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>🏆 أعلى منتجاتك سعراً</h4>
          {analytics.topProds.map((p, i) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < analytics.topProds.length - 1 ? `1px solid ${T.navyBorder}` : "none" }}>
              <span style={{ color: T.textPrimary, fontSize: 13 }}>{p.name}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>{p.price?.toLocaleString("ar-IQ")} د.ع</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>مخزون: {p.stock}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

const SellerDashScreen = ({ session, profile }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sellerId, setSellerId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "", price: "", old_price: "", category_id: "",
    stock: "1", condition: "new", city: "",
    brand: "", model: "", year: "", mileage: "", transmission: "", fuel_type: "",
    discount_percent: "0", discount_ends_at: "",
  });
  const [saving, setSaving] = useState(false);
  const [savingStage, setSavingStage] = useState("");
  const [saveError, setSaveError] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerOrdersLoading, setSellerOrdersLoading] = useState(false);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState({});
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerStats, setSellerStats] = useState({ pendingCount: 0, todayCount: 0, revenue: 0, rating: null });
  const [sellerAuctions, setSellerAuctions] = useState([]);
  const [sellerAuctionsLoading, setSellerAuctionsLoading] = useState(false);
  const [deleteAuctionSuccess, setDeleteAuctionSuccess] = useState("");
  const [deleteAuctionError, setDeleteAuctionError] = useState("");
  const [editingAuction, setEditingAuction] = useState(null);
  const [editAuctionForm, setEditAuctionForm] = useState({ title: "", description: "", starting_price: "", min_increment: "", ends_at: "", category_id: "", vehicle_id: "" });
  const [editAuctionCategories, setEditAuctionCategories] = useState([]);
  const [editAuctionVehicles, setEditAuctionVehicles] = useState([]);
  const [editAuctionNewFiles, setEditAuctionNewFiles] = useState([]);
  const [editAuctionNewPreviews, setEditAuctionNewPreviews] = useState([]);
  const [editAuctionSaving, setEditAuctionSaving] = useState(false);
  const [editAuctionError, setEditAuctionError] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const user = session?.user;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rows } = await supabase.from("sellers").select("id, store_name, verified, rating, seller_type, specialty, is_verified, plan, max_products, response_rate").eq("owner_id", user.id);
      const data = rows?.[0] || null;
      if (data) {
        setSellerId(data.id);
        setSellerInfo(data);
        loadProducts(data.id);
        const today = new Date().toISOString().split("T")[0];
        const [{ count: pendingCount }, { count: todayCount }, { data: revenueRows }] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", data.id).eq("status", "pending"),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", data.id).gte("created_at", today),
          supabase.from("orders").select("total_amount").eq("seller_id", data.id),
        ]);
        const revenue = (revenueRows || []).reduce((s, r) => s + (r.total_amount || 0), 0);
        setSellerStats({ pendingCount: pendingCount || 0, todayCount: todayCount || 0, revenue, rating: data.rating });
      }
    })();
    (async () => {
      const { data } = await supabase.from("categories").select("id,name").order("sort_order");
      setCategories(data || []);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!sellerInfo?.id) return;
    const dayNames = ["أحد", "اثن", "ثلث", "أربع", "خمس", "جمعة", "سبت"];
    supabase.from("seller_weekly_revenue").select("*").eq("seller_id", sellerInfo.id).then(({ data }) => {
      const today = new Date();
      const result = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const row = (data || []).find(r => r.day_date === dateStr || r.sale_date === dateStr || r.order_date === dateStr);
        return { day: dayNames[d.getDay()], amount: Number(row?.total_revenue || row?.revenue || 0) };
      });
      const maxAmt = Math.max(...result.map(r => r.amount), 1);
      const isEmpty = result.every(r => r.amount === 0);
      setWeeklyChartData(result.map((r, i) => ({
        ...r,
        heightPct: isEmpty ? 4 : Math.max(4, Math.round((r.amount / maxAmt) * 100)),
        isToday: i === 6,
        isEmpty,
      })));
    });
    supabase.from("products").select("id,name,stock").eq("seller_id", sellerInfo.id).eq("status", "active").lte("stock", 5).order("stock", { ascending: true }).limit(5).then(({ data }) => {
      setLowStockProducts(data || []);
    });
  }, [sellerInfo?.id]);

  useEffect(() => {
    if (activeTab !== "reports" || !sellerInfo?.id || reportData) return;
    setReportLoading(true);
    Promise.all([
      supabase.from("orders").select("total_amount").eq("seller_id", sellerInfo.id),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", sellerInfo.id),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", sellerInfo.id).eq("status", "delivered"),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("seller_id", sellerInfo.id).eq("status", "active"),
      supabase.from("seller_top_products").select("*").eq("seller_id", sellerInfo.id).limit(5),
    ]).then(([{ data: revRows }, { count: orderCount }, { count: deliveredCount }, { count: activeCount }, { data: topProducts }]) => {
      const totalRevenue = (revRows || []).reduce((s, r) => s + (r.total_amount || 0), 0);
      setReportData({ totalRevenue, orderCount: orderCount || 0, deliveredCount: deliveredCount || 0, activeCount: activeCount || 0, topProducts: topProducts || [] });
      setReportLoading(false);
    });
  }, [activeTab, sellerInfo?.id]);

  const loadProducts = async (sid) => {
    setProductsLoading(true);
    const { data } = await supabase.from("products").select("*").eq("seller_id", sid).order("created_at", { ascending: false });
    setProducts(data || []);
    setProductsLoading(false);
  };

  const loadSellerOrders = async (sid) => {
    setSellerOrdersLoading(true);
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("seller_id", sid).order("created_at", { ascending: false });
    setSellerOrders(data || []);
    setSellerOrdersLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setOrderStatusUpdating(p => ({ ...p, [orderId]: true }));
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setOrderStatusUpdating(p => ({ ...p, [orderId]: false }));
  };

  const loadSellerAuctions = async (sid) => {
    setSellerAuctionsLoading(true);
    const { data } = await supabase.from("auctions").select("*, categories(name)").eq("seller_id", sid).order("created_at", { ascending: false });
    setSellerAuctions(data || []);
    setSellerAuctionsLoading(false);
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المزاد؟")) return;
    const { data: deleted, error } = await supabase.from("auctions").delete().eq("id", auctionId).select("id");
    if (error) {
      setDeleteAuctionError(`فشل الحذف: ${error.message}`);
      setTimeout(() => setDeleteAuctionError(""), 4000);
      return;
    }
    if (!deleted || deleted.length === 0) {
      setDeleteAuctionError("لا يمكن حذف هذا المزاد لوجود مزايدات فعلية عليه — هذا لحماية المزايدين");
      setTimeout(() => setDeleteAuctionError(""), 5000);
      return;
    }
    setSellerAuctions(prev => prev.filter(a => a.id !== auctionId));
    setDeleteAuctionSuccess("تم حذف المزاد بنجاح");
    setTimeout(() => setDeleteAuctionSuccess(""), 3000);
  };

  const handleOpenEditAuction = async (auction) => {
    setEditingAuction(auction);
    setEditAuctionForm({
      title: auction.title || "",
      description: auction.description || "",
      starting_price: String(auction.starting_price || ""),
      min_increment: String(auction.min_increment || ""),
      ends_at: auction.ends_at ? auction.ends_at.slice(0, 16) : "",
      category_id: auction.category_id ? String(auction.category_id) : "",
      vehicle_id: auction.vehicle_id || "",
    });
    setEditAuctionError(null);
    setEditAuctionNewFiles([]);
    editAuctionNewPreviews.forEach(u => URL.revokeObjectURL(u));
    setEditAuctionNewPreviews([]);
    const [{ data: cats }, { data: veh }] = await Promise.all([
      supabase.from("categories").select("id,name").neq("id", 11).order("sort_order"),
      supabase.from("vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);
    setEditAuctionCategories(cats || []);
    setEditAuctionVehicles(veh || []);
  };

  const handleSaveAuction = async () => {
    if (!editAuctionForm.title.trim()) { setEditAuctionError("عنوان المزاد مطلوب"); return; }
    if (!editAuctionForm.ends_at) { setEditAuctionError("تاريخ النهاية مطلوب"); return; }
    setEditAuctionSaving(true);
    setEditAuctionError(null);
    const isCars = String(editAuctionForm.category_id) === "8";
    let images = editingAuction.images || [];
    if (editAuctionNewFiles.length > 0) {
      for (let i = 0; i < editAuctionNewFiles.length; i++) {
        const file = editAuctionNewFiles[i];
        const path = `auctions/${Date.now()}_${i}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
        if (upErr) { setEditAuctionError(`فشل رفع الصورة: ${upErr.message}`); setEditAuctionSaving(false); return; }
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        images = [...images, urlData.publicUrl];
      }
    }
    const { error } = await supabase.from("auctions").update({
      title: editAuctionForm.title.trim(),
      description: isCars ? null : (editAuctionForm.description.trim() || null),
      starting_price: Number(editAuctionForm.starting_price),
      min_increment: editAuctionForm.min_increment ? Number(editAuctionForm.min_increment) : 0,
      ends_at: editAuctionForm.ends_at,
      category_id: Number(editAuctionForm.category_id),
      vehicle_id: isCars ? (editAuctionForm.vehicle_id || null) : null,
      images,
    }).eq("id", editingAuction.id);
    setEditAuctionSaving(false);
    if (error) { setEditAuctionError(error.message); return; }
    setEditingAuction(null);
    editAuctionNewPreviews.forEach(u => URL.revokeObjectURL(u));
    setEditAuctionNewPreviews([]);
    setEditAuctionNewFiles([]);
    setDeleteAuctionSuccess("تم تحديث المزاد بنجاح");
    setTimeout(() => setDeleteAuctionSuccess(""), 3000);
    loadSellerAuctions(sellerId);
  };

  useEffect(() => {
    if (activeTab === "orders" && sellerId) loadSellerOrders(sellerId);
    if (activeTab === "auctions" && sellerId) loadSellerAuctions(sellerId);
  }, [activeTab, sellerId]);

  const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
  const isCarCategory = selectedCat?.name?.includes("سيارات");

  const resetForm = () => {
    setForm({
      name: "", price: "", old_price: "", category_id: "",
      stock: "1", condition: "new", city: "",
      brand: "", model: "", year: "", mileage: "", transmission: "", fuel_type: "",
      discount_percent: "0", discount_ends_at: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name || "",
      price: p.price ? String(p.price) : "",
      old_price: p.old_price ? String(p.old_price) : "",
      category_id: p.category_id ? String(p.category_id) : "",
      stock: p.stock ? String(p.stock) : "1",
      condition: p.condition || "new",
      city: p.city || "",
      brand: p.brand || "",
      model: p.model || "",
      year: p.year ? String(p.year) : "",
      mileage: p.mileage ? String(p.mileage) : "",
      transmission: p.transmission || "",
      fuel_type: p.fuel_type || "",
      discount_percent: p.discount_percent ? String(p.discount_percent) : "0",
      discount_ends_at: p.discount_ends_at ? p.discount_ends_at.slice(0, 16) : "",
    });
    setImageFile(null);
    setImagePreview(isImageUrl(p.images?.[0]) ? p.images[0] : null);
    setSaveError(null);
    setSaveSuccessMsg("");
    setShowAddModal(true);
  };

  const compressImage = (file) => new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1000;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.78);
    };
    img.src = url;
  });

  const handleDelete = async (productId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) { alert(`فشل الحذف: ${error.message}`); return; }
    setDeleteSuccessMsg("تم حذف المنتج بنجاح");
    loadProducts(sellerId);
    setTimeout(() => setDeleteSuccessMsg(""), 3000);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.category_id) {
      setSaveError("يرجى ملء الحقول المطلوبة: الاسم والسعر والقسم");
      return;
    }
    setSaveError(null);
    setSaving(true);

    const { data: sellerData, error: sellerErr } = await supabase.from("sellers").select("id").eq("owner_id", user.id).single();
    if (sellerErr || !sellerData) {
      setSaveError("لا يوجد متجر مرتبط بحسابك");
      setSaving(false);
      return;
    }

    let images = editProduct ? (editProduct.images || []) : [];
    if (imageFile) {
      setSavingStage("uploading");
      const compressed = await compressImage(imageFile);
      const path = `${sellerData.id}/${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, compressed, { contentType: "image/jpeg" });
      if (uploadErr) {
        setSaveError(`فشل رفع الصورة: ${uploadErr.message}`);
        setSaving(false);
        setSavingStage("");
        return;
      }
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      images = [urlData.publicUrl];
    }

    setSavingStage("saving");
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      category_id: form.category_id,
      stock: Number(form.stock) || 1,
      condition: form.condition,
      city: form.city.trim() || null,
      images,
      discount_percent: Number(form.discount_percent) || 0,
      discount_ends_at: form.discount_ends_at ? form.discount_ends_at : null,
    };
    if (isCarCategory) {
      payload.brand = form.brand.trim() || null;
      payload.model = form.model.trim() || null;
      payload.year = form.year ? Number(form.year) : null;
      payload.mileage = form.mileage ? Number(form.mileage) : null;
      payload.transmission = form.transmission || null;
      payload.fuel_type = form.fuel_type || null;
    }

    let opError;
    if (editProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editProduct.id);
      opError = error;
    } else {
      const { error } = await supabase.from("products").insert({ ...payload, seller_id: sellerData.id, status: "active" });
      opError = error;
    }
    setSaving(false);
    setSavingStage("");
    if (opError) { setSaveError(opError.message); return; }
    const msg = editProduct ? "تم تحديث المنتج بنجاح" : "تمت إضافة المنتج بنجاح";
    setShowAddModal(false);
    setEditProduct(null);
    resetForm();
    setSaveSuccessMsg(msg);
    loadProducts(sellerData.id);
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const selectStyle = {
    width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`,
    borderRadius: 10, padding: "11px 14px", color: T.textPrimary,
    fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    appearance: "none", cursor: "pointer",
  };

  const stats = [
    { label: "مبيعات اليوم", value: sellerStats.todayCount.toLocaleString("ar-IQ"), icon: "📦" },
    { label: "الإيرادات", value: sellerStats.revenue.toLocaleString("ar-IQ"), icon: "💰" },
    { label: "طلبات جديدة", value: sellerStats.pendingCount.toLocaleString("ar-IQ"), icon: "🔔", urgent: true },
    { label: "التقييم", value: sellerStats.rating != null ? sellerStats.rating.toFixed(1) : "—", icon: "⭐" },
  ];

  const orderStatusOptions = [
    { value: "pending", label: "قيد الانتظار", color: T.orange },
    { value: "confirmed", label: "تم التأكيد", color: T.blue },
    { value: "shipped", label: "تم الشحن", color: T.gold },
    { value: "delivered", label: "تم التسليم", color: T.green },
    { value: "cancelled", label: "ملغي", color: T.red },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>لوحة البائع 🏪</h2>
          <p style={{ margin: 0, color: T.textSecondary, fontSize: 12 }}>{sellerInfo?.store_name || "..."}</p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {(sellerInfo?.is_verified || sellerInfo?.verified) ? <Badge color={T.green}>✓ موثق</Badge> : <Badge color={T.orange}>غير موثق</Badge>}
          {sellerInfo?.plan && <Badge color={sellerInfo.plan === "premium" ? T.gold : sellerInfo.plan === "pro" ? T.blue : T.textMuted}>{sellerInfo.plan}</Badge>}
        </div>
      </div>
      {!(sellerInfo?.is_verified || sellerInfo?.verified) && sellerInfo && (
        <Card style={{ marginBottom: 16, background: `${T.orange}11`, border: `1px solid ${T.orange}44` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 24 }}>🔖</span>
            <div>
              <div style={{ color: T.orange, fontWeight: 700, fontSize: 13 }}>متجرك غير موثق بعد</div>
              <div style={{ color: T.textMuted, fontSize: 12 }}>تواصل مع الإدارة عبر الدعم لتوثيق متجرك والحصول على شارة التحقق</div>
            </div>
          </div>
        </Card>
      )}
      {sellerInfo?.max_products && (
        <Card style={{ marginBottom: 16, background: `${T.blue}11`, border: `1px solid ${T.blue}33` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: T.textSecondary, fontSize: 12 }}>المنتجات المستخدمة</div>
              <div style={{ color: products.length >= sellerInfo.max_products ? T.red : T.blue, fontWeight: 800, fontSize: 16 }}>{products.length} / {sellerInfo.max_products}</div>
            </div>
            {products.length >= sellerInfo.max_products && (
              <button onClick={() => { const n = toWhatsAppNumber("07700000000"); if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent("أريد ترقية اشتراكي في دكتور السيارات")}`); }} style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, border: "none", borderRadius: 10, padding: "8px 14px", color: T.navy, fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>ترقية الخطة ⬆️</button>
            )}
          </div>
        </Card>
      )}

      {saveSuccessMsg && (
        <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>
          ✓ {saveSuccessMsg}
        </div>
      )}

      {deleteSuccessMsg && (
        <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13, fontWeight: 700 }}>
          🗑️ {deleteSuccessMsg}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {stats.map(stat => (
          <Card key={stat.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 6px", color: T.textMuted, fontSize: 12 }}>{stat.label}</p>
                <p style={{ margin: 0, color: stat.urgent ? T.red : T.gold, fontWeight: 900, fontSize: 22 }}>{stat.value}</p>
              </div>
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: "نظرة عامة" },
          { id: "orders", label: "الطلبات" },
          { id: "products", label: "المنتجات" },
          ...(sellerInfo?.seller_type === "wholesale" || profile?.role === "trader" ? [{ id: "warehouse", label: "مستودعي" }] : []),
          { id: "auctions", label: "مزاداتي" },
          { id: "analytics", label: "إحصائيات" },
          { id: "reports", label: "التقارير" },
        ]}
        active={activeTab} onChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <div>
          {/* Revenue Chart */}
          <Card style={{ marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>📈 الإيرادات الأسبوعية</h4>
            {weeklyChartData.length === 0 ? (
              <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                  {weeklyChartData.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: `${d.heightPct}%`, background: d.isToday ? `linear-gradient(180deg, ${T.gold}, ${T.goldDark})` : `${T.gold}44`, borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                      <span style={{ color: T.textMuted, fontSize: 9 }}>{d.day}</span>
                    </div>
                  ))}
                </div>
                {weeklyChartData[0]?.isEmpty && <p style={{ textAlign: "center", color: T.textMuted, fontSize: 12, margin: "8px 0 0" }}>لا توجد مبيعات هذا الأسبوع بعد</p>}
              </>
            )}
          </Card>

          {/* Inventory Alerts */}
          <Card>
            <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>⚠️ تحذيرات المخزون</h4>
            {lowStockProducts.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span style={{ color: T.green, fontSize: 13 }}>جميع المنتجات متوفرة بكميات كافية</span>
              </div>
            ) : lowStockProducts.map((item, i) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < lowStockProducts.length - 1 ? `1px solid ${T.navyBorder}` : "none" }}>
                <span style={{ color: T.textSecondary, fontSize: 13 }}>{item.name}</span>
                <span style={{ color: item.stock === 0 ? T.red : T.orange, fontWeight: 700 }}>{item.stock === 0 ? "نفد" : `${item.stock} قطعة`}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sellerOrdersLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
          ) : sellerOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p style={{ color: T.textMuted, margin: 0 }}>لا توجد طلبات بعد</p>
            </div>
          ) : sellerOrders.map(order => {
            const statusInfo = orderStatusOptions.find(s => s.value === order.status) || { label: order.status, color: T.textMuted };
            const itemNames = order.order_items?.map(i => i.product_name).join("، ") || "—";
            const date = new Date(order.created_at).toLocaleDateString("ar-IQ");
            return (
              <Card key={order.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>{date}</span>
                  <Badge small color={statusInfo.color}>{statusInfo.label}</Badge>
                </div>
                <p style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>{itemNames}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>الكمية: {order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0}</span>
                  <span style={{ color: T.gold, fontWeight: 800 }}>{order.total_amount?.toLocaleString("ar-IQ")} د.ع</span>
                </div>
                <div style={{ background: T.navyLight, borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                  {order.buyer_name && <span style={{ color: T.textSecondary, fontSize: 12 }}>👤 {order.buyer_name}</span>}
                  <span style={{ color: T.textSecondary, fontSize: 12 }}>📱 {order.buyer_phone}</span>
                  <span style={{ color: T.textSecondary, fontSize: 12 }}>📍 {order.buyer_address}{order.city ? ` — ${order.city}` : ""}</span>
                  {order.notes && <span style={{ color: T.textMuted, fontSize: 11 }}>📝 {order.notes}</span>}
                </div>
                <select
                  value={order.status}
                  disabled={!!orderStatusUpdating[order.id]}
                  onChange={e => handleUpdateStatus(order.id, e.target.value)}
                  style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 8, padding: "8px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none" }}
                >
                  {orderStatusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: T.textSecondary, fontSize: 13 }}>{products.length} منتج</span>
            <Btn size="sm" icon="+" variant="primary" onClick={() => { setSaveError(null); setSaveSuccessMsg(""); resetForm(); setShowAddModal(true); }}>منتج جديد</Btn>
          </div>
          {productsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textSecondary, fontSize: 13 }}>جارٍ التحميل...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
              <p style={{ color: T.textSecondary, fontSize: 14, margin: 0 }}>لا توجد منتجات بعد. أضف منتجك الأول!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {products.map(p => (
                <Card key={p.id}>
                  <div style={{ fontSize: 36, textAlign: "center", background: T.navyLight, borderRadius: 10, marginBottom: 8, overflow: "hidden", height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isImageUrl(p.images?.[0]) ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    ) : (p.images?.[0] || "📦")}
                  </div>
                  <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 12, fontWeight: 700 }}>{p.name}</p>
                  <p style={{ margin: "0 0 8px", color: T.gold, fontSize: 13, fontWeight: 800 }}>{Number(p.price).toLocaleString("ar-IQ")} د.ع</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Btn size="sm" variant="ghost" fullWidth onClick={() => handleEdit(p)}>تعديل</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(p.id)}>🗑️</Btn>
                    <Btn size="sm" variant={p.is_promoted ? "secondary" : "ghost"} fullWidth onClick={async () => {
                      await supabase.from("products").update({ is_promoted: !p.is_promoted }).eq("id", p.id);
                      setProducts(prev => prev.map(pp => pp.id === p.id ? { ...pp, is_promoted: !pp.is_promoted } : pp));
                    }}>{p.is_promoted ? "⭐ ممول" : "روّج"}</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "warehouse" && (
        <div>
          {sellerInfo?.specialty && (
            <Card style={{ marginBottom: 16, background: `${T.purple}11`, border: `1px solid ${T.purple}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>📦</span>
                <div>
                  <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 2 }}>تخصص المستودع</div>
                  <div style={{ color: T.purple, fontWeight: 800, fontSize: 15 }}>{sellerInfo.specialty}</div>
                </div>
              </div>
            </Card>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: T.textSecondary, fontSize: 13 }}>{products.length} منتج في المستودع</span>
            <Btn size="sm" icon="+" variant="primary" onClick={() => { setSaveError(null); setSaveSuccessMsg(""); resetForm(); setShowAddModal(true); }}>أضف للمستودع</Btn>
          </div>
          {productsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textSecondary, fontSize: 13 }}>جارٍ التحميل...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏭</div>
              <p style={{ color: T.textSecondary, fontSize: 14, margin: 0 }}>المستودع فارغ. أضف بضاعتك الأولى!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {products.map(p => (
                <Card key={p.id}>
                  <div style={{ fontSize: 36, textAlign: "center", background: T.navyLight, borderRadius: 10, marginBottom: 8, overflow: "hidden", height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isImageUrl(p.images?.[0]) ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    ) : (p.images?.[0] || "📦")}
                  </div>
                  <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 12, fontWeight: 700 }}>{p.name}</p>
                  <p style={{ margin: "0 0 8px", color: T.gold, fontSize: 13, fontWeight: 800 }}>{Number(p.price).toLocaleString("ar-IQ")} د.ع</p>
                  <Badge small color={T.purple}>مستودع</Badge>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <Btn size="sm" variant="ghost" fullWidth onClick={() => handleEdit(p)}>تعديل</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(p.id)}>🗑️</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "auctions" && (
        <div>
          {deleteAuctionSuccess && (
            <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>
              ✓ {deleteAuctionSuccess}
            </div>
          )}
          {deleteAuctionError && (
            <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13, fontWeight: 700 }}>
              ⚠️ {deleteAuctionError}
            </div>
          )}
          {sellerAuctionsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
          ) : sellerAuctions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏷️</div>
              <p style={{ color: T.textMuted, margin: 0 }}>لا توجد مزادات بعد</p>
            </div>
          ) : sellerAuctions.map(auction => {
            const firstImg = isImageUrl((auction.images || [])[0]) ? auction.images[0] : null;
            const statusLabel = auction.status === "live" ? "🔴 مباشر" : auction.status === "upcoming" ? "⏳ قادم" : "✅ منتهي";
            const statusColor = auction.status === "live" ? T.red : auction.status === "upcoming" ? T.gold : T.textMuted;
            return (
              <Card key={auction.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: T.navyLight, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {firstImg ? <img src={firstImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🚗"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ color: statusColor, fontWeight: 700, fontSize: 11 }}>{statusLabel}</span>
                      {auction.categories?.name && <span style={{ color: T.textMuted, fontSize: 11 }}>{auction.categories.name}</span>}
                    </div>
                    <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{auction.title}</p>
                    <p style={{ margin: 0, color: T.gold, fontWeight: 800, fontSize: 13 }}>{(auction.current_price || auction.starting_price || 0).toLocaleString("ar-IQ")} د.ع</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="secondary" onClick={() => handleOpenEditAuction(auction)}>✏️</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDeleteAuction(auction.id)}>🗑️</Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "analytics" && (
        <SellerAnalyticsTab sellerId={sellerId} />
      )}

      {activeTab === "reports" && (
        <div>
          {reportLoading || !reportData ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
          ) : (
<>
              {[
                ["إجمالي الإيرادات", `${reportData.totalRevenue.toLocaleString("ar-IQ")} د.ع`],
                ["إجمالي الطلبات", `${reportData.orderCount.toLocaleString("ar-IQ")} طلب`],
                ["الطلبات المُسلَّمة", `${reportData.deliveredCount.toLocaleString("ar-IQ")} طلب`],
                ["المنتجات النشطة", `${reportData.activeCount.toLocaleString("ar-IQ")} منتج`],
              ].map(([label, value]) => (
                <Card key={label} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: T.textSecondary, fontSize: 13 }}>{label}</span>
                  <span style={{ color: T.gold, fontWeight: 800, fontSize: 15 }}>{value}</span>
                </Card>
              ))}
              {reportData.topProducts.length > 0 && (
                <Card style={{ marginBottom: 10 }}>
                  <h4 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 14 }}>🏆 أفضل المنتجات</h4>
                  {reportData.topProducts.map((p, i) => (
                    <div key={p.product_id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < reportData.topProducts.length - 1 ? `1px solid ${T.navyBorder}` : "none" }}>
                      <span style={{ color: T.textSecondary, fontSize: 13 }}>{p.product_name || p.name}</span>
                      <span style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>{(p.total_revenue || p.revenue || 0).toLocaleString("ar-IQ")} د.ع</span>
                    </div>
                  ))}
                </Card>
              )}
              <Btn fullWidth variant="secondary" icon="📊" disabled style={{ opacity: 0.5 }}>تصدير التقرير (قريباً)</Btn>
            </>
          )}
        </div>
      )}

      <Modal isOpen={!!editingAuction} onClose={() => { if (!editAuctionSaving) { setEditingAuction(null); editAuctionNewPreviews.forEach(u => URL.revokeObjectURL(u)); setEditAuctionNewPreviews([]); setEditAuctionNewFiles([]); } }} title="تعديل المزاد ✏️">
        <Input label="عنوان المزاد *" value={editAuctionForm.title} onChange={v => setEditAuctionForm(f => ({ ...f, title: v }))} placeholder="مثال: تويوتا كامري 2020 للبيع بالمزاد" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الفئة *</label>
          <select value={editAuctionForm.category_id} onChange={e => setEditAuctionForm(f => ({ ...f, category_id: e.target.value, vehicle_id: "" }))} style={selectStyle}>
            <option value="">-- اختر الفئة --</option>
            {editAuctionCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {String(editAuctionForm.category_id) === "8" ? (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>المركبة *</label>
            {editAuctionVehicles.length === 0 ? (
              <p style={{ color: T.textMuted, fontSize: 12, margin: 0 }}>لا توجد مركبات مسجلة في حسابك</p>
            ) : (
              <select value={editAuctionForm.vehicle_id} onChange={e => setEditAuctionForm(f => ({ ...f, vehicle_id: e.target.value }))} style={selectStyle}>
                <option value="">-- اختر مركبة --</option>
                {editAuctionVehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model}{v.year ? ` (${v.year})` : ""}{v.plate_number ? ` — ${v.plate_number}` : ""}</option>)}
              </select>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الوصف</label>
            <textarea value={editAuctionForm.description} onChange={e => setEditAuctionForm(f => ({ ...f, description: e.target.value }))} placeholder="تفاصيل إضافية..." rows={3} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="السعر الابتدائي (د.ع) *" value={editAuctionForm.starting_price} onChange={v => setEditAuctionForm(f => ({ ...f, starting_price: v.replace(/[^0-9]/g, "") }))} placeholder="0" type="number" />
          <Input label="أدنى زيادة (د.ع)" value={editAuctionForm.min_increment} onChange={v => setEditAuctionForm(f => ({ ...f, min_increment: v.replace(/[^0-9]/g, "") }))} placeholder="0" type="number" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>تاريخ الانتهاء *</label>
          <input type="datetime-local" value={editAuctionForm.ends_at} onChange={e => setEditAuctionForm(f => ({ ...f, ends_at: e.target.value }))} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        {String(editAuctionForm.category_id) !== "8" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>إضافة صور جديدة (تُضاف للصور الموجودة)</label>
            {editAuctionNewPreviews.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {editAuctionNewPreviews.map((url, i) => (
                  <img key={i} src={url} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
                ))}
              </div>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: 8, background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>📷</span>
              <span style={{ color: T.textSecondary, fontSize: 13 }}>{editAuctionNewFiles.length > 0 ? `${editAuctionNewFiles.length} صورة مختارة` : "اختر صوراً إضافية..."}</span>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                editAuctionNewPreviews.forEach(u => URL.revokeObjectURL(u));
                setEditAuctionNewFiles(files);
                setEditAuctionNewPreviews(files.map(f => URL.createObjectURL(f)));
              }} />
            </label>
          </div>
        )}
        {editAuctionError && (
          <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13, fontWeight: 600 }}>
            ⚠️ {editAuctionError}
          </div>
        )}
        <Btn fullWidth onClick={handleSaveAuction} disabled={editAuctionSaving}>
          {editAuctionSaving ? "جارٍ الحفظ..." : "💾 حفظ التعديلات"}
        </Btn>
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditProduct(null); resetForm(); }} title={editProduct ? "تعديل المنتج" : "إضافة منتج جديد"}>
        <Input label="اسم المنتج *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="مثال: فلتر هواء تويوتا كامري" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="السعر * (د.ع)" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="15000" />
          <Input label="السعر قبل الخصم (د.ع)" type="number" value={form.old_price} onChange={v => setForm(f => ({ ...f, old_price: v }))} placeholder="20000" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>القسم *</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={selectStyle}>
            <option value="">-- اختر القسم --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="الكمية المتوفرة" type="number" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} placeholder="1" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الحالة</label>
            <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} style={selectStyle}>
              <option value="new">جديد</option>
              <option value="used">مستخدم</option>
            </select>
          </div>
        </div>
        <Input label="المدينة" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="بغداد" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="نسبة الخصم %" type="number" value={form.discount_percent} onChange={v => setForm(f => ({ ...f, discount_percent: v }))} placeholder="0" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>انتهاء الخصم (اختياري)</label>
            <input type="datetime-local" value={form.discount_ends_at} onChange={e => setForm(f => ({ ...f, discount_ends_at: e.target.value }))} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        {isCarCategory && (
          <>
            <div style={{ borderTop: `1px solid ${T.navyBorder}`, margin: "4px 0 14px", paddingTop: 14 }}>
              <p style={{ margin: "0 0 12px", color: T.gold, fontSize: 13, fontWeight: 700 }}>🚗 تفاصيل السيارة</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="الماركة" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} placeholder="Toyota" />
              <Input label="الموديل" value={form.model} onChange={v => setForm(f => ({ ...f, model: v }))} placeholder="Camry" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="السنة" type="number" value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} placeholder="2022" />
              <Input label="الممشى (كم)" type="number" value={form.mileage} onChange={v => setForm(f => ({ ...f, mileage: v }))} placeholder="50000" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>نوع القير</label>
                <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))} style={selectStyle}>
                  <option value="">-- اختر --</option>
                  <option value="automatic">أوتوماتيك</option>
                  <option value="manual">يدوي</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>نوع الوقود</label>
                <select value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))} style={selectStyle}>
                  <option value="">-- اختر --</option>
                  <option value="petrol">بنزين</option>
                  <option value="diesel">ديزل</option>
                  <option value="hybrid">هايبرد</option>
                  <option value="electric">كهربائي</option>
                </select>
              </div>
            </div>
          </>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>صورة المنتج (اختياري)</label>
          {imagePreview && (
            <div style={{ marginBottom: 8, borderRadius: 10, overflow: "hidden" }}>
              <img src={imagePreview} alt="معاينة" style={{ width: "100%", height: 140, objectFit: "cover" }} />
            </div>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 8, background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>📷</span>
            <span style={{ color: T.textSecondary, fontSize: 13 }}>{imageFile ? imageFile.name : "اختر صورة من جهازك..."}</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }} />
          </label>
        </div>

        {saveError && (
          <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13 }}>
            ⚠️ {saveError}
          </div>
        )}
        <Btn fullWidth variant="primary" onClick={handleSave} disabled={saving}>
          {savingStage === "uploading" ? "⏳ جارٍ رفع الصورة..." : savingStage === "saving" ? "💾 جارٍ حفظ المنتج..." : "💾 حفظ المنتج"}
        </Btn>
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
const DARK_COLORS = { navy: "#060E1F", navyMid: "#0A1628", navyCard: "#0F1F3D", navyLight: "#162040", navyBorder: "#1E3A6E", textPrimary: "#E8EAED", textSecondary: "#8B9DC3", textMuted: "#4B6080" };
const LIGHT_COLORS = { navy: "#F5F7FA", navyMid: "#FFFFFF", navyCard: "#FFFFFF", navyLight: "#F0F2F5", navyBorder: "#D1D5DB", textPrimary: "#111827", textSecondary: "#4B5563", textMuted: "#9CA3AF" };

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
  const themeMode = "dark";
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  useEffect(() => {
    Object.assign(T, DARK_COLORS);
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

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
    <div dir="rtl" style={{ fontFamily: "'Cairo', 'Tajawal', 'Segoe UI', sans-serif", background: T.navy, minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative" }}>
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
