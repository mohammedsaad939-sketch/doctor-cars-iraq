import { useState, useEffect } from "react";
import { T } from "./theme";
import { supabase } from "../supabaseClient";

export const MOCK = {
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

export const Badge = ({ children, color = T.gold, small = false }) => (
  <span style={{
    background: `${color}22`, color, border: `1px solid ${color}44`,
    borderRadius: 20, padding: small ? "1px 8px" : "3px 10px",
    fontSize: small ? 10 : 11, fontWeight: 700, display: "inline-block",
    whiteSpace: "nowrap"
  }}>{children}</span>
);

export const Stars = ({ rating, size = 12 }) => {
  const full = Math.floor(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= full ? T.gold : T.navyBorder }}>★</span>
      ))}
    </span>
  );
};

export const isImageUrl = (v) => typeof v === "string" && v.startsWith("http");

export const Btn = ({ children, onClick, variant = "primary", size = "md", disabled = false, fullWidth = false, icon = null }) => {
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

export const Card = ({ children, style = {}, onClick = null }) => (
  <div onClick={onClick} style={{
    background: T.navyCard, border: `1px solid ${T.navyBorder}`,
    borderRadius: 16, padding: 16, cursor: onClick ? "pointer" : "default",
    transition: "all 0.2s", ...style,
  }}>{children}</div>
);

export const Input = ({ label, value, onChange, placeholder = "", type = "text", icon = null }) => (
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

export const Modal = ({ isOpen, onClose, title, children }) => {
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

export const Tabs = ({ tabs, active, onChange }) => (
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

export const Section = ({ title, subtitle, action, children }) => (
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

export const AdCarousel = ({ onProductView, onNavigate }) => {
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
      window.open(ad.external_url, "_blank", "noopener,noreferrer");
    } else if (ad.link_type === "product" && ad.link_target_id) {
      const { data } = await supabase.from("products").select("*, categories(name)").eq("id", ad.link_target_id).maybeSingle();
      if (data) onProductView({ ...data, image: Array.isArray(data.images) ? (data.images[0] || "📦") : (data.images || "📦"), category: data.categories?.name || "", oldPrice: data.old_price || null, rating: data.rating || 0, reviews: 0 });
    } else if (ad.link_type === "seller_store" && ad.link_target_id) {
      onNavigate("sellerPublic", { sellerId: ad.link_target_id });
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
          <img src={ad.image_url} alt={ad.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
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

export const ProductCard = ({ product, onView, onCart, isFav, onFavToggle, onCompare, inCompare }) => {
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
        {isImageUrl(product.image) ? <img src={product.image} alt={product.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : product.image}
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
