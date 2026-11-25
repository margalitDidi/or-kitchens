import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { Lightbox } from "@/components/site/Lightbox";
import { Button } from "@/components/ui/button";
import { projectQuery, siteContentQuery } from "@/lib/site-queries";
import { categoryKey } from "@/lib/use-site";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/projects/$id")({
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(siteContentQuery()),
      context.queryClient.ensureQueryData(projectQuery(params.id)),
    ]);
  },
  head: () => ({
    meta: [
      { title: "פרויקט · OR KITCHENS" },
      { name: "description", content: "גלריית פרויקט בעיצוב אישי — מטבחים, חדרי שינה, ארונות ונגרות משלימה." },
      { property: "og:title", content: "פרויקט · OR KITCHENS" },
      { property: "og:description", content: "גלריית פרויקט בעיצוב אישי — מטבחים, חדרי שינה, ארונות ונגרות משלימה." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(projectQuery(id));
  const { t, pick, dir } = useLang();
  const [index, setIndex] = useState<number | null>(null);
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;

  if (!data.project) {
    return (
      <SiteShell>
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-5 pt-32 text-center">
          <h1 className="text-4xl">{t("project_not_found")}</h1>
          <Button asChild variant="gold" size="xl">
            <Link to="/projects">{t("project_back")}</Link>
          </Button>
        </div>
      </SiteShell>
    );
  }

  const p = data.project;
  const images = data.images.length ? data.images.map((i) => i.url) : p.cover_url ? [p.cover_url] : [];

  return (
    <SiteShell>
      <section className="relative h-[75svh] overflow-hidden">
        {p.cover_url && <img src={p.cover_url} alt={pick(p, "title")} className="animate-hero-zoom h-full w-full object-cover" />}
        <div className="bg-hero-fade absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-14 md:px-8">
          <Link to="/projects" className="mb-6 inline-flex items-center gap-2 text-sm text-ivory/80 hover:text-primary">
            <Back className="h-4 w-4" /> {t("project_back")}
          </Link>
          <span className="eyebrow block">{t(categoryKey(p.category))}</span>
          <h1 className="mt-3 text-5xl text-ivory md:text-7xl">{pick(p, "title")}</h1>
          {pick(p, "location") && <p className="mt-3 text-ivory/75">{pick(p, "location")}</p>}
        </div>
      </section>
      {pick(p, "description") && (
        <section className="mx-auto max-w-3xl px-5 py-20 md:px-8">
          <Reveal>
            <p className="font-display text-2xl leading-relaxed text-foreground md:text-3xl">{pick(p, "description")}</p>
          </Reveal>
        </section>
      )}
      {images.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-10 md:px-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="eyebrow">{t("project_gallery")}</h2>
            <span className="text-xs tabular-nums text-muted-foreground">
              {images.length} {t("photos_count")}
            </span>
          </div>
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
            {images.map((src, i) => (
              <Reveal key={src + i} delay={(i % 3) * 100} className="mb-6 break-inside-avoid">
                <button type="button" onClick={() => setIndex(i)} className="img-zoom block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border transition-colors duration-300 hover:border-primary/45">
                  <img src={src} alt={pick(p, "title")} loading="lazy" className="w-full object-cover" />
                </button>
              </Reveal>
            ))}
          </div>
        </section>
      )}
      <Lightbox images={images} index={index} onClose={() => setIndex(null)} onIndex={setIndex} alt={pick(p, "title")} />
    </SiteShell>
  );
}
