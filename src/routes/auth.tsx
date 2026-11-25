import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "כניסת מנהל" },
      { name: "description", content: "כניסה לניהול תוכן האתר." },
      { property: "og:title", content: "כניסת מנהל" },
      { property: "og:description", content: "כניסה לניהול תוכן האתר." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const field = "w-full rounded-xl border border-input bg-background/40 px-4 py-3 text-foreground outline-none focus:border-primary";

function AuthPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(
          error.message.toLowerCase().includes("confirm")
            ? "צריך לאשר את החשבון דרך הקישור שנשלח למייל"
            : "פרטי הכניסה שגויים. בפעם הראשונה צריך קודם ליצור חשבון — לחצי על \"הרשמה\" למטה",
          { duration: 7000 },
        );
      }
      else {
        toast.success("נכנסת בהצלחה");
        navigate({ to: "/admin" });
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else {
        toast.success("נשלח אליך מייל לאישור החשבון. אחרי האישור חוזרים לכאן ונכנסים", { duration: 9000 });
        setMode("in");
      }
    }
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="card-luxe w-full max-w-md space-y-5 p-8">
        <Link to="/" className="eyebrow">← חזרה לאתר</Link>
        <h1 className="text-4xl">{mode === "in" ? "כניסת מנהל" : "יצירת חשבון מנהל"}</h1>
        {mode === "up" && (
          <p className="text-sm text-muted-foreground">החשבון הראשון שנוצר הופך אוטומטית למנהל האתר.</p>
        )}
        <input className={field} type="email" dir="ltr" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={field} type="password" dir="ltr" placeholder="Password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={busy}>
          {mode === "in" ? "כניסה" : "הרשמה"}
        </Button>
        {mode === "in" && (
          <p className="text-center text-sm text-muted-foreground">כניסה ראשונה? קודם צריך ליצור חשבון מנהל.</p>
        )}
        <Button type="button" variant="ghost" className="w-full" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "יצירת חשבון מנהל (הרשמה)" : "יש לך חשבון? כניסה"}
        </Button>
      </form>
    </div>
  );
}
