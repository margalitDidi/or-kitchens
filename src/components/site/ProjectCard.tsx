import { Link } from "@tanstack/react-router";
import { ArrowUpLeft, ArrowUpRight, Images } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { categoryKey } from "@/lib/use-site";
import type { ProjectRow } from "@/lib/site.functions";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  className,
  aspect = "aspect-[4/5]",
  photoCount,
}: {
  project: ProjectRow;
  className?: string;
  aspect?: string;
  photoCount?: number | undefined;
}) {
  const { t, pick, dir } = useLang();
  const Arrow = dir === "rtl" ? ArrowUpLeft : ArrowUpRight;
  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      className={cn("img-zoom group relative block overflow-hidden rounded-2xl border border-border transition-colors duration-500 hover:border-primary/45", className)}
    >
      <div className={cn("relative w-full overflow-hidden bg-muted", aspect)}>
        {project.cover_url && (
          <img
            src={project.cover_url}
            alt={pick(project, "title")}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent" />
      </div>
      {photoCount && photoCount > 1 && (
        <span className="glass absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-ivory/90">
          <Images className="h-3.5 w-3.5 text-primary" />
          {photoCount} {t("photos_count")}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
        <div>
          <span className="eyebrow text-[0.65rem]">{t(categoryKey(project.category))}</span>
          <h3 className="mt-2 text-2xl text-ivory md:text-3xl">{pick(project, "title")}</h3>
          {pick(project, "location") && (
            <p className="mt-1 text-sm text-ivory/75">{pick(project, "location")}</p>
          )}
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground">
          <Arrow className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
