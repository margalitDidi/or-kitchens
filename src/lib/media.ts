import { supabase } from "@/integrations/supabase/client";

const BUCKET = "site-media";
const MEDIA_PREFIX = "/api/public/media/";
const MAX_SIDE = 2400;

/** Shrinks large photos in the browser before upload so pages stay fast. */
async function optimize(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  const passthrough = { blob: file as Blob, ext: (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, ""), type: file.type };
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") return passthrough;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return passthrough;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const isPng = file.type === "image/png";
    const type = isPng ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.86));
    if (!blob) return passthrough;
    return { blob, ext: isPng ? "png" : "jpg", type };
  } catch {
    return passthrough;
  }
}

/** Uploads a file to the media library and returns a stable public URL served by the site. */
export async function uploadMedia(file: File, folder: string): Promise<string> {
  const { blob, ext, type } = await optimize(file);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "31536000",
    contentType: type || undefined,
    upsert: false,
  });
  if (error) throw error;
  return `${MEDIA_PREFIX}${path}`;
}

/** Resolves a private site-media URL to a short-lived signed URL for authenticated admin previews. */
export async function resolveAdminMediaUrl(url: string): Promise<string> {
  if (!url.startsWith(MEDIA_PREFIX)) return url;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(url.slice(MEDIA_PREFIX.length), 3600);
  return data?.signedUrl ?? url;
}

/** Removes an uploaded file if the URL points at the media library (bundled images are left alone). */
export async function removeMedia(url: string) {
  if (!url.startsWith(MEDIA_PREFIX)) return;
  await supabase.storage.from(BUCKET).remove([url.slice(MEDIA_PREFIX.length)]);
}
