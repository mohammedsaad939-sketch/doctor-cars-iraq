import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, Input, Modal, Btn, isImageUrl } from "../utils/components";

const CartScreen = ({ session, onNavigate, onCartCountChange, profile }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ buyer_name: "", buyer_phone: "", buyer_address: "", city: "", notes: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const loadCart = async () => {
    if (!session?.user) { setCartLoading(false); return; }
    const { data } = await supabase.from("cart_items").select("*, products(*)").eq("user_id", session.user.id).order("created_at");
    setCartItems(data || []);
    setCartLoading(false);
    if (onCartCountChange) onCartCountChange((data || []).length);
  };

  useEffect(() => { loadCart(); }, [session?.user?.id]);

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    setUpdating(p => ({ ...p, [item.id]: true }));
    if (newQty <= 0) {
      await supabase.from("cart_items").delete().eq("id", item.id);
    } else {
      await supabase.from("cart_items").update({ quantity: newQty }).eq("id", item.id);
    }
    await loadCart();
    setUpdating(p => ({ ...p, [item.id]: false }));
  };

  const removeItem = async (item) => {
    setUpdating(p => ({ ...p, [item.id]: true }));
    try {
      await supabase.from("cart_items").delete().eq("id", item.id);
      await loadCart();
    } finally {
      setUpdating(p => ({ ...p, [item.id]: false }));
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);

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

  const handleConfirmCheckout = async () => {
    if (!checkoutForm.buyer_name.trim() || !checkoutForm.buyer_phone.trim() || !checkoutForm.buyer_address.trim()) {
      setCheckoutError("يرجى تعبئة الاسم ورقم الهاتف والعنوان");
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const uid = session.user.id;
      for (const item of cartItems) {
        if (!item.products) {
          throw new Error(`بيانات المنتج مفقودة — يرجى تحديث السلة وإعادة المحاولة`);
        }
        if (!item.products.seller_id) {
          throw new Error(`المنتج "${item.products.name || item.product_id}" غير مرتبط ببائع — لا يمكن إتمام الطلب`);
        }
      }
      const grouped = {};
      for (const item of cartItems) {
        const sid = item.products.seller_id;
        if (!grouped[sid]) grouped[sid] = [];
        grouped[sid].push(item);
      }
      for (const [sellerId, items] of Object.entries(grouped)) {
        const sellerTotal = items.reduce((s, i) => s + (i.products?.price || 0) * i.quantity, 0);
        const { data: order, error: orderErr } = await supabase.from("orders").insert({
          buyer_id: uid,
          seller_id: sellerId,
          status: "pending",
          payment_method: "cod",
          total_amount: sellerTotal,
          buyer_name: checkoutForm.buyer_name.trim(),
          buyer_phone: checkoutForm.buyer_phone.trim(),
          buyer_address: checkoutForm.buyer_address.trim(),
          city: checkoutForm.city.trim(),
          notes: checkoutForm.notes.trim(),
        }).select("id").single();
        if (orderErr) throw orderErr;
        const orderItems = items.map(i => ({
          order_id: order.id,
          product_id: i.product_id,
          product_name: i.products?.name || "",
          quantity: i.quantity,
          unit_price: i.products?.price || 0,
        }));
        const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
        if (itemsErr) throw itemsErr;
      }
      await supabase.from("cart_items").delete().eq("user_id", uid);
      setCartItems([]);
      if (onCartCountChange) onCartCountChange(0);
      setCheckoutSuccess(true);
    } catch (err) {
      setCheckoutError(err.message || "حدث خطأ، يرجى المحاولة مجدداً");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cartLoading) return <div style={{ padding: 32, textAlign: "center", color: T.textMuted }}>جارٍ التحميل...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🛒 سلة التسوق</h2>
      {cartItems.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
          <h3 style={{ color: T.textSecondary, fontWeight: 400, margin: "0 0 16px" }}>السلة فارغة</h3>
          <Btn onClick={() => onNavigate("shop")}>تصفح المنتجات</Btn>
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {cartItems.map(item => {
              const prod = item.products || {};
              const imgSrc = Array.isArray(prod.images) ? prod.images[0] : prod.images;
              return (
                <Card key={item.id} style={{ display: "flex", gap: 12, alignItems: "center", opacity: updating[item.id] ? 0.6 : 1 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, overflow: "hidden" }}>
                    {isImageUrl(imgSrc) ? <img src={imgSrc} alt={prod.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "📦"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 4px", color: T.textPrimary, fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.name || "منتج"}</p>
                    <p style={{ margin: 0, color: T.gold, fontWeight: 800, fontSize: 14 }}>{((prod.price || 0) * item.quantity).toLocaleString("ar-IQ")} د.ع</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => updateQty(item, -1)} disabled={updating[item.id]} style={{ width: 28, height: 28, borderRadius: 8, background: T.navyLight, border: `1px solid ${T.navyBorder}`, color: T.textPrimary, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ color: T.textPrimary, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
                    <button onClick={() => updateQty(item, 1)} disabled={updating[item.id]} style={{ width: 28, height: 28, borderRadius: 8, background: T.navyLight, border: `1px solid ${T.navyBorder}`, color: T.textPrimary, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                    <button onClick={() => removeItem(item)} disabled={updating[item.id]} style={{ background: `${T.red}22`, border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                  </div>
                </Card>
              );
            })}
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
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: T.textSecondary }}>طريقة الدفع</span>
              <span style={{ color: T.gold, fontWeight: 700 }}>الدفع عند الاستلام</span>
            </div>
            <div style={{ height: 1, background: T.navyBorder, margin: "10px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: T.textPrimary, fontWeight: 800, fontSize: 16 }}>الإجمالي</span>
              <span style={{ color: T.gold, fontWeight: 900, fontSize: 18 }}>{total.toLocaleString("ar-IQ")} د.ع</span>
            </div>
          </Card>

          <Btn fullWidth size="lg" icon="💳" onClick={handleOpenCheckout}>متابعة للدفع</Btn>
        </>
      )}

      {showCheckout && (
        <Modal title="تأكيد الطلب" onClose={() => setShowCheckout(false)}>
          {checkoutSuccess ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
              <h3 style={{ color: T.green, margin: "0 0 8px" }}>تم تقديم طلبك بنجاح!</h3>
              <p style={{ color: T.textSecondary, margin: "0 0 20px" }}>سيتواصل معك البائع قريباً</p>
              <Btn onClick={() => { setShowCheckout(false); onNavigate("myOrders"); }}>عرض طلباتي</Btn>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Input label="الاسم الكامل *" value={checkoutForm.buyer_name} onChange={v => setCheckoutForm(f => ({ ...f, buyer_name: v }))} placeholder="اسمك الكامل" />
              <Input label="رقم الهاتف *" value={checkoutForm.buyer_phone} onChange={v => setCheckoutForm(f => ({ ...f, buyer_phone: v }))} placeholder="07XXXXXXXXX" />
              <Input label="العنوان التفصيلي *" value={checkoutForm.buyer_address} onChange={v => setCheckoutForm(f => ({ ...f, buyer_address: v }))} placeholder="المحلة، الزقاق، رقم الدار..." />
              <div>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>المدينة</label>
                <select value={checkoutForm.city} onChange={e => setCheckoutForm(f => ({ ...f, city: e.target.value }))} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "11px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" }}>
                  <option value="">اختر المدينة</option>
                  {["بغداد", "البصرة", "أربيل", "النجف", "كربلاء", "الموصل", "الديوانية", "الحلة", "كركوك"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Input label="ملاحظات" value={checkoutForm.notes} onChange={v => setCheckoutForm(f => ({ ...f, notes: v }))} placeholder="أي تعليمات خاصة..." />
              {checkoutError && <p style={{ color: T.red, fontSize: 13, margin: 0, fontWeight: 600 }}>⚠️ {checkoutError}</p>}
              <Btn fullWidth size="lg" onClick={handleConfirmCheckout} disabled={checkoutLoading} icon="✅">
                {checkoutLoading ? "جارٍ التأكيد..." : "تأكيد الطلب"}
              </Btn>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CartScreen;
