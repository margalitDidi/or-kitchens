import { useEffect, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { adminTestimonialsQuery, inputClass } from "./admin-data";
import { SaveBar } from "./ContentEditor";
import type { TestimonialRow } from "@/lib/site.functions";

export function TestimonialsEditor({ onSaved }: { onSaved: () => void }) {
  const { data } = useSuspenseQuery(adminTestimonialsQuery);
  const qc = useQueryClient();
  const [rows, setRows] = useState<TestimonialRow[]>(data);
  const [busy, setBusy] = useState(false);
  useEffect(() => setRows(data), [data]);

  const changed = rows.filter((r) => {
    const o = data.find((d) => d.id === r.id);
    return !o || o.name_he !== r.name_he || o.name_en !== r.name_en || o.text_he !== r.text_he || o.text_en !== r.text_en;
  });
  const set = (id: string, k: keyof TestimonialRow, v: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [k]: v } : r)));

  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["admin", "testimonials"] });
    onSaved();
  };

  async function add() {
    const { error } = await supabase.from("testimonials").insert({ name_he: "שם הלקוח", text_he: "", sort_order: rows.length + 1 });
    if (error) { toast.error("ההוספה נכשלה"); return; }
    refresh();
  }
  async function remove(id: string) {
    if (!window.confirm("למחוק את ההמלצה?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    refresh();
  }
  async function save() {
    setBusy(true);
    const results = await Promise.all(
      changed.map((r) =>
        supabase.from("testimonials").update({ name_he: r.name_he, name_en: r.name_en, text_he: r.text_he, text_en: r.text_en }).eq("id", r.id),
      ),
    );
    setBusy(false);
    if (results.some((r) => r.error)) { toast.error("השמירה נכשלה"); return; }
    toast.success("ההמלצות נשמרו");
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="hero" size="lg" onClick={add}>
          <Plus /> המלצה חדשה
        </Button>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="card-luxe space-y-3 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <input className={inputClass} placeholder="שם (עברית)" value={r.name_he} onChange={(e) => set(r.id, "name_he", e.target.value)} />
            <input className={inputClass} dir="ltr" placeholder="Name (English)" value={r.name_en} onChange={(e) => set(r.id, "name_en", e.target.value)} />
            <textarea rows={3} className={inputClass} placeholder="ההמלצה (עברית)" value={r.text_he} onChange={(e) => set(r.id, "text_he", e.target.value)} />
            <textarea rows={3} className={inputClass} dir="ltr" placeholder="Testimonial (English)" value={r.text_en} onChange={(e) => set(r.id, "text_en", e.target.value)} />
          </div>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(r.id)}>
            <Trash2 /> מחיקה
          </Button>
        </div>
      ))}
      <SaveBar count={changed.length} busy={busy} onSave={save} />
    </div>
  );
}
