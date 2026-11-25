import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ContactForm } from "@/components/site/ContactForm";
import { Reveal } from "@/components/site/Reveal";
import { siteContentQuery } from "@/lib/site-queries";
import { useSite } from "@/lib/use-site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery()),
  head: () => ({
    meta: [
      { title: "צור קשר · OR KITCHENS" },
      { name: "description", content: "תיאום פגישת ייעוץ ותכנון למטבחים, חדרי שינה, ארונות ונגרות בהתאמה אישית." },
      { property: "og:title", content: "צור קשר · OR KITCHENS" },
      { property: "og:description", content: "תיאום פגישת ייעוץ ותכנון למטבחים, חדרי שינה, ארונות ונגרות בהתאמה אישית." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { c, raw } = useSite();
  const { t } = useLang();
  const wa = raw("contact_whatsapp").replace(/\D/g, "");
  const items = [
    raw("contact_phone") && { icon: Phone, label: t("form_phone"), value: raw("contact_phone"), href: `tel:${raw("contact_phone")}`, ltr: true },
    wa && { icon: MessageCircle, label: "WhatsApp", value: t("cta_whatsapp"), href: `https://wa.me/${wa}` },
    raw("contact_email") && { icon: Mail, label: "Email", value: raw("contact_email"), href: `mailto:${raw("contact_email")}` },
    c("contact_address") && { icon: MapPin, label: t("contact_area"), value: c("contact_address") },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string; ltr?: boolean }[];

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-40 md:grid-cols-2 md:px-8">
        <div>
          <SectionHeading eyebrow={t("section_contact")} title={t("contact_title")} subtitle={c("cta_text")} />
          <div className="mt-12 space-y-4">
            {items.map((it, i) => (
              <Reveal key={it.label} delay={i * 100}>
                <a href={it.href} target={it.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="card-luxe flex items-center gap-5 p-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 text-primary">
                    <it.icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">{it.label}</span>
                    <span className="text-lg text-foreground" dir={it.ltr ? "ltr" : undefined}>{it.value}</span>
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150}>
          <ContactForm />
        </Reveal>
      </section>
    </SiteShell>
  );
}
