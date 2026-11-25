import { useSuspenseQuery } from "@tanstack/react-query";
import { siteContentQuery } from "./site-queries";
import { useLang } from "./i18n";

/** Site-wide editable content with a localized getter: c("hero_title"). Falls back to Hebrew. */
export function useSite() {
  const { data } = useSuspenseQuery(siteContentQuery());
  const { lang } = useLang();
  const c = (key: string) => {
    const entry = data.content[key];
    if (!entry) return "";
    const v = entry[lang];
    return v && v.trim() ? v : entry.he;
  };
  /** Language-neutral values (urls, phone numbers) are stored in the Hebrew column. */
  const raw = (key: string) => data.content[key]?.he ?? "";
  return { ...data, c, raw };
}

export type Category = "kitchen" | "bedroom" | "closets";
export const CATEGORIES: Category[] = ["kitchen", "bedroom", "closets"];
export const categoryKey = (cat: string) =>
  (cat === "bedroom" || cat === "bathroom" ? "cat_bedroom" : cat === "closets" ? "cat_closets" : "cat_kitchen") as
    | "cat_kitchen"
    | "cat_bedroom"
    | "cat_closets";
