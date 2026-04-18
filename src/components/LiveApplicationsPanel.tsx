import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Activity, Calendar, CheckCircle2, Clock, Shield, XCircle } from "lucide-react";
import { toast } from "sonner";

interface LiveApp {
  id: string;
  status: string;
  score: number | null;
  score_category: string | null;
  documents_complete: boolean | null;
  fraud_flag: boolean | null;
  income_monthly: number | null;
  rent: number | null;
  job_title: string | null;
  company: string | null;
  created_at: string | null;
  property_id: string;
  tenant_id: string;
  tenants?: { id: string; name: string; email: string; phone: string | null } | null;
  properties?: { id: string; title: string; address: string | null; rent: number | null } | null;
}

const statusColor: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

function timeAgo(d?: string | null) {
  if (!d) return "";
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const LiveApplicationsPanel = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<LiveApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleApp, setScheduleApp] = useState<LiveApp | null>(null);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("10:00");

  const fetchApps = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tenant_applications")
      .select(
        `id, status, score, score_category, documents_complete, fraud_flag,
         income_monthly, rent, job_title, company, created_at,
         property_id, tenant_id,
         tenants:tenant_id ( id, name, email, phone ),
         properties:property_id ( id, title, address, rent )`
      )
      .eq("agency_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) console.error(error);
    setApps((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
    if (!user) return;
    // Realtime updates so onboarding submissions appear instantly
    const ch = supabase
      .channel("agency-live-apps")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tenant_applications", filter: `agency_id=eq.${user.id}` },
        () => fetchApps()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("tenant_applications").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Application ${status}`);
    fetchApps();
  };

  const scheduleViewing = async () => {
    if (!scheduleApp || !user) return;
    if (!viewingDate || !viewingTime) {
      toast.error("Pick date and time");
      return;
    }
    const start = new Date(`${viewingDate}T${viewingTime}:00`);
    const end = new Date(start.getTime() + 30 * 60000);
    const { error } = await supabase.from("viewings").insert({
      agency_id: user.id,
      application_id: scheduleApp.id,
      tenant_id: scheduleApp.tenant_id,
      property_id: scheduleApp.property_id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "confirmed",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Viewing scheduled and saved");
    setScheduleApp(null);
    setViewingDate("");
    setViewingTime("10:00");
  };

  if (loading) return null;
  if (apps.length === 0) return null;

  return (
    <>
      <Card className="shadow-card border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              Live applications
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                {apps.length} from database
              </Badge>
            </CardTitle>
            <span className="text-xs text-muted-foreground">Updated in real-time</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {apps.map((a) => {
            const tenant = a.tenants;
            const property = a.properties;
            const score = a.score ?? 0;
            const ratio = a.income_monthly && a.rent ? (a.income_monthly / a.rent).toFixed(1) : null;
            return (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {(tenant?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tenant?.name || tenant?.email || "Unknown tenant"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {property?.title || "—"} · {a.job_title || "—"}{a.company ? ` @ ${a.company}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {score > 0 && (
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 justify-end">
                        <Shield className="w-3 h-3 text-primary" />
                        <span className="text-sm font-bold text-foreground">{score}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{a.score_category || "—"}</p>
                    </div>
                  )}
                  {ratio && (
                    <span className="text-xs text-muted-foreground hidden md:inline">{ratio}× rent</span>
                  )}
                  <Badge variant="outline" className={`text-[10px] capitalize ${statusColor[a.status] || ""}`}>
                    {a.status}
                  </Badge>
                  {a.fraud_flag && <Badge variant="destructive" className="text-[10px]">Fraud</Badge>}
                  <span className="text-[10px] text-muted-foreground hidden md:flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(a.created_at)}
                  </span>

                  <div className="flex items-center gap-1">
                    {a.status !== "approved" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => updateStatus(a.id, "approved")}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </Button>
                    )}
                    {a.status !== "rejected" && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => updateStatus(a.id, "rejected")}>
                        <XCircle className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setScheduleApp(a);
                        const t = new Date();
                        t.setDate(t.getDate() + 1);
                        setViewingDate(t.toISOString().slice(0, 10));
                      }}
                    >
                      <Calendar className="w-4 h-4 text-primary" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={!!scheduleApp} onOpenChange={(o) => !o && setScheduleApp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule viewing</DialogTitle>
          </DialogHeader>
          {scheduleApp && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For <span className="font-medium text-foreground">{scheduleApp.tenants?.name}</span> at{" "}
                <span className="font-medium text-foreground">{scheduleApp.properties?.title}</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={viewingDate} onChange={(e) => setViewingDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Time</Label>
                  <Input type="time" value={viewingTime} onChange={(e) => setViewingTime(e.target.value)} />
                </div>
              </div>
              <Button className="w-full" onClick={scheduleViewing}>Save viewing</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LiveApplicationsPanel;
