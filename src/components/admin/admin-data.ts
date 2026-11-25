import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const adminContentQuery = queryOptions({
  queryKey: ["admin", "content"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_content").select("key, value_he, value_en");
    if (error) throw error;
    const map: Record<string, { he: string; en: string }> = {};
    for (const r of data) map[r.key] = { he: r.value_he, en: r.value_en };
    return map;
  },
});

export const adminProjectsQuery = queryOptions({
  queryKey: ["admin", "projects"],
  queryFn: async () => {
    const { data, error } = await supabase.from("projects").select("*").order("sort_order").order("created_at");
    if (error) throw error;
    return data;
  },
});

export const adminProjectImagesQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["admin", "project-images", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_images")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

export const adminTestimonialsQuery = queryOptions({
  queryKey: ["admin", "testimonials"],
  queryFn: async () => {
    const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
    if (error) throw error;
    return data;
  },
});

export const adminLeadsQuery = queryOptions({
  queryKey: ["admin", "leads"],
  queryFn: async () => {
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

/** Saves many content keys at once (Hebrew + English). */
export async function saveContent(rows: { key: string; he: string; en: string }[]) {
  if (!rows.length) return;
  const { error } = await supabase
    .from("site_content")
    .upsert(rows.map((r) => ({ key: r.key, value_he: r.he, value_en: r.en })), { onConflict: "key" });
  if (error) throw error;
}

export const inputClass =
  "w-full rounded-lg border border-input bg-background/50 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary";
