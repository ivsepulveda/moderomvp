import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ModeroLogo from "@/components/ModeroLogo";
import { CheckCircle, Clock, FileText, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationStatus = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);
  const [scoreLog, setScoreLog] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/apply");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!tenant) return;

      const { data: app } = await supabase
        .from("tenant_applications")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (app) {
        setApplication(app);
        // Fetch score breakdown
        const { data: score } = await supabase
          .from("score_logs")
          .select("*")
          .eq("application_id", app.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (score) setScoreLog(score);
      }
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Under Review", color: "bg-amber-100 text-amber-800", icon: <Clock className="w-5 h-5" /> },
    under_review: { label: "In Review", color: "bg-blue-100 text-blue-800", icon: <FileText className="w-5 h-5" /> },
    approved: { label: "Qualified", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-5 h-5" /> },
    rejected: { label: "Not Qualified", color: "bg-red-100 text-red-800", icon: <Shield className="w-5 h-5" /> },
  };

  const status = statusConfig[application?.status] || statusConfig.pending;

  const scoreCategories = scoreLog ? [
    { label: "Financial Stability", value: scoreLog.financial_score, max: 35 },
    { label: "Employment Trust", value: scoreLog.employment_score, max: 20 },
    { label: "Document Integrity", value: scoreLog.document_score, max: 20 },
    { label: "Identity Verification", value: scoreLog.identity_score, max: 15 },
    { label: "Fraud Check", value: 10 - (scoreLog.fraud_penalty || 0), max: 10 },
  ] : [];

  return (
    <div className="min-h-screen gradient-hero">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <ModeroLogo size="sm" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {/* Status Card */}
        <Card className="shadow-card text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-orange">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Application Submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Your application has been processed. Here's your trust score breakdown.
            </p>
            <div className="flex justify-center">
              <Badge className={`${status.color} text-sm px-4 py-2 flex items-center gap-2`}>
                {status.icon} {status.label}
              </Badge>
            </div>
            {application?.score != null && application.score > 0 && (
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
                <p className="text-5xl font-bold text-primary">{application.score}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {application.score_category && (
                    <span className="capitalize">{application.score_category}</span>
                  )}
                  {" · "}/100
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score Breakdown */}
        {scoreLog && (
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Score Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoreCategories.map((cat) => (
                <div key={cat.label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{cat.label}</span>
                    <span className="text-muted-foreground">{cat.value}/{cat.max}</span>
                  </div>
                  <Progress value={(cat.value / cat.max) * 100} className="h-2" />
                </div>
              ))}

              {scoreLog.fraud_flag && (
                <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Fraud flags detected</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      {(scoreLog.fraud_reasons || []).map((r: string, i: number) => (
                        <li key={i}>• {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to modero.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApplicationStatus;
