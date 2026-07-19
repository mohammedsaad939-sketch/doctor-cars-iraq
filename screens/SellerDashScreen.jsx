import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, toWhatsAppNumber } from "../utils/theme";
import { getCategories } from "../utils/hooks";
import { isImageUrl, Badge, Btn, Card, Input, Modal, Tabs } from "../utils/components";

const SellerAnalyticsTab = ({ sellerId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;
    (async () => {
      const [{ data: viewsData }, { data: topProds }, { count: totalOrders }] = await Promise.all([
        supabase.from("seller_product_analytics").select("*").eq("seller_id", sellerId).limit(10),
        supabase.from("products").select("id,name,stock,price").eq("seller_id", sellerId).eq("status", "active").order("price", { ascending: false }).limit(5),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", sellerId),
      ]);
      setAnalytics({ views: viewsData || [], topProds: topProds || [], totalOrders: totalOrders || 0 });
      setLoading(false);
    })();
  }, [sellerId]);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>;

  return (
    <div>
      <Card style={{ marginBottom: 14, background: `${T.blue}11`, border: `1px solid ${T.blue}33` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ color: T.textMuted, fontSize: 12 }}>إجمالي الطلبات</div><div style={{ color: T.blue, fontWeight: 900, fontSize: 24 }}>{analytics.totalOrders}</div></div>
          <span style={{ fontSize: 32 }}>📦</span>
        </div>
      </Card>
      {analytics.views.length > 0 && (
        <Card style={{ marginBottom: 14 }}>
          <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>📊 إحصائيات المنتجات</h4>
          {analytics.views.map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < analytics.views.length - 1 ? `1px solid ${T.navyBorder}` : "none" }}>
              <span style={{ color: T.textPrimary, fontSize: 13 }}>{row.product_name || row.product_id}</span>
              <span style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>{row.view_count || row.views || 0} مشاهدة</span>
            </div>
          ))}
        </Card>
      )}
      {analytics.topProds.length > 0 && (
        <Card>
          <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>🏆 أعلى منتجاتك سعراً</h4>
          {analytics.topProds.map((p, i) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < analytics.topProds.length - 1 ? `1px solid ${T.navyBorder}` : "none" }}>
              <span style={{ color: T.textPrimary, fontSize: 13 }}>{p.name}</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>{p.price?.toLocaleString("ar-IQ")} د.ع</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>مخزون: {p.stock}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

const SellerDashScreen = ({ session, profile }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sellerId, setSellerId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "", price: "", old_price: "", category_id: "",
    stock: "1", condition: "new", city: "",
    brand: "", model: "", year: "", mileage: "", transmission: "", fuel_type: "",
    discount_percent: "0", discount_ends_at: "",
  });
  const [saving, setSaving] = useState(false);
  const [savingStage, setSavingStage] = useState("");
  const [saveError, setSaveError] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState("");
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerOrdersLoading, setSellerOrdersLoading] = useState(false);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState({});
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerStats, setSellerStats] = useState({ pendingCount: 0, todayCount: 0, revenue: 0, rating: null });
  const [sellerAuctions, setSellerAuctions] = useState([]);
  const [sellerAuctionsLoading, setSellerAuctionsLoading] = useState(false);
  const [deleteAuctionSuccess, setDeleteAuctionSuccess] = useState("");
  const [deleteAuctionError, setDeleteAuctionError] = useState("");
  const [editingAuction, setEditingAuction] = useState(null);
  const [editAuctionForm, setEditAuctionForm] = useState({ title: "", description: "", starting_price: "", min_increment: "", ends_at: "", category_id: "", vehicle_id: "" });
  const [editAuctionCategories, setEditAuctionCategories] = useState([]);
  const [editAuctionVehicles, setEditAuctionVehicles] = useState([]);
  const [editAuctionNewFiles, setEditAuctionNewFiles] = useState([]);
  const [editAuctionNewPreviews, setEditAuctionNewPreviews] = useState([]);
  const [editAuctionSaving, setEditAuctionSaving] = useState(false);
  const [editAuctionError, setEditAuctionError] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const user = session?.user;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rows } = await supabase.from("sellers").select("id, store_name, verified, rating, seller_type, specialty, is_verified, plan, max_products, response_rate").eq("owner_id", user.id);
      const data = rows?.[0] || null;
      if (data) {
        setSellerId(data.id);
        setSellerInfo(data);
        loadProducts(data.id);
        const today = new Date().toISOString().split("T")[0];
        const [{ count: pendingCount }, { count: todayCount }, { data: revenueRows }] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", data.id).eq("status", "pending"),
          supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", data.id).gte("created_at", today),
          supabase.from("orders").select("total_amount").eq("seller_id", data.id),
        ]);
        const revenue = (revenueRows || []).reduce((s, r) => s + (r.total_amount || 0), 0);
        setSellerStats({ pendingCount: pendingCount || 0, todayCount: todayCount || 0, revenue, rating: data.rating });
      }
    })();
    getCategories(supabase).then(data => setCategories(data));
  }, [user?.id]);

  useEffect(() => {
    if (!sellerInfo?.id) return;
    const dayNames = ["أحد", "اثن", "ثلث", "أربع", "خمس", "جمعة", "سبت"];
    supabase.from("seller_weekly_revenue").select("*").eq("seller_id", sellerInfo.id).then(({ data }) => {
      const today = new Date();
      const result = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const row = (data || []).find(r => r.day_date === dateStr || r.sale_date === dateStr || r.order_date === dateStr);
        return { day: dayNames[d.getDay()], amount: Number(row?.total_revenue || row?.revenue || 0) };
      });
      const maxAmt = Math.max(...result.map(r => r.amount), 1);
      const isEmpty = result.every(r => r.amount === 0);
      setWeeklyChartData(result.map((r, i) => ({
        ...r,
        heightPct: isEmpty ? 4 : Math.max(4, Math.round((r.amount / maxAmt) * 100)),
        isToday: i === 6,
        isEmpty,
      })));
    });
    supabase.from("products").select("id,name,stock").eq("seller_id", sellerInfo.id).eq("status", "active").lte("stock", 5).order("stock", { ascending: true }).limit(5).then(({ data }) => {
      setLowStockProducts(data || []);
    });
  }, [sellerInfo?.id]);

  useEffect(() => {
    if (activeTab !== "reports" || !sellerInfo?.id || reportData) return;
    setReportLoading(true);
    Promise.all([
      supabase.from("orders").select("total_amount").eq("seller_id", sellerInfo.id),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", sellerInfo.id),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_id", sellerInfo.id).eq("status", "delivered"),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("seller_id", sellerInfo.id).eq("status", "active"),
      supabase.from("seller_top_products").select("*").eq("seller_id", sellerInfo.id).limit(5),
    ]).then(([{ data: revRows }, { count: orderCount }, { count: deliveredCount }, { count: activeCount }, { data: topProducts }]) => {
      const totalRevenue = (revRows || []).reduce((s, r) => s + (r.total_amount || 0), 0);
      setReportData({ totalRevenue, orderCount: orderCount || 0, deliveredCount: deliveredCount || 0, activeCount: activeCount || 0, topProducts: topProducts || [] });
      setReportLoading(false);
    });
  }, [activeTab, sellerInfo?.id]);

  const loadProducts = async (sid) => {
    setProductsLoading(true);
    const { data } = await supabase.from("products").select("*").eq("seller_id", sid).order("created_at", { ascending: false });
    setProducts(data || []);
    setProductsLoading(false);
  };

  const loadSellerOrders = async (sid) => {
    setSellerOrdersLoading(true);
    const { data } = await supabase.from("orders").select("*, order_items(*)").eq("seller_id", sid).order("created_at", { ascending: false });
    setSellerOrders(data || []);
    setSellerOrdersLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setOrderStatusUpdating(p => ({ ...p, [orderId]: true }));
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    setOrderStatusUpdating(p => ({ ...p, [orderId]: false }));
  };

  const loadSellerAuctions = async (sid) => {
    setSellerAuctionsLoading(true);
    const { data } = await supabase.from("auctions").select("*, categories(name)").eq("seller_id", sid).order("created_at", { ascending: false });
    setSellerAuctions(data || []);
    setSellerAuctionsLoading(false);
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المزاد؟")) return;
    const { data: deleted, error } = await supabase.from("auctions").delete().eq("id", auctionId).select("id");
    if (error) {
      setDeleteAuctionError(`فشل الحذف: ${error.message}`);
      setTimeout(() => setDeleteAuctionError(""), 4000);
      return;
    }
    if (!deleted || deleted.length === 0) {
      setDeleteAuctionError("لا يمكن حذف هذا المزاد لوجود مزايدات فعلية عليه — هذا لحماية المزايدين");
      setTimeout(() => setDeleteAuctionError(""), 5000);
      return;
    }
    setSellerAuctions(prev => prev.filter(a => a.id !== auctionId));
    setDeleteAuctionSuccess("تم حذف المزاد بنجاح");
    setTimeout(() => setDeleteAuctionSuccess(""), 3000);
  };

  const handleOpenEditAuction = async (auction) => {
    setEditingAuction(auction);
    setEditAuctionForm({
      title: auction.title || "",
      description: auction.description || "",
      starting_price: String(auction.starting_price || ""),
      min_increment: String(auction.min_increment || ""),
      ends_at: auction.ends_at ? auction.ends_at.slice(0, 16) : "",
      category_id: auction.category_id ? String(auction.category_id) : "",
      vehicle_id: auction.vehicle_id || "",
    });
    setEditAuctionError(null);
    setEditAuctionNewFiles([]);
    editAuctionNewPreviews.forEach(u => URL.revokeObjectURL(u));
    setEditAuctionNewPreviews([]);
    const [allCats, { data: veh }] = await Promise.all([
      getCategories(supabase),
      supabase.from("vehicles").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
    ]);
    setEditAuctionCategories(allCats.filter(c => c.id !== 11));
    setEditAuctionVehicles(veh || []);
  };

  const handleSaveAuction = async () => {
    if (!editAuctionForm.title.trim()) { setEditAuctionError("عنوان المزاد مطلوب"); return; }
    if (!editAuctionForm.ends_at) { setEditAuctionError("تاريخ النهاية مطلوب"); return; }
    setEditAuctionSaving(true);
    setEditAuctionError(null);
    const isCars = String(editAuctionForm.category_id) === "8";
    let images = editingAuction.images || [];
    if (editAuctionNewFiles.length > 0) {
      for (let i = 0; i < editAuctionNewFiles.length; i++) {
        const file = editAuctionNewFiles[i];
        const path = `auctions/${Date.now()}_${i}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
        if (upErr) { setEditAuctionError(`فشل رفع الصورة: ${upErr.message}`); setEditAuctionSaving(false); return; }
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        images = [...images, urlData.publicUrl];
      }
    }
    const { error } = await supabase.from("auctions").update({
      title: editAuctionForm.title.trim(),
      description: isCars ? null : (editAuctionForm.description.trim() || null),
      starting_price: Number(editAuctionForm.starting_price),
      min_increment: editAuctionForm.min_increment ? Number(editAuctionForm.min_increment) : 0,
      ends_at: editAuctionForm.ends_at,
      category_id: Number(editAuctionForm.category_id),
      vehicle_id: isCars ? (editAuctionForm.vehicle_id || null) : null,
      images,
    }).eq("id", editingAuction.id);
    setEditAuctionSaving(false);
    if (error) { setEditAuctionError(error.message); return; }
    setEditingAuction(null);
    editAuctionNewPreviews.forEach(u => URL.revokeObjectURL(u));
    setEditAuctionNewPreviews([]);
    setEditAuctionNewFiles([]);
    setDeleteAuctionSuccess("تم تحديث المزاد بنجاح");
    setTimeout(() => setDeleteAuctionSuccess(""), 3000);
    loadSellerAuctions(sellerId);
  };

  useEffect(() => {
    if (activeTab === "orders" && sellerId) loadSellerOrders(sellerId);
    if (activeTab === "auctions" && sellerId) loadSellerAuctions(sellerId);
  }, [activeTab, sellerId]);

  const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
  const isCarCategory = selectedCat?.name?.includes("سيارات");

  const resetForm = () => {
    setForm({
      name: "", price: "", old_price: "", category_id: "",
      stock: "1", condition: "new", city: "",
      brand: "", model: "", year: "", mileage: "", transmission: "", fuel_type: "",
      discount_percent: "0", discount_ends_at: "",
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name || "",
      price: p.price ? String(p.price) : "",
      old_price: p.old_price ? String(p.old_price) : "",
      category_id: p.category_id ? String(p.category_id) : "",
      stock: p.stock ? String(p.stock) : "1",
      condition: p.condition || "new",
      city: p.city || "",
      brand: p.brand || "",
      model: p.model || "",
      year: p.year ? String(p.year) : "",
      mileage: p.mileage ? String(p.mileage) : "",
      transmission: p.transmission || "",
      fuel_type: p.fuel_type || "",
      discount_percent: p.discount_percent ? String(p.discount_percent) : "0",
      discount_ends_at: p.discount_ends_at ? p.discount_ends_at.slice(0, 16) : "",
    });
    setImageFile(null);
    setImagePreview(isImageUrl(p.images?.[0]) ? p.images[0] : null);
    setSaveError(null);
    setSaveSuccessMsg("");
    setShowAddModal(true);
  };

  const compressImage = (file) => new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1000;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.78);
    };
    img.src = url;
  });

  const handleDelete = async (productId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) { alert(`فشل الحذف: ${error.message}`); return; }
    setDeleteSuccessMsg("تم حذف المنتج بنجاح");
    loadProducts(sellerId);
    setTimeout(() => setDeleteSuccessMsg(""), 3000);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.category_id) {
      setSaveError("يرجى ملء الحقول المطلوبة: الاسم والسعر والقسم");
      return;
    }
    setSaveError(null);
    setSaving(true);

    const { data: sellerData, error: sellerErr } = await supabase.from("sellers").select("id").eq("owner_id", user.id).single();
    if (sellerErr || !sellerData) {
      setSaveError("لا يوجد متجر مرتبط بحسابك");
      setSaving(false);
      return;
    }

    let images = editProduct ? (editProduct.images || []) : [];
    if (imageFile) {
      setSavingStage("uploading");
      const compressed = await compressImage(imageFile);
      const path = `${sellerData.id}/${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(path, compressed, { contentType: "image/jpeg" });
      if (uploadErr) {
        setSaveError(`فشل رفع الصورة: ${uploadErr.message}`);
        setSaving(false);
        setSavingStage("");
        return;
      }
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      images = [urlData.publicUrl];
    }

    setSavingStage("saving");
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      category_id: form.category_id,
      stock: Number(form.stock) || 1,
      condition: form.condition,
      city: form.city.trim() || null,
      images,
      discount_percent: Number(form.discount_percent) || 0,
      discount_ends_at: form.discount_ends_at ? form.discount_ends_at : null,
    };
    if (isCarCategory) {
      payload.brand = form.brand.trim() || null;
      payload.model = form.model.trim() || null;
      payload.year = form.year ? Number(form.year) : null;
      payload.mileage = form.mileage ? Number(form.mileage) : null;
      payload.transmission = form.transmission || null;
      payload.fuel_type = form.fuel_type || null;
    }

    let opError;
    if (editProduct) {
      const { error } = await supabase.from("products").update(payload).eq("id", editProduct.id);
      opError = error;
    } else {
      const { error } = await supabase.from("products").insert({ ...payload, seller_id: sellerData.id, status: "active" });
      opError = error;
    }
    setSaving(false);
    setSavingStage("");
    if (opError) { setSaveError(opError.message); return; }
    const msg = editProduct ? "تم تحديث المنتج بنجاح" : "تمت إضافة المنتج بنجاح";
    setShowAddModal(false);
    setEditProduct(null);
    resetForm();
    setSaveSuccessMsg(msg);
    loadProducts(sellerData.id);
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const selectStyle = {
    width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`,
    borderRadius: 10, padding: "11px 14px", color: T.textPrimary,
    fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    appearance: "none", cursor: "pointer",
  };

  const stats = [
    { label: "مبيعات اليوم", value: sellerStats.todayCount.toLocaleString("ar-IQ"), icon: "📦" },
    { label: "الإيرادات", value: sellerStats.revenue.toLocaleString("ar-IQ"), icon: "💰" },
    { label: "طلبات جديدة", value: sellerStats.pendingCount.toLocaleString("ar-IQ"), icon: "🔔", urgent: true },
    { label: "التقييم", value: sellerStats.rating != null ? sellerStats.rating.toFixed(1) : "—", icon: "⭐" },
  ];

  const orderStatusOptions = [
    { value: "pending", label: "قيد الانتظار", color: T.orange },
    { value: "confirmed", label: "تم التأكيد", color: T.blue },
    { value: "shipped", label: "تم الشحن", color: T.gold },
    { value: "delivered", label: "تم التسليم", color: T.green },
    { value: "cancelled", label: "ملغي", color: T.red },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>لوحة البائع 🏪</h2>
          <p style={{ margin: 0, color: T.textSecondary, fontSize: 12 }}>{sellerInfo?.store_name || "..."}</p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {(sellerInfo?.is_verified || sellerInfo?.verified) ? <Badge color={T.green}>✓ موثق</Badge> : <Badge color={T.orange}>غير موثق</Badge>}
          {sellerInfo?.plan && <Badge color={sellerInfo.plan === "premium" ? T.gold : sellerInfo.plan === "pro" ? T.blue : T.textMuted}>{sellerInfo.plan}</Badge>}
        </div>
      </div>
      {!(sellerInfo?.is_verified || sellerInfo?.verified) && sellerInfo && (
        <Card style={{ marginBottom: 16, background: `${T.orange}11`, border: `1px solid ${T.orange}44` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 24 }}>🔖</span>
            <div>
              <div style={{ color: T.orange, fontWeight: 700, fontSize: 13 }}>متجرك غير موثق بعد</div>
              <div style={{ color: T.textMuted, fontSize: 12 }}>تواصل مع الإدارة عبر الدعم لتوثيق متجرك والحصول على شارة التحقق</div>
            </div>
          </div>
        </Card>
      )}
      {sellerInfo?.max_products && (
        <Card style={{ marginBottom: 16, background: `${T.blue}11`, border: `1px solid ${T.blue}33` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: T.textSecondary, fontSize: 12 }}>المنتجات المستخدمة</div>
              <div style={{ color: products.length >= sellerInfo.max_products ? T.red : T.blue, fontWeight: 800, fontSize: 16 }}>{products.length} / {sellerInfo.max_products}</div>
            </div>
            {products.length >= sellerInfo.max_products && (
              <button onClick={() => { const n = toWhatsAppNumber("07700000000"); if (n) window.open(`https://wa.me/${n}?text=${encodeURIComponent("أريد ترقية اشتراكي في دكتور السيارات")}`, "_blank", "noopener,noreferrer"); }} style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldDark})`, border: "none", borderRadius: 10, padding: "8px 14px", color: T.navy, fontFamily: "inherit", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>ترقية الخطة ⬆️</button>
            )}
          </div>
        </Card>
      )}

      {saveSuccessMsg && (
        <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>
          ✓ {saveSuccessMsg}
        </div>
      )}

      {deleteSuccessMsg && (
        <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13, fontWeight: 700 }}>
          🗑️ {deleteSuccessMsg}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {stats.map(stat => (
          <Card key={stat.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: "0 0 6px", color: T.textMuted, fontSize: 12 }}>{stat.label}</p>
                <p style={{ margin: 0, color: stat.urgent ? T.red : T.gold, fontWeight: 900, fontSize: 22 }}>{stat.value}</p>
              </div>
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "overview", label: "نظرة عامة" },
          { id: "orders", label: "الطلبات" },
          { id: "products", label: "المنتجات" },
          ...(sellerInfo?.seller_type === "wholesale" || profile?.role === "trader" ? [{ id: "warehouse", label: "مستودعي" }] : []),
          { id: "auctions", label: "مزاداتي" },
          { id: "analytics", label: "إحصائيات" },
          { id: "reports", label: "التقارير" },
        ]}
        active={activeTab} onChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <div>
          {/* Revenue Chart */}
          <Card style={{ marginBottom: 16 }}>
            <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>📈 الإيرادات الأسبوعية</h4>
            {weeklyChartData.length === 0 ? (
              <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                  {weeklyChartData.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: `${d.heightPct}%`, background: d.isToday ? `linear-gradient(180deg, ${T.gold}, ${T.goldDark})` : `${T.gold}44`, borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                      <span style={{ color: T.textMuted, fontSize: 9 }}>{d.day}</span>
                    </div>
                  ))}
                </div>
                {weeklyChartData[0]?.isEmpty && <p style={{ textAlign: "center", color: T.textMuted, fontSize: 12, margin: "8px 0 0" }}>لا توجد مبيعات هذا الأسبوع بعد</p>}
              </>
            )}
          </Card>

          {/* Inventory Alerts */}
          <Card>
            <h4 style={{ margin: "0 0 12px", color: T.textPrimary, fontSize: 14 }}>⚠️ تحذيرات المخزون</h4>
            {lowStockProducts.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                <span style={{ fontSize: 18 }}>✅</span>
                <span style={{ color: T.green, fontSize: 13 }}>جميع المنتجات متوفرة بكميات كافية</span>
              </div>
            ) : lowStockProducts.map((item, i) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < lowStockProducts.length - 1 ? `1px solid ${T.navyBorder}` : "none" }}>
                <span style={{ color: T.textSecondary, fontSize: 13 }}>{item.name}</span>
                <span style={{ color: item.stock === 0 ? T.red : T.orange, fontWeight: 700 }}>{item.stock === 0 ? "نفد" : `${item.stock} قطعة`}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sellerOrdersLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
          ) : sellerOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p style={{ color: T.textMuted, margin: 0 }}>لا توجد طلبات بعد</p>
            </div>
          ) : sellerOrders.map(order => {
            const statusInfo = orderStatusOptions.find(s => s.value === order.status) || { label: order.status, color: T.textMuted };
            const itemNames = order.order_items?.map(i => i.product_name).join("، ") || "—";
            const date = new Date(order.created_at).toLocaleDateString("ar-IQ");
            return (
              <Card key={order.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>{date}</span>
                  <Badge small color={statusInfo.color}>{statusInfo.label}</Badge>
                </div>
                <p style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 14, fontWeight: 700 }}>{itemNames}</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ color: T.textMuted, fontSize: 12 }}>الكمية: {order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0}</span>
                  <span style={{ color: T.gold, fontWeight: 800 }}>{order.total_amount?.toLocaleString("ar-IQ")} د.ع</span>
                </div>
                <div style={{ background: T.navyLight, borderRadius: 10, padding: "10px 12px", marginBottom: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                  {order.buyer_name && <span style={{ color: T.textSecondary, fontSize: 12 }}>👤 {order.buyer_name}</span>}
                  <span style={{ color: T.textSecondary, fontSize: 12 }}>📱 {order.buyer_phone}</span>
                  <span style={{ color: T.textSecondary, fontSize: 12 }}>📍 {order.buyer_address}{order.city ? ` — ${order.city}` : ""}</span>
                  {order.notes && <span style={{ color: T.textMuted, fontSize: 11 }}>📝 {order.notes}</span>}
                </div>
                <select
                  value={order.status}
                  disabled={!!orderStatusUpdating[order.id]}
                  onChange={e => handleUpdateStatus(order.id, e.target.value)}
                  style={{ width: "100%", background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 8, padding: "8px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, cursor: "pointer", outline: "none" }}
                >
                  {orderStatusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "products" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: T.textSecondary, fontSize: 13 }}>{products.length} منتج</span>
            <Btn size="sm" icon="+" variant="primary" onClick={() => { setSaveError(null); setSaveSuccessMsg(""); resetForm(); setShowAddModal(true); }}>منتج جديد</Btn>
          </div>
          {productsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textSecondary, fontSize: 13 }}>جارٍ التحميل...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
              <p style={{ color: T.textSecondary, fontSize: 14, margin: 0 }}>لا توجد منتجات بعد. أضف منتجك الأول!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {products.map(p => (
                <Card key={p.id}>
                  <div style={{ fontSize: 36, textAlign: "center", background: T.navyLight, borderRadius: 10, marginBottom: 8, overflow: "hidden", height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isImageUrl(p.images?.[0]) ? (
                      <img src={p.images[0]} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    ) : (p.images?.[0] || "📦")}
                  </div>
                  <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 12, fontWeight: 700 }}>{p.name}</p>
                  <p style={{ margin: "0 0 8px", color: T.gold, fontSize: 13, fontWeight: 800 }}>{Number(p.price).toLocaleString("ar-IQ")} د.ع</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Btn size="sm" variant="ghost" fullWidth onClick={() => handleEdit(p)}>تعديل</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(p.id)}>🗑️</Btn>
                    <Btn size="sm" variant={p.is_promoted ? "secondary" : "ghost"} fullWidth onClick={async () => {
                      await supabase.from("products").update({ is_promoted: !p.is_promoted }).eq("id", p.id);
                      setProducts(prev => prev.map(pp => pp.id === p.id ? { ...pp, is_promoted: !pp.is_promoted } : pp));
                    }}>{p.is_promoted ? "⭐ ممول" : "روّج"}</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "warehouse" && (
        <div>
          {sellerInfo?.specialty && (
            <Card style={{ marginBottom: 16, background: `${T.purple}11`, border: `1px solid ${T.purple}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>📦</span>
                <div>
                  <div style={{ color: T.textMuted, fontSize: 12, marginBottom: 2 }}>تخصص المستودع</div>
                  <div style={{ color: T.purple, fontWeight: 800, fontSize: 15 }}>{sellerInfo.specialty}</div>
                </div>
              </div>
            </Card>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ color: T.textSecondary, fontSize: 13 }}>{products.length} منتج في المستودع</span>
            <Btn size="sm" icon="+" variant="primary" onClick={() => { setSaveError(null); setSaveSuccessMsg(""); resetForm(); setShowAddModal(true); }}>أضف للمستودع</Btn>
          </div>
          {productsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textSecondary, fontSize: 13 }}>جارٍ التحميل...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏭</div>
              <p style={{ color: T.textSecondary, fontSize: 14, margin: 0 }}>المستودع فارغ. أضف بضاعتك الأولى!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {products.map(p => (
                <Card key={p.id}>
                  <div style={{ fontSize: 36, textAlign: "center", background: T.navyLight, borderRadius: 10, marginBottom: 8, overflow: "hidden", height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isImageUrl(p.images?.[0]) ? (
                      <img src={p.images[0]} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
                    ) : (p.images?.[0] || "📦")}
                  </div>
                  <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 12, fontWeight: 700 }}>{p.name}</p>
                  <p style={{ margin: "0 0 8px", color: T.gold, fontSize: 13, fontWeight: 800 }}>{Number(p.price).toLocaleString("ar-IQ")} د.ع</p>
                  <Badge small color={T.purple}>مستودع</Badge>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <Btn size="sm" variant="ghost" fullWidth onClick={() => handleEdit(p)}>تعديل</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDelete(p.id)}>🗑️</Btn>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "auctions" && (
        <div>
          {deleteAuctionSuccess && (
            <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>
              ✓ {deleteAuctionSuccess}
            </div>
          )}
          {deleteAuctionError && (
            <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13, fontWeight: 700 }}>
              ⚠️ {deleteAuctionError}
            </div>
          )}
          {sellerAuctionsLoading ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
          ) : sellerAuctions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🏷️</div>
              <p style={{ color: T.textMuted, margin: 0 }}>لا توجد مزادات بعد</p>
            </div>
          ) : sellerAuctions.map(auction => {
            const firstImg = isImageUrl((auction.images || [])[0]) ? auction.images[0] : null;
            const statusLabel = auction.status === "live" ? "🔴 مباشر" : auction.status === "upcoming" ? "⏳ قادم" : "✅ منتهي";
            const statusColor = auction.status === "live" ? T.red : auction.status === "upcoming" ? T.gold : T.textMuted;
            return (
              <Card key={auction.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: T.navyLight, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    {firstImg ? <img src={firstImg} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🚗"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ color: statusColor, fontWeight: 700, fontSize: 11 }}>{statusLabel}</span>
                      {auction.categories?.name && <span style={{ color: T.textMuted, fontSize: 11 }}>{auction.categories.name}</span>}
                    </div>
                    <p style={{ margin: "0 0 4px", color: T.textPrimary, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{auction.title}</p>
                    <p style={{ margin: 0, color: T.gold, fontWeight: 800, fontSize: 13 }}>{(auction.current_price || auction.starting_price || 0).toLocaleString("ar-IQ")} د.ع</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn size="sm" variant="secondary" onClick={() => handleOpenEditAuction(auction)}>✏️</Btn>
                    <Btn size="sm" variant="danger" onClick={() => handleDeleteAuction(auction.id)}>🗑️</Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "analytics" && (
        <SellerAnalyticsTab sellerId={sellerId} />
      )}

      {activeTab === "reports" && (
        <div>
          {reportLoading || !reportData ? (
            <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div>
          ) : (
            <>
              {[
                ["إجمالي الإيرادات", `${reportData.totalRevenue.toLocaleString("ar-IQ")} د.ع`],
                ["إجمالي الطلبات", `${reportData.orderCount.toLocaleString("ar-IQ")} طلب`],
                ["الطلبات المُسلَّمة", `${reportData.deliveredCount.toLocaleString("ar-IQ")} طلب`],
                ["المنتجات النشطة", `${reportData.activeCount.toLocaleString("ar-IQ")} منتج`],
              ].map(([label, value]) => (
                <Card key={label} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: T.textSecondary, fontSize: 13 }}>{label}</span>
                  <span style={{ color: T.gold, fontWeight: 800, fontSize: 15 }}>{value}</span>
                </Card>
              ))}
              {reportData.topProducts.length > 0 && (
                <Card style={{ marginBottom: 10 }}>
                  <h4 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 14 }}>🏆 أفضل المنتجات</h4>
                  {reportData.topProducts.map((p, i) => (
                    <div key={p.product_id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < reportData.topProducts.length - 1 ? `1px solid ${T.navyBorder}` : "none" }}>
                      <span style={{ color: T.textSecondary, fontSize: 13 }}>{p.product_name || p.name}</span>
                      <span style={{ color: T.gold, fontWeight: 700, fontSize: 13 }}>{(p.total_revenue || p.revenue || 0).toLocaleString("ar-IQ")} د.ع</span>
                    </div>
                  ))}
                </Card>
              )}
              <Btn fullWidth variant="secondary" icon="📊" disabled style={{ opacity: 0.5 }}>تصدير التقرير (قريباً)</Btn>
            </>
          )}
        </div>
      )}

      <Modal isOpen={!!editingAuction} onClose={() => { if (!editAuctionSaving) { setEditingAuction(null); editAuctionNewPreviews.forEach(u => URL.revokeObjectURL(u)); setEditAuctionNewPreviews([]); setEditAuctionNewFiles([]); } }} title="تعديل المزاد ✏️">
        <Input label="عنوان المزاد *" value={editAuctionForm.title} onChange={v => setEditAuctionForm(f => ({ ...f, title: v }))} placeholder="مثال: تويوتا كامري 2020 للبيع بالمزاد" />
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الفئة *</label>
          <select value={editAuctionForm.category_id} onChange={e => setEditAuctionForm(f => ({ ...f, category_id: e.target.value, vehicle_id: "" }))} style={selectStyle}>
            <option value="">-- اختر الفئة --</option>
            {editAuctionCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {String(editAuctionForm.category_id) === "8" ? (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>المركبة *</label>
            {editAuctionVehicles.length === 0 ? (
              <p style={{ color: T.textMuted, fontSize: 12, margin: 0 }}>لا توجد مركبات مسجلة في حسابك</p>
            ) : (
              <select value={editAuctionForm.vehicle_id} onChange={e => setEditAuctionForm(f => ({ ...f, vehicle_id: e.target.value }))} style={selectStyle}>
                <option value="">-- اختر مركبة --</option>
                {editAuctionVehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model}{v.year ? ` (${v.year})` : ""}{v.plate_number ? ` — ${v.plate_number}` : ""}</option>)}
              </select>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الوصف</label>
            <textarea value={editAuctionForm.description} onChange={e => setEditAuctionForm(f => ({ ...f, description: e.target.value }))} placeholder="تفاصيل إضافية..." rows={3} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="السعر الابتدائي (د.ع) *" value={editAuctionForm.starting_price} onChange={v => setEditAuctionForm(f => ({ ...f, starting_price: v.replace(/[^0-9]/g, "") }))} placeholder="0" type="number" />
          <Input label="أدنى زيادة (د.ع)" value={editAuctionForm.min_increment} onChange={v => setEditAuctionForm(f => ({ ...f, min_increment: v.replace(/[^0-9]/g, "") }))} placeholder="0" type="number" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>تاريخ الانتهاء *</label>
          <input type="datetime-local" value={editAuctionForm.ends_at} onChange={e => setEditAuctionForm(f => ({ ...f, ends_at: e.target.value }))} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        {String(editAuctionForm.category_id) !== "8" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>إضافة صور جديدة (تُضاف للصور الموجودة)</label>
            {editAuctionNewPreviews.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {editAuctionNewPreviews.map((url, i) => (
                  <img key={i} src={url} alt="" loading="lazy" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover" }} />
                ))}
              </div>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: 8, background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
              <span style={{ fontSize: 18 }}>📷</span>
              <span style={{ color: T.textSecondary, fontSize: 13 }}>{editAuctionNewFiles.length > 0 ? `${editAuctionNewFiles.length} صورة مختارة` : "اختر صوراً إضافية..."}</span>
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                editAuctionNewPreviews.forEach(u => URL.revokeObjectURL(u));
                setEditAuctionNewFiles(files);
                setEditAuctionNewPreviews(files.map(f => URL.createObjectURL(f)));
              }} />
            </label>
          </div>
        )}
        {editAuctionError && (
          <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13, fontWeight: 600 }}>
            ⚠️ {editAuctionError}
          </div>
        )}
        <Btn fullWidth onClick={handleSaveAuction} disabled={editAuctionSaving}>
          {editAuctionSaving ? "جارٍ الحفظ..." : "💾 حفظ التعديلات"}
        </Btn>
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditProduct(null); resetForm(); }} title={editProduct ? "تعديل المنتج" : "إضافة منتج جديد"}>
        <Input label="اسم المنتج *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="مثال: فلتر هواء تويوتا كامري" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="السعر * (د.ع)" type="number" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} placeholder="15000" />
          <Input label="السعر قبل الخصم (د.ع)" type="number" value={form.old_price} onChange={v => setForm(f => ({ ...f, old_price: v }))} placeholder="20000" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>القسم *</label>
          <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={selectStyle}>
            <option value="">-- اختر القسم --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="الكمية المتوفرة" type="number" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} placeholder="1" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>الحالة</label>
            <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} style={selectStyle}>
              <option value="new">جديد</option>
              <option value="used">مستخدم</option>
            </select>
          </div>
        </div>
        <Input label="المدينة" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="بغداد" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Input label="نسبة الخصم %" type="number" value={form.discount_percent} onChange={v => setForm(f => ({ ...f, discount_percent: v }))} placeholder="0" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>انتهاء الخصم (اختياري)</label>
            <input type="datetime-local" value={form.discount_ends_at} onChange={e => setForm(f => ({ ...f, discount_ends_at: e.target.value }))} style={{ width: "100%", background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 12px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        {isCarCategory && (
          <>
            <div style={{ borderTop: `1px solid ${T.navyBorder}`, margin: "4px 0 14px", paddingTop: 14 }}>
              <p style={{ margin: "0 0 12px", color: T.gold, fontSize: 13, fontWeight: 700 }}>🚗 تفاصيل السيارة</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="الماركة" value={form.brand} onChange={v => setForm(f => ({ ...f, brand: v }))} placeholder="Toyota" />
              <Input label="الموديل" value={form.model} onChange={v => setForm(f => ({ ...f, model: v }))} placeholder="Camry" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="السنة" type="number" value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} placeholder="2022" />
              <Input label="الممشى (كم)" type="number" value={form.mileage} onChange={v => setForm(f => ({ ...f, mileage: v }))} placeholder="50000" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>نوع القير</label>
                <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))} style={selectStyle}>
                  <option value="">-- اختر --</option>
                  <option value="automatic">أوتوماتيك</option>
                  <option value="manual">يدوي</option>
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>نوع الوقود</label>
                <select value={form.fuel_type} onChange={e => setForm(f => ({ ...f, fuel_type: e.target.value }))} style={selectStyle}>
                  <option value="">-- اختر --</option>
                  <option value="petrol">بنزين</option>
                  <option value="diesel">ديزل</option>
                  <option value="hybrid">هايبرد</option>
                  <option value="electric">كهربائي</option>
                </select>
              </div>
            </div>
          </>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", color: T.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: 600 }}>صورة المنتج (اختياري)</label>
          {imagePreview && (
            <div style={{ marginBottom: 8, borderRadius: 10, overflow: "hidden" }}>
              <img src={imagePreview} alt="معاينة" loading="lazy" style={{ width: "100%", height: 140, objectFit: "cover" }} />
            </div>
          )}
          <label style={{ display: "flex", alignItems: "center", gap: 8, background: T.navyLight, border: `1px dashed ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>📷</span>
            <span style={{ color: T.textSecondary, fontSize: 13 }}>{imageFile ? imageFile.name : "اختر صورة من جهازك..."}</span>
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImageFile(file);
              setImagePreview(URL.createObjectURL(file));
            }} />
          </label>
        </div>

        {saveError && (
          <div style={{ background: `${T.red}22`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.red, fontSize: 13 }}>
            ⚠️ {saveError}
          </div>
        )}
        <Btn fullWidth variant="primary" onClick={handleSave} disabled={saving}>
          {savingStage === "uploading" ? "⏳ جارٍ رفع الصورة..." : savingStage === "saving" ? "💾 جارٍ حفظ المنتج..." : "💾 حفظ المنتج"}
        </Btn>
      </Modal>
    </div>
  );
};

export default SellerDashScreen;
