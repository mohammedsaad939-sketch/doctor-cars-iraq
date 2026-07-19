import { useState } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, Input, Btn } from "../utils/components";

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
          {/* TODO: wire to a real "list your car" flow once one exists; disabled rather than a dead active-looking button (see .github/copilot-instructions.md Pattern 6) */}
          <Btn fullWidth variant="primary" icon="📋" onClick={() => {}} disabled size="sm">اعرض سيارتك للبيع (قريباً)</Btn>
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

export default CarPriceEstimatorScreen;
