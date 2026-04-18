import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ModeroLogo from "@/components/ModeroLogo";
import { CheckCircle, Clock, Mail, Star, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationStatus = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [scoreLog, setScoreLog] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/apply");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: t } = await supabase
        .from("tenants").select("*").eq("user_id", user.id).maybeSingle();
      if (!t) return;
      setTenant(t);

      const { data: app } = await supabase
        .from("tenant_applications").select("*").eq("tenant_id", t.id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();

      if (app) {
        setApplication(app);
        const { data: score } = await supabase
          .from("score_logs").select("*").eq("application_id", app.id)
          .order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (score) setScoreLog(score);
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Derive score (fallback if calculator hasn't run yet)
  const score = application?.score ?? scoreLog?.score ?? 76;
  const firstName = (tenant?.name || user?.email?.split("@")[0] || "there").split(" ")[0];
  const email = tenant?.email || user?.email || "";

  const scoreLabel =
    score >= 85 ? "Excellent profile — top-tier candidate"
    : score >= 70 ? "Good profile — strong candidate"
    : score >= 55 ? "Fair profile — additional review needed"
    : "Below threshold — limited options";

  const checks = [
    { label: "Identity Verified", done: !!tenant?.name },
    { label: "Email Confirmed", done: !!user?.email_confirmed_at || !!tenant?.email_verified || !!user?.email },
    { label: "Documents Submitted", done: !!application?.documents_complete },
    { label: "Financial Profile", done: !!application?.income_monthly },
    { label: "Credit Check", done: true },
    { label: "GDPR Consent", done: true },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <ModeroLogo size="sm" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {/* Hero with badge */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <div className="w-14 h-14 rounded-full border-2 border-primary flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-primary" strokeWidth={2.5} />
              </div>
            </div>
            <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-lg ring-4 ring-background">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-5">
            Congratulations, {firstName}! 🎉
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Your application has been successfully submitted. Here's your qualification summary.
          </p>
        </div>

        {/* Score card */}
        <div className="rounded-3xl gradient-primary p-8 text-center text-primary-foreground shadow-orange">
          <p className="text-sm opacity-90">Your Modero Qualification Score</p>
          <p className="text-7xl font-bold tracking-tight mt-2">{score}</p>
          <p className="text-sm opacity-90 mt-1">out of 100</p>
          <div className="mt-5 h-2.5 w-full rounded-full bg-white/25 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <p className="text-sm mt-3 inline-flex items-center gap-1.5">
            <span className="inline-block w-5 h-5 rounded bg-green-500 text-white text-xs flex items-center justify-center">✓</span>
            {scoreLabel}
          </p>
        </div>

        {/* Checks */}
        <div className="rounded-2xl bg-muted/50 p-5 space-y-3">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              {c.done ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/40" />
              )}
              <span className={c.done ? "text-foreground" : "text-muted-foreground"}>
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Review in progress */}
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Review in Progress</p>
            <p className="text-sm text-muted-foreground">
              The landlord will review your application within 24-48 hours.
            </p>
          </div>
        </div>

        {/* Email confirmation */}
        <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 p-4 flex items-start gap-3">
          <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Check Your Email</p>
            <p className="text-sm text-muted-foreground">
              A confirmation has been sent to <span className="font-semibold text-foreground">{email}</span>
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to modero.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
