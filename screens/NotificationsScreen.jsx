import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, relativeTime } from "../utils/theme";
import { Card } from "../utils/components";

const NotificationsScreen = ({ session, onUnreadChange }) => {
  const typeIcon = { new_bid: "🏆", outbid: "⚠️", auction_won: "🎉", auction_ended: "⏰", order_update: "📦", part_request: "🔧", general: "🔔" };
  const typeColor = { new_bid: T.gold, outbid: T.orange, auction_won: T.green, auction_ended: T.blue, order_update: T.blue, part_request: T.purple, general: T.textSecondary };

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (!session?.user) { setLoading(false); return; }
    const { data } = await supabase.from("notifications").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20);
    setNotifs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifs(); }, [session?.user?.id]);

  const markRead = async (notif) => {
    if (notif.is_read) return;
    setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    if (onUnreadChange) {
      const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", session.user.id).eq("is_read", false);
      onUnreadChange(count || 0);
    }
  };

  const markAllRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", session.user.id).eq("is_read", false);
    if (onUnreadChange) onUnreadChange(0);
  };

  if (!session) {
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ margin: "0 0 20px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>الإشعارات 🔔</h2>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <p style={{ color: T.textSecondary, margin: 0, fontSize: 14 }}>سجّل دخولك لتلقّي الإشعارات</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>الإشعارات 🔔</h2>
        {notifs.some(n => !n.is_read) && (
          <button onClick={markAllRead} style={{ background: "none", border: "none", color: T.gold, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>تحديد الكل كمقروء</button>
        )}
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: T.textMuted, fontSize: 13 }}>جارٍ التحميل...</div>
      ) : notifs.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ color: T.textSecondary, margin: 0, fontSize: 14 }}>لا توجد إشعارات بعد</p>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map(notif => {
            const ic = typeIcon[notif.type] || "🔔";
            const cl = typeColor[notif.type] || T.textSecondary;
            return (
              <Card key={notif.id} onClick={() => markRead(notif)} style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", background: notif.is_read ? T.navyCard : `${T.navyCard}`, borderRight: `4px solid ${notif.is_read ? T.navyBorder : cl}`, opacity: notif.is_read ? 0.75 : 1 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cl}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{ic}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                    <span style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{notif.title}</span>
                    {!notif.is_read && <div style={{ width: 8, height: 8, background: T.blue, borderRadius: "50%", flexShrink: 0, marginTop: 4 }} />}
                  </div>
                  <p style={{ margin: "0 0 4px", color: T.textSecondary, fontSize: 12, lineHeight: 1.5 }}>{notif.body}</p>
                  <span style={{ color: T.textMuted, fontSize: 11 }}>{relativeTime(notif.created_at)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
