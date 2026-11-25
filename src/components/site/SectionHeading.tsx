import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <div className={cn("mb-5 flex items-center gap-4", align === "center" && "justify-center")}>
          <span className="h-px w-10 bg-primary/60" />
          <span className="eyebrow">{eyebrow}</span>
          {align === "center" && <span className="h-px w-10 bg-primary/60" />}
        </div>
      )}
      <h2 className="text-4xl leading-[1.1] text-foreground md:text-6xl">{title}</h2>
      {subtitle && <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{subtitle}</p>}
    </Reveal>
  );
}
