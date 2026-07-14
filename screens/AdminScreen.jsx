import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T } from "../utils/theme";
import { Card, Badge, Btn, Tabs, Section, Input } from "../utils/components";

const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [adminUpdateMsg, setAdminUpdateMsg] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(null);
  const [openRequestsCount, setOpenRequestsCount] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [promotedProducts, setPromotedProducts] = useState([]);
  const [promotedLoading, setPromotedLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== "users" || users.length > 0) return;
    setUsersLoading(true);
    supabase.from("profiles").select("id, full_name, is_admin, created_at").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setUsers(data || []); setUsersLoading(false); });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "violations" || openRequestsCount !== null) return;
    supabase.from("part_requests").select("id", { count: "exact", head: true }).eq("status", "open")
      .then(({ count }) => setOpenRequestsCount(count || 0));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "verification" || pendingSellers.length > 0) return;
    setSellersLoading(true);
    supabase.from("sellers").select("id, store_name, seller_type, created_at, is_verified, verified").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setPendingSellers(data || []); setSellersLoading(false); });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "promotions" || promotedProducts.length > 0) return;
    setPromotedLoading(true);
    supabase.from("products").select("id, name, is_promoted, seller_id, sellers(store_name)").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setPromotedProducts(data || []); setPromotedLoading(false); });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "subscriptions" || subscriptions.length > 0) return;
    setSubscriptionsLoading(true);
    supabase.from("sellers").select("id, store_name, plan, max_products, seller_type").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => { setSubscriptions(data || []); setSubscriptionsLoading(false); });
  }, [activeTab]);

  const handleVerifySeller = async (sellerId, approve) => {
    await supabase.from("sellers").update({ is_verified: approve, verified: approve }).eq("id", sellerId);
    setPendingSellers(prev => prev.map(s => s.id === sellerId ? { ...s, is_verified: approve, verified: approve } : s));
    setVerifyMsg(approve ? "تم توثيق البائع ✓" : "تم رفض التوثيق");
    setTimeout(() => setVerifyMsg(""), 3000);
  };

  const handleTogglePromoted = async (productId, current) => {
    await supabase.from("products").update({ is_promoted: !current }).eq("id", productId);
    setPromotedProducts(prev => prev.map(p => p.id === productId ? { ...p, is_promoted: !current } : p));
  };

  const handleAdminToggle = async (userId, makeAdmin) => {
    setShowUserMenu(null);
    await supabase.from("profiles").update({ is_admin: makeAdmin }).eq("id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: makeAdmin } : u));
    setAdminUpdateMsg(makeAdmin ? "تم منح صلاحيات المشرف" : "تم إلغاء صلاحيات المشرف");
    setTimeout(() => setAdminUpdateMsg(""), 3000);
  };

  const filteredUsers = users.filter(u => !userSearch || (u.full_name || "").toLowerCase().includes(userSearch.toLowerCase()));

  const systemStats = [
    { label: "المستخدمون النشطون", value: "٨٤,٣٢١", icon: "👥", color: T.blue },
    { label: "البائعون الموثقون", value: "١,٢٤٠", icon: "🏪", color: T.green },
    { label: "المنتجات المنشورة", value: "٤٥,٦٠٠", icon: "📦", color: T.gold },
    { label: "المخالفات المكتشفة", value: "١٢", icon: "🚫", color: T.red },
  ];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>🛡️</span>
        <div>
          <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>لوحة الإدارة</h2>
          <p style={{ margin: 0, color: T.textMuted, fontSize: 11 }}>صلاحيات كاملة | آخر دخول: الآن</p>
        </div>
      </div>

      {/* System Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {systemStats.map(stat => (
          <Card key={stat.label} style={{ border: `1px solid ${stat.color}33` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ color: stat.color, fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ color: T.textMuted, fontSize: 11 }}>{stat.label}</div>
          </Card>
        ))}
      </div>

      <Tabs
        tabs={[{ id: "overview", label: "نظرة عامة" }, { id: "users", label: "المستخدمون" }, { id: "verification", label: "التوثيق" }, { id: "promotions", label: "المنشورات" }, { id: "subscriptions", label: "الاشتراكات" }, { id: "violations", label: "المخالفات" }, { id: "finance", label: "المالية" }]}
        active={activeTab} onChange={setActiveTab}
      />

      {activeTab === "overview" && (
        <div>
          {/* AI Monitoring */}
          <Card style={{ marginBottom: 16, background: `${T.purple}11`, border: `1px solid ${T.purple}33` }}>
            <h4 style={{ margin: "0 0 12px", color: T.purple, fontSize: 14 }}>🤖 مراقبة الذكاء الاصطناعي</h4>
            {[
              { agent: "وكيل مراقبة المحتوى", status: "نشط", checked: "٢,٣٤٠ إعلان", flagged: "١٢" },
              { agent: "وكيل كشف الاحتيال", status: "نشط", checked: "٨٤,٣٢١ معاملة", flagged: "٣" },
              { agent: "وكيل تحليل السوق", status: "نشط", checked: "تحديث كل ساعة", flagged: "—" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${T.navyBorder}` : "none" }}>
                <div>
                  <div style={{ color: T.textPrimary, fontWeight: 600, fontSize: 13 }}>{a.agent}</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{a.checked}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Badge small color={T.green}>{a.status}</Badge>
                  {a.flagged !== "—" && <div style={{ color: T.red, fontSize: 11, fontWeight: 700, marginTop: 2 }}>⚠️ {a.flagged}</div>}
                </div>
              </div>
            ))}
          </Card>

          {/* Recent Activity */}
          <Section title="النشاط الأخير">
            {[
              { action: "تسجيل بائع جديد", detail: "محل الفيصل للغيار - البصرة", time: "٥ دقائق", type: "new" },
              { action: "رفض إعلان مخالف", detail: "محتوى غير ذي صلة بالسيارات", time: "١٥ دقيقة", type: "violation" },
              { action: "اكتمال مزاد", detail: "تويوتا لاندكروزر - ٣٢,٠٠٠,٠٠٠ د.ع", time: "ساعة", type: "auction" },
              { action: "شكوى مستخدم", detail: "تأخر في التوصيل - طلب #١٠١٥", time: "٢ ساعة", type: "complaint" },
            ].map((act, i) => (
              <Card key={i} style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 20 }}>
                  {{ new: "🆕", violation: "🚫", auction: "🏆", complaint: "⚠️" }[act.type]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 13 }}>{act.action}</div>
                  <div style={{ color: T.textMuted, fontSize: 11 }}>{act.detail} | {act.time}</div>
                </div>
              </Card>
            ))}
          </Section>
        </div>
      )}

      {activeTab === "users" && (
        <div>
          {adminUpdateMsg && <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>✓ {adminUpdateMsg}</div>}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="ابحث عن مستخدم..." style={{ flex: 1, background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: "10px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
          </div>
          {usersLoading ? <div style={{ textAlign: "center", padding: 32, color: T.textMuted }}>جارٍ التحميل...</div> : filteredUsers.map(user => (
            <Card key={user.id} style={{ marginBottom: 10, position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
                  <div>
                    <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{user.full_name || "بدون اسم"}</div>
                    <div style={{ color: T.textMuted, fontSize: 11 }}>{user.id.slice(0, 8)}…</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {user.is_admin && <Badge small color={T.purple}>مشرف</Badge>}
                  <button onClick={() => setShowUserMenu(showUserMenu === user.id ? null : user.id)} style={{ background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 8, padding: "5px 10px", color: T.textSecondary, fontFamily: "inherit", fontSize: 11, cursor: "pointer" }}>⋯</button>
                </div>
              </div>
              {showUserMenu === user.id && (
                <div style={{ position: "absolute", top: 48, left: 0, background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 10, padding: 8, zIndex: 10, minWidth: 160, boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                  {!user.is_admin ? (
                    <button onClick={() => handleAdminToggle(user.id, true)} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.gold, fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "8px 12px", cursor: "pointer", textAlign: "right", borderRadius: 8 }}>⭐ جعله مشرفاً</button>
                  ) : (
                    <button onClick={() => handleAdminToggle(user.id, false)} style={{ display: "block", width: "100%", background: "none", border: "none", color: T.red, fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "8px 12px", cursor: "pointer", textAlign: "right", borderRadius: 8 }}>✕ إزالة الصلاحيات</button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === "verification" && (
        <div>
          {verifyMsg && <div style={{ background: `${T.green}22`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, color: T.green, fontSize: 13, fontWeight: 700 }}>{verifyMsg}</div>}
          {sellersLoading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingSellers.map(s => (
                <Card key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{s.store_name}</div>
                      <div style={{ color: T.textMuted, fontSize: 11 }}>{s.seller_type} · {new Date(s.created_at).toLocaleDateString("ar-IQ")}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {(s.is_verified || s.verified) ? <Badge color={T.green}>موثق ✓</Badge> : <Badge color={T.orange}>معلق</Badge>}
                      {!(s.is_verified || s.verified) && <Btn size="sm" variant="green" onClick={() => handleVerifySeller(s.id, true)}>قبول</Btn>}
                      {(s.is_verified || s.verified) && <Btn size="sm" variant="danger" onClick={() => handleVerifySeller(s.id, false)}>إلغاء</Btn>}
                    </div>
                  </div>
                </Card>
              ))}
              {pendingSellers.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>لا توجد طلبات توثيق</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === "promotions" && (
        <div>
          {promotedLoading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {promotedProducts.map(p => (
                <Card key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ color: T.textMuted, fontSize: 11 }}>{p.sellers?.store_name || "—"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {p.is_promoted ? <Badge color={T.purple}>ممول</Badge> : <Badge color={T.textMuted}>عادي</Badge>}
                      <Btn size="sm" variant={p.is_promoted ? "danger" : "ghost"} onClick={() => handleTogglePromoted(p.id, p.is_promoted)}>
                        {p.is_promoted ? "إلغاء التمويل" : "روّج"}
                      </Btn>
                    </div>
                  </div>
                </Card>
              ))}
              {promotedProducts.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>لا توجد منتجات</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div>
          {subscriptionsLoading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {subscriptions.map(s => (
                <Card key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{s.store_name}</div>
                      <div style={{ color: T.textMuted, fontSize: 11 }}>حد المنتجات: {s.max_products || "غير محدود"}</div>
                    </div>
                    <Badge color={s.plan === "premium" ? T.gold : s.plan === "pro" ? T.blue : T.textMuted}>
                      {s.plan || "مجاني"}
                    </Badge>
                  </div>
                </Card>
              ))}
              {subscriptions.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>لا توجد اشتراكات</div>}
            </div>
          )}
        </div>
      )}

      {activeTab === "violations" && (
        <div>
          {openRequestsCount !== null && (
            <Card style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12, background: `${T.orange}11`, border: `1px solid ${T.orange}33` }}>
              <span style={{ fontSize: 28 }}>📋</span>
              <div>
                <div style={{ color: T.textPrimary, fontWeight: 800, fontSize: 14 }}>طلبات قطع مفتوحة: {openRequestsCount}</div>
                <div style={{ color: T.textMuted, fontSize: 12 }}>طلبات تحتاج متابعة من فريق الدعم</div>
              </div>
            </Card>
          )}
          <Card style={{ textAlign: "center", padding: 40, background: `${T.red}08`, border: `1px solid ${T.red}22` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ margin: "0 0 8px", color: T.textPrimary, fontSize: 16, fontWeight: 800 }}>لوحة المخالفات</h3>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>هذه اللوحة قيد التطوير — ستكون متاحة في إصدار قادم</p>
          </Card>
        </div>
      )}

      {activeTab === "finance" && (
        <div>
          <Card style={{ textAlign: "center", padding: 40, background: `${T.gold}08`, border: `1px solid ${T.gold}22` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
            <h3 style={{ margin: "0 0 8px", color: T.textPrimary, fontSize: 16, fontWeight: 800 }}>اللوحة المالية</h3>
            <p style={{ margin: 0, color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>هذه اللوحة قيد التطوير — ستكون متاحة في إصدار قادم</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminScreen;
