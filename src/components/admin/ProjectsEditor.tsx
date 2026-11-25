import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { adminProjectImagesQuery, adminProjectsQuery, inputClass } from "./admin-data";
import { AdminImage, ImageField } from "./ImageField";
import { removeMedia, uploadMedia } from "@/lib/media";
import type { ProjectRow } from "@/lib/site.functions";
import { cn } from "@/lib/utils";

const catLabel: Record<string, string> = { kitchen: "מטבחים", bedroom: "חדרי שינה וארונות", closets: "ספריות ונגרות משלימה" };

export function ProjectsEditor({ onSaved }: { onSaved: () => void }) {
  const { data: projects } = useSuspenseQuery(adminProjectsQuery);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProjectRow | null>(null);
  const [creating, setCreating] = useState(false);

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["admin", "projects"] });
    onSaved();
  };

  async function create() {
    setCreating(true);
    const maxOrder = projects.reduce((m, p) => Math.max(m, p.sort_order), 0);
    const { data, error } = await supabase
      .from("projects")
      .insert({ title_he: "פרויקט חדש", category: "kitchen", sort_order: maxOrder + 1, published: false })
      .select()
      .single();
    setCreating(false);
    if (error || !data) { toast.error("לא הצלחנו ליצור פרויקט"); return; }
    await refresh();
    setEditing(data);
  }

  async function move(i: number, dirn: -1 | 1) {
    const a = projects[i];
    const b = projects[i + dirn];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("projects").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("projects").update({ sort_order: a.sort_order === b.sort_order ? a.sort_order + dirn : a.sort_order }).eq("id", b.id),
    ]);
    refresh();
  }

  async function remove(p: ProjectRow) {
    if (!window.confirm(`למחוק את "${p.title_he}"? הפעולה לא ניתנת לביטול.`)) return;
    const { data: imgs } = await supabase.from("project_images").select("url").eq("project_id", p.id);
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) { toast.error("המחיקה נכשלה"); return; }
    await Promise.all([...(imgs ?? []).map((i) => removeMedia(i.url)), removeMedia(p.cover_url)]);
    toast.success("הפרויקט נמחק");
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          הוסיפי פרויקטים, תמונות וגלריות. פרויקט מוסתר לא יופיע באתר. ⭐ = מופיע בדף הבית.
        </p>
        <Button variant="hero" size="lg" onClick={create} disabled={creating}>
          {creating ? <Loader2 className="animate-spin" /> : <Plus />} פרויקט חדש
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <div key={p.id} className={cn("card-luxe overflow-hidden", !p.published && "opacity-60")}>
            <div className="relative aspect-[4/3] bg-muted">
              {p.cover_url && <AdminImage src={p.cover_url} className="absolute inset-0 h-full w-full object-cover" />}
              <div className="absolute top-3 start-3 flex gap-1.5">
                {p.featured && <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground"><Star className="inline h-3 w-3" /></span>}
                {!p.published && <span className="rounded-full bg-background/80 px-2 py-1 text-xs">מוסתר</span>}
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <div className="text-xs text-primary">{catLabel[p.category]}</div>
                <div className="font-display text-xl">{p.title_he || "ללא שם"}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="gold" onClick={() => setEditing(p)}>
                  <Pencil /> עריכה
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="הזזה למעלה">
                  <ArrowUp />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === projects.length - 1} aria-label="הזזה למטה">
                  <ArrowDown />
                </Button>
                <Button size="icon" variant="ghost" className="ms-auto text-destructive" onClick={() => remove(p)} aria-label="מחיקה">
                  <Trash2 />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-normal">עריכת פרויקט</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProjectForm
              key={editing.id}
              project={editing}
              onDone={async () => {
                await refresh();
                setEditing(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectForm({ project, onDone }: { project: ProjectRow; onDone: () => void }) {
  const [p, setP] = useState(project);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ProjectRow>(k: K, v: ProjectRow[K]) => setP((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true);
    const { error } = await supabase
      .from("projects")
      .update({
        category: p.category,
        title_he: p.title_he,
        title_en: p.title_en,
        description_he: p.description_he,
        description_en: p.description_en,
        location_he: p.location_he,
        location_en: p.location_en,
        cover_url: p.cover_url,
        featured: p.featured,
        published: p.published,
      })
      .eq("id", p.id);
    setBusy(false);
    if (error) { toast.error("השמירה נכשלה"); return; }
    toast.success("הפרויקט נשמר");
    onDone();
  }

  const bi = (base: "title" | "location" | "description", label: string, long = false) => (
    <div className="space-y-1">
      <div className="text-sm font-semibold">{label}</div>
      <div className="grid gap-3 md:grid-cols-2">
        {(["he", "en"] as const).map((l) => {
          const k = `${base}_${l}` as keyof ProjectRow;
          const common = {
            className: inputClass,
            dir: l === "en" ? "ltr" : "rtl",
            placeholder: l === "he" ? "עברית" : "English",
            value: p[k] as string,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never),
          };
          return long ? <textarea key={l} rows={4} {...common} /> : <input key={l} {...common} />;
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[1fr_240px]">
        <div className="space-y-5">
          <div className="space-y-1">
            <div className="text-sm font-semibold">קטגוריה</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(catLabel).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => set("category", v)}
                  className={cn("rounded-full border px-4 py-1.5 text-sm", p.category === v ? "border-primary bg-primary/15 text-primary" : "border-input")}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          {bi("title", "שם הפרויקט")}
          {bi("location", "מיקום")}
          {bi("description", "תיאור", true)}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={p.published} onCheckedChange={(v) => set("published", v)} />
              {p.published ? <><Eye className="h-4 w-4" /> מוצג באתר</> : <><EyeOff className="h-4 w-4" /> מוסתר</>}
            </label>
            <label className="flex items-center gap-3 text-sm">
              <Switch checked={p.featured} onCheckedChange={(v) => set("featured", v)} />
              <Star className="h-4 w-4" /> מופיע בדף הבית
            </label>
          </div>
        </div>
        <ImageField label="תמונה ראשית" folder={`projects/${p.id}`} value={p.cover_url} onChange={(v) => set("cover_url", v)} aspect="aspect-[4/5]" />
      </div>
      <GalleryEditor projectId={p.id} onPickCover={(url) => set("cover_url", url)} />
      <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-2 border-t border-border bg-popover p-4">
        <Button variant="hero" size="lg" onClick={save} disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} שמירה
        </Button>
      </div>
    </div>
  );
}

function GalleryEditor({ projectId, onPickCover }: { projectId: string; onPickCover: (url: string) => void }) {
  const qc = useQueryClient();
  const { data: images = [], isLoading } = useQuery(adminProjectImagesQuery(projectId));
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "project-images", projectId] });

  useEffect(() => () => void qc.invalidateQueries({ queryKey: ["site-content"] }), [qc]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading(list.length);
    let order = images.reduce((m, i) => Math.max(m, i.sort_order), 0);
    for (const f of list) {
      try {
        const url = await uploadMedia(f, `projects/${projectId}`);
        order += 1;
        await supabase.from("project_images").insert({ project_id: projectId, url, sort_order: order });
      } catch {
        toast.error(`העלאת ${f.name} נכשלה`);
      }
      setUploading((n) => n - 1);
    }
    if (input.current) input.current.value = "";
    refresh();
    toast.success("התמונות נוספו לגלריה");
  }

  async function remove(id: string, url: string) {
    await supabase.from("project_images").delete().eq("id", id);
    await removeMedia(url);
    refresh();
  }

  async function move(i: number, dirn: -1 | 1) {
    const a = images[i];
    const b = images[i + dirn];
    if (!a || !b) return;
    await Promise.all([
      supabase.from("project_images").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("project_images").update({ sort_order: a.sort_order === b.sort_order ? a.sort_order + dirn : a.sort_order }).eq("id", b.id),
    ]);
    refresh();
  }

  return (
    <div className="space-y-3 border-t border-border pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">גלריית תמונות</div>
          <div className="text-xs text-muted-foreground">אפשר לבחור כמה תמונות בבת אחת. התמונות נשמרות מיד.</div>
        </div>
        <Button variant="gold" size="sm" onClick={() => input.current?.click()} disabled={uploading > 0}>
          {uploading > 0 ? <><Loader2 className="animate-spin" /> מעלה ({uploading})</> : <><ImagePlus /> הוספת תמונות</>}
        </Button>
        <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      </div>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-input p-8 text-center text-sm text-muted-foreground">עדיין אין תמונות בגלריה</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              <AdminImage src={img.url} className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-background/85 p-1.5">
                <div className="flex">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(i, -1)} disabled={i === 0} aria-label="קודם">
                    <ArrowUp />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="הבא">
                    <ArrowDown />
                  </Button>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onPickCover(img.url)} aria-label="קביעה כתמונה ראשית" title="קביעה כתמונה ראשית">
                  <Star />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(img.id, img.url)} aria-label="מחיקה">
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
