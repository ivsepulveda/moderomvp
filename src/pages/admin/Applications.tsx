import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle, XCircle, Clock, Globe, Mail, Building2, BarChart3,
  ExternalLink, AlertTriangle, GripVertical, Loader2
} from "lucide-react";
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
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  flags: string[];
  created_at: string;
}

const columns: { key: Application["status"]; label: string; icon: React.ElementType; color: string }[] = [
  { key: "pending", label: "Pending Review", icon: Clock, color: "text-yellow-600" },
  { key: "approved", label: "Approved", icon: CheckCircle, color: "text-green-600" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-destructive" },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const Applications = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
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

  const updateStatus = async (id: string, status: Application["status"], reason?: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("applications")
      .update({ status, ...(reason ? { rejection_reason: reason } : {}) })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update application");
      console.error(error);
    } else {
      setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status, ...(reason ? { rejection_reason: reason } : {}) } : a)));
      toast.success(`Application ${status}`);
    }
    setSelectedApp(null);
    setShowRejectDialog(false);
    setRejectReason("");
    setUpdating(false);
  };

  const getApps = (status: Application["status"]) => apps.filter((a) => a.status === status);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Agency Applications</h2>
        <p className="text-muted-foreground text-sm mt-1">Review and manage incoming agency applications</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const Icon = col.icon;
          const colApps = getApps(col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Icon className={`w-5 h-5 ${col.color}`} />
                <h3 className="font-semibold text-foreground">{col.label}</h3>
                <Badge variant="secondary" className="ml-auto text-xs">{colApps.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[200px] bg-secondary/30 rounded-2xl p-3">
                {colApps.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No applications</p>
                )}
                {colApps.map((app) => (
                  <Card
                    key={app.id}
                    className="shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer border-border group"
                    onClick={() => setSelectedApp(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground text-sm truncate">{app.agency_name}</h4>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{app.email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{app.active_listings || "—"} listings</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(app.created_at)}</span>
                          </div>
                          {app.flags && app.flags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
                              <span className="text-xs text-destructive truncate">{app.flags.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

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
                <Button variant="hero" onClick={() => updateStatus(selectedApp.id, "approved")} disabled={updating}>
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

export default Applications;
