import { T } from "../utils/theme";
import { Btn } from "../utils/components";

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

export default ComparisonScreen;
