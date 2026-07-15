import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, Badge } from "../utils/components";

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

export default MyOrdersScreen;
