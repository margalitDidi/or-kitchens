import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUpLeft, ArrowUpRight, BedDouble, ChefHat, Library, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProjectCard } from "@/components/site/ProjectCard";
import { ContactForm } from "@/components/site/ContactForm";
import { siteContentQuery } from "@/lib/site-queries";
import { useSite, type Category } from "@/lib/use-site";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery()),
  head: () => ({
    meta: [
      { title: "OR KITCHENS · תכנון, עיצוב וייצור מטבחים ונגרות בהתאמה אישית" },
      { name: "description", content: "תכנון, עיצוב וייצור מטבחים, חדרי שינה, ארונות ונגרות בהתאמה אישית — מהרעיון וההדמיה ועד התקנה מושלמת." },
      { property: "og:title", content: "OR KITCHENS · תכנון, עיצוב וייצור מטבחים ונגרות בהתאמה אישית" },
      { property: "og:description", content: "תכנון, עיצוב וייצור מטבחים, חדרי שינה, ארונות ונגרות בהתאמה אישית — מהרעיון וההדמיה ועד התקנה מושלמת." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteShell>
      <Hero />
      <Marquee />
      <AboutTeaser />
      <Services />
      <Featured />
      <Process />
      <Testimonials />
      <ContactSection />
    </SiteShell>
  );
}

function Hero() {
  const { c, raw } = useSite();
  const { t } = useLang();
  const hero = raw("hero_image") || "/images/hero-kitchen.jpg";
  const stats = [1, 2, 3].map((n) => ({ v: c(`stat_${n}_value`), l: c(`stat_${n}_label`) }));
  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img src={hero} alt="" className="animate-hero-zoom h-full w-full object-cover" width={1920} height={1088} />
        <div className="bg-hero-fade absolute inset-0" />
        <div className="bg-hero-scrim absolute inset-0" />
      </div>
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-10 pt-28 md:px-8 md:pb-16 md:pt-36">
        <Reveal>
          <span className="glass eyebrow inline-flex items-center gap-3 rounded-full border border-border px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {c("hero_eyebrow")}
          </span>
        </Reveal>
        <Reveal delay={150}>
          <h1 className="mt-6 max-w-4xl text-[2.6rem] leading-[1.06] text-ivory sm:text-6xl md:mt-8 md:text-8xl">
            {c("hero_title")}
          </h1>
        </Reveal>
        <Reveal delay={300}>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/85 sm:text-lg md:mt-8 md:text-xl">{c("hero_subtitle")}</p>
        </Reveal>
        <Reveal delay={450} className="mt-8 flex flex-wrap gap-3 md:mt-10">
          <Button asChild variant="hero" size="xl" className="w-full sm:w-auto">
            <Link to="/contact">{t("cta_consult")}</Link>
          </Button>
          <Button asChild variant="glass" size="xl" className="w-full sm:w-auto">
            <Link to="/projects">{t("cta_view_projects")}</Link>
          </Button>
        </Reveal>
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 md:px-8 md:pb-10">
        <Reveal delay={600} className="glass relative grid grid-cols-3 overflow-hidden rounded-2xl border border-border [&>*+*]:border-s [&>*+*]:border-border">
          <span className="gold-line pointer-events-none absolute inset-x-0 top-0" aria-hidden />
          {stats.map((s) => (
            <div key={s.l} className="px-2.5 py-4 text-center md:px-8 md:py-7">
              <div className="font-display text-2xl tabular-nums text-gradient-gold sm:text-3xl md:text-5xl">{s.v}</div>
              <div className="mt-1 text-[0.72rem] leading-snug text-ivory/75 md:text-sm">{s.l}</div>
            </div>
          ))}
        </Reveal>
        <div className="mt-6 hidden justify-center md:flex">
          <ArrowDown className="h-5 w-5 animate-float-slow text-primary/70" />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const { t } = useLang();
  const words = [t("cat_kitchen"), t("cat_bedroom"), t("cat_closets"), t("cat_kitchen"), t("cat_bedroom"), t("cat_closets")];
  return (
    <div className="overflow-hidden border-y border-border py-6" dir="ltr">
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
        {[...words, ...words].map((w, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-3xl text-foreground/40 md:text-5xl">
            {w}
            <span className="text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function AboutTeaser() {
  const { c, raw } = useSite();
  const { t } = useLang();
  const img = raw("about_image") || "/images/designer-studio.jpg";
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-28 md:grid-cols-2 md:px-8 md:py-36">
      <Reveal className="relative">
        <div className="img-zoom overflow-hidden rounded-3xl border border-border">
          <img src={img} alt={c("about_title")} loading="lazy" className="aspect-[4/5] w-full object-cover" />
        </div>
        <div className="card-luxe absolute -bottom-8 end-6 hidden max-w-[235px] p-6 md:block">
          <div className="font-display text-5xl text-gradient-gold">360°</div>
          <div className="mt-1 text-sm leading-snug text-muted-foreground">{t("about_badge_label")}</div>
        </div>
      </Reveal>
      <div>
        <SectionHeading eyebrow={t("section_about")} title={c("about_title")} />
        <Reveal delay={150}>
          <p className="mt-8 line-clamp-6 text-lg leading-loose text-muted-foreground">{c("about_text")}</p>
          <Button asChild variant="gold" size="xl" className="mt-10">
            <Link to="/about">{t("cta_read_more")}</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

const serviceMeta: { cat: Category; icon: typeof ChefHat; fallback: string }[] = [
  { cat: "kitchen", icon: ChefHat, fallback: "/images/kitchen-olive.jpg" },
  { cat: "bedroom", icon: BedDouble, fallback: "/images/bedroom-suite.jpg" },
  { cat: "closets", icon: Library, fallback: "/images/living-media-wall.jpg" },
];

function Services() {
  const { c, projects } = useSite();
  const { t, dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowUpLeft : ArrowUpRight;
  return (
    <section className="section-band relative py-24 md:py-36">
      <div className="bg-radial-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t("section_services")} title={t("section_services_title")} align="center" />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {serviceMeta.map(({ cat, icon: Icon, fallback }, i) => {
            const cover = projects.find((p) => p.category === cat && p.cover_url)?.cover_url || fallback;
            const key = cat === "closets" ? "service_closets" : cat === "bedroom" ? "service_bedroom" : "service_kitchen";
            const title = c(`${key}_title`) || (cat === "bedroom" ? c("service_bathroom_title") : "");
            const text = c(`${key}_text`) || (cat === "bedroom" ? c("service_bathroom_text") : "");
            return (
              <Reveal key={cat} delay={i * 120}>
                <Link
                  to="/projects"
                  search={{ category: cat }}
                  className={cn("img-zoom group relative block overflow-hidden rounded-3xl border border-border transition-colors duration-500 hover:border-primary/45", i === 1 && "md:mt-10")}
                >
                  <div className="relative aspect-[3/4]">
                    <img src={cover} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/12 to-ink/0" />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-between p-7">
                    <span className="glass flex h-14 w-14 items-center justify-center rounded-full border border-border text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <span className="font-display text-sm text-primary">0{i + 1}</span>
                      <h3 className="mt-2 text-3xl text-ivory md:text-4xl">{title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-ivory/80">{text}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-primary transition-transform duration-300 group-hover:translate-x-[-4px]">
                        {t("cta_explore")}
                        <Arrow className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const { projects, galleryCounts } = useSite();
  const { t } = useLang();
  const featured = (projects.filter((p) => p.featured).length ? projects.filter((p) => p.featured) : projects).slice(0, 5);
  if (!featured.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <SectionHeading eyebrow={t("section_featured")} title={t("section_featured_title")} />
        <Reveal>
          <Button asChild variant="gold" size="xl">
            <Link to="/projects">{t("cta_all_projects")}</Link>
          </Button>
        </Reveal>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-6">
        {featured.map((p, i) => {
          const span = i === 0 ? "md:col-span-4 md:row-span-2" : i < 3 ? "md:col-span-2" : "md:col-span-3";
          const aspect = i === 0 ? "aspect-[4/5] md:aspect-auto md:h-full md:min-h-[640px]" : i < 3 ? "aspect-[4/5] md:aspect-auto md:h-[308px]" : "aspect-[4/3]";
          return (
            <Reveal key={p.id} delay={(i % 3) * 120} className={span}>
              <ProjectCard project={p} aspect={aspect} photoCount={galleryCounts[p.id]} className="h-full" />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Process() {
  const { c } = useSite();
  const { t } = useLang();
  const steps = [1, 2, 3, 4].map((n) => ({ n, title: c(`process_${n}_title`), text: c(`process_${n}_text`) }));
  return (
    <section className="section-band py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading eyebrow={t("section_process")} title={c("process_title")} align="center" />
        <div className="relative mt-20 grid gap-10 md:grid-cols-4 md:gap-6">
          <div className="gold-line absolute inset-x-0 top-7 hidden md:block" aria-hidden />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 140} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-primary/50 bg-background font-display text-xl text-primary">
                0{s.n}
              </div>
              <h3 className="mt-6 text-2xl text-foreground">{s.title}</h3>
              <p className="mx-auto mt-3 max-w-[260px] text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { testimonials } = useSite();
  const { t, pick } = useLang();
  if (!testimonials.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-28 md:px-8 md:py-36">
      <SectionHeading eyebrow={t("section_testimonials")} title={t("section_testimonials_title")} align="center" />
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {testimonials.map((tm, i) => (
          <Reveal key={tm.id} delay={i * 120}>
            <figure className="card-luxe flex h-full flex-col justify-between p-8">
              <Quote className="h-8 w-8 text-primary/60" />
              <blockquote className="mt-6 flex-1 font-display text-xl leading-relaxed text-foreground">
                “{pick(tm, "text")}”
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3 text-sm text-primary">
                <span className="h-px w-8 bg-primary/60" />
                {pick(tm, "name")}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const { c } = useSite();
  const { t } = useLang();
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-20 md:px-8">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <SectionHeading eyebrow={t("section_contact")} title={c("cta_title")} subtitle={c("cta_text")} />
        </div>
        <Reveal delay={150}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
