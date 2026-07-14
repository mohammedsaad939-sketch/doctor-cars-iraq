export const T = {
  navy: "#060E1F",
  navyDark: "#060E1F",
  navyMid: "#0A1628",
  navyCard: "#0F1F3D",
  navyLight: "#162040",
  navyBorder: "#1E3A6E",
  border: "#1E3A6E",
  gold: "#F59E0B",
  goldLight: "#FCD34D",
  goldDark: "#D97706",
  warning: "#F59E0B",
  blue: "#3B82F6",
  blueDark: "#1D4ED8",
  green: "#10B981",
  success: "#10B981",
  red: "#EF4444",
  error: "#EF4444",
  orange: "#F97316",
  purple: "#8B5CF6",
  textPrimary: "#E8EAED",
  textSecondary: "#8B9DC3",
  textMuted: "#4B6080",
};

export const toWhatsAppNumber = (phone) => {
  if (!phone) return "";
  let d = String(phone).replace(/[\s\-()]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.startsWith("964")) return d;
  if (d.startsWith("0")) return "964" + d.slice(1);
  return "964" + d;
};

export const relativeTime = (iso) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return "منذ لحظات";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 172800) return "أمس";
  return `منذ ${Math.floor(diff / 86400)} يوم`;
};
