import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, toWhatsAppNumber } from "../utils/theme";
import { getCategories } from "../utils/hooks";
import { isImageUrl, Badge, Btn, Card, Input, Modal, Section, AdCarousel, ProductCard, MOCK } from "../utils/components";

let _homeStatsCache = null;
let _topSellersCache = null;

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
    const t = setTimeout(async () => {
      setPersonalListingsLoading(true);
      const { data } = await supabase
        .from("personal_listings")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);
      setPersonalListings(data || []);
      setPersonalListingsLoading(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    getCategories(supabase).then(data => setPublishCategories(data));
  }, []);

  useEffect(() => {
    (async () => {
      const cats = await getCategories(supabase);
      if (!cats.length) return;
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
    if (_homeStatsCache) {
      setMarketStats(_homeStatsCache);
      setTopSellers(_topSellersCache || []);
      return;
    }
    const t1 = setTimeout(() => {
      supabase.from("sellers").select("id, store_name, specialty, seller_type, phone, is_verified").limit(4).then(({ data }) => {
        setTopSellers(data || []);
        _topSellersCache = data || [];
      });
    }, 1000);
    const t2 = setTimeout(() => {
      Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("sellers").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("auctions").select("id", { count: "exact", head: true }),
      ]).then(([{ count: products }, { count: sellers }, { count: orders }, { count: auctions }]) => {
        const stats = { products: products || 0, sellers: sellers || 0, orders: orders || 0, auctions: auctions || 0 };
        setMarketStats(stats);
        _homeStatsCache = stats;
      });
    }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
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
              <p style={{ color: T.textSecondary, margin: 0 }}>لا توجد نتائج لـ &quot;{searchText}&quot;</p>
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
                      {isImageUrl(listing.images?.[0]) ? <img src={listing.images[0]} alt={listing.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🏷️"}
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
                <button onClick={e => { e.stopPropagation(); const num = toWhatsAppNumber(seller.phone); if (num) window.open(`https://wa.me/${num}`, "_blank", "noopener,noreferrer"); }} style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "6px 12px", color: T.green, fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>تواصل</button>
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
              {publishImagePreview && <div style={{ marginBottom: 8, borderRadius: 10, overflow: "hidden" }}><img src={publishImagePreview} alt="معاينة" loading="lazy" style={{ width: "100%", height: 120, objectFit: "cover" }} /></div>}
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
                <img src={selectedListing.images[0]} alt={selectedListing.title} loading="lazy" style={{ width: "100%", height: 180, objectFit: "cover" }} />
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
              <Btn fullWidth variant="ghost" icon="💬" onClick={() => window.open(`https://wa.me/${toWhatsAppNumber(selectedListing.contact_phone)}`, "_blank", "noopener,noreferrer")}>واتساب</Btn>
              <Btn size="sm" variant="secondary" icon="↗️" onClick={() => {
                const text = encodeURIComponent(`شاهد هذا على دكتور السيارات:\n${selectedListing.title} - ${Number(selectedListing.price).toLocaleString("ar-IQ")} د.ع\n${window.location.href}`);
                window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
              }}>مشاركة</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default HomeScreen;
