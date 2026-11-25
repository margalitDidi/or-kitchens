import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { siteContentQuery } from "@/lib/site-queries";
import { useSite } from "@/lib/use-site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery()),
  head: () => ({
    meta: [
      { title: "אודות · OR KITCHENS" },
      { name: "description", content: "תכנון, עיצוב וייצור מטבחים, חדרי שינה, ארונות ונגרות בהתאמה אישית — מהרעיון ועד התקנה מושלמת." },
      { property: "og:title", content: "אודות · OR KITCHENS" },
      { property: "og:description", content: "תכנון, עיצוב וייצור מטבחים, חדרי שינה, ארונות ונגרות בהתאמה אישית — מהרעיון ועד התקנה מושלמת." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { c, raw } = useSite();
  const { t } = useLang();
  const img = raw("about_image") || "/images/designer-studio.jpg";
  const stats = [1, 2, 3].map((n) => ({ v: c(`stat_${n}_value`), l: c(`stat_${n}_label`) }));
  const steps = [1, 2, 3, 4].map((n) => ({ n, title: c(`process_${n}_title`), text: c(`process_${n}_text`) }));
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-40 md:grid-cols-2 md:px-8">
        <div>
          <SectionHeading eyebrow={t("section_about")} title={c("about_title")} />
          <Reveal delay={150}>
            <p className="mt-8 whitespace-pre-line text-lg leading-loose text-muted-foreground">{c("about_text")}</p>
            <Button asChild variant="hero" size="xl" className="mt-10">
              <Link to="/contact">{t("cta_consult")}</Link>
            </Button>
          </Reveal>
        </div>
        <Reveal className="img-zoom overflow-hidden rounded-3xl border border-border">
          <img src={img} alt={c("about_title")} className="aspect-[4/5] w-full object-cover" />
        </Reveal>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="grid grid-cols-3 rounded-2xl border border-border [&>*+*]:border-s [&>*+*]:border-border">
          {stats.map((s) => (
            <div key={s.l} className="px-3 py-8 text-center">
              <div className="font-display text-4xl text-gradient-gold md:text-6xl">{s.v}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <SectionHeading eyebrow={t("section_process")} title={c("process_title")} />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={(i % 2) * 120} className="card-luxe p-8">
              <span className="font-display text-3xl text-primary">0{s.n}</span>
              <h3 className="mt-4 text-3xl">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
