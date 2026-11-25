import type { ContentMap } from "./site.functions";

/**
 * Built-in text shown only when the backend cannot be reached.
 * The site stays readable instead of blanking; real editable content comes from the database.
 */
export const DEFAULT_CONTENT: ContentMap = {
  brand_name: { he: "OR KITCHENS", en: "OR KITCHENS" },
  brand_tagline: { he: "תכנון · עיצוב · ייצור בהתאמה אישית", en: "Bespoke Planning · Design · Manufacturing" },

  hero_eyebrow: { he: "תכנון · עיצוב · ייצור בהתאמה אישית", en: "Bespoke Planning · Design · Manufacturing" },
  hero_title: { he: "מטבחים ונגרות שנבנים מתוך מחשבה על כל פרט", en: "Kitchens & millwork crafted around every detail" },
  hero_subtitle: {
    he: "מהחזון העיצובי וההדמיה הראשונה ועד ייצור מדויק במפעל מתקדם והתקנה מושלמת בבית שלכם.",
    en: "From initial vision and 3D renders to precision factory manufacturing and flawless installation in your home.",
  },

  stat_1_value: { he: "+250", en: "250+" },
  stat_1_label: { he: "פרויקטים בהתאמה אישית", en: "Bespoke projects" },
  stat_2_value: { he: "0.1 מ״מ", en: "0.1 mm" },
  stat_2_label: { he: "דיוק חיתוך וגימור במפעל", en: "Factory cutting & finish precision" },
  stat_3_value: { he: "100%", en: "100%" },
  stat_3_label: { he: "תכנון וליווי מקצה לקצה", en: "End-to-end planning & guidance" },

  about_title: { he: "מטבחים שנבנים מתוך מחשבה על כל פרט", en: "Kitchens built with thought for every detail" },
  about_text: {
    he: "כל מטבח מתחיל בהבנה עמוקה של הבית, ההרגלים והצרכים היומיומיים שלכם. אנחנו שמים דגש על תכנון חכם של החלל, חלוקה מדויקת של אזורי העבודה, פתרונות אחסון נסתרים, בחירת חומרים ופרזול מהשורה הראשונה — ועל ביצוע מוקפד עד למילימטר האחרון.\n\nלצד ההתמחות במטבחים, אנחנו מתכננים ומייצרים גם ארונות קיר, חדרי ארונות, מיטות, ספריות ברזל וריהוט משלים בהתאמה אישית מלאה.",
    en: "Every kitchen begins with a deep understanding of your home, habits and daily routines. We focus on intelligent spatial planning, concealed storage, premium materials and precision execution.\n\nAlongside bespoke kitchens, we also craft flush wardrobes, walk-in closets, beds, steel libraries and custom millwork throughout the home.",
  },

  service_kitchen_title: { he: "מטבחי יוקרה", en: "Luxury Kitchens" },
  service_kitchen_text: {
    he: "תכנון ארגונומי, איים מרשימים, מזווים אינטגרליים ומערכות פרזול חכמות — מטבח שנראה מושלם ועובד בהרמוניה.",
    en: "Ergonomic planning, sculptural islands, concealed pantries and smart hardware — a kitchen that looks refined and works effortlessly.",
  },
  service_bedroom_title: { he: "חדרי שינה וארונות", en: "Bedrooms & Wardrobes" },
  service_bedroom_text: {
    he: "מיטות מעוצבות, קירות כוח, חדרי ארונות וארונות קיר בקו אפס עם תאורה נסתרת וחלוקה פנימית מדויקת.",
    en: "Tailored beds, architectural feature walls, walk-in closets and flush wardrobes with concealed lighting and precise interiors.",
  },
  service_closets_title: { he: "ספריות ונגרות משלימה", en: "Libraries & Custom Millwork" },
  service_closets_text: {
    he: "ספריות ברזל ועץ, יחידות מדיה, חיפויי קיר ופריטי נגרות בהתאמה אישית היוצרים שפה הרמונית בכל חללי הבית.",
    en: "Steel-and-oak libraries, media walls, architectural wall paneling and custom pieces uniting every room in one design language.",
  },

  process_title: { he: "מהרעיון ועד הבית", en: "From idea to home" },
  process_1_title: { he: "אפיון ותכנון חלל", en: "Spatial discovery & planning" },
  process_1_text: { he: "לומדים את הרגלי הבישול והאירוח, מודדים את השטח ומתכננים הנדסת אנוש מדויקת.", en: "Understanding your routines, measuring on site and engineering ergonomic proportions." },
  process_2_title: { he: "הדמיה ובחירת חומרים", en: "3D renders & material selection" },
  process_2_text: { he: "הדמיות תלת־ממד ריאליסטיות והתאמה אישית של חזיתות, משטחים, גוונים ופרזול.", en: "Photorealistic 3D visuals and curated fronts, stone surfaces, tones and hardware." },
  process_3_title: { he: "ייצור ממוחשב במפעל", en: "Precision factory production" },
  process_3_text: { he: "הורדה לייצור בטכנולוגיית חיתוך וגימור מתקדמת תחת בקרת איכות קפדנית.", en: "CNC precision cutting and multi-stage finishing under strict quality control." },
  process_4_title: { he: "התקנה ומסירה מושלמת", en: "Installation & handover" },
  process_4_text: { he: "תיאום מלא וליווי צמוד עד להרכבה מדויקת בביתכם ועמידה מלאה בלוחות הזמנים.", en: "Full coordination and close supervision through spotless installation, right on schedule." },

  cta_title: { he: "בואו נתכנן את הפרויקט הבא שלכם", en: "Let's plan your next project" },
  cta_text: {
    he: "השאירו פרטים או שלחו הודעה ישירה בוואטסאפ ונחזור אליכם בהקדם לתיאום פגישת ייעוץ ותכנון.",
    en: "Leave your details or message us directly on WhatsApp and we will get back to you shortly to arrange a consultation.",
  },
  contact_phone: { he: "052-4480444", en: "052-4480444" },
  contact_whatsapp: { he: "972524480444", en: "972524480444" },
  contact_email: { he: "orkitchens@gmail.com", en: "orkitchens@gmail.com" },
  contact_address: { he: "פריסה ארצית · תיאום פגישות ייעוץ", en: "Nationwide · Consultation by appointment" },
};

/** Keys the site reads through c() / raw(); used by the fallback test. */
export const CONTENT_KEYS = Object.keys(DEFAULT_CONTENT);
