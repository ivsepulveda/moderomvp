import { useState, useEffect, useMemo } from "react";
import {
  Building2, ClipboardList, UserCheck, AlertTriangle, TrendingUp, TrendingDown,
  Clock, Mail, Globe, ExternalLink, BarChart3, Loader2, CheckCircle, XCircle,
  Euro, Target, Zap, Activity, Users, ShieldCheck, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { submittedApplicationQualityKPIs } from "@/data/submittedApplication";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";

interface Application {
  id: string;
  agency_name: string;
  email: string;
  website: string | null;
  idealista_profile: string | null;
  active_listings: string | null;
  monthly_inquiries: string | null;
  years_operating: string | null;
  associations: string | null;
  pitch: string | null;
  status: string;
  rejection_reason: string | null;
  flags: string[];
  created_at: string;
}

// ROI assumption: Modero saves ~€85 per qualified tenant screened
// (avg 30 min agent time + reduced fraud loss). Tunable in Settings.
const REVENUE_PER_SCREENING = 85;
// Avg pipeline value per approved agency / month (subscription proxy)
const VALUE_PER_AGENCY_MONTH = 299;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [tenantApps, setTenantApps] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      const [a, t, l] = await Promise.all([
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
        supabase.from("tenant_applications").select("id, status, score, fraud_flag, created_at"),
        supabase.from("leads").select("id, processed, created_at"),
      ]);
      if (a.error) toast.error("Failed to load applications");
      setApps((a.data as Application[]) || []);
      setTenantApps(t.data || []);
      setLeads(l.data || []);
      setLoading(false);
    })();
  }, []);

  const updateStatus = async (id: string, status: string, reason?: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("applications")
      .update({ status, ...(reason ? { rejection_reason: reason } : {}) })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update application");
    } else {
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status, ...(reason ? { rejection_reason: reason } : {}) } : a)));
      toast.success(`Application ${status}`);
    }
    setSelectedApp(null);
    setShowRejectDialog(false);
    setRejectReason("");
    setUpdating(false);
  };

  // ============ Smart metrics ============
  const metrics = useMemo(() => {
    const total = apps.length;
    const pending = apps.filter((a) => a.status === "pending").length;
    const approved = apps.filter((a) => a.status === "approved").length;
    const rejected = apps.filter((a) => a.status === "rejected").length;
    const decided = approved + rejected;
    const approvalRate = decided ? Math.round((approved / decided) * 100) : 0;

    const now = Date.now();
    const last30 = apps.filter((a) => now - new Date(a.created_at).getTime() < 30 * 86400000);
    const prev30 = apps.filter((a) => {
      const t = now - new Date(a.created_at).getTime();
      return t >= 30 * 86400000 && t < 60 * 86400000;
    });
    const growth = prev30.length ? Math.round(((last30.length - prev30.length) / prev30.length) * 100) : 0;

    // Avg time-to-decision
    const decidedApps = apps.filter((a) => a.status !== "pending");
    const avgDecisionHrs = decidedApps.length
      ? Math.round(
          decidedApps.reduce((sum, a) => sum + (now - new Date(a.created_at).getTime()), 0) /
            decidedApps.length / 3600000
        )
      : 0;

    // Tenant pipeline
    const tenantTotal = tenantApps.length;
    const tenantApproved = tenantApps.filter((t) => t.status === "approved").length;
    const fraudCaught = tenantApps.filter((t) => t.fraud_flag).length;
    const avgScore = tenantApps.length
      ? Math.round(tenantApps.reduce((s, t) => s + (t.score || 0), 0) / tenantApps.length)
      : 0;

    // ROI / revenue saved
    const revenueSaved = tenantTotal * REVENUE_PER_SCREENING;
    const monthlyRecurring = approved * VALUE_PER_AGENCY_MONTH;

    // Lead funnel
    const leadsTotal = leads.length;
    const leadsProcessed = leads.filter((l) => l.processed).length;
    const conversionRate = leadsTotal ? Math.round((leadsProcessed / leadsTotal) * 100) : 0;

    return {
      total, pending, approved, rejected, approvalRate, growth, avgDecisionHrs,
      tenantTotal, tenantApproved, fraudCaught, avgScore,
      revenueSaved, monthlyRecurring, leadsTotal, leadsProcessed, conversionRate,
      last30: last30.length,
    };
  }, [apps, tenantApps, leads]);

  // 30-day trend (apps per day)
  const trendData = useMemo(() => {
    const days: { date: string; apps: number; tenants: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en", { month: "short", day: "numeric" });
      const a = apps.filter((x) => x.created_at?.startsWith(key)).length;
      const t = tenantApps.filter((x) => x.created_at?.startsWith(key)).length;
      days.push({ date: label, apps: a, tenants: t });
    }
    return days;
  }, [apps, tenantApps]);

  const statusBreakdown = [
    { name: "Approved", value: metrics.approved, color: "hsl(142 71% 45%)" },
    { name: "Pending", value: metrics.pending, color: "hsl(38 92% 50%)" },
    { name: "Rejected", value: metrics.rejected, color: "hsl(0 72% 51%)" },
  ].filter((s) => s.value > 0);

  const recentApps = apps.slice(0, 6);
  const flaggedApps = apps.filter((a) => a.flags && a.flags.length > 0);
  const flagCounts: Record<string, number> = {};
  flaggedApps.forEach((a) => a.flags?.forEach((f) => { flagCounts[f] = (flagCounts[f] || 0) + 1; }));

  // KPI cards
  const kpis = [
    {
      label: "Revenue Impact",
      value: `€${metrics.revenueSaved.toLocaleString()}`,
      sub: `+€${metrics.monthlyRecurring.toLocaleString()}/mo recurring`,
      icon: Euro,
      trend: metrics.growth,
      gradient: true,
    },
    {
      label: "Approval Rate",
      value: `${metrics.approvalRate}%`,
      sub: `${metrics.approved} of ${metrics.approved + metrics.rejected} decided`,
      icon: Target,
      trend: metrics.approvalRate >= 60 ? metrics.approvalRate - 50 : -(50 - metrics.approvalRate),
    },
    {
      label: "Pending Review",
      value: String(metrics.pending),
      sub: metrics.avgDecisionHrs ? `~${metrics.avgDecisionHrs}h avg decision` : "No decisions yet",
      icon: ClipboardList,
      trend: -metrics.pending,
      urgent: metrics.pending > 5,
    },
    {
      label: "Fraud Prevented",
      value: String(metrics.fraudCaught),
      sub: `${metrics.tenantTotal} tenants screened`,
      icon: ShieldCheck,
      trend: metrics.fraudCaught,
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Live overview of platform performance, agency pipeline and tenant intelligence
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          <Activity className="w-3 h-3 text-primary animate-pulse" />
          Live · updated just now
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className={`shadow-card hover:shadow-card-hover transition-all duration-300 border-border ${
                kpi.gradient ? "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" : ""
              } ${kpi.urgent ? "ring-2 ring-yellow-400/40" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${kpi.gradient ? "gradient-primary shadow-orange" : "bg-secondary"} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${kpi.gradient ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  {kpi.trend !== undefined && kpi.trend !== 0 && (
                    <span className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full ${
                      kpi.trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {kpi.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(kpi.trend)}{kpi.label === "Approval Rate" ? "%" : ""}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : kpi.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trend + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">30-Day Activity</CardTitle>
              <span className="text-xs text-muted-foreground">{metrics.last30} new applications</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="apps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="tenants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="apps" stroke="hsl(var(--primary))" fill="url(#apps)" strokeWidth={2} name="Agency apps" />
                  <Area type="monotone" dataKey="tenants" stroke="hsl(217 91% 60%)" fill="url(#tenants)" strokeWidth={2} name="Tenant screenings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Application Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {statusBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-12">No data yet</p>
            ) : (
              <>
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusBreakdown} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {statusBreakdown.map((s) => <Cell key={s.name} fill={s.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 mt-2">
                  {statusBreakdown.map((s) => (
                    <div key={s.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                        <span className="text-muted-foreground">{s.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tenant Intelligence + Lead Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Tenant Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-secondary rounded-xl">
                <p className="text-xl font-bold text-foreground">{metrics.tenantTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">Screened</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-xl">
                <p className="text-xl font-bold text-primary">{metrics.avgScore}</p>
                <p className="text-xs text-muted-foreground mt-1">Avg score</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-xl">
                <p className="text-xl font-bold text-destructive">{metrics.fraudCaught}</p>
                <p className="text-xs text-muted-foreground mt-1">Fraud flagged</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Approval rate</span>
                <span className="font-medium text-foreground">
                  {metrics.tenantTotal ? Math.round((metrics.tenantApproved / metrics.tenantTotal) * 100) : 0}%
                </span>
              </div>
              <Progress value={metrics.tenantTotal ? (metrics.tenantApproved / metrics.tenantTotal) * 100 : 0} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Lead Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-secondary rounded-xl">
                <p className="text-xl font-bold text-foreground">{metrics.leadsTotal}</p>
                <p className="text-xs text-muted-foreground mt-1">Inbound</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-xl">
                <p className="text-xl font-bold text-foreground">{metrics.leadsProcessed}</p>
                <p className="text-xs text-muted-foreground mt-1">Processed</p>
              </div>
              <div className="text-center p-3 bg-secondary rounded-xl">
                <p className="text-xl font-bold text-primary">{metrics.conversionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">Conversion</p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Pipeline health</span>
                <span className="font-medium text-foreground">{metrics.conversionRate}%</span>
              </div>
              <Progress value={metrics.conversionRate} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Quality KPIs (from onboarding submissions) */}
      <Card className="shadow-card border-border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Tenant Quality (onboarding submissions)
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {submittedApplicationQualityKPIs.totalSubmitted + metrics.tenantTotal} submitted across network
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-background border border-border p-4">
            <p className="text-xs text-muted-foreground">Avg Trust Score</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {submittedApplicationQualityKPIs.avgTrustScore.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground"> / 10</span>
            </p>
            <Progress value={submittedApplicationQualityKPIs.avgTrustScore * 10} className="h-1.5 mt-2" />
          </div>
          <div className="rounded-xl bg-background border border-border p-4">
            <p className="text-xs text-muted-foreground">% Qualified for Financing</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {submittedApplicationQualityKPIs.pctQualifiedForFinancing}
              <span className="text-sm font-normal text-muted-foreground">%</span>
            </p>
            <Progress value={submittedApplicationQualityKPIs.pctQualifiedForFinancing} className="h-1.5 mt-2" />
          </div>
          <div className="rounded-xl bg-background border border-border p-4">
            <p className="text-xs text-muted-foreground">Fraud Flag Rate</p>
            <p className="text-2xl font-bold text-destructive mt-1">
              {submittedApplicationQualityKPIs.fraudFlagRate}
              <span className="text-sm font-normal text-muted-foreground">%</span>
            </p>
            <Progress value={submittedApplicationQualityKPIs.fraudFlagRate} className="h-1.5 mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Applications</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/admin/applications")}>
            View all <ArrowUpRight className="w-3 h-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : recentApps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No applications yet</p>
          ) : (
            <div className="space-y-2">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                      {app.agency_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{app.agency_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">{app.active_listings || "—"} listings</span>
                    <span className={`text-xs capitalize px-2 py-0.5 rounded-full border ${statusColors[app.status] || "bg-secondary text-secondary-foreground"}`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {timeAgo(app.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flags */}
      {Object.keys(flagCounts).length > 0 && (
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Application Red Flags
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Common quality issues across inbound agency applications.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(flagCounts).map(([flag, count]) => ({ flag, count }))} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis dataKey="flag" type="category" width={140} tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp && !showRejectDialog} onOpenChange={() => setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                  {selectedApp.agency_name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate text-left">{selectedApp.agency_name}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs capitalize px-2 py-0.5 rounded-full border ${statusColors[selectedApp.status] || "bg-secondary text-secondary-foreground"}`}>
                      {selectedApp.status}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedApp.created_at).toLocaleDateString()} · {timeAgo(selectedApp.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Contact</h4>
                <div className="space-y-2 text-sm">
                  <a href={`mailto:${selectedApp.email}`} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                    <Mail className="w-4 h-4 text-muted-foreground" /><span className="truncate">{selectedApp.email}</span>
                  </a>
                  {selectedApp.website && (
                    <a href={selectedApp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      <Globe className="w-4 h-4" /><span className="truncate">{selectedApp.website}</span><ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Market Presence</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Active listings", value: selectedApp.active_listings || "—", icon: Building2 },
                    { label: "Inquiries / mo", value: selectedApp.monthly_inquiries || "—", icon: BarChart3 },
                    { label: "Years operating", value: selectedApp.years_operating || "—", icon: Clock },
                  ].map((s) => (
                    <div key={s.label} className="bg-secondary rounded-xl p-3 text-center">
                      <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-base font-semibold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {selectedApp.pitch && (
                <section>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pitch</h4>
                  <div className="p-3 bg-secondary/50 rounded-xl">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">{selectedApp.pitch}</p>
                  </div>
                </section>
              )}

              {selectedApp.flags?.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Risk & Flags</h4>
                  <div className="bg-destructive/10 rounded-xl p-3 space-y-1.5">
                    {selectedApp.flags.map((f) => (
                      <p key={f} className="text-xs text-destructive">• {f}</p>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {selectedApp.status === "pending" && (
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowRejectDialog(true)} className="text-destructive border-destructive/30 hover:bg-destructive/10" disabled={updating}>
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button onClick={() => updateStatus(selectedApp.id, "approved")} disabled={updating}>
                  {updating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />} Approve
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={() => setShowRejectDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Rejection Reason</DialogTitle></DialogHeader>
          <div className="py-2">
            <Label htmlFor="reason">Why is this application being rejected?</Label>
            <Textarea id="reason" placeholder="e.g. Fewer than 10 active listings, personal email address..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => selectedApp && updateStatus(selectedApp.id, "rejected", rejectReason)} disabled={!rejectReason || updating}>
              {updating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
