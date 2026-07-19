// Shared enum option lists for the Vehicle Management module — one place so
// VehicleFormScreen (data entry) and VehicleListingsScreen (browse filters)
// never drift into two different lists for the same concept.

export const IRAQI_GOVERNORATES = [
  "بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كربلاء", "الأنبار", "ديالى",
  "كركوك", "واسط", "ميسان", "ذي قار", "المثنى", "القادسية", "بابل", "صلاح الدين",
  "دهوك", "السليمانية",
];

export const FUEL_TYPES = [
  { value: "gasoline", label: "بنزين" },
  { value: "diesel", label: "ديزل" },
  { value: "hybrid", label: "هجين" },
  { value: "electric", label: "كهربائي" },
];

export const TRANSMISSIONS = [
  { value: "automatic", label: "أوتوماتيك" },
  { value: "manual", label: "يدوي" },
];

export const DRIVE_TYPES = [
  { value: "fwd", label: "دفع أمامي" },
  { value: "rwd", label: "دفع خلفي" },
  { value: "awd", label: "دفع رباعي (AWD)" },
  { value: "4wd", label: "دفع رباعي (4WD)" },
];

export const VEHICLE_CONDITIONS = [
  { value: "new", label: "جديدة" },
  { value: "used", label: "مستعملة" },
  { value: "needs_repair", label: "بحاجة لإصلاح" },
];

export const CURRENCIES = [
  { value: "IQD", label: "دينار عراقي" },
  { value: "USD", label: "دولار أمريكي" },
];

export const VEHICLE_FEATURES = [
  "مكيف", "فتحة سقف", "مقاعد جلد", "كاميرا خلفية", "حساسات ركن",
  "شاشة لمس", "بلوتوث", "مثبت سرعة", "وسائد هوائية", "فرامل ABS",
  "نظام ملاحة GPS", "إطارات جديدة", "زجاج كهربائي", "مقاعد كهربائية",
];
