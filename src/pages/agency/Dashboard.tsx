import { Building2, Users, TrendingUp, Clock, Shield, BarChart3, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  { label: "Active Listings", value: "34", icon: Building2, change: "+2 this week", trend: "up" },
  { label: "Tenant Inquiries", value: "67", icon: Users, change: "+12 this week", trend: "up" },
  { label: "Pre-Qualified", value: "41", icon: Shield, change: "61% rate", trend: "up" },
  { label: "Avg. Trust Score", value: "7.8", icon: TrendingUp, change: "+0.3 vs last month", trend: "up" },
];

const recentInquiries = [
  { id: 1, name: "Carlos Mendez", property: "Calle Gran Vía 42, 3B", score: 8.5, status: "qualified", time: "10 min ago" },
  { id: 2, name: "Ana Ferreira", property: "Rua Augusta 15, 2D", score: 6.2, status: "review", time: "25 min ago" },
  { id: 3, name: "Marco Rossi", property: "Via Roma 88, Int 4", score: 3.1, status: "flagged", time: "1 hour ago" },
  { id: 4, name: "Sophie Laurent", property: "Calle Serrano 12, 5A", score: 9.1, status: "qualified", time: "2 hours ago" },
  { id: 5, name: "João Silva", property: "Av. Liberdade 100, 1E", score: 7.4, status: "qualified", time: "3 hours ago" },
];

const statusStyles: Record<string, string> = {
  qualified: "bg-green-100 text-green-800 border-green-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  flagged: "bg-red-100 text-red-800 border-red-200",
};

const AgencyDashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back{profile?.agency_name ? `, ${profile.agency_name}` : ""}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Your tenant intelligence overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-all duration-300 border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-primary" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-orange">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Inquiries */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Tenant Inquiries</CardTitle>
            <a href="/agency/tenants" className="text-sm text-primary hover:underline font-medium">View all →</a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                    {inquiry.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{inquiry.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{inquiry.property}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-foreground">{inquiry.score}</p>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize ${statusStyles[inquiry.status]}`}>
                    {inquiry.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {inquiry.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revenue Saved for Landlords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">€12,450</p>
                <p className="text-sm text-muted-foreground mt-1">Total vacancy cost prevented this month</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Avg. Days Saved", value: "18" },
                  { label: "Bad Tenants Blocked", value: "9" },
                  { label: "Landlord NPS", value: "92" },
                ].map((m) => (
                  <div key={m.label} className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inquiry Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { stage: "Total Inquiries", count: 67, pct: 100 },
                { stage: "Pre-Screened", count: 52, pct: 78 },
                { stage: "Qualified", count: 41, pct: 61 },
                { stage: "Viewing Scheduled", count: 28, pct: 42 },
                { stage: "Lease Signed", count: 12, pct: 18 },
              ].map((s) => (
                <div key={s.stage} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{s.stage}</span>
                    <span className="text-muted-foreground">{s.count} ({s.pct}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyDashboard;
