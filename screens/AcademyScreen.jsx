import { useState } from "react";
import { T } from "../utils/theme";
import { Section, Card, Badge, Btn } from "../utils/components";

const REAL_COURSES = [
  {
    id: 1,
    title: "Automobile Engineering",
    provider: "NPTEL / IIT India",
    level: "متوسط",
    url: "https://nptel.ac.in/courses/107106088",
    summary: {
      ar: "دورة هندسية من معهد IIT الهندي تشرح الأنظمة الأساسية للسيارة: المحرك، نقل الحركة، التعليق، والفرامل، مع الأساس الرياضي لكل نظام. مناسبة لمن يريد فهماً تقنياً عميقاً.",
      en: "An engineering course from IIT (India) covering the core systems of a car — engine, transmission, suspension, and brakes — with the mathematical foundation behind each. Suited for those wanting a deep technical understanding.",
      ku: "کۆرسێکی ئەندازیاری لە IIT (ھیندستان) کە سیستەمە سەرەکیەکانی ئۆتۆمبێل ڕوون دەکاتەوە: ماتۆر، گواستنەوەی هێز، سەسپینشن، و بریك، لەگەڵ بنەمای بیرکاری بۆ هەر سیستەمێک.",
    },
  },
  {
    id: 2,
    title: "Electric Cars: Technology, Business and Policy",
    provider: "Coursera / TU Delft",
    level: "مبتدئ",
    url: "https://online-learning.tudelft.nl/programs/electric-cars/",
    summary: {
      ar: "دورة من جامعة دلفت الهولندية تشرح كيف تعمل السيارة الكهربائية: المحرك الكهربائي، البطارية، الشحن، ومستقبل التنقل الكهربائي.",
      en: "A course from TU Delft (Netherlands) explaining how electric cars work — the electric motor, battery, charging, and the future of electric mobility.",
      ku: "کۆرسێک لە زانکۆی دێلفت (هۆلەندا) کە ڕوون دەکاتەوە چۆن ئۆتۆمبێلی کارەبایی کاردەکات: ماتۆری کارەبایی، باتری، شارژکردن، و داهاتووی گواستنەوەی کارەبایی.",
    },
  },
  {
    id: 3,
    title: "Self-Driving Cars Specialization",
    provider: "Coursera / University of Toronto",
    level: "متقدم",
    url: "https://www.coursera.org/specializations/self-driving-cars",
    summary: {
      ar: "دورة من جامعة تورنتو الكندية تشرح المكونات الأساسية لتقنية القيادة الذاتية: الحساسات، أنظمة الأمان، والتحكم بالمركبة.",
      en: "A course from the University of Toronto introducing the core components of self-driving car technology — sensors, safety systems, and vehicle control.",
      ku: "کۆرسێک لە زانکۆی تورۆنتۆ (کانادا) کە بنەمای تەکنەلۆجیای لێخوڕینی خۆکار ڕوون دەکاتەوە: سێنسەرەکان، سیستەمی سەلامەتی، و کۆنترۆڵی ئۆتۆمبێل.",
    },
  },
  {
    id: 4,
    title: "Internal Combustion Engines",
    provider: "MIT OpenCourseWare",
    level: "متقدم",
    url: "https://ocw.mit.edu/courses/2-61-internal-combustion-engines-spring-2008/",
    summary: {
      ar: "محاضرات من معهد MIT الأمريكي الشهير تشرح كيف يعمل محرك السيارة من الداخل: الاحتراق، الأداء، والكفاءة.",
      en: "Lectures from the renowned MIT explaining how a car engine works internally — the combustion cycle, performance, and efficiency.",
      ku: "وتارەکان لە MIT ناودارکراو کە ڕوون دەکاتەوە چۆن ماتۆری ئۆتۆمبێل لە ناوەوە کاردەکات: سووڕی شیاندن، کارایی، و بەرهەمداریتی.",
    },
  },
  {
    id: 5,
    title: "Car Mechanics and Vehicle Maintenance",
    provider: "Alison",
    level: "مبتدئ",
    url: "https://alison.com/tag/automotive",
    summary: {
      ar: "دورة عملية مجانية تشرح أساسيات صيانة السيارة: المحرك، الفرامل، ونصائح مهمة عند شراء سيارة.",
      en: "A free practical course covering car maintenance basics — engine, brakes, and important tips when buying a car.",
      ku: "کۆرسێکی کرداری بەخۆڕایی کە بنەماکانی چاکسازی ئۆتۆمبێل ڕوون دەکاتەوە: ماتۆر، بریك، و ئامۆژگاری گرنگ لە کاتی کڕینی ئۆتۆمبێل.",
    },
  },
  {
    id: 6,
    title: "How Cars Work — Engineering Explained",
    provider: "YouTube / Engineering Explained",
    level: "مبتدئ",
    url: "https://www.youtube.com/@EngineeringExplained/playlists",
    summary: {
      ar: "قناة يوتيوب مشهورة عالمياً (أكثر من مليوني مشترك) تشرح كيف تعمل أجزاء السيارة المختلفة بطريقة مبسطة ومرئية.",
      en: "A globally popular YouTube channel (2M+ subscribers) explaining how different car parts work in a simple, visual way.",
      ku: "کانالێکی یوتیوبی ناودار لە جیهان (زیاتر لە ٢ ملیۆن بەشداربوو) کە چۆنیەتی کارکردنی بەشە جۆراوجۆرەکانی ئۆتۆمبێل بە شێوەیەکی سادە و بینراو ڕوون دەکاتەوە.",
    },
  },
];

const AcademyScreen = () => {
  const levelColor = { "مبتدئ": T.green, "متوسط": T.orange, "متقدم": T.red };
  const detectLang = () => {
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    if (nav.startsWith("ar")) return "ar";
    if (nav.startsWith("ku")) return "ku";
    return "en";
  };
  const [courseLang, setCourseLang] = useState(detectLang);
  const langs = [
    { key: "ar", label: "عربي" },
    { key: "en", label: "English" },
    { key: "ku", label: "کوردی" },
  ];
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 20, fontWeight: 800 }}>🎓 الأكاديمية التعليمية</h2>
      <p style={{ margin: "0 0 6px", color: T.textSecondary, fontSize: 13 }}>دورات خارجية مجانية موثّقة في ميكانيك السيارات والهندسة</p>
      <p style={{ margin: "0 0 12px", color: T.textMuted, fontSize: 11 }}>المحتوى باللغة الإنجليزية — يفتح في نافذة خارجية</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {langs.map(l => (
          <button key={l.key} onClick={() => setCourseLang(l.key)} style={{
            padding: "4px 12px", borderRadius: 20, border: "1px solid",
            borderColor: courseLang === l.key ? T.blue : T.border,
            background: courseLang === l.key ? T.blue : "transparent",
            color: courseLang === l.key ? "#fff" : T.textSecondary,
            fontSize: 12, cursor: "pointer", fontWeight: courseLang === l.key ? 700 : 400,
          }}>{l.label}</button>
        ))}
      </div>

      <Section title="الدورات المتاحة">
        {REAL_COURSES.map(course => (
          <Card key={course.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Badge small color={levelColor[course.level]}>{course.level}</Badge>
              <div style={{ display: "flex", gap: 6 }}>
                <Badge small color={T.green}>مجاني</Badge>
                <Badge small color={T.blue}>خارجي</Badge>
              </div>
            </div>
            <h4 style={{ margin: "0 0 6px", color: T.textPrimary, fontSize: 14, fontWeight: 800, lineHeight: 1.4 }}>{course.title}</h4>
            <p style={{ margin: "0 0 6px", color: T.textSecondary, fontSize: 12 }}>🏫 {course.provider}</p>
            <p style={{ margin: "0 0 14px", color: T.textMuted, fontSize: 12, lineHeight: 1.5, direction: courseLang === "en" ? "ltr" : "rtl", textAlign: courseLang === "en" ? "left" : "right" }}>{(course.summary && (course.summary[courseLang] || course.summary.ar)) || ""}</p>
            <a href={course.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
              <Btn fullWidth size="sm" icon="🔗">ابدأ الدورة</Btn>
            </a>
          </Card>
        ))}
      </Section>
    </div>
  );
};

export default AcademyScreen;
