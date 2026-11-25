import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useSite } from "@/lib/use-site";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { t } = useLang();
  const { c, raw } = useSite();
  const year = new Date().getFullYear();
  const wa = raw("contact_whatsapp").replace(/\D/g, "");
  return (
    <footer className="relative mt-24 border-t border-border">
      <div className="bg-radial-glow pointer-events-none absolute inset-x-0 top-0 h-64" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-3 md:px-8">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{c("hero_subtitle")}</p>
        </div>
        <div className="space-y-4 text-sm">
          <h3 className="eyebrow">{t("contact_details")}</h3>
          {raw("contact_phone") && (
            <a href={`tel:${raw("contact_phone")}`} className="flex items-center gap-3 text-foreground/85 hover:text-primary">
              <Phone className="h-4 w-4 text-primary" />
              <span dir="ltr">{raw("contact_phone")}</span>
            </a>
          )}
          {raw("contact_email") && (
            <a href={`mailto:${raw("contact_email")}`} className="flex items-center gap-3 text-foreground/85 hover:text-primary">
              <Mail className="h-4 w-4 text-primary" />
              {raw("contact_email")}
            </a>
          )}
          {c("contact_address") && (
            <p className="flex items-center gap-3 text-foreground/85">
              <MapPin className="h-4 w-4 text-primary" />
              {c("contact_address")}
            </p>
          )}
        </div>
        <div className="space-y-4 text-sm">
          <h3 className="eyebrow">{t("nav_projects")}</h3>
          <div className="flex flex-col gap-2">
            <Link to="/projects" search={{ category: "kitchen" }} className="text-foreground/85 hover:text-primary">{t("cat_kitchen")}</Link>
            <Link to="/projects" search={{ category: "bedroom" }} className="text-foreground/85 hover:text-primary">{t("cat_bedroom")}</Link>
            <Link to="/projects" search={{ category: "closets" }} className="text-foreground/85 hover:text-primary">{t("cat_closets")}</Link>
          </div>
          <div className="flex gap-3 pt-2">
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary transition-colors hover:border-primary hover:bg-primary/10">
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
            {raw("contact_instagram") && (
              <a href={raw("contact_instagram")} target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary transition-colors hover:border-primary hover:bg-primary/10">
                <Instagram className="h-4 w-4" />
              </a>
            )}
            {raw("contact_facebook") && (
              <a href={raw("contact_facebook")} target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-primary transition-colors hover:border-primary hover:bg-primary/10">
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="gold-line" />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 pb-24 pt-6 text-center text-xs text-muted-foreground md:flex-row md:px-8 md:text-start">
        <span>
          © {year} {c("brand_name")} · {t("footer_rights")}
        </span>
        <span className="text-muted-foreground/80">{t("footer_disclaimer")}</span>
        <Link to="/auth" className="hover:text-primary">
          {t("footer_admin")}
        </Link>
      </div>
    </footer>
  );
}
