import { useState, useEffect } from "react";
import { Building2, ClipboardList, UserCheck, AlertTriangle, TrendingUp, Clock, Mail, Globe, ExternalLink, BarChart3, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchApps = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load applications");
      console.error(error);
    } else {
      setApps((data as Application[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
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

  const pendingCount = apps.filter((a) => a.status === "pending").length;
  const approvedCount = apps.filter((a) => a.status === "approved").length;
  const rejectedCount = apps.filter((a) => a.status === "rejected").length;

  const stats = [
    { label: "Pending Applications", value: String(pendingCount), icon: ClipboardList, change: `${apps.length} total`, trend: "up" as const },
    { label: "Approved Agencies", value: String(approvedCount), icon: UserCheck, change: `${approvedCount} approved`, trend: "up" as const },
    { label: "Rejected", value: String(rejectedCount), icon: AlertTriangle, change: `${rejectedCount} rejected`, trend: "neutral" as const },
    { label: "Total Applications", value: String(apps.length), icon: Building2, change: loading ? "Loading..." : "All time", trend: "up" as const },
  ];

  const recentApps = apps.slice(0, 8);

  const flaggedApps = apps.filter((a) => a.flags && a.flags.length > 0);
  const flagCounts: Record<string, number> = {};
  flaggedApps.forEach((a) => a.flags?.forEach((f) => { flagCounts[f] = (flagCounts[f] || 0) + 1; }));

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
                    <p className="text-3xl font-bold text-foreground mt-1">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : stat.value}
                    </p>
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
          <CardTitle className="text-lg">Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recentApps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
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

      {/* Flags & Alerts */}
      {Object.keys(flagCounts).length > 0 && (
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Flags & Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(flagCounts).map(([flag, count]) => (
                <div key={flag} className="flex items-center justify-between p-2.5 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">{flag}</span>
                  </div>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp && !showRejectDialog} onOpenChange={() => setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
                  {selectedApp.agency_name.charAt(0)}
                </div>
                {selectedApp.agency_name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" /> {selectedApp.email}
                </div>
                {selectedApp.website && (
                  <a href={selectedApp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedApp.idealista_profile && (
                  <a href={selectedApp.idealista_profile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline col-span-2">
                    <ExternalLink className="w-4 h-4" /> Idealista Profile
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Listings", value: selectedApp.active_listings || "—", icon: Building2 },
                  { label: "Inquiries/mo", value: selectedApp.monthly_inquiries || "—", icon: BarChart3 },
                  { label: "Years", value: selectedApp.years_operating || "—", icon: Clock },
                ].map((s) => (
                  <div key={s.label} className="bg-secondary rounded-xl p-3 text-center">
                    <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm font-semibold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {selectedApp.associations && (
                <div>
                  <Label className="text-xs text-muted-foreground">Associations</Label>
                  <p className="text-sm text-foreground mt-0.5">{selectedApp.associations}</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Why they're serious</Label>
                <p className="text-sm text-foreground mt-0.5 leading-relaxed">{selectedApp.pitch || "—"}</p>
              </div>

              {selectedApp.flags && selectedApp.flags.length > 0 && (
                <div className="bg-destructive/10 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Flags
                  </p>
                  {selectedApp.flags.map((f) => (
                    <p key={f} className="text-xs text-destructive">• {f}</p>
                  ))}
                </div>
              )}

              {selectedApp.rejection_reason && (
                <div className="bg-destructive/10 rounded-xl p-3">
                  <p className="text-xs font-semibold text-destructive">Rejection Reason</p>
                  <p className="text-sm text-foreground mt-1">{selectedApp.rejection_reason}</p>
                </div>
              )}
            </div>

            {selectedApp.status === "pending" && (
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  disabled={updating}
                >
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

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={() => setShowRejectDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="reason">Why is this application being rejected?</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Fewer than 10 active listings, personal email address..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => selectedApp && updateStatus(selectedApp.id, "rejected", rejectReason)}
              disabled={!rejectReason || updating}
            >
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
