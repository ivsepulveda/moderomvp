import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ModeroLogo from "@/components/ModeroLogo";
import { CheckCircle, Clock, FileText, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ApplicationStatus = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState<any>(null);

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
      if (app) setApplication(app);
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
    in_review: { label: "In Review", color: "bg-blue-100 text-blue-800", icon: <FileText className="w-5 h-5" /> },
    qualified: { label: "Qualified", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-5 h-5" /> },
    rejected: { label: "Not Qualified", color: "bg-red-100 text-red-800", icon: <Shield className="w-5 h-5" /> },
  };

  const status = statusConfig[application?.status] || statusConfig.pending;

  return (
    <div className="min-h-screen gradient-hero">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <ModeroLogo size="sm" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="shadow-card text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-orange">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Application Submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Your application is now being reviewed by the agency. You'll receive an email update when your status changes.
            </p>
            <div className="flex justify-center">
              <Badge className={`${status.color} text-sm px-4 py-2 flex items-center gap-2`}>
                {status.icon} {status.label}
              </Badge>
            </div>
            {application?.score != null && application.score > 0 && (
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
                <p className="text-4xl font-bold text-primary">{application.score}</p>
                <p className="text-xs text-muted-foreground">/100</p>
              </div>
            )}
            <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block pt-4">
              ← Back to modero.com
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationStatus;
