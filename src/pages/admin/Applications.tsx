import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle, XCircle, Clock, Globe, Mail, Building2, BarChart3,
  ExternalLink, AlertTriangle, GripVertical, Loader2, Users, Home, TrendingUp, Settings as SettingsIcon
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

interface Agent { id: string; name: string; email: string; phone: string | null; is_active: boolean; }
interface Listing { id: string; title: string; address: string | null; rent: number | null; bedrooms: number | null; is_active: boolean | null; }
interface ScoreLog { id: string; score: number; result: string | null; created_at: string | null; fraud_flag: boolean | null; }
interface AgencySetup { completed: boolean; current_step: number; team_members: unknown; listings: unknown; basic_info: unknown; }

const Applications = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [details, setDetails] = useState<{
    agents: Agent[]; listings: Listing[]; scores: ScoreLog[]; setup: AgencySetup | null; loading: boolean;
  }>({ agents: [], listings: [], scores: [], setup: null, loading: false });

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

  // Fetch related data when an application is selected
  useEffect(() => {
    if (!selectedApp) return;
    let cancelled = false;
    const loadDetails = async () => {
      setDetails((d) => ({ ...d, loading: true }));
      // Find the agency profile (id) by matching the application email
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .ilike("email", selectedApp.email)
        .maybeSingle();

      const agencyId = profile?.id;

      const [agentsRes, listingsRes, scoresRes, setupRes] = await Promise.all([
        agencyId
          ? supabase.from("agency_agents").select("id, name, email, phone, is_active").eq("agency_id", agencyId)
          : Promise.resolve({ data: [] as Agent[] }),
        agencyId
          ? supabase.from("properties").select("id, title, address, rent, bedrooms, is_active").eq("agency_id", agencyId).order("created_at", { ascending: false }).limit(20)
          : Promise.resolve({ data: [] as Listing[] }),
        agencyId
          ? supabase
              .from("score_logs")
              .select("id, score, result, created_at, fraud_flag, application_id, tenant_applications!inner(agency_id)")
              .eq("tenant_applications.agency_id", agencyId)
              .order("created_at", { ascending: false })
              .limit(10)
          : Promise.resolve({ data: [] as ScoreLog[] }),
        supabase
          .from("agency_setup")
          .select("completed, current_step, team_members, listings, basic_info")
          .eq("application_id", selectedApp.id)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      setDetails({
        agents: (agentsRes.data as Agent[]) || [],
        listings: (listingsRes.data as Listing[]) || [],
        scores: (scoresRes.data as ScoreLog[]) || [],
        setup: (setupRes.data as AgencySetup) || null,
        loading: false,
      });
    };
    loadDetails();
    return () => { cancelled = true; };
  }, [selectedApp]);

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
      if (status === "approved") {
        toast.success("Application approved — ready for setup", {
          description: "Click Start Setup on the approved card when you're ready to onboard.",
        });
      } else {
        toast.success(`Application ${status}`);
      }
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
                          {app.status === "approved" && (
                            <Button
                              size="sm"
                              className="mt-3 w-full rounded-xl gradient-primary text-primary-foreground hover:opacity-90"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/agencies/${app.id}/setup`);
                              }}
                            >
                              <SettingsIcon className="w-3.5 h-3.5 mr-1.5" /> Start Setup
                            </Button>
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

      {/* Application Detail Dialog — Full Profile */}
      <Dialog open={!!selectedApp && !showRejectDialog} onOpenChange={() => setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {selectedApp.agency_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-foreground truncate">{selectedApp.agency_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        selectedApp.status === "approved"
                          ? "default"
                          : selectedApp.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs capitalize"
                    >
                      {selectedApp.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Applied {timeAgo(selectedApp.created_at)}</span>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Contact */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate text-foreground">{selectedApp.email}</span>
                  </div>
                  {selectedApp.website ? (
                    <a
                      href={selectedApp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary rounded-xl p-3 text-primary transition-colors"
                    >
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate flex-1">{selectedApp.website.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3 text-muted-foreground">
                      <Globe className="w-4 h-4" /> No website
                    </div>
                  )}
                  {selectedApp.idealista_profile && (
                    <a
                      href={selectedApp.idealista_profile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary rounded-xl p-3 text-primary transition-colors sm:col-span-2"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate flex-1">Idealista Profile</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  )}
                </div>
              </section>

              {/* Stats */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Business Stats</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Active Listings", value: selectedApp.active_listings || "—", icon: Building2 },
                    { label: "Inquiries / month", value: selectedApp.monthly_inquiries || "—", icon: BarChart3 },
                    { label: "Years Operating", value: selectedApp.years_operating || "—", icon: Clock },
                  ].map((s) => (
                    <div key={s.label} className="bg-secondary rounded-xl p-3 text-center">
                      <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                      <p className="text-base font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Associations */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Professional Associations</h4>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-sm text-foreground leading-relaxed">{selectedApp.associations || "—"}</p>
                </div>
              </section>

              {/* Pitch */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Why They're Serious</h4>
                <div className="bg-secondary/50 rounded-xl p-3">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selectedApp.pitch || "—"}</p>
                </div>
              </section>

              {/* Live Platform Activity */}
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                  Platform Activity
                  {details.loading && <Loader2 className="w-3 h-3 animate-spin" />}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <Users className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-base font-bold text-foreground">{details.agents.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Agents</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-3 text-center">
                    <Home className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-base font-bold text-foreground">{details.listings.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Listings (live)</p>
                  </div>
                </div>
              </section>

              {details.setup && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                    <SettingsIcon className="w-3 h-3" /> Onboarding Setup
                  </h4>
                  <div className="bg-secondary/50 rounded-xl p-3 flex items-center justify-between">
                    <p className="text-sm text-foreground">Step {details.setup.current_step + 1} / 5</p>
                    <Badge variant={details.setup.completed ? "default" : "secondary"} className="text-xs">
                      {details.setup.completed ? "Completed" : "In progress"}
                    </Badge>
                  </div>
                </section>
              )}

              {details.agents.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Team ({details.agents.length})
                  </h4>
                  <div className="bg-secondary/50 rounded-xl divide-y divide-border">
                    {details.agents.slice(0, 6).map((a) => (
                      <div key={a.id} className="p-3 flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                        </div>
                        <Badge variant={a.is_active ? "default" : "secondary"} className="text-xs flex-shrink-0">
                          {a.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {details.listings.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                    <Home className="w-3 h-3" /> Live Listings ({details.listings.length})
                  </h4>
                  <div className="bg-secondary/50 rounded-xl divide-y divide-border">
                    {details.listings.slice(0, 6).map((l) => (
                      <div key={l.id} className="p-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{l.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{l.address || "—"}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-foreground">{l.rent ? `€${l.rent}` : "—"}</p>
                          <p className="text-xs text-muted-foreground">{l.bedrooms ?? "—"} bd</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {details.scores.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Recent Tenant Scores ({details.scores.length})
                  </h4>
                  <div className="bg-secondary/50 rounded-xl divide-y divide-border">
                    {details.scores.map((s) => (
                      <div key={s.id} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{s.score}/100</p>
                          <p className="text-xs text-muted-foreground">
                            {s.created_at ? timeAgo(s.created_at) : "—"} · {s.result || "—"}
                          </p>
                        </div>
                        {s.fraud_flag && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Fraud
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Flags */}
              {selectedApp.flags && selectedApp.flags.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-destructive mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Flags
                  </h4>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 space-y-1">
                    {selectedApp.flags.map((f) => (
                      <p key={f} className="text-xs text-destructive">• {f}</p>
                    ))}
                  </div>
                </section>
              )}

              {/* Rejection reason */}
              {selectedApp.status === "rejected" && selectedApp.rejection_reason && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-destructive mb-2">Rejection Reason</h4>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                    <p className="text-sm text-destructive leading-relaxed">{selectedApp.rejection_reason}</p>
                  </div>
                </section>
              )}

              {/* Approved confirmation */}
              {selectedApp.status === "approved" && (
                <section>
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm text-primary font-medium">Approved — agency can now access the platform</p>
                  </div>
                </section>
              )}

              {/* Application ID */}
              <p className="text-[10px] text-muted-foreground/60 font-mono pt-2 border-t border-border">
                ID: {selectedApp.id}
              </p>
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
