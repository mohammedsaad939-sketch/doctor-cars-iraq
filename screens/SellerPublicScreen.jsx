import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, toWhatsAppNumber } from "../utils/theme";
import { Card, Badge, Btn, ProductCard } from "../utils/components";

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
          {seller.whatsapp || seller.phone ? <Btn size="sm" variant="green" icon="📱" onClick={() => { const n = toWhatsAppNumber(seller.whatsapp || seller.phone); if (n) window.open(`https://wa.me/${n}`, "_blank", "noopener,noreferrer"); }}>واتساب</Btn> : null}
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

export default SellerPublicScreen;
