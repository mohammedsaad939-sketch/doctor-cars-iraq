import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { T, relativeTime } from "../utils/theme";
import { Card } from "../utils/components";

const MessagesScreen = ({ session, msgContext, onClearMsgContext }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (msgContext) { setActiveConv(msgContext); if (onClearMsgContext) onClearMsgContext(); }
  }, []);

  useEffect(() => {
    if (!session?.user?.id || activeConv) return;
    const uid = session.user.id;
    supabase.from("messages")
      .select("*, sender:sender_id(id,full_name), receiver:receiver_id(id,full_name), products(name)")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const convMap = {};
        (data || []).forEach(msg => {
          const partner = msg.sender_id === uid ? msg.receiver : msg.sender;
          if (!partner) return;
          const pid = partner.id;
          if (!convMap[pid]) convMap[pid] = { partner, lastMsg: msg, unread: 0, productName: msg.products?.name };
          if (msg.receiver_id === uid && !msg.is_read) convMap[pid].unread++;
        });
        setConversations(Object.values(convMap));
        setLoading(false);
      });
  }, [session?.user?.id, activeConv]);

  useEffect(() => {
    if (!activeConv || !session?.user?.id) return;
    const uid = session.user.id;
    const pid = activeConv.partnerId;
    supabase.from("messages")
      .select("*")
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${pid}),and(sender_id.eq.${pid},receiver_id.eq.${uid})`)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages(data || []));
    supabase.from("messages").update({ is_read: true }).eq("sender_id", pid).eq("receiver_id", uid).eq("is_read", false);
    const channel = supabase.channel(`msgs-${uid}-${pid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${uid}` }, payload => {
        const m = payload.new;
        if (m.sender_id === pid) {
          setMessages(prev => [...prev, m]);
          supabase.from("messages").update({ is_read: true }).eq("id", m.id);
        }
      }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeConv?.partnerId]);

  const sendMessage = async () => {
    if (!msgText.trim() || sending || !session?.user?.id) return;
    setSending(true);
    const uid = session.user.id;
    const { data, error } = await supabase.from("messages").insert({ sender_id: uid, receiver_id: activeConv.partnerId, product_id: activeConv.productId || null, content: msgText.trim() }).select().single();
    if (!error && data) setMessages(prev => [...prev, data]);
    setMsgText("");
    setSending(false);
  };

  if (!session?.user?.id) {
    return (
      <div style={{ padding: 16 }}>
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <p style={{ color: T.textSecondary, margin: 0 }}>سجّل دخولك لعرض رسائلك</p>
        </Card>
      </div>
    );
  }

  if (activeConv) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)" }}>
        <div style={{ padding: "10px 16px", background: T.navyCard, borderBottom: `1px solid ${T.navyBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => { setActiveConv(null); setMessages([]); setLoading(true); }} style={{ background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: T.textPrimary, fontSize: 16 }}>→</button>
          <div>
            <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{activeConv.partnerName}</div>
            {activeConv.productName && <div style={{ color: T.textMuted, fontSize: 11 }}>📦 {activeConv.productName}</div>}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {messages.map((msg, i) => {
            const isMine = msg.sender_id === session.user.id;
            return (
              <div key={msg.id || i} style={{ display: "flex", justifyContent: isMine ? "flex-start" : "flex-end" }}>
                <div style={{ maxWidth: "75%", background: isMine ? T.gold : T.navyCard, color: isMine ? "#000" : T.textPrimary, borderRadius: 12, padding: "8px 12px", fontSize: 13, border: isMine ? "none" : `1px solid ${T.navyBorder}` }}>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3 }}>{relativeTime(msg.created_at)}</div>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && <div style={{ textAlign: "center", color: T.textMuted, fontSize: 13, marginTop: 40 }}>ابدأ المحادثة</div>}
        </div>
        <div style={{ padding: "10px 16px", display: "flex", gap: 8, background: T.navyCard, borderTop: `1px solid ${T.navyBorder}` }}>
          <input value={msgText} onChange={e => setMsgText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="اكتب رسالة..." style={{ flex: 1, background: T.navyLight, border: `1px solid ${T.navyBorder}`, borderRadius: 20, padding: "8px 14px", color: T.textPrimary, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
          <button onClick={sendMessage} disabled={sending} style={{ background: T.gold, border: "none", borderRadius: 20, padding: "8px 16px", color: "#000", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>إرسال</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>رسائلي 💬</h2>
      {loading ? <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>جارٍ التحميل...</div> : conversations.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <p style={{ color: T.textSecondary, margin: 0 }}>لا توجد رسائل بعد</p>
        </Card>
      ) : conversations.map((conv, i) => (
        <Card key={i} style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => setActiveConv({ partnerId: conv.partner.id, partnerName: conv.partner.full_name, productId: conv.lastMsg?.product_id || null, productName: conv.productName || null })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.navyLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>👤</div>
              <div>
                <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 14 }}>{conv.partner.full_name}</div>
                <div style={{ color: T.textMuted, fontSize: 12 }}>{(conv.lastMsg?.content || "").substring(0, 40)}{(conv.lastMsg?.content || "").length > 40 ? "..." : ""}</div>
                {conv.productName && <div style={{ color: T.blue, fontSize: 11 }}>📦 {conv.productName}</div>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{ color: T.textMuted, fontSize: 10 }}>{relativeTime(conv.lastMsg?.created_at)}</span>
              {conv.unread > 0 && <span style={{ background: T.red, color: "#fff", borderRadius: 10, padding: "2px 7px", fontSize: 11, fontWeight: 700 }}>{conv.unread}</span>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MessagesScreen;
