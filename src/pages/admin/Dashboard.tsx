import { Building2, ClipboardList, UserCheck, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Pending Applications", value: "8", icon: ClipboardList, change: "+3 this week", trend: "up" },
  { label: "Approved Agencies", value: "23", icon: UserCheck, change: "+5 this month", trend: "up" },
  { label: "Rejected", value: "12", icon: AlertTriangle, change: "4 this month", trend: "neutral" },
  { label: "Active Agencies", value: "19", icon: Building2, change: "82% retention", trend: "up" },
];

const recentApplications = [
  { id: 1, name: "Barcelona Prime Rentals", email: "info@bcnprime.es", listings: "25-50", status: "pending", date: "2 hours ago" },
  { id: 2, name: "Lisboa Casa Agency", email: "hello@lisboaacasa.pt", listings: "50-100", status: "pending", date: "5 hours ago" },
  { id: 3, name: "Roma Living Srl", email: "contact@romaliving.it", listings: "10-25", status: "pending", date: "1 day ago" },
  { id: 4, name: "Madrid Select Homes", email: "admin@madridselect.es", listings: "100+", status: "approved", date: "2 days ago" },
  { id: 5, name: "Porto Rental Co", email: "geral@portorental.pt", listings: "<10", status: "rejected", date: "3 days ago" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Overview of agency applications and platform activity</p>
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
                      {stat.trend === "up" && <TrendingUp className="w-3 h-3 text-primary" />}
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

      {/* Recent Applications */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Applications</CardTitle>
            <button
              onClick={() => navigate("/admin/applications")}
              className="text-sm text-primary hover:underline font-medium"
            >
              View all →
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/30 transition-colors cursor-pointer"
                onClick={() => navigate("/admin/applications")}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                    {app.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{app.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">{app.listings} listings</span>
                  <Badge variant="outline" className={`text-xs capitalize ${statusColors[app.status]}`}>
                    {app.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {app.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Top Markets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { market: "Spain", agencies: 12, pct: 52 },
                { market: "Portugal", agencies: 7, pct: 30 },
                { market: "Italy", agencies: 4, pct: 18 },
              ].map((m) => (
                <div key={m.market} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{m.market}</span>
                    <span className="text-muted-foreground">{m.agencies} agencies</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Flags & Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { flag: "Low listing count (<10)", count: 3, severity: "warning" },
                { flag: "Personal email used", count: 2, severity: "error" },
                { flag: "No website provided", count: 1, severity: "warning" },
              ].map((f) => (
                <div key={f.flag} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${f.severity === "error" ? "text-destructive" : "text-primary"}`} />
                    <span className="text-sm text-foreground">{f.flag}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{f.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
