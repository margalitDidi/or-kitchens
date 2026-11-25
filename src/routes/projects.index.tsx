import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { siteContentQuery } from "@/lib/site-queries";
import { CATEGORIES, categoryKey, useSite, type Category } from "@/lib/use-site";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/")({
  validateSearch: (s: Record<string, unknown>): { category?: Category } => {
    const c = s["category"];
    if (c === "bathroom") return { category: "bedroom" };
    return c === "kitchen" || c === "bedroom" || c === "closets" ? { category: c } : {};
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery()),
  head: () => ({
    meta: [
      { title: "כל העבודות · OR KITCHENS" },
      { name: "description", content: "מבחר פרויקטים בעיצוב אישי: מטבחים, חדרי שינה, ארונות ונגרות משלימה." },
      { property: "og:title", content: "כל העבודות · OR KITCHENS" },
      { property: "og:description", content: "מבחר פרויקטים בעיצוב אישי: מטבחים, חדרי שינה, ארונות ונגרות משלימה." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, galleryCounts } = useSite();
  const { t } = useLang();
  const { category } = Route.useSearch();
  const matchesCat = (cat: string, target: Category) =>
    cat === target || (target === "bedroom" && cat === "bathroom");
  const list = category ? projects.filter((p) => matchesCat(p.category, category)) : projects;
  const tabs: { v: Category | undefined; label: string; count: number }[] = [
    { v: undefined, label: t("cat_all"), count: projects.length },
    ...CATEGORIES.map((c) => ({
      v: c,
      label: t(categoryKey(c)),
      count: projects.filter((p) => matchesCat(p.category, c)).length,
    })),
  ];
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 md:px-8 md:pt-40">
        <SectionHeading eyebrow={t("nav_projects")} title={t("projects_title")} subtitle={t("projects_subtitle")} />
        <div className="mt-10 flex flex-wrap gap-2.5 md:mt-12">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to="/projects"
              search={tab.v ? { category: tab.v } : {}}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-all",
                category === tab.v ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground/80 hover:border-primary/50",
              )}
            >
              {tab.label}
              <span className={cn("text-xs tabular-nums", category === tab.v ? "text-primary/80" : "text-muted-foreground")}>
                {tab.count}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-8">
        {list.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">{t("projects_empty")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 100}>
                <ProjectCard project={p} photoCount={galleryCounts[p.id]} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
