import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Serves only images referenced by public site content or published projects.
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!path || path.includes("..") || path.length > 300 || !/^[\w\-./]+$/.test(path)) {
          return new Response("Not found", { status: 404 });
        }
        const url = process.env["SUPABASE_URL"]!;
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const sb = createClient<Database>(url, key, {
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
        const mediaUrl = `/api/public/media/${path}`;
        let isPublicAsset = false;
        try {
          // Verify via the RLS-enforced publishable client that this file is part of published public content.
          const [heContent, enContent, coverProject, galleryImage] = await Promise.all([
            sb.from("site_content").select("key").eq("value_he", mediaUrl).limit(1),
            sb.from("site_content").select("key").eq("value_en", mediaUrl).limit(1),
            sb.from("projects").select("id").eq("cover_url", mediaUrl).eq("published", true).limit(1),
            sb.from("project_images").select("id").eq("url", mediaUrl).limit(1),
          ]);
          isPublicAsset = Boolean(
            heContent.data?.length ||
              enContent.data?.length ||
              coverProject.data?.length ||
              galleryImage.data?.length,
          );
        } catch {
          isPublicAsset = false;
        }
        if (!isPublicAsset) return new Response("Not found", { status: 404 });

        // Stream the verified public asset from the private bucket using the server-side admin client.
        let data: Blob | null = null;
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const res = await supabaseAdmin.storage.from("site-media").download(path);
          if (!res.error) data = res.data;
        } catch {
          data = null;
        }
        if (!data) return new Response("Not found", { status: 404 });
        return new Response(data, {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
