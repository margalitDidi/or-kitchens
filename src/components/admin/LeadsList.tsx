import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Check, Mail, Phone, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { adminLeadsQuery } from "./admin-data";
import { cn } from "@/lib/utils";

const typeLabel: Record<string, string> = { kitchen: "מטבח", bathroom: "חדר רחצה", closets: "ארונות וספריות", other: "אחר" };

export function LeadsList() {
  const { data } = useSuspenseQuery(adminLeadsQuery);
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "leads"] });

  if (!data.length) {
    return <div className="card-luxe p-12 text-center text-muted-foreground">עדיין לא התקבלו פניות מהאתר.</div>;
  }
  return (
    <div className="space-y-3">
      {data.map((l) => (
        <div key={l.id} className={cn("card-luxe flex flex-col gap-3 p-5 md:flex-row md:items-center", l.handled && "opacity-55")}>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-xl">{l.name}</span>
              {l.project_type && <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs text-primary">{typeLabel[l.project_type] ?? l.project_type}</span>}
              <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("he-IL")}</span>
            </div>
            {l.message && <p className="text-sm text-muted-foreground">{l.message}</p>}
            <div className="flex flex-wrap gap-4 text-sm">
              <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 text-primary" dir="ltr"><Phone className="h-3.5 w-3.5" /> {l.phone}</a>
              {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 text-primary"><Mail className="h-3.5 w-3.5" /> {l.email}</a>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="gold"
              onClick={async () => {
                await supabase.from("leads").update({ handled: !l.handled }).eq("id", l.id);
                refresh();
              }}
            >
              <Check /> {l.handled ? "סמני כחדש" : "טופל"}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              aria-label="מחיקה"
              onClick={async () => {
                if (!window.confirm("למחוק את הפנייה?")) return;
                await supabase.from("leads").delete().eq("id", l.id);
                refresh();
              }}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
