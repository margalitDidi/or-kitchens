import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useSite } from "@/lib/use-site";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(6).max(30).regex(/^[\d+\-\s()]+$/),
  email: z.union([z.literal(""), z.string().trim().email().max(255)]),
  project_type: z.string().max(50),
  message: z.string().trim().max(2000),
});

const fieldClass =
  "w-full rounded-xl border border-input bg-background/40 px-4 py-3.5 text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary";

export function ContactForm({ className }: { className?: string }) {
  const { t } = useLang();
  const { raw } = useSite();
  const wa = raw("contact_whatsapp").replace(/\D/g, "");
  const [type, setType] = useState("kitchen");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [invalid, setInvalid] = useState<string[]>([]);

  const types = [
    { v: "kitchen", label: t("cat_kitchen") },
    { v: "bedroom", label: t("cat_bedroom") },
    { v: "closets", label: t("cat_closets") },
    { v: "other", label: t("form_other") },
  ];

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name") ?? "",
      phone: fd.get("phone") ?? "",
      email: fd.get("email") ?? "",
      project_type: type,
      message: fd.get("message") ?? "",
    });
    if (!parsed.success) {
      setInvalid(parsed.error.issues.map((i) => String(i.path[0])));
      return;
    }
    setInvalid([]);
    setStatus("sending");
    const { error } = await supabase.from("leads").insert(parsed.data);
    setStatus(error ? "error" : "done");
  }

  if (status === "done") {
    return (
      <div className={cn("card-luxe flex flex-col items-center justify-center gap-4 p-12 text-center", className)}>
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <p className="font-display text-2xl text-foreground">{t("form_success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("card-luxe space-y-5 p-6 md:p-10", className)} noValidate>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-muted-foreground">{t("form_name")}</span>
          <input name="name" maxLength={100} className={cn(fieldClass, invalid.includes("name") && "border-destructive")} />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-muted-foreground">{t("form_phone")}</span>
          <input name="phone" type="tel" dir="ltr" maxLength={30} className={cn(fieldClass, "text-start", invalid.includes("phone") && "border-destructive")} />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">{t("form_email")}</span>
        <input name="email" type="email" dir="ltr" maxLength={255} className={cn(fieldClass, "text-start", invalid.includes("email") && "border-destructive")} />
      </label>
      <div className="space-y-2">
        <span className="text-sm text-muted-foreground">{t("form_type")}</span>
        <div className="flex flex-wrap gap-2">
          {types.map((o) => (
            <button
              type="button"
              key={o.v}
              onClick={() => setType(o.v)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-all",
                type === o.v ? "border-primary bg-primary/15 text-primary" : "border-input text-foreground/80 hover:border-primary/50",
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <label className="block space-y-2">
        <span className="text-sm text-muted-foreground">{t("form_message")}</span>
        <textarea name="message" rows={4} maxLength={2000} className={cn(fieldClass, "resize-none")} />
      </label>
      {status === "error" && <p className="text-sm text-destructive">{t("form_error")}</p>}
      <Button type="submit" variant="hero" size="xl" className="w-full" disabled={status === "sending"}>
        {status === "sending" ? t("form_sending") : t("form_submit")}
      </Button>
      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 pt-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <MessageCircle className="h-4 w-4 text-primary" />
          {t("form_whatsapp_alt")}
        </a>
      )}
    </form>
  );
}
