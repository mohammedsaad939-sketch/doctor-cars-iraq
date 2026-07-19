import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, toWhatsAppNumber, relativeTime } from "../utils/theme";
import { isImageUrl, Badge, Btn, Card, Input, Modal, Stars, Tabs, ProductCard, MOCK } from "../utils/components";

const ProductDetailScreen = ({ product, onBack, onCartAdd, session, profile, favSet, onFavToggle, onNavigate, onMsgContext }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ buyer_name: "", buyer_phone: "", buyer_address: "", city: "", notes: "" });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerProductCount, setSellerProductCount] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [sellerReviewsLoading, setSellerReviewsLoading] = useState(false);
  const [sellerReviewForm, setSellerReviewForm] = useState({ rating: 5, comment: "" });
  const [sellerReviewSubmitting, setSellerReviewSubmitting] = useState(false);
  const [sellerReviewError, setSellerReviewError] = useState(null);
  const [sellerReviewSuccess, setSellerReviewSuccess] = useState(false);
  const [hasSellerReviewed, setHasSellerReviewed] = useState(false);
  const [discountCountdown, setDiscountCountdown] = useState("");

  useEffect(() => {
    if (!product?.seller_id) return;
    const sid = product.seller_id;
    Promise.all([
      supabase.from("sellers").select("store_name, verified, is_verified, rating, created_at, phone, whatsapp, owner_id, response_rate, id").eq("id", sid).single(),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("seller_id", sid),
    ]).then(([{ data: sellerData }, { count }]) => {
      setSellerInfo(sellerData || null);
      setSellerProductCount(count || 0);
    });
  }, [product?.seller_id]);

  useEffect(() => {
    if (!product?.id) return;
    setReviewsLoading(true);
    supabase.from("product_reviews").select("*, profiles(full_name)").eq("product_id", product.id).order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews(data || []);
        if (session?.user?.id) setHasReviewed((data || []).some(r => r.user_id === session.user.id));
        setReviewsLoading(false);
      });
  }, [product?.id]);

  useEffect(() => {
    if (!product?.seller_id) return;
    setSellerReviewsLoading(true);
    supabase.from("seller_reviews").select("*, profiles(full_name)").eq("seller_id", product.seller_id).order("created_at", { ascending: false })
      .then(({ data }) => {
        setSellerReviews(data || []);
        if (session?.user?.id) setHasSellerReviewed((data || []).some(r => r.user_id === session.user.id));
        setSellerReviewsLoading(false);
      });
  }, [product?.seller_id]);

  useEffect(() => {
    if (!product?.discount_ends_at) return;
    const update = () => {
      const diff = new Date(product.discount_ends_at) - new Date();
      if (diff <= 0) { setDiscountCountdown("انتهى العرض"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDiscountCountdown(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [product?.discount_ends_at]);

  const handleSubmitSellerReview = async () => {
    if (!session?.user?.id || !product?.seller_id) return;
    if (!sellerReviewForm.comment.trim()) { setSellerReviewError("يرجى كتابة تعليق"); return; }
    setSellerReviewSubmitting(true);
    setSellerReviewError(null);
    const { error } = await supabase.from("seller_reviews").insert({ seller_id: product.seller_id, user_id: session.user.id, rating: sellerReviewForm.rating, comment: sellerReviewForm.comment.trim() });
    if (error) {
      setSellerReviewError("حدث خطأ، حاول مجدداً");
    } else {
      setSellerReviewSuccess(true);
      setHasSellerReviewed(true);
      setSellerReviews(prev => [{ user_id: session.user.id, rating: sellerReviewForm.rating, comment: sellerReviewForm.comment.trim(), created_at: new Date().toISOString(), profiles: { full_name: profile?.full_name || "أنت" } }, ...prev]);
    }
    setSellerReviewSubmitting(false);
  };

  const handleSubmitReview = async () => {
    if (!session?.user?.id) return;
    if (!reviewForm.comment.trim()) { setReviewError("يرجى كتابة تعليق"); return; }
    setReviewSubmitting(true);
    setReviewError(null);
    const { error } = await supabase.from("product_reviews").insert({ product_id: product.id, user_id: session.user.id, rating: reviewForm.rating, comment: reviewForm.comment.trim() });
    if (error) {
      setReviewError("حدث خطأ، حاول مجدداً");
    } else {
      setReviewSuccess(true);
      setHasReviewed(true);
      setReviews(prev => [{ user_id: session.user.id, rating: reviewForm.rating, comment: reviewForm.comment.trim(), created_at: new Date().toISOString(), profiles: { full_name: profile?.full_name || "أنت" } }, ...prev]);
    }
    setReviewSubmitting(false);
  };

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
    try {
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
      if (orderError) { setCheckoutError(orderError.message); return; }
      const { error: itemsError } = await supabase.from("order_items").insert({
        order_id: orderData.id,
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.price,
      });
      if (itemsError) { setCheckoutError(itemsError.message); return; }
      setCheckoutSuccess(true);
    } finally {
      setCheckoutLoading(false);
    }
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
      <div style={{ background: T.navyCard, textAlign: "center", fontSize: 80, marginBottom: 0, overflow: "hidden", height: isImageUrl(product.image) ? 260 : "auto", padding: isImageUrl(product.image) ? 0 : 40, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {isImageUrl(product.image) ? <img src={product.image} alt={product.name} loading="lazy" style={{ width: "100%", height: 260, objectFit: "cover" }} /> : product.image}
        {(() => { const isDisc = product.discount_percent > 0 && (!product.discount_ends_at || new Date(product.discount_ends_at) > new Date()); return isDisc ? <div style={{ position: "absolute", top: 12, left: 12, background: T.red, color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 13, fontWeight: 700 }}>خصم {product.discount_percent}%</div> : null; })()}
        {onFavToggle && <button onClick={() => onFavToggle(product.id)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer" }}>{favSet?.has(String(product.id)) ? "❤️" : "🤍"}</button>}
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
        {(() => {
          const isDisc = product.discount_percent > 0 && (!product.discount_ends_at || new Date(product.discount_ends_at) > new Date());
          const discP = isDisc ? Math.round(product.price * (1 - product.discount_percent / 100) / 100) * 100 : null;
          return (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ color: T.gold, fontWeight: 900, fontSize: 24 }}>{(discP || product.price).toLocaleString("ar-IQ")} د.ع</span>
                {(discP || product.oldPrice) && <span style={{ color: T.textMuted, fontSize: 16, textDecoration: "line-through" }}>{product.price.toLocaleString("ar-IQ")}</span>}
              </div>
              {isDisc && product.discount_ends_at && discountCountdown && (
                <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 8, padding: "4px 10px", marginTop: 6, display: "inline-block" }}>
                  <span style={{ color: T.red, fontSize: 12, fontWeight: 700 }}>⏱ ينتهي بعد: {discountCountdown}</span>
                </div>
              )}
            </div>
          );
        })()}

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
          <>
          <Card>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏪</div>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: T.textPrimary, fontWeight: 800, fontSize: 15 }}>{sellerInfo?.store_name || product.seller || "—"}</span>
                  {(sellerInfo?.verified || sellerInfo?.is_verified) && <Badge small color={T.green}>✓ موثق</Badge>}
                </div>
                {sellerInfo?.rating != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Stars rating={sellerInfo.rating} size={12} />
                    <span style={{ color: T.textMuted, fontSize: 12 }}> {sellerInfo.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                ["المنتجات", sellerProductCount != null ? sellerProductCount.toLocaleString("ar-IQ") : "—"],
                ["منذ", sellerInfo?.created_at ? new Date(sellerInfo.created_at).getFullYear().toString() : "—"],
                ["الاستجابة", sellerInfo?.response_rate != null ? `${Math.round(sellerInfo.response_rate)}%` : "—"],
              ].map(([l, v]) => (
                <div key={l} style={{ textAlign: "center", background: T.navyLight, borderRadius: 10, padding: 10 }}>
                  <div style={{ color: T.gold, fontWeight: 800, fontSize: 16 }}>{v}</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn fullWidth size="sm" icon="🏬" variant="blue" onClick={() => { if (onNavigate && sellerInfo?.id) { onNavigate("sellerPublic", { sellerId: sellerInfo.id }); } }}>زيارة المتجر</Btn>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn fullWidth size="sm" icon="💬" variant="ghost" onClick={() => { if (!session?.user?.id) return; if (sellerInfo?.owner_id && onMsgContext) { onMsgContext({ partnerId: sellerInfo.owner_id, partnerName: sellerInfo.store_name || "البائع", productId: product.id, productName: product.name }); if (onNavigate) onNavigate("messages"); } }}>راسل البائع</Btn>
              <Btn fullWidth size="sm" icon="📱" variant="ghost" onClick={() => { const num = toWhatsAppNumber(sellerInfo?.whatsapp || sellerInfo?.phone); if (num) window.open(`https://wa.me/${num}`, "_blank", "noopener,noreferrer"); }}>واتساب</Btn>
              <Btn fullWidth size="sm" icon="📞" variant="ghost" onClick={() => { const ph = sellerInfo?.phone; if (ph) window.open(`tel:${ph}`, "_self"); }}>اتصال</Btn>
            </div>
          </Card>
          <div style={{ marginTop: 16 }}>
            <h4 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 14, fontWeight: 800 }}>تقييمات البائع</h4>
            {sellerReviews.length > 0 && (
              <Card style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: T.gold }}>{(sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length).toFixed(1)}</div>
                  <div>
                    <Stars rating={Math.round(sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length)} size={13} />
                    <div style={{ color: T.textMuted, fontSize: 12 }}>{sellerReviews.length} تقييم</div>
                  </div>
                </div>
              </Card>
            )}
            {session?.user?.id && !hasSellerReviewed && !sellerReviewSuccess && (
              <Card style={{ marginBottom: 10 }}>
                <h4 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 13 }}>أضف تقييمك للبائع</h4>
                <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(s => <button key={s} onClick={() => setSellerReviewForm(f => ({ ...f, rating: s }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, opacity: s <= sellerReviewForm.rating ? 1 : 0.3, padding: 0 }}>⭐</button>)}
                </div>
                <textarea value={sellerReviewForm.comment} onChange={e => setSellerReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="اكتب تعليقك هنا..." rows={2} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "8px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                {sellerReviewError && <p style={{ color: T.red, fontSize: 12, margin: "0 0 6px" }}>{sellerReviewError}</p>}
                <Btn fullWidth size="sm" onClick={handleSubmitSellerReview} disabled={sellerReviewSubmitting}>{sellerReviewSubmitting ? "جارٍ الإرسال..." : "إرسال التقييم"}</Btn>
              </Card>
            )}
            {sellerReviewSuccess && <Card style={{ textAlign: "center", marginBottom: 10 }}><p style={{ color: T.green, margin: 0, fontWeight: 700 }}>✅ تم إرسال تقييمك!</p></Card>}
            {sellerReviewsLoading ? <div style={{ textAlign: "center", padding: 16, color: T.textMuted }}>جارٍ التحميل...</div> : sellerReviews.map((r, i) => (
              <Card key={r.id || i} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{r.profiles?.full_name || "مجهول"}</div>
                      <Stars rating={r.rating} size={10} />
                    </div>
                  </div>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{relativeTime(r.created_at)}</span>
                </div>
                <p style={{ margin: 0, color: T.textSecondary, fontSize: 13 }}>{r.comment}</p>
              </Card>
            ))}
            {!sellerReviewsLoading && sellerReviews.length === 0 && <div style={{ textAlign: "center", padding: 16, color: T.textMuted, fontSize: 13 }}>لا توجد تقييمات بعد</div>}
          </div>
          </>
        )}

        {activeTab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.length > 0 && (
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: T.gold }}>{(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}</div>
                  <div>
                    <Stars rating={Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)} size={14} />
                    <div style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>{reviews.length} تقييم</div>
                  </div>
                </div>
              </Card>
            )}
            {session?.user?.id && !hasReviewed && !reviewSuccess && (
              <Card>
                <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>أضف تقييمك</h4>
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, opacity: s <= reviewForm.rating ? 1 : 0.3, padding: 0 }}>⭐</button>
                  ))}
                </div>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="اكتب تعليقك هنا..." rows={3} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 10 }} />
                {reviewError && <p style={{ color: T.red, fontSize: 12, margin: "0 0 8px" }}>{reviewError}</p>}
                <Btn fullWidth onClick={handleSubmitReview} disabled={reviewSubmitting}>{reviewSubmitting ? "جارٍ الإرسال..." : "إرسال التقييم"}</Btn>
              </Card>
            )}
            {reviewSuccess && (
              <Card style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <p style={{ color: T.green, margin: 0, fontWeight: 700 }}>تم إرسال تقييمك بنجاح!</p>
              </Card>
            )}
            {reviewsLoading ? (
              <div style={{ textAlign: "center", padding: 20, color: T.textMuted }}>جارٍ التحميل...</div>
            ) : reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <p style={{ color: T.textMuted, margin: 0 }}>لا توجد تقييمات بعد. كن أول من يقيّم!</p>
              </div>
            ) : reviews.map((review, i) => (
              <Card key={review.id || i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{review.profiles?.full_name || "مجهول"}</div>
                      <Stars rating={review.rating} size={11} />
                    </div>
                  </div>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{relativeTime(review.created_at)}</span>
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
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <Btn fullWidth onClick={handleOpenCheckout} variant="blue" icon="🛍️">اشتري الآن</Btn>
            <Btn size="sm" variant="secondary" icon="↗️" onClick={() => {
              const text = encodeURIComponent(`شاهد هذا على دكتور السيارات:\n${product.name} - ${product.price.toLocaleString("ar-IQ")} د.ع\n${window.location.href}`);
              window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
            }}>مشاركة</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailScreen;
