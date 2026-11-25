import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resolveAdminMediaUrl, uploadMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Renders an image in the admin panel, resolving private site-media uploads via signed URLs. */
export function AdminImage({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  const [resolved, setResolved] = useState(() => (src.startsWith("/api/public/media/") ? "" : src));

  useEffect(() => {
    let active = true;
    if (!src.startsWith("/api/public/media/")) {
      setResolved(src);
      return;
    }
    resolveAdminMediaUrl(src).then((next) => {
      if (active) setResolved(next);
    });
    return () => {
      active = false;
    };
  }, [src]);

  if (!resolved) return null;
  return <img src={resolved} alt={alt} className={className} />;
}

/** Single image picker with preview. Calls onChange with the new URL ("" when removed). */
export function ImageField({
  value,
  onChange,
  folder,
  label,
  hint,
  aspect = "aspect-video",
  contain = false,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label: string;
  hint?: string;
  aspect?: string;
  contain?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
      toast.success("התמונה הועלתה");
    } catch (e) {
      toast.error("ההעלאה נכשלה: " + (e instanceof Error ? e.message : ""));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-foreground">{label}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      <div className={cn("relative overflow-hidden rounded-xl border border-dashed border-input bg-muted/40", aspect)}>
        {value ? (
          <AdminImage src={value} className={cn("absolute inset-0 h-full w-full", contain ? "object-contain p-4" : "object-cover")} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">אין תמונה</div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="gold" size="sm" onClick={() => input.current?.click()} disabled={busy}>
          <ImagePlus /> {value ? "החלפת תמונה" : "העלאת תמונה"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} disabled={busy}>
            <Trash2 /> הסרה
          </Button>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}
