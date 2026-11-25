import { describe, expect, it } from "vitest";

import { CONTENT_KEYS, DEFAULT_CONTENT } from "@/lib/site-defaults";
import { CATEGORIES, categoryKey } from "@/lib/use-site";

// The backend is sometimes briefly unreachable. When that happens the site must
// still render with built-in text instead of showing a blank error page.
describe("Site content fallback", () => {
  it("has Hebrew and English text for every key the site reads", () => {
    expect(CONTENT_KEYS.length).toBeGreaterThan(20);
    for (const key of CONTENT_KEYS) {
      const entry = DEFAULT_CONTENT[key];
      expect(entry, `missing content key: ${key}`).toBeDefined();
      expect(entry?.he.trim().length, `empty Hebrew text for ${key}`).toBeGreaterThan(0);
      expect(entry?.en.trim().length, `empty English text for ${key}`).toBeGreaterThan(0);
    }
  });

  it("keeps the keys the homepage and about page read", () => {
    for (const key of ["hero_title", "hero_subtitle", "about_text", "service_bedroom_title", "process_title", "cta_title", "brand_name"]) {
      expect(DEFAULT_CONTENT[key]?.he, key).toBeTruthy();
    }
    expect(DEFAULT_CONTENT["brand_name"]?.he).toBe("OR KITCHENS");
  });

  it("leaves image keys out so bundled photos are used when the backend is down", () => {
    for (const key of ["logo_url", "hero_image", "about_image"]) {
      expect(DEFAULT_CONTENT[key]?.he ?? "", key).toBe("");
    }
  });

  it("uses kitchen, bedroom and closets as the three portfolio categories", () => {
    expect(CATEGORIES).toEqual(["kitchen", "bedroom", "closets"]);
    expect(categoryKey("bedroom")).toBe("cat_bedroom");
    expect(categoryKey("bathroom")).toBe("cat_bedroom");
    expect(categoryKey("closets")).toBe("cat_closets");
  });
});
