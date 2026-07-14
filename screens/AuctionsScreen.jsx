import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, toWhatsAppNumber } from "../utils/theme";
import { isImageUrl, Badge, Btn, Card, Input, Modal, Tabs } from "../utils/components";

const AuctionsScreen = ({ onNavigate, session }) => {
  const user = session?.user ?? null;
  const [activeTab, setActiveTab] = useState("live");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [bidAmount, setBidAmount] = useState({});
  const [bidState, setBidState] = useState({}); // { [auctionId]: { loading, success, error } }
  const [lastBidsMap, setLastBidsMap] = useState({}); // { [auctionId]: { bidder_id } }
  const [winnerBidsMap, setWinnerBidsMap] = useState({}); // { [auctionId]: winningAmount }
  const [galleryIdx, setGalleryIdx] = useState({}); // { [auctionId]: number }
  const [lightbox, setLightbox] = useState(null); // auctionId or null
  const [userBidsMap, setUserBidsMap] = useState({}); // { [auctionId]: [{ id, amount, created_at }] }
  const [bidDeleteState, setBidDeleteState] = useState({}); // { [bidId]: { loading, error } }
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", starting_price: "", min_increment: "", starts_at: "", ends_at: "", category_id: "", vehicle_id: "" });
  const [auctionCategories, setAuctionCategories] = useState([]);
  const [sellerVehicles, setSellerVehicles] = useState([]);
  const [auctionImageFiles, setAuctionImageFiles] = useState([]);
  const [auctionImagePreviews, setAuctionImagePreviews] = useState([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [mySellerId, setMySellerId] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("sellers").select("id").eq("owner_id", session.user.id).single()
      .then(({ data }) => { if (data) setMySellerId(data.id); });
  }, [session?.user?.id]);

  const handleOpenCreate = async () => {
    if (!user) { setCreateError("يجب تسجيل الدخول أولاً"); setShowCreateModal(true); return; }
    setCreateForm({ title: "", description: "", starting_price: "", min_increment: "", starts_at: "", ends_at: "", category_id: "", vehicle_id: "" });
    setCreateError(null);
    setCreateSuccess(false);
    setAuctionImageFiles([]);
    auctionImagePreviews.forEach(u => URL.revokeObjectURL(u));
    setAuctionImagePreviews([]);
    setShowCreateModal(true);
    const [{ data: cats }, { data: veh }] = await Promise.all([
      supabase.from("categories").select("id,name").neq("id", 11).order("sort_order"),
      supabase.from("vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);
    setAuctionCategories(cats || []);
    setSellerVehicles(veh || []);
  };

  const handleCreateAuction = async () => {
    if (!createForm.title.trim()) { setCreateError("اسم المزاد مطلوب"); return; }
    if (!createForm.category_id) { setCreateError("الفئة مطلوبة"); return; }
    const rawPrice = String(createForm.starting_price).replace(/[^0-9.]/g, "");
    if (!rawPrice || isNaN(Number(rawPrice)) || Number(rawPrice) <= 0) { setCreateError("السعر الابتدائي مطلوب"); return; }
    if (!createForm.starts_at) { setCreateError("تاريخ البداية مطلوب"); return; }
    if (!createForm.ends_at) { setCreateError("تاريخ النهاية مطلوب"); return; }
    if (new Date(createForm.ends_at) <= new Date(createForm.starts_at)) { setCreateError("تاريخ النهاية يجب أن يكون بعد البداية"); return; }
    const isCars = String(createForm.category_id) === "8";
    if (isCars && !createForm.vehicle_id) { setCreateError("يجب اختيار مركبة لمزادات السيارات"); return; }
    setCreating(true);
    setCreateError(null);
    const { data: sellerRow } = await supabase.from("sellers").select("id").eq("owner_id", user.id).maybeSingle();
    if (!sellerRow) { setCreateError("يجب أن يكون لديك حساب بائع لإنشاء مزاد"); setCreating(false); return; }
    const startPrice = Number(String(createForm.starting_price).replace(/[^0-9.]/g, ""));
    const status = new Date(createForm.starts_at) <= new Date() ? "live" : "upcoming";
    let images = [];
    if (isCars) {
      const v = sellerVehicles.find(v => v.id === createForm.vehicle_id);
      images = v?.images || [];
    } else if (auctionImageFiles.length > 0) {
      for (let i = 0; i < auctionImageFiles.length; i++) {
        const file = auctionImageFiles[i];
        const path = `auctions/${Date.now()}_${i}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
        if (upErr) { setCreateError(`فشل رفع الصورة: ${upErr.message}`); setCreating(false); return; }
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        images.push(urlData.publicUrl);
      }
    }
    const { error } = await supabase.from("auctions").insert({
      seller_id: sellerRow.id,
      title: createForm.title.trim(),
      description: isCars ? null : (createForm.description.trim() || null),
      starting_price: startPrice,
      current_price: startPrice,
      min_increment: createForm.min_increment ? Number(createForm.min_increment) : 0,
      starts_at: createForm.starts_at,
      ends_at: createForm.ends_at,
      status,
      category_id: Number(createForm.category_id),
      images,
      vehicle_id: isCars ? createForm.vehicle_id : null,
    });
    setCreating(false);
    if (error) {
      const msg = (error.message.includes("vehicle_id") || error.message.includes("trigger"))
        ? "مزادات السيارات تتطلب ربط مركبة. الرجاء اختيار مركبة صحيحة."
        : error.message;
      setCreateError(msg);
      return;
    }
    setCreateSuccess(true);
    auctionImagePreviews.forEach(u => URL.revokeObjectURL(u));
    setAuctionImagePreviews([]);
    setAuctionImageFiles([]);
    setTimeout(() => { setShowCreateModal(false); setCreateSuccess(false); loadAuctions(activeTab); }, 2000);
  };

  const handleBid = async (auctionId) => {
    if (!session?.user?.id) {
      setBidState(p => ({ ...p, [auctionId]: { error: "يجب تسجيل الدخول أولاً للمزايدة" } }));
      return;
    }
    const rawVal = bidAmount[auctionId];
    const amount = Number(rawVal);
    if (!rawVal || !amount || isNaN(amount)) {
      setBidState(p => ({ ...p, [auctionId]: { error: "أدخل مبلغاً صحيحاً للمزايدة" } }));
      return;
    }
    console.log("BID ATTEMPT:", auctionId, session.user.id, amount);
    setBidState(p => ({ ...p, [auctionId]: { loading: true, error: null, success: false } }));
    const { error } = await supabase.from("bids").insert({ auction_id: auctionId, bidder_id: session.user.id, amount });
    if (error) {
      console.error("BID ERROR:", error);
      setBidState(p => ({ ...p, [auctionId]: { error: error.message } }));
    } else {
      setBidState(p => ({ ...p, [auctionId]: { success: true } }));
      setBidAmount(p => ({ ...p, [auctionId]: "" }));
      setTimeout(() => setBidState(p => ({ ...p, [auctionId]: {} })), 3000);
    }
  };

  const handleDeleteBid = async (bidId, auctionId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المزايدة؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setBidDeleteState(p => ({ ...p, [bidId]: { loading: true, error: null } }));
    const { error } = await supabase.from("bids").delete().eq("id", bidId);
    if (error) {
      setBidDeleteState(p => ({ ...p, [bidId]: { error: error.message } }));
      setTimeout(() => setBidDeleteState(p => ({ ...p, [bidId]: {} })), 4000);
      return;
    }
    setBidDeleteState(p => ({ ...p, [bidId]: {} }));
    setUserBidsMap(prev => {
      const updated = { ...prev };
      if (updated[auctionId]) updated[auctionId] = updated[auctionId].filter(b => b.id !== bidId);
      return updated;
    });
  };

  // Countdown ticker — runs only on "live" tab
  useEffect(() => {
    if (activeTab !== "live") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activeTab]);

  const formatCountdown = (endsAt) => {
    if (!endsAt) return "—";
    const diff = new Date(endsAt) - now;
    if (diff <= 0) return "انتهى";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Realtime subscription — أشترك عند فتح "مباشر"، وألغِ الاشتراك عند المغادرة
  useEffect(() => {
    if (activeTab !== "live") return;
    const channel = supabase
      .channel("auctions-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "auctions" }, (payload) => {
        setAuctions(prev => prev.map(a =>
          a.id === payload.new.id ? { ...a, current_price: payload.new.current_price } : a
        ));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeTab]);

  const loadWinnerBids = async (auctionsList) => {
    const endedWithWinner = (auctionsList || []).filter(a => a.status === "ended" && a.winner_id);
    if (!endedWithWinner.length) return;
    const ids = endedWithWinner.map(a => a.id);
    const { data: bids } = await supabase.from("bids").select("auction_id, bidder_id, amount")
      .in("auction_id", ids).order("amount", { ascending: false });
    const map = {};
    (bids || []).forEach(b => {
      const auction = endedWithWinner.find(a => a.id === b.auction_id);
      if (auction && b.bidder_id === auction.winner_id && !map[b.auction_id]) {
        map[b.auction_id] = b.amount;
      }
    });
    setWinnerBidsMap(map);
  };

  const loadAuctions = async (tab) => {
    setLoading(true);
    setAuctions([]);

    if (tab === "mine") {
      if (!user) { setLoading(false); return; }
      const { data: myBids } = await supabase.from("bids").select("auction_id").eq("bidder_id", user.id);
      const ids = [...new Set((myBids || []).map(b => b.auction_id))];
      if (!ids.length) { setLoading(false); return; }
      const { data } = await supabase.from("auctions").select("*, sellers(store_name, phone, whatsapp), vehicles(*)").in("id", ids);
      setAuctions(data || []);
      // جلب آخر مزايدة لكل مزاد لمعرفة من هو الأعلى حالياً
      const { data: latestBids } = await supabase
        .from("bids").select("id, auction_id, bidder_id, amount, created_at")
        .in("auction_id", ids).order("created_at", { ascending: false });
      const map = {};
      const myBidsMap = {};
      (latestBids || []).forEach(b => {
        if (!map[b.auction_id]) map[b.auction_id] = b;
        if (b.bidder_id === user.id) {
          if (!myBidsMap[b.auction_id]) myBidsMap[b.auction_id] = [];
          myBidsMap[b.auction_id].push(b);
        }
      });
      setLastBidsMap(map);
      setUserBidsMap(myBidsMap);
      await loadWinnerBids(data || []);
      setLoading(false);
      return;
    }

    let q = supabase.from("auctions").select("*, sellers(store_name, phone, whatsapp), vehicles(*)");
    if (tab === "live")       q = q.eq("status", "live").order("ends_at");
    else if (tab === "upcoming") q = q.eq("status", "upcoming").order("starts_at");
    else if (tab === "ended")    q = q.eq("status", "ended").order("ends_at", { ascending: false });
    const { data } = await q;
    setAuctions(data || []);
    await loadWinnerBids(data || []);
    setLoading(false);
  };

  useEffect(() => { loadAuctions(activeTab); }, [activeTab]);

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🏆 المزادات</h2>
      <Tabs
        tabs={[{ id: "live", label: "🔴 مباشر" }, { id: "upcoming", label: "⏳ قادم" }, { id: "ended", label: "✅ منتهي" }, { id: "mine", label: "🎯 مزاداتي" }]}
        active={activeTab} onChange={setActiveTab}
      />

      {loading && <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>⏳ جاري التحميل...</div>}

      {!loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {auctions.length === 0 && activeTab !== "mine" && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{activeTab === "live" ? "🏆" : activeTab === "upcoming" ? "⏳" : "✅"}</div>
              <p style={{ color: T.textSecondary, margin: 0 }}>لا توجد مزادات في هذا القسم حالياً</p>
            </Card>
          )}
          {auctions.length === 0 && activeTab === "mine" && !user && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
              <p style={{ color: T.textSecondary, margin: 0 }}>يجب تسجيل الدخول لعرض مزاداتك</p>
            </Card>
          )}
          {auctions.length === 0 && activeTab === "mine" && user && (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
              <p style={{ color: T.textSecondary, margin: 0 }}>لم تشارك في أي مزاد بعد</p>
            </Card>
          )}

          {auctions.map(auction => {
            const hasVehicle = !!auction.vehicle_id && auction.vehicles;
            const displayImages = hasVehicle ? (auction.vehicles.images || []) : (auction.images || []);
            const firstImg = isImageUrl(displayImages[0]) ? displayImages[0] : null;
            const minRequired = (auction.current_price || auction.starting_price || 0) + (auction.min_increment || 0);
            const lastBid = lastBidsMap[auction.id];
            const isTopBidder = activeTab === "mine" && user && lastBid?.bidder_id === user.id;
            return (
              <Card key={auction.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  {auction.status === "live" ? <Badge color={T.red}>🔴 مباشر</Badge>
                    : auction.status === "upcoming" ? <Badge color={T.gold}>⏳ قادم</Badge>
                    : <Badge color={T.textMuted}>✅ منتهي</Badge>}
                  {auction.status === "live" && (
                    <span style={{ color: T.red, fontWeight: 800, fontFamily: "monospace", fontSize: 18 }}>{formatCountdown(auction.ends_at)}</span>
                  )}
                  {auction.status === "upcoming" && auction.starts_at && (
                    <span style={{ color: T.gold, fontWeight: 700, fontSize: 12 }}>يبدأ: {new Date(auction.starts_at).toLocaleDateString("ar-IQ")}</span>
                  )}
                </div>
                {(() => {
                  const gIdx = galleryIdx[auction.id] || 0;
                  const setG = (n) => setGalleryIdx(p => ({ ...p, [auction.id]: (n + displayImages.length) % displayImages.length }));
                  return displayImages.length > 0 ? (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 160, background: T.navyLight }}>
                        <img src={displayImages[gIdx]} alt={auction.title} onClick={() => setLightbox(auction.id)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
                        {displayImages.length > 1 && (
                          <>
                            <button onClick={() => setG(gIdx - 1)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                            <button onClick={() => setG(gIdx + 1)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 30, height: 30, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                          </>
                        )}
                      </div>
                      {displayImages.length > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 7 }}>
                          {displayImages.map((_, i) => (
                            <div key={i} onClick={() => setG(i)} style={{ width: gIdx === i ? 16 : 6, height: 6, borderRadius: 3, background: gIdx === i ? T.gold : T.navyBorder, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }} />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: 48, textAlign: "center", background: T.navyLight, borderRadius: 12, padding: "16px 0", marginBottom: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><span>🚗</span><span style={{ fontSize: 12, color: T.textMuted }}>لا توجد صور متاحة</span></div>
                  );
                })()}
                {hasVehicle && (
                  <div style={{ background: T.navyMid, borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                    <div style={{ color: T.gold, fontWeight: 800, fontSize: 12, marginBottom: 6 }}>🚗 تفاصيل المركبة</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {auction.vehicles.brand && auction.vehicles.model && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>الموديل</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{auction.vehicles.brand} {auction.vehicles.model}</div></div>
                      )}
                      {auction.vehicles.year && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>سنة الصنع</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{auction.vehicles.year}</div></div>
                      )}
                      {auction.vehicles.chassis_number && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>رقم الشاصي</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 11 }}>{auction.vehicles.chassis_number}</div></div>
                      )}
                      {auction.vehicles.import_origin && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>أصل الاستيراد</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{auction.vehicles.import_origin === "american" ? "وارد أمريكي" : "وارد خليجي"}</div></div>
                      )}
                      {auction.vehicles.mileage_km != null && (
                        <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>المسافة المقطوعة</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{Number(auction.vehicles.mileage_km).toLocaleString("ar-IQ")} كم</div></div>
                      )}
                    </div>
                  </div>
                )}
                <h3 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 15, fontWeight: 800 }}>{auction.title}</h3>
                {auction.description && <p style={{ margin: "0 0 8px", color: T.textMuted, fontSize: 12 }}>{auction.description}</p>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <p style={{ margin: "0 0 2px", color: T.textMuted, fontSize: 12 }}>السعر الحالي</p>
                    <p style={{ margin: 0, color: T.gold, fontWeight: 900, fontSize: 18 }}>{(auction.current_price || auction.starting_price || 0).toLocaleString("ar-IQ")} د.ع</p>
                  </div>
                  {activeTab === "mine" && (
                    isTopBidder
                      ? <span style={{ background: `${T.green}22`, color: T.green, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>✅ أنت الأعلى</span>
                      : <span style={{ background: `${T.red}22`, color: T.red, padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>تمت مزايدة أعلى منك</span>
                  )}
                </div>
                {auction.status === "live" && (() => {
                  if (!user) return (
                    <p style={{ margin: 0, color: T.textMuted, fontSize: 13, fontWeight: 600, textAlign: "center", padding: "10px 0" }}>🔒 سجّل دخولك أولاً للمزايدة</p>
                  );
                  if (mySellerId && auction.seller_id === mySellerId) return (
                    <div style={{ background: `${T.gold}18`, border: `1px solid ${T.gold}44`, borderRadius: 10, padding: "12px 14px" }}>
                      <p style={{ margin: "0 0 8px", color: T.gold, fontWeight: 700, fontSize: 13 }}>📢 أنت صاحب هذا المزاد — لا يمكنك المزايدة على مزادك الخاص. شارك رابط المزاد مع المشترين.</p>
                      <a href={`https://wa.me/?text=${encodeURIComponent(auction.title + "\n" + window.location.href)}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>📲 شارك عبر واتساب</a>
                    </div>
                  );
                  const bid = bidState[auction.id] || {};
                  const isOwnAuctionErr = bid.error && (bid.error.includes("البائع") || bid.error.includes("مزاده") || bid.error.includes("مزادك"));
                  return (
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <input
                          type="number"
                          placeholder={`أدنى: ${minRequired.toLocaleString("ar-IQ")}`}
                          value={bidAmount[auction.id] || ""}
                          onChange={e => setBidAmount(p => ({ ...p, [auction.id]: e.target.value }))}
                          style={{ flex: 1, background: T.navyLight, border: `1px solid ${bid.error ? T.red : T.navyBorder}`, borderRadius: 10, padding: "10px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none" }}
                        />
                        <Btn
                          onClick={() => handleBid(auction.id)}
                          variant={bid.success ? "green" : "primary"}
                          disabled={bid.loading}
                          icon={bid.loading ? "⏳" : bid.success ? "✓" : "🏷️"}
                        >
                          {bid.loading ? "..." : bid.success ? "تم!" : "زايد الآن"}
                        </Btn>
                      </div>
                      {bid.error && (
                        <div style={{ background: `${T.red}18`, border: `1px solid ${T.red}55`, borderRadius: 8, padding: "8px 12px", marginTop: 6 }}>
                          <p style={{ margin: 0, color: T.red, fontSize: 13, fontWeight: 700 }}>
                            {isOwnAuctionErr ? "لا يمكنك المزايدة على مزادك الخاص" : bid.error}
                          </p>
                        </div>
                      )}
                      {bid.success && <p style={{ margin: "4px 0 0", color: T.green, fontSize: 12, fontWeight: 700 }}>✓ تمت المزايدة بنجاح!</p>}
                    </div>
                  );
                })()}
                {auction.status === "ended" && (() => {
                  if (!auction.winner_id) {
                    return (
                      <div style={{ background: `${T.navyLight}`, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                        <p style={{ margin: 0, color: T.textMuted, fontSize: 13, fontWeight: 600 }}>🔒 انتهى المزاد بدون أي مزايدات</p>
                      </div>
                    );
                  }
                  const winAmount = winnerBidsMap[auction.id];
                  const isWinner = user && user.id === auction.winner_id;
                  if (isWinner) {
                    return (
                      <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}55`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", color: T.green, fontSize: 15, fontWeight: 800 }}>🎉 لقد فزت بهذا المزاد!</p>
                        {winAmount != null && <p style={{ margin: 0, color: T.green, fontSize: 13, fontWeight: 700 }}>السعر النهائي: {winAmount.toLocaleString("ar-IQ")} د.ع</p>}
                      </div>
                    );
                  }
                  return (
                    <div style={{ background: `${T.navyLight}`, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                      <p style={{ margin: "0 0 4px", color: T.textMuted, fontSize: 13, fontWeight: 600 }}>🔒 انتهى المزاد</p>
                      {winAmount != null && <p style={{ margin: 0, color: T.gold, fontSize: 13, fontWeight: 700 }}>السعر النهائي: {winAmount.toLocaleString("ar-IQ")} د.ع</p>}
                    </div>
                  );
                })()}
                {activeTab === "mine" && auction.status === "ended" && userBidsMap[auction.id]?.length > 0 && (
                  <div style={{ marginTop: 10, background: T.navyMid, borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ margin: "0 0 8px", color: T.textSecondary, fontSize: 12, fontWeight: 700 }}>📋 مزايداتي في هذا المزاد</p>
                    {userBidsMap[auction.id].map(bid => {
                      const ds = bidDeleteState[bid.id] || {};
                      return (
                        <div key={bid.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${T.navyBorder}` }}>
                          <span style={{ color: T.textPrimary, fontSize: 13, fontWeight: 700 }}>{bid.amount.toLocaleString("ar-IQ")} د.ع</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {ds.error && <span style={{ color: T.red, fontSize: 11 }}>{ds.error}</span>}
                            <button onClick={() => handleDeleteBid(bid.id, auction.id)} disabled={ds.loading} style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, color: T.red, borderRadius: 7, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                              {ds.loading ? "..." : "🗑️"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {(auction.sellers?.phone || auction.sellers?.whatsapp) && (
                  <div style={{ background: T.navyMid, borderRadius: 10, padding: "10px 12px", marginTop: 10, display: "flex", gap: 8, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                    <span style={{ color: T.textSecondary, fontSize: 12, fontWeight: 700, flexBasis: "100%", textAlign: "center", marginBottom: 4 }}>📞 تواصل مع البائع</span>
                    {auction.sellers.phone && (
                      <a href={`tel:${auction.sellers.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${T.blue}22`, color: T.blue, border: `1px solid ${T.blue}44`, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                        📱 اتصال
                      </a>
                    )}
                    {auction.sellers.whatsapp && (
                      <a href={`https://wa.me/${toWhatsAppNumber(auction.sellers.whatsapp)}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#25D36622", color: "#25D366", border: "1px solid #25D36644", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                        💬 واتساب
                      </a>
                    )}
                  </div>
                )}
                {auction.sellers?.store_name && (
                  <p style={{ margin: "8px 0 0", color: T.textMuted, fontSize: 11, textAlign: "center" }}>
                    {auction.min_increment ? `أدنى زيادة: ${auction.min_increment.toLocaleString("ar-IQ")} د.ع | ` : ""}البائع: {auction.sellers.store_name}
                  </p>
                )}
              </Card>
            );
          })}

          {activeTab === "live" && (
            <Card style={{ textAlign: "center", padding: 28, border: `2px dashed ${T.navyBorder}`, background: "transparent" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏷️</div>
              <h4 style={{ margin: "0 0 8px", color: T.textPrimary }}>أنشئ مزادك الخاص</h4>
              <p style={{ margin: "0 0 16px", color: T.textMuted, fontSize: 13 }}>بع سيارتك أو قطعتك عبر المزاد</p>
              <Btn onClick={handleOpenCreate}>إنشاء مزاد جديد</Btn>
            </Card>
          )}
        </div>
      )}

      {lightbox !== null && (() => {
        const lbAuction = auctions.find(a => a.id === lightbox);
        if (!lbAuction) return null;
        const lbHasVehicle = !!lbAuction.vehicle_id && lbAuction.vehicles;
        const lbImages = lbHasVehicle ? (lbAuction.vehicles.images || []) : (lbAuction.images || []);
        const lbIdx = galleryIdx[lightbox] || 0;
        const lbSetG = (n) => setGalleryIdx(p => ({ ...p, [lightbox]: (n + lbImages.length) % lbImages.length }));
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", flexDirection: "column" }}>
            <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 16, right: 16, zIndex: 10000, background: "rgba(255,255,255,0.18)", border: "none", borderRadius: "50%", width: 40, height: 40, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>✕</button>
            <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
              <img src={lbImages[lbIdx]} alt={lbAuction.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              {lbImages.length > 1 && (
                <>
                  <button onClick={() => lbSetG(lbIdx - 1)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                  <button onClick={() => lbSetG(lbIdx + 1)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                </>
              )}
            </div>
            {lbImages.length > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 5, padding: "8px 0" }}>
                {lbImages.map((_, i) => (
                  <div key={i} onClick={() => lbSetG(i)} style={{ width: lbIdx === i ? 16 : 6, height: 6, borderRadius: 3, background: lbIdx === i ? T.gold : "rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }} />
                ))}
              </div>
            )}
            <div style={{ background: T.navyCard, padding: "14px 16px", overflowY: "auto", maxHeight: "35vh" }}>
              <h3 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 15, fontWeight: 800 }}>{lbAuction.title}</h3>
              <p style={{ margin: "0 0 10px", color: T.gold, fontWeight: 900, fontSize: 16 }}>{(lbAuction.current_price || lbAuction.starting_price || 0).toLocaleString("ar-IQ")} د.ع</p>
              {lbHasVehicle && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {lbAuction.vehicles.brand && lbAuction.vehicles.model && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>الموديل</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{lbAuction.vehicles.brand} {lbAuction.vehicles.model}</div></div>
                  )}
                  {lbAuction.vehicles.year && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>سنة الصنع</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{lbAuction.vehicles.year}</div></div>
                  )}
                  {lbAuction.vehicles.chassis_number && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>رقم الشاصي</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 11 }}>{lbAuction.vehicles.chassis_number}</div></div>
                  )}
                  {lbAuction.vehicles.import_origin && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>أصل الاستيراد</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{lbAuction.vehicles.import_origin === "american" ? "وارد أمريكي" : "وارد خليجي"}</div></div>
                  )}
                  {lbAuction.vehicles.mileage_km != null && (
                    <div><div style={{ color: T.textMuted, fontSize: 10, marginBottom: 2 }}>المسافة المقطوعة</div><div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 12 }}>{Number(lbAuction.vehicles.mileage_km).toLocaleString("ar-IQ")} كم</div></div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      <Modal isOpen={showCreateModal} onClose={() => { if (!creating) { auctionImagePreviews.forEach(u => URL.revokeObjectURL(u)); setAuctionImagePreviews([]); setAuctionImageFiles([]); setShowCreateModal(false); } }} title="إنشاء مزاد جديد 🏷️">
        {createSuccess ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: T.green, fontWeight: 700, fontSize: 16 }}>تم إنشاء المزاد بنجاح!</p>
          </div>
        ) : (
          <>
            <Input label="عنوان المزاد *" value={createForm.title} onChange={v => setCreateForm(f => ({ ...f, title: v }))} placeholder="مثال: تويوتا كامري 2020 للبيع بالمزاد" />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الفئة *</label>
              <select value={createForm.category_id} onChange={e => setCreateForm(f => ({ ...f, category_id: e.target.value, vehicle_id: "" }))} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box", appearance: "none" }}>
                <option value="">-- اختر الفئة --</option>
                {auctionCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {String(createForm.category_id) === "8" ? (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>المركبة *</label>
                {sellerVehicles.length === 0 ? (
                  <div style={{ background: `${T.gold}11`, border: `1px solid ${T.gold}44`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ margin: "0 0 10px", color: T.textSecondary, fontSize: 13 }}>لا توجد مركبات مسجلة. أضف مركبتك أولاً من شاشة مركبتي.</p>
                    <Btn size="sm" variant="secondary" onClick={() => { setShowCreateModal(false); if (typeof onNavigate === "function") onNavigate("garage"); }}>انتقل إلى مركبتي</Btn>
                  </div>
                ) : (
                  <select value={createForm.vehicle_id} onChange={e => setCreateForm(f => ({ ...f, vehicle_id: e.target.value }))} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box", appearance: "none" }}>
                    <option value="">-- اختر المركبة --</option>
                    {sellerVehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model}{v.year ? ` (${v.year})` : ""}{v.plate_number ? ` — ${v.plate_number}` : ""}</option>)}
                  </select>
                )}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6 }}>الوصف</label>
                  <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="تفاصيل إضافية عن المنتج..." rows={3} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6 }}>صور المزاد</label>
                  <input type="file" accept="image/*" multiple onChange={e => {
                    const files = Array.from(e.target.files);
                    setAuctionImageFiles(prev => [...prev, ...files]);
                    files.forEach(file => setAuctionImagePreviews(prev => [...prev, URL.createObjectURL(file)]));
                    e.target.value = "";
                  }} style={{ display: "none" }} id="auction-img-input" />
                  <label htmlFor="auction-img-input" style={{ display: "inline-block", background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: "10px 18px", color: T.textSecondary, fontSize: 13, cursor: "pointer" }}>+ إضافة صور</label>
                  {auctionImagePreviews.length > 0 && (
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {auctionImagePreviews.map((url, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img src={url} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
                          <button onClick={() => { URL.revokeObjectURL(url); setAuctionImagePreviews(p => p.filter((_, j) => j !== i)); setAuctionImageFiles(p => p.filter((_, j) => j !== i)); }} style={{ position: "absolute", top: -6, right: -6, background: T.red, color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="السعر الابتدائي (د.ع) *" value={createForm.starting_price} onChange={v => setCreateForm(f => ({ ...f, starting_price: v.replace(/[^0-9]/g, "") }))} placeholder="0" type="number" />
              <Input label="أدنى زيادة (د.ع)" value={createForm.min_increment} onChange={v => setCreateForm(f => ({ ...f, min_increment: v.replace(/[^0-9]/g, "") }))} placeholder="0" type="number" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6 }}>تاريخ ووقت البداية *</label>
              <input type="datetime-local" value={createForm.starts_at} onChange={e => setCreateForm(f => ({ ...f, starts_at: e.target.value }))} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6 }}>تاريخ ووقت النهاية *</label>
              <input type="datetime-local" value={createForm.ends_at} onChange={e => setCreateForm(f => ({ ...f, ends_at: e.target.value }))} style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            {createError && <p style={{ color: T.red, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{createError}</p>}
            <div style={{ background: `${T.gold}11`, border: `1px solid ${T.gold}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
              <p style={{ margin: 0, color: T.textSecondary, fontSize: 12, lineHeight: 1.6 }}>تنبيه: لا يمكن حذف المزاد بعد استلام أي مزايدة عليه، حمايةً لحقوق المزايدين. تأكد من جميع التفاصيل قبل النشر.</p>
            </div>
            <Btn fullWidth onClick={handleCreateAuction} disabled={creating || (String(createForm.category_id) === "8" && sellerVehicles.length === 0)}>{creating ? "جارٍ الإنشاء..." : "إنشاء المزاد"}</Btn>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AuctionsScreen;
