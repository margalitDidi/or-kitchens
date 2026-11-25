import { Link } from "@tanstack/react-router";
import { useSite } from "@/lib/use-site";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const { c, raw } = useSite();
  const logo = raw("logo_url");
  const name = c("brand_name");
  return (
    <Link to="/" className={cn("group flex items-center gap-3", className)} aria-label={name}>
      {logo ? (
        <img src={logo} alt={name} className="h-10 w-auto max-w-[180px] object-contain md:h-12" />
      ) : (
        <span className="flex flex-col leading-none">
          <span className="font-display text-2xl tracking-wide text-foreground md:text-[1.7rem]">{name}</span>
          <span className="eyebrow mt-1.5 text-[0.6rem]">{c("brand_tagline")}</span>
        </span>
      )}
    </Link>
  );
}
