import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, relativeTime } from "../utils/theme";
import { Card, Stars } from "../utils/components";

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

export default MyReviewsScreen;
