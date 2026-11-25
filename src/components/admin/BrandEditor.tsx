import { useEffect, useMemo, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminContentQuery, inputClass, saveContent } from "./admin-data";
import { ImageField } from "./ImageField";
import { SaveBar } from "./ContentEditor";

const imageKeys = ["logo_url", "hero_image", "about_image"] as const;
const contactKeys = [
  { key: "contact_phone", label: "טלפון", placeholder: "050-000-0000" },
  { key: "contact_whatsapp", label: "מספר וואטסאפ (עם קידומת 972, בלי 0)", placeholder: "972500000000" },
  { key: "contact_email", label: "אימייל", placeholder: "name@example.com" },
  { key: "contact_instagram", label: "קישור לאינסטגרם", placeholder: "https://instagram.com/..." },
  { key: "contact_facebook", label: "קישור לפייסבוק", placeholder: "https://facebook.com/..." },
];

/** Logo, main images and contact details. Language-neutral values live in the Hebrew column. */
export function BrandEditor({ onSaved }: { onSaved: () => void }) {
  const { data } = useSuspenseQuery(adminContentQuery);
  const qc = useQueryClient();
  const initial = useMemo(() => {
    const o: Record<string, string> = {};
    for (const k of [...imageKeys, ...contactKeys.map((c) => c.key)]) o[k] = data[k]?.he ?? "";
    return o;
  }, [data]);
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  useEffect(() => setDraft(initial), [initial]);

  const changed = Object.keys(draft).filter((k) => draft[k] !== initial[k]);
  const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  async function save() {
    setBusy(true);
    try {
      await saveContent(changed.map((k) => ({ key: k, he: draft[k] ?? "", en: data[k]?.en ?? "" })));
      await qc.invalidateQueries({ queryKey: ["admin", "content"] });
      onSaved();
      toast.success("נשמר בהצלחה");
    } catch {
      toast.error("השמירה נכשלה");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-luxe grid gap-8 p-5 md:grid-cols-3 md:p-8">
        <ImageField
          label="לוגו"
          hint="מומלץ PNG עם רקע שקוף. בלי לוגו יוצג שם העסק."
          folder="brand"
          value={draft["logo_url"] ?? ""}
          onChange={(v) => set("logo_url", v)}
          aspect="aspect-[3/2]"
          contain
        />
        <ImageField
          label="תמונה ראשית (פתיח)"
          hint="תמונה רחבה ואיכותית, לרוחב."
          folder="brand"
          value={draft["hero_image"] ?? ""}
          onChange={(v) => set("hero_image", v)}
          aspect="aspect-[3/2]"
        />
        <ImageField
          label="תמונת אודות"
          hint="תמונה לאורך — שלך או של הסטודיו."
          folder="brand"
          value={draft["about_image"] ?? ""}
          onChange={(v) => set("about_image", v)}
          aspect="aspect-[3/2]"
        />
      </div>
      <div className="card-luxe space-y-5 p-5 md:p-8">
        <h2 className="text-3xl">פרטי התקשרות</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {contactKeys.map((c) => (
            <label key={c.key} className="space-y-1">
              <span className="text-sm text-foreground">{c.label}</span>
              <input dir="ltr" className={inputClass} placeholder={c.placeholder} value={draft[c.key] ?? ""} onChange={(e) => set(c.key, e.target.value)} />
            </label>
          ))}
        </div>
      </div>
      <SaveBar count={changed.length} busy={busy} onSave={save} />
    </div>
  );
}
