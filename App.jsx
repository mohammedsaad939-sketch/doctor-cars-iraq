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
// PRODUCT CARD
// ═══════════════════════════════════════════════════════
const ProductCard = ({ product, onView, onCart }) => (
  <Card style={{ position: "relative" }} onClick={() => onView(product)}>
    {product.oldPrice && (
      <div style={{ position: "absolute", top: 12, left: 12, background: T.red, color: "#fff", borderRadius: 8, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
        -{Math.round((1 - product.price / product.oldPrice) * 100)}%
      </div>
    )}
    <div style={{ fontSize: 48, textAlign: "center", marginBottom: 10, background: `${T.navyLight}`, borderRadius: 12, overflow: "hidden", height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
      <span style={{ color: T.gold, fontWeight: 800, fontSize: 15 }}>{product.price.toLocaleString("ar-IQ")} د.ع</span>
      {product.oldPrice && <span style={{ color: T.textMuted, fontSize: 12, textDecoration: "line-through" }}>{product.oldPrice.toLocaleString("ar-IQ")}</span>}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: T.textSecondary, fontSize: 11 }}>📍 {product.city}</span>
      <button onClick={e => { e.stopPropagation(); onCart(product); }} style={{
        background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, border: "none",
        borderRadius: 8, padding: "6px 12px", color: T.navy, fontWeight: 700, fontSize: 12, cursor: "pointer"
      }}>+سلة</button>
    </div>
  </Card>
);

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
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

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
      const res = await signUp({ fullName: name, phone, email, password, role: userType });
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
            <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: T.gold }} />
            <label htmlFor="agree" style={{ color: T.textSecondary, fontSize: 13, lineHeight: 1.5, cursor: "pointer" }}>
              أوافق على <span style={{ color: T.gold }}>شروط الاستخدام</span> و<span style={{ color: T.gold }}>سياسة الخصوصية</span>
            </label>
          </div>
        )}

        <Btn onClick={handleSubmit} fullWidth size="lg" disabled={(mode === "register" && !agreed) || submitting}>
          {submitting ? "جارٍ التحقق..." : mode === "login" ? "دخول" : "إنشاء الحساب"}
        </Btn>

        {mode === "login" && (
          <button style={{ display: "block", margin: "12px auto 0", background: "none", border: "none", color: T.gold, fontSize: 13, cursor: "pointer" }}>
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
const HomeScreen = ({ onNavigate, onProductView, onCartAdd, cartCount }) => {
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeAuction, setActiveAuction] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveAuction(p => (p + 1) % MOCK.auctions.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const filteredProducts = searchText
    ? MOCK.products.filter(p => p.name.includes(searchText) || p.category.includes(searchText))
    : MOCK.products;

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(180deg, ${T.navyMid} 0%, transparent 100%)`, padding: "16px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, color: T.textMuted, fontSize: 12 }}>أهلاً بك 👋</p>
            <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>أبو علي الميكانيكي</h2>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => onNavigate("notifications")} style={{ position: "relative", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 12, width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer" }}>
              🔔
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: T.red, borderRadius: "50%" }} />
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
              borderRadius: 14, padding: "13px 46px 13px 120px", color: T.textPrimary,
              fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
              transition: "border-color 0.2s"
            }}
          />
          <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 4 }}>
            <button onClick={() => {}} style={{ background: `${T.purple}22`, border: "none", borderRadius: 8, padding: "5px 8px", fontSize: 14, cursor: "pointer" }} title="بحث بالصورة">📷</button>
            <button onClick={() => {}} style={{ background: `${T.blue}22`, border: "none", borderRadius: 8, padding: "5px 8px", fontSize: 14, cursor: "pointer" }} title="بحث صوتي">🎙️</button>
          </div>
        </div>

        {/* QUICK FILTERS */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 4 }}>
          {["الكل", "بغداد", "البصرة", "أربيل", "النجف", "كربلاء", "الموصل"].map(city => (
            <button key={city} style={{ background: city === "الكل" ? `linear-gradient(135deg, ${T.gold}, ${T.goldDark})` : T.navyCard, border: `1px solid ${city === "الكل" ? "transparent" : T.navyBorder}`, borderRadius: 20, padding: "6px 14px", color: city === "الكل" ? T.navy : T.textSecondary, fontFamily: "inherit", fontWeight: 600, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              {city}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
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
        <div style={{ background: `linear-gradient(135deg, ${T.gold}22, ${T.goldDark}11)`, border: `1px solid ${T.gold}44`, borderRadius: 14, padding: "12px 16px", marginBottom: 20, cursor: "pointer" }} onClick={() => onNavigate("auctions")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, background: T.red, borderRadius: "50%", animation: "pulse 1s infinite" }} />
              <span style={{ color: T.gold, fontWeight: 800, fontSize: 13 }}>🏆 مزاد مباشر</span>
            </div>
            <span style={{ color: T.red, fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>{MOCK.auctions[activeAuction].timeLeft}</span>
          </div>
          <p style={{ margin: "6px 0 4px", color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>{MOCK.auctions[activeAuction].title}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: T.textSecondary, fontSize: 12 }}>السعر الحالي: <span style={{ color: T.gold, fontWeight: 800 }}>{MOCK.auctions[activeAuction].currentBid.toLocaleString("ar-IQ")} د.ع</span></span>
            <span style={{ color: T.textSecondary, fontSize: 11 }}>{MOCK.auctions[activeAuction].bids} مزايد</span>
          </div>
        </div>

        {/* CATEGORIES GRID */}
        <Section title="الأقسام" subtitle="تصفح جميع الخدمات" action={{ label: "الكل", onClick: () => onNavigate("categories") }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {MOCK.categories.slice(0, 8).map(cat => (
              <button key={cat.id} onClick={() => onNavigate("shop")} style={{
                background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 14,
                padding: "12px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{cat.icon}</div>
                <span style={{ color: T.textPrimary, fontSize: 10, fontWeight: 700, textAlign: "center", lineHeight: 1.3 }}>{cat.name}</span>
                <span style={{ color: T.textMuted, fontSize: 9 }}>{cat.count.toLocaleString("ar-IQ")}</span>
              </button>
            ))}
          </div>
        </Section>

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

        {/* FEATURED PRODUCTS */}
        <Section title="منتجات مميزة" subtitle="أفضل العروض اليوم" action={{ label: "الكل", onClick: () => onNavigate("shop") }}>
          {searchText ? (
            filteredProducts.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} />)}
              </div>
            ) : (
              <Card style={{ textAlign: "center", padding: 32 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
                <p style={{ color: T.textSecondary, margin: 0 }}>لم يتم العثور على نتائج لـ "{searchText}"</p>
                <Btn variant="secondary" size="sm" style={{ marginTop: 12 }} onClick={() => onNavigate("request")}>اطلب القطعة</Btn>
              </Card>
            )
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {MOCK.products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} />)}
            </div>
          )}
        </Section>

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
            {MOCK.sellers.map(seller => (
              <Card key={seller.id} style={{ display: "flex", alignItems: "center", gap: 14 }} onClick={() => onNavigate("sellerProfile")}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{seller.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{seller.name}</span>
                    {seller.verified && <Badge small color={T.green}>✓ موثق</Badge>}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <Stars rating={seller.rating} size={11} />
                    <span style={{ color: T.textMuted, fontSize: 11 }}>📍 {seller.city}</span>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Badge color={seller.type === "وكالة" ? T.purple : seller.type === "جملة" ? T.blue : T.gold} small>{seller.type}</Badge>
                  <p style={{ margin: "4px 0 0", color: T.textMuted, fontSize: 10 }}>{seller.products} منتج</p>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* MARKET STATS */}
        <Section title="إحصائيات السوق" subtitle="تحليل ذكي للسوق العراقي">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {MOCK.marketStats.map((stat, i) => (
              <Card key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ color: T.gold, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{stat.value}</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>{stat.label}</div>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

// ── SHOP SCREEN ──────────────────────────────────────
const ShopScreen = ({ onProductView, onCartAdd }) => {
  const [products, setProducts] = useState(MOCK.products);
  useEffect(() => {
    supabase.from("products").select("*, sellers(store_name, verified, rating), categories(name)").then(({ data, error }) => {
      if (!error && data) {
        setProducts(data.map(p => ({
          id: p.id,
          seller_id: p.seller_id,
          name: p.name,
          price: p.price,
          oldPrice: p.old_price,
          category: p.categories?.name,
          seller: p.sellers?.store_name,
          sellerVerified: p.sellers?.verified,
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
          fuel_type: p.fuel_type
        })));
      }
    });
  }, []);

  const [activeCategory, setActiveCategory] = useState("الكل");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);

  useEffect(() => {
    supabase.from("categories").select("id,name").order("sort_order").then(({ data }) => {
      if (data) setShopCategories(data);
    });
  }, []);

  const categoryTabs = ["الكل", ...shopCategories.map(c => c.name)];
  const filtered = activeCategory === "الكل" ? products : products.filter(p => p.category === activeCategory);

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
        <span style={{ color: T.textMuted, fontSize: 13 }}>{filtered.length} منتج</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "8px 14px", color: T.textSecondary, fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>
            ⚙️ فلتر
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "8px 14px", color: T.textSecondary, fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none" }}>
            <option value="default">ترتيب افتراضي</option>
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
            {["موثق فقط", "جديد", "متوفر", "توصيل"].map(f => (
              <button key={f} style={{ background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 20, padding: "6px 14px", color: T.textSecondary, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>{f}</button>
            ))}
          </div>
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
        {filtered.map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} />)}
      </div>
    </div>
  );
};

// ── PRODUCT DETAIL SCREEN ──────────────────────────────────────
const ProductDetailScreen = ({ product, onBack, onCartAdd, session, profile }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ buyer_name: "", buyer_phone: "", buyer_address: "", city: "", notes: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

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
    if (orderError) { setCheckoutError(orderError.message); setCheckoutLoading(false); return; }
    const { error: itemsError } = await supabase.from("order_items").insert({
      order_id: orderData.id,
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: product.price,
    });
    if (itemsError) { setCheckoutError(itemsError.message); setCheckoutLoading(false); return; }
    setCheckoutLoading(false);
    setCheckoutSuccess(true);
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
      <div style={{ background: T.navyCard, textAlign: "center", fontSize: 80, marginBottom: 0, overflow: "hidden", height: isImageUrl(product.image) ? 260 : "auto", padding: isImageUrl(product.image) ? 0 : 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isImageUrl(product.image) ? <img src={product.image} alt={product.name} style={{ width: "100%", height: 260, objectFit: "cover" }} /> : product.image}
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
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
          <span style={{ color: T.gold, fontWeight: 900, fontSize: 24 }}>{product.price.toLocaleString("ar-IQ")} د.ع</span>
          {product.oldPrice && <span style={{ color: T.textMuted, fontSize: 16, textDecoration: "line-through" }}>{product.oldPrice.toLocaleString("ar-IQ")}</span>}
        </div>

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
          <Card>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏪</div>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: T.textPrimary, fontWeight: 800, fontSize: 15 }}>{product.seller}</span>
                  <Badge small color={T.green}>✓ موثق</Badge>
                </div>
                <Stars rating={4.8} size={12} />
                <span style={{ color: T.textMuted, fontSize: 12 }}> ٤.٨ (١٢٤ تقييم)</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[["المبيعات", "٢٣٤٠"], ["المنتجات", "٤٥٠"], ["منذ", "٢٠١٥"], ["الاستجابة", "< ١ ساعة"]].map(([l, v]) => (
                <div key={l} style={{ textAlign: "center", background: T.navyLight, borderRadius: 10, padding: 10 }}>
                  <div style={{ color: T.gold, fontWeight: 800, fontSize: 16 }}>{v}</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn fullWidth size="sm" icon="💬" variant="ghost">رسالة</Btn>
              <Btn fullWidth size="sm" icon="📱" variant="ghost">واتساب</Btn>
              <Btn fullWidth size="sm" icon="📞" variant="ghost">اتصال</Btn>
            </div>
          </Card>
        )}

        {activeTab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[{ name: "محمد علي", rating: 5, comment: "قطعة ممتازة وأصلية 100%، البائع متعاون جداً والتوصيل سريع", time: "منذ أسبوع" }, { name: "أحمد كريم", rating: 4, comment: "منتج جيد، التغليف ممتاز. سأشتري مرة ثانية", time: "منذ أسبوعين" }].map((review, i) => (
              <Card key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{review.name}</div>
                      <Stars rating={review.rating} size={11} />
                    </div>
                  </div>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{review.time}</span>
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
          <div style={{ marginTop: 8 }}>
            <Btn fullWidth onClick={handleOpenCheckout} variant="blue" icon="🛍️">اشتري الآن</Btn>
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

  const handleBid = async (auctionId) => {
    if (!user) {
      setBidState(p => ({ ...p, [auctionId]: { error: "يجب تسجيل الدخول أولاً للمزايدة" } }));
      return;
    }
    const amount = Number(bidAmount[auctionId]);
    if (!amount) return;
    setBidState(p => ({ ...p, [auctionId]: { loading: true, error: null, success: false } }));
    const { error } = await supabase.from("bids").insert({ auction_id: auctionId, bidder_id: user.id, amount });
    if (error) {
      setBidState(p => ({ ...p, [auctionId]: { error: error.message } }));
    } else {
      setBidState(p => ({ ...p, [auctionId]: { success: true } }));
      setBidAmount(p => ({ ...p, [auctionId]: "" }));
      setTimeout(() => setBidState(p => ({ ...p, [auctionId]: {} })), 3000);
    }
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

  const loadAuctions = async (tab) => {
    setLoading(true);
    setAuctions([]);

    if (tab === "mine") {
      if (!user) { setLoading(false); return; }
      const { data: myBids } = await supabase.from("bids").select("auction_id").eq("bidder_id", user.id);
      const ids = [...new Set((myBids || []).map(b => b.auction_id))];
      if (!ids.length) { setLoading(false); return; }
      const { data } = await supabase.from("auctions").select("*, sellers(store_name)").in("id", ids);
      setAuctions(data || []);
      // جلب آخر مزايدة لكل مزاد لمعرفة من هو الأعلى حالياً
      const { data: latestBids } = await supabase
        .from("bids").select("auction_id, bidder_id, amount")
        .in("auction_id", ids).order("created_at", { ascending: false });
      const map = {};
      (latestBids || []).forEach(b => { if (!map[b.auction_id]) map[b.auction_id] = b; });
      setLastBidsMap(map);
      setLoading(false);
      return;
    }

    let q = supabase.from("auctions").select("*, sellers(store_name)");
    if (tab === "live")       q = q.eq("status", "live").order("ends_at");
    else if (tab === "upcoming") q = q.eq("status", "upcoming").order("starts_at");
    else if (tab === "ended")    q = q.eq("status", "ended").order("ends_at", { ascending: false });
    const { data } = await q;
    setAuctions(data || []);
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
            const imgIsUrl = isImageUrl(auction.image);
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
                <div style={{ fontSize: imgIsUrl ? undefined : 48, textAlign: "center", background: T.navyLight, borderRadius: 12, padding: imgIsUrl ? 0 : "16px 0", marginBottom: 12, overflow: "hidden" }}>
                  {imgIsUrl ? <img src={auction.image} alt={auction.title} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12 }} /> : (auction.image || "🏆")}
                </div>
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
              <Btn>إنشاء مزاد جديد</Btn>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// ── DIAGNOSIS SCREEN ──────────────────────────────────────
const DiagnosisScreen = ({ onCartAdd, session }) => {
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const allSymptoms = [
    "صوت غريب عند الفرملة", "اهتزاز عند القيادة", "دخان من المحرك",
    "صوت طقطقة", "مشكلة في التبريد", "عدم الاشتغال",
    "ضوء تحذيري", "استهلاك زيت زائد", "تسريب سوائل",
    "مشكلة في الكهرباء", "تسريب وقود", "مشكلة في الفرامل"
  ];

  const toggleSymptom = (s) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const runDiagnosis = async () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        severity: "متوسط",
        causes: [
          { cause: "تآكل أقراص الفرامل", probability: 85, parts: ["أقراص فرامل أمامية", "تيل الفرامل"] },
          { cause: "مشكلة في نوابض التعليق", probability: 60, parts: ["نوابض تعليق", "مساعد"] },
          { cause: "بالونات الإطارات غير متساوية", probability: 40, parts: [] },
        ],
        recommendation: "نوصي بمراجعة ورشة متخصصة في الفرامل في أقرب وقت. الأعراض تشير بشكل كبير إلى الحاجة لتغيير أقراص الفرامل.",
        urgency: "خلال أسبوع",
        relatedSellers: MOCK.products.slice(0, 2),
      });
      setLoading(false);
      setStep(3);
    }, 2500);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 8px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🤖 تشخيص الأعطال الذكي</h2>
      <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13 }}>مدعوم بالذكاء الاصطناعي — دقة تشخيص 92%</p>

      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? T.gold : T.navyBorder, transition: "background 0.3s" }} />
        ))}
      </div>

      {step === 1 && (
        <div>
          <h3 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>الخطوة ١: حدد سيارتك</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {MOCK.vehicles.map(v => (
              <button key={v.id} onClick={() => setVehicle(v.id)} style={{
                background: vehicle === v.id ? `${T.gold}22` : T.navyCard,
                border: `2px solid ${vehicle === v.id ? T.gold : T.navyBorder}`,
                borderRadius: 14, padding: 14, cursor: "pointer", textAlign: "right"
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🚗</div>
                <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{v.make} {v.model}</div>
                <div style={{ color: T.textSecondary, fontSize: 12 }}>{v.year} | {v.km.toLocaleString("ar-IQ")} كم</div>
              </button>
            ))}
          </div>
          <Btn fullWidth onClick={() => setStep(2)} disabled={!vehicle}>التالي →</Btn>
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
          <div style={{ background: `${T.orange}22`, border: `1px solid ${T.orange}44`, borderRadius: 14, padding: 16, marginBottom: 16, display: "flex", gap: 10 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <div>
              <div style={{ color: T.orange, fontWeight: 800, fontSize: 14 }}>خطورة: {result.severity}</div>
              <div style={{ color: T.textSecondary, fontSize: 12 }}>يجب الإصلاح {result.urgency}</div>
            </div>
          </div>

          <h3 style={{ color: T.textPrimary, fontSize: 15, fontWeight: 800, marginBottom: 12 }}>الأسباب المحتملة</h3>
          {result.causes.map((c, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: T.textPrimary, fontWeight: 700 }}>{c.cause}</span>
                <span style={{ color: c.probability > 70 ? T.red : c.probability > 50 ? T.orange : T.green, fontWeight: 700, fontSize: 15 }}>{c.probability}%</span>
              </div>
              <div style={{ background: T.navyLight, borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${c.probability}%`, background: c.probability > 70 ? T.red : c.probability > 50 ? T.orange : T.green, borderRadius: 6 }} />
              </div>
              {c.parts.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {c.parts.map(p => <Badge key={p} small color={T.blue}>{p}</Badge>)}
                </div>
              )}
            </Card>
          ))}

          <Card style={{ marginBottom: 16, background: `${T.green}11`, border: `1px solid ${T.green}33` }}>
            <h4 style={{ margin: "0 0 8px", color: T.green }}>💡 توصية الذكاء الاصطناعي</h4>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>{result.recommendation}</p>
          </Card>

          <Section title="قطع مقترحة بالقرب منك" subtitle="بناءً على التشخيص">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {result.relatedSellers.map(p => <ProductCard key={p.id} product={p} onView={() => {}} onCart={onCartAdd || (() => {})} />)}
            </div>
          </Section>

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
const EmergencyScreen = () => {
  const [requested, setRequested] = useState(null);

  return (
    <div style={{ padding: 16 }}>
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
                    onClick={() => setRequested(service.id)}
                    style={{
                      background: requested === service.id ? T.green : `linear-gradient(135deg, ${T.red}, #DC2626)`,
                      border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff",
                      fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: service.available ? "pointer" : "not-allowed",
                    }}
                  >
                    {requested === service.id ? "✓ تم الطلب" : "اطلب الآن"}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Map placeholder */}
      <Card style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", background: `${T.blue}11`, border: `1px solid ${T.blue}33` }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🗺️</div>
          <p style={{ color: T.textSecondary, margin: 0, fontSize: 13 }}>الخريطة التفاعلية<br /><span style={{ fontSize: 11 }}>تحديد موقعك وأقرب الخدمات</span></p>
          <Btn size="sm" variant="blue" style={{ marginTop: 10 }} icon="📍">تحديد موقعي</Btn>
        </div>
      </Card>
    </div>
  );
};

// ── MY GARAGE SCREEN ──────────────────────────────────────
const GarageScreen = () => {
  const [activeVehicle, setActiveVehicle] = useState(0);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const vehicle = MOCK.vehicles[activeVehicle];

  const maintenanceHistory = [
    { date: "٢٠٢٤/١١/٠١", type: "تغيير زيت", cost: 25000, workshop: "ورشة الأستاذ أحمد", notes: "Shell Helix 5W-30" },
    { date: "٢٠٢٤/٠٩/١٥", type: "تغيير فلاتر", cost: 45000, workshop: "ورشة الأستاذ أحمد", notes: "فلتر هواء وزيت" },
    { date: "٢٠٢٤/٠٦/٢٠", type: "فحص شامل", cost: 80000, workshop: "وكالة تويوتا", notes: "فحص دوري" },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🚗 مركبتي</h2>
        <Btn size="sm" onClick={() => setShowAddVehicle(true)} icon="+">إضافة</Btn>
      </div>

      {/* Vehicle Selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {MOCK.vehicles.map((v, i) => (
          <button key={v.id} onClick={() => setActiveVehicle(i)} style={{
            flex: 1, background: activeVehicle === i ? `${T.gold}22` : T.navyCard,
            border: `2px solid ${activeVehicle === i ? T.gold : T.navyBorder}`,
            borderRadius: 14, padding: 12, cursor: "pointer", textAlign: "right"
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🚗</div>
            <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{v.make} {v.model}</div>
            <div style={{ color: T.textSecondary, fontSize: 11 }}>{v.year}</div>
            <Badge small color={v.status === "جيدة" ? T.green : T.orange}>{v.status}</Badge>
          </button>
        ))}
      </div>

      {/* Vehicle Card */}
      <Card style={{ marginBottom: 16, background: `linear-gradient(135deg, ${T.navyLight}, ${T.navyCard})` }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48 }}>🚗</div>
          <div>
            <h3 style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 18, fontWeight: 900 }}>{vehicle.make} {vehicle.model}</h3>
            <p style={{ margin: "0 0 4px", color: T.textSecondary, fontSize: 13 }}>{vehicle.year} | {vehicle.color}</p>
            <Badge color={T.blue}>{vehicle.plate}</Badge>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[["آخر صيانة", vehicle.lastService], ["الصيانة القادمة", vehicle.nextService], ["المسافة المقطوعة", `${vehicle.km.toLocaleString("ar-IQ")} كم`]].map(([l, v]) => (
            <div key={l} style={{ background: T.navyMid, borderRadius: 10, padding: 10 }}>
              <div style={{ color: T.textMuted, fontSize: 10, marginBottom: 4 }}>{l}</div>
              <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[["تشخيص", "🤖"], ["ورشة", "🏪"], ["طوارئ", "🚨"], ["تذكير", "⏰"]].map(([label, icon]) => (
          <button key={label} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 12, padding: "12px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ color: T.textSecondary, fontSize: 10, fontWeight: 600 }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Maintenance History */}
      <Section title="سجل الصيانة">
        {maintenanceHistory.map((record, i) => (
          <Card key={i} style={{ marginBottom: 10, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${T.blue}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔧</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{record.type}</div>
              <div style={{ color: T.textSecondary, fontSize: 12 }}>{record.workshop} | {record.date}</div>
              <div style={{ color: T.textMuted, fontSize: 11, marginTop: 2 }}>{record.notes}</div>
            </div>
            <div style={{ color: T.gold, fontWeight: 800, fontSize: 14, textAlign: "center" }}>
              {record.cost.toLocaleString("ar-IQ")}
              <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 400 }}>د.ع</div>
            </div>
          </Card>
        ))}
      </Section>

      <Modal isOpen={showAddVehicle} onClose={() => setShowAddVehicle(false)} title="إضافة مركبة جديدة">
        <Input label="الشركة المصنعة" value="" onChange={() => {}} placeholder="مثال: Toyota, Kia, Hyundai" icon="🏭" />
        <Input label="الموديل" value="" onChange={() => {}} placeholder="مثال: Camry, Elantra" icon="🚗" />
        <Input label="سنة الصنع" value="" onChange={() => {}} placeholder="مثال: 2020" type="number" icon="📅" />
        <Input label="رقم اللوحة" value="" onChange={() => {}} placeholder="مثال: بغداد - أ 12345" icon="🔖" />
        <Btn fullWidth onClick={() => setShowAddVehicle(false)}>إضافة المركبة</Btn>
      </Modal>
    </div>
  );
};

// ── SELLER DASHBOARD SCREEN ──────────────────────────────────────
const SellerDashScreen = ({ session }) => {
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

  const user = session?.user;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("sellers").select("id").eq("owner_id", user.id).single();
      if (data) { setSellerId(data.id); loadProducts(data.id); }
    })();
    (async () => {
      const { data } = await supabase.from("categories").select("id,name").order("sort_order");
      setCategories(data || []);
    })();
  }, [user?.id]);

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

  useEffect(() => {
    if (activeTab === "orders" && sellerId) loadSellerOrders(sellerId);
  }, [activeTab, sellerId]);

  const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
  const isCarCategory = selectedCat?.name?.includes("سيارات");

  const resetForm = () => {
    setForm({
      name: "", price: "", old_price: "", category_id: "",
      stock: "1", condition: "new", city: "",
      brand: "", model: "", year: "", mileage: "", transmission: "", fuel_type: "",
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
    { label: "مبيعات اليوم", value: "١٢", icon: "📦", trend: "+15%" },
    { label: "الإيرادات", value: "٨٥٠,٠٠٠", icon: "💰", trend: "+22%" },
    { label: "طلبات جديدة", value: "٣", icon: "🔔", trend: "+3", urgent: true },
    { label: "التقييم", value: "٤.٨", icon: "⭐", trend: "ثابت" },
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
          <p style={{ margin: 0, color: T.textSecondary, fontSize: 12 }}>محل النجار للغيار</p>
        </div>
        <Badge color={T.green}>✓ موثق</Badge>
      </div>

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
            <div style={{ marginTop: 8 }}>
              <Badge small color={stat.trend.includes("+") ? T.green : T.textMuted}>{stat.trend}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[{ id: "overview", label: "نظرة عامة" }, { id: "orders", label: "الطلبات" }, { id: "products", label: "المنتجات" }, { id: "reports", label: "التقارير" }]}
        active={activeTab} onChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <div>
          {/* Revenue Chart */}
          <Card style={{ marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>📈 الإيرادات الأسبوعية</h4>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
              {[45, 60, 40, 80, 70, 90, 85].map((h, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: `${h}%`, background: i === 6 ? `linear-gradient(180deg, ${T.gold}, ${T.goldDark})` : `${T.gold}44`, borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                  <span style={{ color: T.textMuted, fontSize: 9 }}>{"سبعأثخجسأح".split("").filter((_, j) => [0, 2, 4, 6, 8, 10, 12].includes(j * 2))[i] || ["أ", "ث", "ج", "خ", "س", "ج", "س"][i]}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Inventory Alerts */}
          <Card>
            <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>⚠️ تحذيرات المخزون</h4>
            {[{ name: "فلتر هواء تويوتا", stock: 2, min: 5 }, { name: "زيت Shell 5W-30", stock: 8, min: 10 }].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i === 0 ? `1px solid ${T.navyBorder}` : "none" }}>
                <span style={{ color: T.textSecondary, fontSize: 13 }}>{item.name}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: item.stock < item.min ? T.red : T.green, fontWeight: 700 }}>{item.stock} قطعة</span>
                  <Btn size="sm" variant="ghost">إضافة</Btn>
                </div>
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
            <Btn size="sm" icon="+" variant="primary" onClick={() => { setSaveError(null); setSaveSuccess(false); resetForm(); setShowAddModal(true); }}>منتج جديد</Btn>
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
                  <div style={{ fontSize: 36, textAlign: "center", background: T.navyLight, borderRadius: 10, padding: "10px 0", marginBottom: 8, overflow: "hidden" }}>
                    {isImageUrl(p.images?.[0]) ? (
                      <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 8 }} />
                    ) : (p.images?.[0] || "📦")}
                  </div>
                  <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 12, fontWeight: 700 }}>{p.name}</p>
                  <p style={{ margin: "0 0 8px", color: T.gold, fontSize: 13, fontWeight: 800 }}>{Number(p.price).toLocaleString("ar-IQ")} د.ع</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="ghost" fullWidth onClick={() => handleEdit(p)}>تعديل</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(p.id)}>🗑️</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "reports" && (
        <div>
          {[["إجمالي المبيعات (الشهر)", "٢,٣٤٠,٠٠٠ د.ع"], ["عدد الطلبات", "١٢٣ طلب"], ["متوسط قيمة الطلب", "١٩,٠٠٠ د.ع"], ["معدل التحويل", "٣.٢%"], ["رضا العملاء", "٩٢%"], ["نمو المبيعات", "+١٨%"]].map(([label, value]) => (
            <Card key={label} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: T.textSecondary, fontSize: 13 }}>{label}</span>
              <span style={{ color: T.gold, fontWeight: 800, fontSize: 15 }}>{value}</span>
            </Card>
          ))}
          <Btn fullWidth variant="secondary" icon="📊">تصدير التقرير</Btn>
        </div>
      )}

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

// ── ADMIN DASHBOARD SCREEN ──────────────────────────────────────
const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState("overview");

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
        tabs={[{ id: "overview", label: "نظرة عامة" }, { id: "users", label: "المستخدمون" }, { id: "violations", label: "المخالفات" }, { id: "finance", label: "المالية" }]}
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
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input placeholder="ابحث عن مستخدم..." style={{ flex: 1, background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
          </div>
          {[
            { name: "علي محمد كريم", type: "مشتري", status: "نشط", joined: "٢٠٢٣", orders: 45 },
            { name: "محل النجار", type: "بائع", status: "موثق", joined: "٢٠١٥", orders: 2340 },
            { name: "أحمد حسين", type: "مشتري", status: "موقوف", joined: "٢٠٢٤", orders: 3 },
          ].map((user, i) => (
            <Card key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                  <div>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{user.name}</div>
                    <div style={{ color: T.textMuted, fontSize: 11 }}>{user.type} | {user.orders} {user.type === "بائع" ? "مبيعة" : "طلب"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Badge small color={user.status === "نشط" ? T.green : user.status === "موثق" ? T.blue : T.red}>{user.status}</Badge>
                  <button style={{ background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 8, padding: "5px 10px", color: T.textSecondary, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>⋯</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "violations" && (
        <div>
          <div style={{ background: `${T.red}15`, border: `1px solid ${T.red}33`, borderRadius: 14, padding: 14, marginBottom: 16, display: "flex", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.6 }}>
              الذكاء الاصطناعي يقوم بمراقبة كل المحتوى تلقائياً. أي إعلان لا يتعلق بالسيارات يُرفض فوراً ولا ينشر.
            </p>
          </div>
          {[
            { content: "إعلان بيع هاتف نقال", user: "أبو حسن", action: "رُفض", severity: "عالية" },
            { content: "صورة غير لائقة في منتج", user: "محل X", action: "تحقيق", severity: "عالية" },
            { content: "سعر مبالغ فيه - فلتر", user: "بائع Y", action: "تحذير", severity: "متوسطة" },
          ].map((v, i) => (
            <Card key={i} style={{ marginBottom: 10, border: `1px solid ${T.red}33` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <Badge small color={v.severity === "عالية" ? T.red : T.orange}>⚠️ {v.severity}</Badge>
                <Badge small color={v.action === "رُفض" ? T.red : v.action === "تحذير" ? T.orange : T.blue}>{v.action}</Badge>
              </div>
              <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 13, fontWeight: 600 }}>{v.content}</p>
              <p style={{ margin: 0, color: T.textMuted, fontSize: 12 }}>المستخدم: {v.user}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "finance" && (
        <div>
          {[
            ["إيرادات الاشتراكات", "٢,٤٥٠,٠٠٠ د.ع"],
            ["رسوم المزادات", "٨٧٠,٠٠٠ د.ع"],
            ["الإعلانات المدفوعة", "١,٢٣٠,٠٠٠ د.ع"],
            ["عمولات التوصيل", "٣٤٠,٠٠٠ د.ع"],
            ["إجمالي الشهر", "٤,٨٩٠,٠٠٠ د.ع"],
          ].map(([label, value], i) => (
            <Card key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", background: i === 4 ? `${T.gold}15` : T.navyCard, border: i === 4 ? `1px solid ${T.gold}44` : `1px solid ${T.navyBorder}` }}>
              <span style={{ color: i === 4 ? T.textPrimary : T.textSecondary, fontSize: 13, fontWeight: i === 4 ? 700 : 400 }}>{label}</span>
              <span style={{ color: T.gold, fontWeight: 900, fontSize: i === 4 ? 17 : 14 }}>{value}</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ── NOTIFICATIONS SCREEN ──────────────────────────────────────
const NotificationsScreen = () => {
  const icons = { order: "📦", auction: "🏆", message: "💬", service: "🔧" };
  const colors = { order: T.blue, auction: T.gold, message: T.green, service: T.orange };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>الإشعارات 🔔</h2>
        <button style={{ background: "none", border: "none", color: T.gold, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>قراءة الكل</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MOCK.notifications.map(notif => (
          <Card key={notif.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", opacity: notif.read ? 0.7 : 1, borderRight: `4px solid ${notif.read ? T.navyBorder : colors[notif.type]}` }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${colors[notif.type]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {icons[notif.type]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{notif.title}</span>
                {!notif.read && <div style={{ width: 8, height: 8, background: T.blue, borderRadius: "50%", flexShrink: 0 }} />}
              </div>
              <p style={{ margin: "0 0 4px", color: T.textSecondary, fontSize: 12, lineHeight: 1.5 }}>{notif.body}</p>
              <span style={{ color: T.textMuted, fontSize: 11 }}>{notif.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── CART SCREEN ──────────────────────────────────────
const CartScreen = ({ items, onRemove, onNavigate }) => {
  const total = items.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🛒 سلة التسوق</h2>
      {items.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
          <h3 style={{ color: T.textSecondary, fontWeight: 400, margin: "0 0 16px" }}>السلة فارغة</h3>
          <Btn onClick={() => onNavigate("shop")}>تصفح المنتجات</Btn>
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {items.map((item, i) => (
              <Card key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{item.image}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px", color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{item.name}</p>
                  <p style={{ margin: 0, color: T.gold, fontWeight: 800, fontSize: 14 }}>{item.price.toLocaleString("ar-IQ")} د.ع</p>
                </div>
                <button onClick={() => onRemove(i)} style={{ background: `${T.red}22`, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>🗑️</button>
              </Card>
            ))}
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
            <div style={{ height: 1, background: T.navyBorder, margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: T.textPrimary, fontWeight: 800, fontSize: 16 }}>الإجمالي</span>
              <span style={{ color: T.gold, fontWeight: 900, fontSize: 18 }}>{total.toLocaleString("ar-IQ")} د.ع</span>
            </div>
          </Card>

          {/* Payment Methods */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["عند الاستلام", "محفظة إلكترونية", "بطاقة مصرفية"].map((method, i) => (
              <button key={method} style={{
                flex: 1, background: i === 0 ? `${T.gold}22` : T.navyCard,
                border: `2px solid ${i === 0 ? T.gold : T.navyBorder}`,
                borderRadius: 10, padding: "8px 4px", color: i === 0 ? T.gold : T.textSecondary,
                fontFamily: "inherit", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "center"
              }}>{method}</button>
            ))}
          </div>

          <Btn fullWidth size="lg" icon="💳">متابعة للدفع</Btn>
        </>
      )}
    </div>
  );
};

// ── ACADEMY SCREEN ──────────────────────────────────────
const AcademyScreen = () => {
  const levels = { "مبتدئ": T.green, "متوسط": T.orange, "متقدم": T.red };
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🎓 الأكاديمية التعليمية</h2>
      <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13 }}>تعلم من أفضل خبراء السيارات في العراق</p>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[["٢١ دورة", "دورة متاحة"], ["٥,٠٠٠+", "طالب مسجل"], ["خبراء", "معتمدون"]].map(([v, l]) => (
          <Card key={l} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: 16 }}>{v}</div>
            <div style={{ color: T.textMuted, fontSize: 11 }}>{l}</div>
          </Card>
        ))}
      </div>

      <Section title="الدورات المتاحة">
        {MOCK.courses.map(course => (
          <Card key={course.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Badge small color={levels[course.level]}>{course.level}</Badge>
              <Stars rating={course.rating} size={12} />
            </div>
            <h4 style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 15, fontWeight: 800 }}>{course.title}</h4>
            <p style={{ margin: "0 0 10px", color: T.textSecondary, fontSize: 12 }}>👨‍🏫 {course.instructor}</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <span style={{ color: T.textMuted, fontSize: 12 }}>📹 {course.lessons} درس</span>
              <span style={{ color: T.textMuted, fontSize: 12 }}>⏱️ {course.duration}</span>
              <span style={{ color: T.textMuted, fontSize: 12 }}>👥 {course.students.toLocaleString("ar-IQ")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: T.gold, fontWeight: 900, fontSize: 16 }}>{course.price.toLocaleString("ar-IQ")} د.ع</span>
              <Btn size="sm">الاشتراك</Btn>
            </div>
          </Card>
        ))}
      </Section>
    </div>
  );
};

// ── MY ORDERS SCREEN ──────────────────────────────────────
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
                <p style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>{itemNames}</p>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
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

// ── PROFILE SCREEN ──────────────────────────────────────
const ProfileScreen = ({ onLogout, onNavigate, profile }) => {
  const menuItems = [
    { icon: "🚗", label: "مركباتي", action: () => onNavigate("garage") },
    { icon: "📦", label: "طلباتي", action: () => onNavigate("myOrders") },
    { icon: "❤️", label: "المفضلة", action: () => {} },
    { icon: "💬", label: "رسائلي", action: () => {} },
    { icon: "💳", label: "طرق الدفع", action: () => {} },
    { icon: "📍", label: "عناويني", action: () => {} },
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
          {[["٠", "طلباتي"], ["٠", "مراجعاتي"], ["٠", "مفضلاتي"]].map(([v, l]) => (
            <div key={l} style={{ flex: 1, background: T.navyMid, borderRadius: 10, padding: 10 }}>
              <div style={{ color: T.gold, fontWeight: 900, fontSize: 18 }}>{v}</div>
              <div style={{ color: T.textMuted, fontSize: 10 }}>{l}</div>
            </div>
          ))}
        </div>
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
const PartRequestScreen = () => {
  const [submitted, setSubmitted] = useState(false);
  const [partName, setPartName] = useState("");
  const [carMake, setCarMake] = useState("");
  const [carYear, setCarYear] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (partName && carMake) setSubmitted(true);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 8px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>📋 طلب قطعة</h2>
      <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13 }}>لم تجد ما تبحث عنه؟ أرسل طلبك لجميع البائعين</p>

      {!submitted ? (
        <>
          <Input label="اسم القطعة المطلوبة" value={partName} onChange={setPartName} placeholder="مثال: فلتر زيت، تيل فرامل..." icon="🔧" />
          <Input label="نوع السيارة" value={carMake} onChange={setCarMake} placeholder="مثال: Toyota Camry" icon="🚗" />
          <Input label="سنة الصنع" value={carYear} onChange={setCarYear} placeholder="مثال: 2018" icon="📅" type="number" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>المحافظة</label>
            <select style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "11px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
              {["بغداد", "البصرة", "أربيل", "النجف", "كربلاء", "الموصل", "الديوانية", "الحلة", "كركوك"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>ملاحظات إضافية</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="أي تفاصيل إضافية عن القطعة المطلوبة..."
              style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 12, padding: 14, color: T.textPrimary, fontSize: 14, fontFamily: "inherit", minHeight: 80, resize: "none", outline: "none", boxSizing: "border-box" }} />
          </div>
          <Btn fullWidth size="lg" onClick={handleSubmit} disabled={!partName || !carMake} icon="📤">إرسال الطلب للبائعين</Btn>
        </>
      ) : (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
          <h3 style={{ margin: "0 0 8px", color: T.green }}>تم إرسال طلبك!</h3>
          <p style={{ color: T.textSecondary, margin: "0 0 20px", lineHeight: 1.6 }}>
            تم إرسال طلبك لـ <span style={{ color: T.gold, fontWeight: 700 }}>١,٢٤٠ بائع</span> في منطقتك. ستصلك عروض الأسعار قريباً.
          </p>
          <Btn onClick={() => setSubmitted(false)} variant="secondary">طلب جديد</Btn>
        </Card>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════
export default function DoctorCarsApp() {
  const { session, profile, loading, authError, signUp, signIn, signOut, signInWithOAuth } = useAuth();
  const [currentScreen, setCurrentScreen] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartBadgeCount, setCartBadgeCount] = useState(0);
  const [cartToast, setCartToast] = useState(null);
  const [prevScreen, setPrevScreen] = useState("home");
  const [userMode, setUserMode] = useState("buyer"); // buyer | seller | admin

  const navigate = (screen) => {
    setPrevScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const handleProductView = (product) => {
    setSelectedProduct(product);
    navigate("productDetail");
  };

  useEffect(() => {
    if (!session?.user) { setCartBadgeCount(0); return; }
    supabase.from("cart_items").select("id", { count: "exact", head: true }).eq("user_id", session.user.id)
      .then(({ count }) => setCartBadgeCount(count || 0));
  }, [session?.user?.id]);

  const handleCartAdd = async (product) => {
    if (!session?.user) {
      setCartToast({ msg: "يرجى تسجيل الدخول أولاً لإضافة المنتجات للسلة", isError: true });
      setTimeout(() => setCartToast(null), 3000);
      return;
    }
    const uid = session.user.id;
    const pid = product.id;
    const { data: existing } = await supabase.from("cart_items").select("id, quantity")
      .eq("user_id", uid).eq("product_id", pid).maybeSingle();
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: uid, product_id: pid, quantity: 1 });
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

  const screensWithBack = ["productDetail", "notifications", "cart", "diagnosis", "emergency", "request", "academy", "sellerDash", "admin", "sellerProfile", "myOrders"];

  const renderScreen = () => {
    switch (currentScreen) {
      case "home": return <HomeScreen onNavigate={navigate} onProductView={handleProductView} onCartAdd={handleCartAdd} cartCount={cartBadgeCount} />;
      case "shop": return <ShopScreen onProductView={handleProductView} onCartAdd={handleCartAdd} />;
      case "auctions": return <AuctionsScreen onNavigate={navigate} session={session} />;
      case "garage": return <GarageScreen />;
      case "profile": return <ProfileScreen onLogout={signOut} onNavigate={navigate} profile={profile} session={session} />;
      case "productDetail": return <ProductDetailScreen product={selectedProduct} onBack={() => navigate(prevScreen)} onCartAdd={handleCartAdd} session={session} profile={profile} />;
      case "notifications": return <NotificationsScreen />;
      case "cart": return <CartScreen session={session} onNavigate={navigate} onCartCountChange={setCartBadgeCount} profile={profile} />;
      case "diagnosis": return <DiagnosisScreen onCartAdd={handleCartAdd} session={session} />;
      case "emergency": return <EmergencyScreen />;
      case "request": return <PartRequestScreen />;
      case "academy": return <AcademyScreen />;
      case "sellerDash": return <SellerDashScreen session={session} />;
      case "myOrders": return <MyOrdersScreen session={session} />;
      case "admin": return <AdminScreen />;
      default: return <HomeScreen onNavigate={navigate} onProductView={handleProductView} onCartAdd={handleCartAdd} cartCount={cartBadgeCount} />;
    }
  };

  const showBackHeader = screensWithBack.includes(currentScreen);

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

      {/* TOP HEADER for sub-screens */}
      {showBackHeader && (
        <div style={{ position: "sticky", top: 0, zIndex: 100, background: `${T.navy}EE`, backdropFilter: "blur(10px)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.navyBorder}` }}>
          <button onClick={() => navigate(prevScreen)} style={{ background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textPrimary, fontSize: 18 }}>→</button>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>{{ productDetail: "🔧", notifications: "🔔", cart: "🛒", diagnosis: "🤖", emergency: "🚨", request: "📋", academy: "🎓", sellerDash: "🏪", admin: "🛡️", sellerProfile: "🏬", myOrders: "📦" }[currentScreen]}</span>
            <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 16 }}>
              {{ productDetail: "تفاصيل المنتج", notifications: "الإشعارات", cart: "السلة", diagnosis: "تشخيص الأعطال", emergency: "خدمات الطوارئ", request: "طلب قطعة", academy: "الأكاديمية", sellerDash: "لوحة البائع", admin: "لوحة الإدارة", sellerProfile: "ملف البائع", myOrders: "طلباتي" }[currentScreen]}
            </span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main style={{ paddingBottom: showBackHeader ? 20 : 90, minHeight: "100vh" }}>
        {renderScreen()}
      </main>

      {/* SHORTCUT TOOLBAR (floating) */}
      {!showBackHeader && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 99, display: "flex", gap: 8, background: `${T.navyCard}CC`, backdropFilter: "blur(10px)", border: `1px solid ${T.navyBorder}`, borderRadius: 20, padding: "6px 10px" }}>
          {[
            { icon: "🤖", screen: "diagnosis", label: "تشخيص" },
            { icon: "🚨", screen: "emergency", label: "طوارئ" },
            { icon: "📋", screen: "request", label: "اطلب قطعة" },
            { icon: "🎓", screen: "academy", label: "الأكاديمية" },
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
              <button key={item.id} onClick={() => navigate(item.id)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", padding: "4px 0", transition: "all 0.2s" }}>
                {item.id === "shop" && cartItems.length > 0 && item.id === "cart" ? null : null}
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

      {/* ROLE SWITCHER (demo only) */}
      <div style={{ position: "fixed", top: 12, left: 12, zIndex: 200, display: "flex", flexDirection: "column", gap: 4 }}>
        {[["B", "buyer", "مشتري"], ["S", "seller", "بائع"], ["A", "admin", "إدارة"]].map(([char, mode, label]) => (
          <button key={mode} onClick={() => { setUserMode(mode); navigate(mode === "admin" ? "admin" : mode === "seller" ? "sellerDash" : "home"); }}
            title={label}
            style={{ width: 32, height: 32, borderRadius: 8, background: userMode === mode ? T.gold : T.navyCard, border: `1px solid ${userMode === mode ? T.gold : T.navyBorder}`, color: userMode === mode ? T.navy : T.textMuted, fontWeight: 800, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
            {char}
          </button>
        ))}
      </div>
    </div>
  );
}
