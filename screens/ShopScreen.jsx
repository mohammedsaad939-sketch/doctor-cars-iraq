import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { getCategories } from "../utils/hooks";
import { Card, ProductCard } from "../utils/components";

const ShopScreen = ({ onProductView, onCartAdd, initialCategory = null, favSet, onFavToggle, onCompare, compareSet }) => {
  const [products, setProducts] = useState([]);
  const [shopLoading, setShopLoading] = useState(true);
  useEffect(() => {
    setShopLoading(true);
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
      setShopLoading(false);
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
    getCategories(supabase).then(data => setShopCategories(data));
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

      {shopLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: T.navyCard, borderRadius: 16, height: 200, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {filtered.map(p => <ProductCard key={p.id} product={p} onView={onProductView} onCart={onCartAdd} isFav={favSet?.has(String(p.id))} onFavToggle={onFavToggle} onCompare={onCompare} inCompare={compareSet?.has(String(p.id))} />)}
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
