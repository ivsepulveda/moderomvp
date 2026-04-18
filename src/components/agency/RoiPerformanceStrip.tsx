// Performance & ROI strip for the Agency Dashboard.
// Reads the demo agency's properties + applications from Supabase, computes
// occupancy / monthly vacancy loss / avg days to rent, and shows a per-listing
// ROI table (target vs suggested rent + days listed + total loss so far).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  TrendingDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

const KpiCard = ({
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
  tone?: "default" | "danger" | "success";
}) => {
  const toneClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "success"
      ? "text-emerald-600"
      : "text-foreground";
  return (
    <Card className="shadow-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          <Icon className={`w-4 h-4 ${toneClass}`} />
        </div>
        <div className={`text-2xl font-bold ${toneClass}`}>{value}</div>
        {hint && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
};

const verdictBadge = (verdict: PropertyRoi["priceVerdict"], pct: number) => {
  if (verdict === "above")
    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
        +{pct.toFixed(0)}% over market
      </Badge>
    );
  if (verdict === "below")
    return (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
        {pct.toFixed(0)}% under market
      </Badge>
    );
  return (
    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
      On market
    </Badge>
  );
};

const RoiPerformanceStrip = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<PropertyRoi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("properties")
        .select(
          "id,title,address,rent,target_rent,suggested_rent,listed_at,rented_at,commission_months,bedrooms,is_active"
        )
        .eq("agency_id", user.id);
      if (cancelled) return;
      const computed = (data ?? []).map((p) =>
        computePropertyRoi(p as PropertyRoiInput)
      );
      setItems(computed);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <Card className="shadow-card border-border">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading performance data…
        </CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return null;
  }

  const portfolio = computePortfolioRoi(items);
  const topLoss = [...items]
    .filter((i) => !i.isRented)
    .sort((a, b) => b.totalLossSinceListed - a.totalLossSinceListed)
    .slice(0, 5);

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            Performance &amp; ROI
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Vacancy losses across your portfolio, with Modero's suggested
            asking-rent benchmark.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl gap-1.5">
          <Link to="/agency/analytics">
            View analytics <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            icon={Building2}
            label="Occupancy"
            value={`${portfolio.occupancyRate.toFixed(0)}%`}
            hint={`${portfolio.rented} rented · ${portfolio.vacant} vacant`}
            tone={portfolio.occupancyRate >= 70 ? "success" : "default"}
          />
          <KpiCard
            icon={TrendingDown}
            label="Monthly Loss"
            value={fmtEur(portfolio.monthlyLossVacant)}
            hint="Vacant rent + lost commission"
            tone="danger"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Lost so far"
            value={fmtEur(portfolio.totalLossSinceListed)}
            hint="Since each listing went live"
            tone="danger"
          />
          <KpiCard
            icon={Clock}
            label="Avg time to rent"
            value={
              portfolio.avgDaysToRent
                ? `${portfolio.avgDaysToRent.toFixed(0)}d`
                : "—"
            }
            hint={
              portfolio.avgDaysVacant
                ? `${portfolio.avgDaysVacant.toFixed(0)}d avg vacancy now`
                : "All units rented"
            }
            tone="success"
          />
        </div>

        {topLoss.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Highest vacancy bleed
            </h4>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Listing</th>
                    <th className="text-right px-3 py-2 font-medium">Asking</th>
                    <th className="text-right px-3 py-2 font-medium">Suggested</th>
                    <th className="text-left px-3 py-2 font-medium">Pricing</th>
                    <th className="text-right px-3 py-2 font-medium">Days vacant</th>
                    <th className="text-right px-3 py-2 font-medium">Lost so far</th>
                  </tr>
                </thead>
                <tbody>
                  {topLoss.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium text-foreground">
                        {p.title}
                      </td>
                      <td className="px-3 py-2 text-right">{fmtEur(p.targetRent)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {fmtEur(p.suggestedRent)}
                      </td>
                      <td className="px-3 py-2">
                        {verdictBadge(p.priceVerdict, p.priceDeltaPct)}
                      </td>
                      <td className="px-3 py-2 text-right">{p.daysVacant}d</td>
                      <td className="px-3 py-2 text-right text-destructive font-semibold">
                        {fmtEur(p.totalLossSinceListed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl bg-accent/40 border border-accent p-3">
          <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground leading-relaxed">
            Modero's suggested rents are calibrated from comparable Idealista
            listings. Pricing &gt;5% above market typically <strong>doubles</strong>{" "}
            time-to-rent in Spain &amp; Portugal.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoiPerformanceStrip;
