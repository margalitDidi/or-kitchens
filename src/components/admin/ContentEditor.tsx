import { useEffect, useMemo, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminContentQuery, inputClass, saveContent } from "./admin-data";
import { cn } from "@/lib/utils";

type Field = { key: string; label: string; long?: boolean };
type Group = { title: string; fields: Field[] };

const groups: Group[] = [
  {
    title: "שם העסק",
    fields: [
      { key: "brand_name", label: "שם העסק" },
      { key: "brand_tagline", label: "שורת תיאור קצרה (מתחת לשם)" },
    ],
  },
  {
    title: "פתיח – דף הבית",
    fields: [
      { key: "hero_eyebrow", label: "שורה קטנה מעל הכותרת" },
      { key: "hero_title", label: "כותרת ראשית", long: true },
      { key: "hero_subtitle", label: "טקסט מתחת לכותרת", long: true },
    ],
  },
  {
    title: "מספרים",
    fields: [
      { key: "stat_1_value", label: "מספר 1" },
      { key: "stat_1_label", label: "תיאור מספר 1" },
      { key: "stat_2_value", label: "מספר 2" },
      { key: "stat_2_label", label: "תיאור מספר 2" },
      { key: "stat_3_value", label: "מספר 3" },
      { key: "stat_3_label", label: "תיאור מספר 3" },
    ],
  },
  {
    title: "אודות",
    fields: [
      { key: "about_title", label: "כותרת" },
      { key: "about_text", label: "טקסט אודות", long: true },
    ],
  },
  {
    title: "תחומי התמחות",
    fields: [
      { key: "service_kitchen_title", label: "מטבחי יוקרה – כותרת" },
      { key: "service_kitchen_text", label: "מטבחי יוקרה – תיאור", long: true },
      { key: "service_bedroom_title", label: "חדרי שינה וארונות – כותרת" },
      { key: "service_bedroom_text", label: "חדרי שינה וארונות – תיאור", long: true },
      { key: "service_closets_title", label: "ספריות ונגרות משלימה – כותרת" },
      { key: "service_closets_text", label: "ספריות ונגרות משלימה – תיאור", long: true },
    ],
  },
  {
    title: "תהליך העבודה",
    fields: [
      { key: "process_title", label: "כותרת" },
      { key: "process_1_title", label: "שלב 1 – כותרת" },
      { key: "process_1_text", label: "שלב 1 – תיאור", long: true },
      { key: "process_2_title", label: "שלב 2 – כותרת" },
      { key: "process_2_text", label: "שלב 2 – תיאור", long: true },
      { key: "process_3_title", label: "שלב 3 – כותרת" },
      { key: "process_3_text", label: "שלב 3 – תיאור", long: true },
      { key: "process_4_title", label: "שלב 4 – כותרת" },
      { key: "process_4_text", label: "שלב 4 – תיאור", long: true },
    ],
  },
  {
    title: "הזמנה ליצירת קשר",
    fields: [
      { key: "cta_title", label: "כותרת" },
      { key: "cta_text", label: "טקסט", long: true },
      { key: "contact_address", label: "אזור פעילות / כתובת" },
    ],
  },
];

export function ContentEditor({ onSaved }: { onSaved: () => void }) {
  const { data } = useSuspenseQuery(adminContentQuery);
  const qc = useQueryClient();
  const [draft, setDraft] = useState(data);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => setDraft(data), [data]);

  const changed = useMemo(
    () =>
      Object.keys(draft).filter((k) => draft[k]?.he !== data[k]?.he || draft[k]?.en !== data[k]?.en),
    [draft, data],
  );

  const set = (key: string, lang: "he" | "en", v: string) =>
    setDraft((d) => ({ ...d, [key]: { he: d[key]?.he ?? "", en: d[key]?.en ?? "", [lang]: v } }));

  async function save() {
    setBusy(true);
    try {
      await saveContent(changed.map((k) => ({ key: k, he: draft[k]!.he, en: draft[k]!.en })));
      await qc.invalidateQueries({ queryKey: ["admin", "content"] });
      onSaved();
      toast.success("הטקסטים נשמרו ומופיעים באתר");
    } catch (e) {
      toast.error("השמירה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  const group = groups[active]!;

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {groups.map((g, i) => (
          <button
            key={g.title}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "shrink-0 rounded-lg px-4 py-2.5 text-start text-sm transition-colors",
              i === active ? "bg-primary/15 text-primary" : "text-foreground/75 hover:bg-muted",
            )}
          >
            {g.title}
          </button>
        ))}
      </nav>
      <div className="card-luxe space-y-6 p-5 md:p-8">
        <h2 className="text-3xl">{group.title}</h2>
        {group.fields.map((f) => (
          <div key={f.key} className="space-y-2 border-b border-border pb-6 last:border-0">
            <div className="text-sm font-semibold text-foreground">{f.label}</div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">עברית</span>
                {f.long ? (
                  <textarea rows={4} className={inputClass} value={draft[f.key]?.he ?? ""} onChange={(e) => set(f.key, "he", e.target.value)} />
                ) : (
                  <input className={inputClass} value={draft[f.key]?.he ?? ""} onChange={(e) => set(f.key, "he", e.target.value)} />
                )}
              </label>
              <label className="space-y-1">
                <span className="text-xs text-muted-foreground">English</span>
                {f.long ? (
                  <textarea rows={4} dir="ltr" className={inputClass} value={draft[f.key]?.en ?? ""} onChange={(e) => set(f.key, "en", e.target.value)} />
                ) : (
                  <input dir="ltr" className={inputClass} value={draft[f.key]?.en ?? ""} onChange={(e) => set(f.key, "en", e.target.value)} />
                )}
              </label>
            </div>
          </div>
        ))}
      </div>
      <SaveBar count={changed.length} busy={busy} onSave={save} />
    </div>
  );
}

export function SaveBar({ count, busy, onSave }: { count: number; busy: boolean; onSave: () => void }) {
  if (!count) return null;
  return (
    <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <span className="text-sm text-muted-foreground">{count} שינויים שלא נשמרו</span>
        <Button variant="hero" size="lg" onClick={onSave} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Save />} שמירת שינויים
        </Button>
      </div>
    </div>
  );
}
