import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_CONTENT } from "@/lib/site-defaults";

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type ContentMap = Record<string, { he: string; en: string }>;
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectImageRow = Database["public"]["Tables"]["project_images"]["Row"];
export type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  try {
    const [contentRes, projectsRes, testimonialsRes, imagesRes] = await Promise.all([
      sb.from("site_content").select("key, value_he, value_en"),
      sb.from("projects").select("*").eq("published", true).order("sort_order").order("created_at"),
      sb.from("testimonials").select("*").eq("published", true).order("sort_order"),
      sb.from("project_images").select("project_id"),
    ]);

    // The backend is sometimes briefly unreachable. Never blank the page: keep
    // whatever came back and fall back to built-in text / bundled photos for the rest.
    const content: ContentMap = {};
    if (!contentRes.error && contentRes.data) {
      for (const row of contentRes.data) content[row.key] = { he: row.value_he, en: row.value_en };
    }
    if (contentRes.error || !Object.keys(content).length) {
      console.warn("[site] content unavailable, using built-in text:", contentRes.error?.message ?? "empty");
    }

    const galleryCounts: Record<string, number> = {};
    if (!imagesRes.error && imagesRes.data) {
      for (const row of imagesRes.data) {
        galleryCounts[row.project_id] = (galleryCounts[row.project_id] ?? 0) + 1;
      }
    }

    return {
      content: Object.keys(content).length ? content : DEFAULT_CONTENT,
      projects: (projectsRes.error ? null : projectsRes.data) as ProjectRow[] | null ?? [],
      testimonials: (testimonialsRes.error ? null : testimonialsRes.data) as TestimonialRow[] | null ?? [],
      galleryCounts,
    };
  } catch (e) {
    console.warn("[site] backend unreachable, serving built-in content:", e instanceof Error ? e.message : e);
    return { content: DEFAULT_CONTENT, projects: [], testimonials: [], galleryCounts: {} as Record<string, number> };
  }
});

export const getProject = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    try {
      const [projectRes, imagesRes] = await Promise.all([
        sb.from("projects").select("*").eq("id", data.id).eq("published", true).maybeSingle(),
        sb.from("project_images").select("*").eq("project_id", data.id).order("sort_order").order("created_at"),
      ]);
      // A failed lookup is shown as "project not found" rather than crashing the page.
      if (projectRes.error) console.warn("[site] project lookup failed:", projectRes.error.message);
      return {
        project: (projectRes.error ? null : projectRes.data ?? null) as ProjectRow | null,
        images: (imagesRes.error ? null : imagesRes.data ?? []) as ProjectImageRow[],
      };
    } catch (e) {
      console.warn("[site] backend unreachable on project lookup:", e instanceof Error ? e.message : e);
      return { project: null, images: [] };
    }
  });
