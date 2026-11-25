import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, type UiKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const links: { to: "/" | "/projects" | "/about" | "/contact"; key: UiKey }[] = [
  { to: "/", key: "nav_home" },
  { to: "/projects", key: "nav_projects" },
  { to: "/about", key: "nav_about" },
  { to: "/contact", key: "nav_contact" },
];

export function SiteHeader() {
  const { t, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass border-b border-border py-3" : "py-6",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Logo />

        <nav className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="relative text-sm tracking-wide text-foreground/80 transition-colors hover:text-primary data-[status=active]:text-primary"
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={toggle}
            className="h-9 min-w-11 rounded-full border border-border px-3 text-xs font-semibold tracking-widest text-foreground/80 transition-colors hover:border-primary hover:text-primary"
            aria-label="Switch language"
          >
            {t("lang_switch")}
          </button>
          <Button asChild variant="hero" size="lg" className="hidden md:inline-flex">
            <Link to="/contact">{t("cta_consult")}</Link>
          </Button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
            onClick={() => setOpen(true)}
            aria-label={t("menu")}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-background transition-all duration-500 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="bg-radial-glow absolute inset-0" aria-hidden />
        <div className="relative flex items-center justify-between px-5 py-6">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
            aria-label={t("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="relative flex flex-1 flex-col justify-center gap-2 px-8">
          {links.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: l.to === "/" }}
              className={cn(
                "font-display text-5xl text-foreground transition-all duration-700 data-[status=active]:text-primary",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
              style={{ transitionDelay: open ? `${120 + i * 80}ms` : "0ms" }}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
        <div className="relative p-8">
          <Button asChild variant="hero" size="xl" className="w-full">
            <Link to="/contact" onClick={() => setOpen(false)}>
              {t("cta_consult")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
