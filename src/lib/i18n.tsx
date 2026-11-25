import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "he" | "en";

const STORAGE_KEY = "site-lang";

const ui = {
  nav_home: { he: "בית", en: "Home" },
  nav_projects: { he: "פרויקטים", en: "Projects" },
  nav_about: { he: "אודות", en: "About" },
  nav_contact: { he: "צור קשר", en: "Contact" },
  cta_consult: { he: "לתיאום פגישת ייעוץ", en: "Book a consultation" },
  cta_view_projects: { he: "לכל העבודות", en: "Explore our work" },
  cta_all_projects: { he: "לכל העבודות", en: "All projects" },
  cta_explore: { he: "לצפייה בעבודות", en: "Explore works" },
  cta_read_more: { he: "קראו עוד", en: "Read more" },
  cta_whatsapp: { he: "שלחו וואטסאפ", en: "WhatsApp us" },
  section_services: { he: "תחומי התמחות", en: "Expertise" },
  section_services_title: { he: "שלושה עולמות. שפה עיצובית אחת.", en: "Three worlds. One design language." },
  section_featured: { he: "פרויקטים נבחרים", en: "Selected work" },
  section_featured_title: { he: "בתים שתכננו וייצרנו יחד", en: "Homes we designed & crafted" },
  section_about: { he: "תכנון ונגרות בהתאמה אישית", en: "Bespoke planning & millwork" },
  about_badge_label: { he: "מעטפת מלאה מתכנון ועד התקנה", en: "Full scope from concept to handover" },
  section_process: { he: "תהליך העבודה", en: "The process" },
  section_testimonials: { he: "לקוחות מספרים", en: "Client stories" },
  section_testimonials_title: { he: "מה נשאר אחרי המסירה", en: "What stays after handover" },
  section_contact: { he: "בואו נדבר", en: "Let's talk" },
  cat_all: { he: "הכל", en: "All" },
  cat_kitchen: { he: "מטבחים", en: "Kitchens" },
  cat_bedroom: { he: "חדרי שינה וארונות", en: "Bedrooms & Wardrobes" },
  cat_closets: { he: "ספריות ונגרות משלימה", en: "Libraries & Millwork" },
  projects_title: { he: "תיק עבודות", en: "Portfolio" },
  projects_subtitle: { he: "מבחר פרויקטים שתוכננו ויוצרו בהתאמה אישית — מטבחים, חדרי שינה, ארונות ונגרות משלימה.", en: "A curated collection of bespoke kitchens, master bedrooms, wardrobes and custom millwork." },
  projects_empty: { he: "עוד אין פרויקטים בקטגוריה הזו.", en: "No projects in this category yet." },
  project_back: { he: "חזרה לפרויקטים", en: "Back to projects" },
  project_gallery: { he: "גלריה", en: "Gallery" },
  photos_count: { he: "תמונות", en: "photos" },
  project_location: { he: "מיקום", en: "Location" },
  project_category: { he: "קטגוריה", en: "Category" },
  project_not_found: { he: "הפרויקט לא נמצא", en: "Project not found" },
  form_name: { he: "שם מלא", en: "Full name" },
  form_phone: { he: "טלפון", en: "Phone" },
  form_email: { he: "אימייל (לא חובה)", en: "Email (optional)" },
  form_type: { he: "סוג הפרויקט", en: "Project type" },
  form_message: { he: "ספרו לי קצת על הפרויקט", en: "Tell me a little about your project" },
  form_submit: { he: "שליחה", en: "Send" },
  form_sending: { he: "שולח…", en: "Sending…" },
  form_whatsapp_alt: { he: "או שלחו פנייה ישירה בוואטסאפ", en: "Or send directly on WhatsApp" },
  form_success: { he: "תודה! הפרטים התקבלו ואחזור אליכם בהקדם.", en: "Thank you! I'll get back to you shortly." },
  form_error: { he: "משהו השתבש. נסו שוב או התקשרו.", en: "Something went wrong. Please try again or call." },
  form_other: { he: "בית מלא / אחר", en: "Full home / Other" },
  contact_title: { he: "נשמח לשמוע על הבית שלכם", en: "Tell me about your home" },
  contact_details: { he: "פרטי התקשרות", en: "Contact details" },
  contact_area: { he: "אזור פעילות", en: "Service area" },
  footer_rights: { he: "כל הזכויות שמורות", en: "All rights reserved" },
  footer_disclaimer: { he: "התמונות להמחשה בלבד · חלק מהתמונות נוצרו בעזרת בינה מלאכותית", en: "Images for illustration purposes only · Some images were generated with AI" },
  footer_admin: { he: "כניסת מנהל", en: "Admin" },
  lang_switch: { he: "EN", en: "עב" },
  menu: { he: "תפריט", en: "Menu" },
  close: { he: "סגירה", en: "Close" },
} as const;

export type UiKey = keyof typeof ui;

interface LangContextValue {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: UiKey) => string;
  /** Pick a localized field: pick(row, "title") → row.title_he / row.title_en (falls back to Hebrew). */
  pick: <T extends Record<string, unknown>>(row: T, base: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("he");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "he") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      dir: lang === "he" ? "rtl" : "ltr",
      setLang,
      toggle: () => setLang(lang === "he" ? "en" : "he"),
      t: (key) => ui[key][lang],
      pick: (row, base) => {
        const v = row[`${base}_${lang}`];
        const fallback = row[`${base}_he`];
        return (typeof v === "string" && v.trim() ? v : typeof fallback === "string" ? fallback : "") as string;
      },
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
