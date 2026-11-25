import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ExternalLink, Image as ImageIcon, Inbox, LayoutGrid, Loader2, LogOut, MessageSquareQuote, Type } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { BrandEditor } from "@/components/admin/BrandEditor";
import { ProjectsEditor } from "@/components/admin/ProjectsEditor";
import { TestimonialsEditor } from "@/components/admin/TestimonialsEditor";
import { LeadsList } from "@/components/admin/LeadsList";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "ניהול האתר" },
      { name: "description", content: "עריכת טקסטים, תמונות ופרויקטים באתר." },
      { property: "og:title", content: "ניהול האתר" },
      { property: "og:description", content: "עריכת טקסטים, תמונות ופרויקטים באתר." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const tabs = [
  { id: "projects", label: "פרויקטים וגלריה", icon: LayoutGrid },
  { id: "texts", label: "טקסטים", icon: Type },
  { id: "brand", label: "לוגו, תמונות ופרטי קשר", icon: ImageIcon },
  { id: "testimonials", label: "המלצות", icon: MessageSquareQuote },
  { id: "leads", label: "פניות", icon: Inbox },
] as const;
type TabId = (typeof tabs)[number]["id"];

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabId>("projects");

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["admin", "is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });

  const onSaved = () => qc.invalidateQueries({ queryKey: ["site-content"] });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="text-4xl">אין לך הרשאת ניהול</h1>
        <p className="text-muted-foreground">החשבון הזה אינו חשבון המנהל של האתר.</p>
        <Button variant="gold" onClick={signOut}>יציאה</Button>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen pb-28">
      <header className="glass sticky top-0 z-30 border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <div className="eyebrow text-[0.65rem]">ניהול האתר</div>
            <div className="text-xs text-muted-foreground" dir="ltr">{user.email}</div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="gold" size="sm">
              <Link to="/" target="_blank"><ExternalLink /> צפייה באתר</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut /> יציאה
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-foreground/75 hover:bg-muted",
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Suspense fallback={<Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-primary" />}>
          {tab === "projects" && <ProjectsEditor onSaved={onSaved} />}
          {tab === "texts" && <ContentEditor onSaved={onSaved} />}
          {tab === "brand" && <BrandEditor onSaved={onSaved} />}
          {tab === "testimonials" && <TestimonialsEditor onSaved={onSaved} />}
          {tab === "leads" && <LeadsList />}
        </Suspense>
      </main>
    </div>
  );
}
