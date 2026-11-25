import type { ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { useSite } from "@/lib/use-site";
import { useLang } from "@/lib/i18n";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteShell({ children }: { children: ReactNode }) {
  const { raw } = useSite();
  const { t } = useLang();
  const wa = raw("contact_whatsapp").replace(/\D/g, "");
  return (
    <div className="grain min-h-screen overflow-x-clip">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noreferrer"
          aria-label={t("cta_whatsapp")}
          className="bg-gradient-gold shadow-gold fixed bottom-4 end-4 z-40 flex h-12 w-12 items-center justify-center rounded-full text-primary-foreground transition-transform hover:scale-110 md:bottom-5 md:end-5 md:h-14 md:w-14"
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        </a>
      )}
    </div>
  );
}
