import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, ProductCard } from "../utils/components";

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

export default FavoritesScreen;
