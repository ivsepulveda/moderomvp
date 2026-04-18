// Full agency analytics page: inquiry funnel, vacancy trend, € lost over time,
// per-listing performance table. All data is computed live from Supabase
// (properties, tenant_applications, viewings) for the logged-in agency.

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  Building2,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle2,
  CalendarCheck,
  FileSignature,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  computePortfolioRoi,
  computePropertyRoi,
  fmtEur,
  PropertyRoi,
  PropertyRoiInput,
} from "@/lib/roi";

interface AppRow {
  id: string;
  status: string;
  score: number | null;
  score_category: string | null;
  created_at: string | null;
  property_id: string;
}
interface ViewingRow {
  id: string;
  application_id: string;
  status: string;
}

const KpiTile = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "danger" | "success" | "primary";
}) => {
  const toneClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "success"
      ? "text-emerald-600"
      : tone === "primary"
      ? "text-primary"
      : "text-foreground";
  return (
    <Card className="shadow-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          <Icon className={`w-4 h-4 ${toneClass}`} />
        </div>
        <div className={`text-3xl font-bold ${toneClass}`}>{value}</div>
        {hint && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyRoi[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [viewings, setViewings] = useState<ViewingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const [pRes, aRes, vRes] = await Promise.all([
        supabase
          .from("properties")
          .select(
            "id,title,address,rent,target_rent,suggested_rent,listed_at,rented_at,commission_months,bedrooms,is_active"
          )
          .eq("agency_id", user.id),
        supabase
          .from("tenant_applications")
          .select("id,status,score,score_category,created_at,property_id")
          .eq("agency_id", user.id),
        supabase
          .from("viewings")
          .select("id,application_id,status")
          .eq("agency_id", user.id),
      ]);
      if (cancelled) return;
      setProperties(
        (pRes.data ?? []).map((p) => computePropertyRoi(p as PropertyRoiInput))
      );
      setApps((aRes.data ?? []) as AppRow[]);
      setViewings((vRes.data ?? []) as ViewingRow[]);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const portfolio = useMemo(() => computePortfolioRoi(properties), [properties]);

  const funnel = useMemo(() => {
    const inquiries = apps.length;
    const qualified = apps.filter(
      (a) => (a.score ?? 0) >= 70 || a.status === "approved"
    ).length;
    const viewingApps = new Set(viewings.map((v) => v.application_id));
    const viewingsCount = viewingApps.size;
    const signed = apps.filter((a) => a.status === "approved").length;
    return [
      { stage: "Inquiries", count: inquiries, fill: "hsl(var(--muted-foreground))" },
      { stage: "Qualified", count: qualified, fill: "hsl(var(--primary))" },
      { stage: "Viewings", count: viewingsCount, fill: "hsl(220 70% 50%)" },
      { stage: "Signed", count: signed, fill: "hsl(142 70% 40%)" },
    ];
  }, [apps, viewings]);

  // Inquiries per day (last 30d)
  const inquiriesTrend = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    apps.forEach((a) => {
      if (!a.created_at) return;
      const key = a.created_at.slice(0, 10);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      count,
    }));
  }, [apps]);

  // Cumulative € lost over last 30d (vacant properties only)
  const lossTrend = useMemo(() => {
    const now = new Date();
    const dailyLossPerVacant = properties
      .filter((p) => !p.isRented)
      .reduce((s, p) => s + p.dailyLoss, 0);
    return Array.from({ length: 30 }).map((_, i) => {
      const day = i + 1;
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return {
        date: d.toISOString().slice(5, 10),
        loss: Math.round(dailyLossPerVacant * day),
      };
    });
  }, [properties]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl">
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      </div>
    );
  }

  const inquiryToSigned =
    funnel[0].count > 0 ? (funnel[3].count / funnel[0].count) * 100 : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Pipeline conversion, vacancy losses, and per-listing performance.
        </p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiTile
          icon={Building2}
          label="Occupancy"
          value={`${portfolio.occupancyRate.toFixed(0)}%`}
          hint={`${portfolio.rented} rented · ${portfolio.vacant} vacant`}
          tone={portfolio.occupancyRate >= 70 ? "success" : "default"}
        />
        <KpiTile
          icon={TrendingDown}
          label="Lost so far"
          value={fmtEur(portfolio.totalLossSinceListed)}
          hint="Across all vacant listings"
          tone="danger"
        />
        <KpiTile
          icon={Clock}
          label="Avg days to rent"
          value={
            portfolio.avgDaysToRent
              ? `${portfolio.avgDaysToRent.toFixed(0)}d`
              : "—"
          }
          hint={
            portfolio.avgDaysVacant
              ? `${portfolio.avgDaysVacant.toFixed(0)}d avg vacancy now`
              : undefined
          }
          tone="success"
        />
        <KpiTile
          icon={TrendingUp}
          label="Inquiry → Signed"
          value={`${inquiryToSigned.toFixed(0)}%`}
          hint={`${funnel[3].count} of ${funnel[0].count} inquiries`}
          tone="primary"
        />
      </div>

      {/* Funnel */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Conversion Funnel
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Inquiry → qualified → viewing → signed lease.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} margin={{ left: 10, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnel.map((f, i) => (
                    <Cell key={i} fill={f.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { label: "Inquiries", icon: Users, value: funnel[0].count },
              { label: "Qualified", icon: CheckCircle2, value: funnel[1].count },
              { label: "Viewings", icon: CalendarCheck, value: funnel[2].count },
              { label: "Signed", icon: FileSignature, value: funnel[3].count },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border p-3 text-center bg-muted/20"
              >
                <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                <div className="text-xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inquiries · last 30 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={inquiriesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Cumulative € lost · last 30 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lossTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    formatter={(v: number) => fmtEur(v)}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-listing table */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Per-listing performance</CardTitle>
          <p className="text-xs text-muted-foreground">
            Asking rent vs Modero's suggestion, days listed, and total loss to date.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Listing</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-right px-4 py-2 font-medium">Asking</th>
                  <th className="text-right px-4 py-2 font-medium">Suggested</th>
                  <th className="text-left px-4 py-2 font-medium">Pricing</th>
                  <th className="text-right px-4 py-2 font-medium">Days</th>
                  <th className="text-right px-4 py-2 font-medium">Total loss</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-2 font-medium text-foreground">{p.title}</td>
                    <td className="px-4 py-2">
                      {p.isRented ? (
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          Rented
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                          Vacant
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">{fmtEur(p.targetRent)}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {fmtEur(p.suggestedRent)}
                    </td>
                    <td className="px-4 py-2">
                      {p.priceVerdict === "above" && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                          +{p.priceDeltaPct.toFixed(0)}%
                        </Badge>
                      )}
                      {p.priceVerdict === "below" && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          {p.priceDeltaPct.toFixed(0)}%
                        </Badge>
                      )}
                      {p.priceVerdict === "on_market" && (
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          On market
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">{p.daysVacant}d</td>
                    <td className={`px-4 py-2 text-right font-semibold ${p.isRented ? "text-muted-foreground" : "text-destructive"}`}>
                      {fmtEur(p.totalLossSinceListed)}
                    </td>
                  </tr>
                ))}
                {!properties.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No properties yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
