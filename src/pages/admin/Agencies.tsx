import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowRight, Bell, Brain, Building2, Calendar, CheckCircle2, ExternalLink,
  Globe, Loader2, Mail, MapPin, MessageSquare, Phone, Settings2, Shield,
  Users, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { submittedApplicationQualityKPIs } from "@/data/submittedApplication";

interface ApprovedAgency {
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
  created_at: string;
  status: string;
}

interface AgencySetupRecord {
  application_id: string;
  current_step: number;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
  basic_info: Record<string, any> | null;
  listings: any[] | null;
  team_members: any[] | null;
  connection_settings: Record<string, any> | null;
  intelligence_brain: Record<string, any> | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const setupProgressLabels = ["Basic info", "Listings", "Connections", "Intelligence Brain", "Team & assignments"];

const Agencies = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<ApprovedAgency[]>([]);
  const [setupMap, setSetupMap] = useState<Record<string, AgencySetupRecord>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAgency, setSelectedAgency] = useState<ApprovedAgency | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load agencies");
        console.error(error);
        setLoading(false);
        return;
      }

      const approved = (data as ApprovedAgency[]) || [];
      setAgencies(approved);

      if (approved.length > 0) {
        const { data: setups, error: setupError } = await supabase
          .from("agency_setup")
          .select("application_id,current_step,completed,completed_at,updated_at,basic_info,listings,team_members,connection_settings,intelligence_brain")
          .in("application_id", approved.map((agency) => agency.id));

        if (setupError) {
          toast.error("Failed to load agency setup status");
        } else {
          const mapped = ((setups as any[]) || []).reduce<Record<string, AgencySetupRecord>>((acc, item) => {
            acc[item.application_id] = item as AgencySetupRecord;
            return acc;
          }, {});
          setSetupMap(mapped);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const selectedSetup = selectedAgency ? setupMap[selectedAgency.id] : null;
  const selectedBasic = (selectedSetup?.basic_info ?? {}) as Record<string, any>;
  const selectedListings = (selectedSetup && Array.isArray(selectedSetup.listings) ? selectedSetup.listings : []) as any[];
  const selectedTeam = (selectedSetup && Array.isArray(selectedSetup.team_members) ? selectedSetup.team_members : []) as any[];
  const selectedConn = (selectedSetup?.connection_settings ?? {}) as Record<string, any>;
  const selectedBrain = (selectedSetup?.intelligence_brain ?? {}) as Record<string, any>;
  const logoUrl = selectedBasic.logo_url as string | undefined;

  const setupStatusLabel = useMemo(() => {
    if (!selectedSetup) return "Not started";
    if (selectedSetup.completed) return "Completed";
    return `In progress · ${setupProgressLabels[selectedSetup.current_step] || "Draft"}`;
  }, [selectedSetup]);

  // Connection summary helpers
  const connectionsList = [
    { key: "gmail_connected", label: "Gmail", icon: Mail },
    { key: "outlook_mail_connected", label: "Outlook Mail", icon: Mail },
    { key: "google_calendar_connected", label: "Google Calendar", icon: Calendar },
    { key: "outlook_calendar_connected", label: "Outlook Calendar", icon: Calendar },
    { key: "whatsapp_connected", label: "WhatsApp", icon: MessageSquare },
    { key: "inbox_connected", label: "Unified inbox", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="p-6 md:p-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Approved Agencies</h2>
          <p className="text-muted-foreground text-sm mt-1">All agencies currently active on the Modero network</p>
        </div>

        {agencies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No approved agencies yet</p>
        ) : (
          <div className="grid gap-4">
            {agencies.map((agency) => {
              const setup = setupMap[agency.id];
              const setupBasic = (setup?.basic_info ?? {}) as Record<string, any>;
              const cardLogo = setupBasic.logo_url as string | undefined;
              const listingsCount = setup && Array.isArray(setup.listings) ? setup.listings.length : 0;
              const teamCount = setup && Array.isArray(setup.team_members) ? setup.team_members.length : 0;

              return (
                <Card
                  key={agency.id}
                  className="shadow-card hover:shadow-card-hover transition-all border-border cursor-pointer"
                  onClick={() => navigate(`/admin/agencies/${agency.id}/setup`)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-orange flex-shrink-0 overflow-hidden bg-background border border-border">
                          {cardLogo ? (
                            <img src={cardLogo} alt={agency.agency_name} className="w-full h-full object-contain" />
                          ) : (
                            <div className="w-full h-full gradient-primary flex items-center justify-center">
                              {agency.agency_name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{agency.agency_name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {agency.email}</span>
                            {agency.website && (
                              <a
                                href={agency.website.startsWith("http") ? agency.website : `https://${agency.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) => event.stopPropagation()}
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <Globe className="w-3 h-3" /> Website <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap justify-end">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" /> {agency.active_listings || "—"} listings
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {teamCount} team
                        </span>
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                          {setup?.completed ? "Setup complete" : setup ? "Setup in progress" : "Setup needed"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Joined {formatDate(agency.created_at)}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAgency(agency);
                          }}
                        >
                          View profile
                        </Button>
                      </div>
                    </div>
                    {setup && (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="rounded-xl bg-muted/30 px-3 py-2 text-sm">
                          <p className="text-xs text-muted-foreground">Portal listings</p>
                          <p className="font-semibold text-foreground">{listingsCount}</p>
                        </div>
                        <div className="rounded-xl bg-muted/30 px-3 py-2 text-sm">
                          <p className="text-xs text-muted-foreground">Team members</p>
                          <p className="font-semibold text-foreground">{teamCount}</p>
                        </div>
                        <div className="rounded-xl bg-primary/5 border border-primary/15 px-3 py-2 text-sm">
                          <p className="text-xs text-muted-foreground">Avg trust score</p>
                          <p className="font-semibold text-foreground">{submittedApplicationQualityKPIs.avgTrustScore.toFixed(1)}<span className="text-xs text-muted-foreground"> / 10</span></p>
                        </div>
                        <div className="rounded-xl bg-primary/5 border border-primary/15 px-3 py-2 text-sm">
                          <p className="text-xs text-muted-foreground">Qualified for financing</p>
                          <p className="font-semibold text-foreground">{submittedApplicationQualityKPIs.pctQualifiedForFinancing}%</p>
                        </div>
                        <div className="rounded-xl bg-muted/30 px-3 py-2 text-sm">
                          <p className="text-xs text-muted-foreground">Fraud flag rate</p>
                          <p className="font-semibold text-destructive">{submittedApplicationQualityKPIs.fraudFlagRate}%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedAgency} onOpenChange={() => setSelectedAgency(null)}>
        {selectedAgency && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0 overflow-hidden bg-background border border-border">
                  {logoUrl ? (
                    <img src={logoUrl} alt={selectedAgency.agency_name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center">
                      {selectedAgency.agency_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="truncate text-left">{selectedAgency.agency_name}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Approved</Badge>
                    {selectedSetup?.completed && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Onboarded
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">Joined {formatDate(selectedAgency.created_at)}</span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Headline KPIs */}
              <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Active listings", value: selectedAgency.active_listings || "—", icon: Building2 },
                  { label: "Monthly inquiries", value: selectedAgency.monthly_inquiries || "—", icon: MessageSquare },
                  { label: "Years operating", value: selectedAgency.years_operating || "—", icon: Calendar },
                  { label: "Portal team", value: String(selectedTeam.length), icon: Users },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/30 p-3">
                    <item.icon className="w-4 h-4 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-semibold text-foreground mt-1">{item.value}</p>
                  </div>
                ))}
              </section>

              {/* Contact */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Contact & online presence</h4>
                <div className="space-y-2 text-sm">
                  <a href={`mailto:${selectedAgency.email}`} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{selectedAgency.email}</span>
                  </a>
                  {selectedAgency.website ? (
                    <a href={selectedAgency.website.startsWith("http") ? selectedAgency.website : `https://${selectedAgency.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{selectedAgency.website}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground"><Globe className="w-4 h-4" /> No website provided</div>
                  )}
                  {selectedAgency.idealista_profile ? (
                    <a href={selectedAgency.idealista_profile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{selectedAgency.idealista_profile}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground"><ExternalLink className="w-4 h-4" /> No Idealista profile</div>
                  )}
                  {selectedConn.notification_email && selectedConn.notification_email !== selectedAgency.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Bell className="w-4 h-4" />
                      <span className="text-xs">Notifications go to <span className="text-foreground font-medium">{selectedConn.notification_email}</span></span>
                    </div>
                  )}
                </div>
              </section>

              {selectedAgency.associations && (
                <section>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Professional associations</h4>
                  <div className="rounded-xl bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap break-words">{selectedAgency.associations}</div>
                </section>
              )}

              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Agency pitch</h4>
                <div className="rounded-xl bg-muted/30 p-3 text-sm text-foreground whitespace-pre-wrap break-words">
                  {selectedAgency.pitch || <span className="italic text-muted-foreground">No pitch provided</span>}
                </div>
              </section>

              {/* Portal listings */}
              {selectedListings.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Portal listings ({selectedListings.length})
                  </h4>
                  <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                    {selectedListings.map((l: any, i: number) => (
                      <div key={l.id || i} className="p-3 flex items-start justify-between gap-3 hover:bg-muted/20">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{l.title || "Untitled listing"}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                            {l.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.address}</span>}
                            {l.bedrooms && <span>{l.bedrooms} bed</span>}
                            {l.bathrooms && <span>{l.bathrooms} bath</span>}
                            {l.idealista_id && <span className="text-primary">ID: {l.idealista_id}</span>}
                          </div>
                        </div>
                        {l.rent && <span className="text-sm font-semibold text-primary flex-shrink-0">€{l.rent}/mo</span>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Team members */}
              {selectedTeam.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Team members ({selectedTeam.length})
                  </h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedTeam.map((m: any, i: number) => (
                      <div key={m.id || i} className="rounded-xl border border-border p-3 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                          {(m.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{m.name || "Unnamed"}</p>
                          {m.role && <p className="text-xs text-primary">{m.role}</p>}
                          {m.email && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {m.email}
                            </p>
                          )}
                          {m.phone && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {m.phone}
                            </p>
                          )}
                          {Array.isArray(m.assigned_listing_ids) && m.assigned_listing_ids.length > 0 && (
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {m.assigned_listing_ids.length} listing{m.assigned_listing_ids.length > 1 ? "s" : ""} assigned
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Connections */}
              {selectedSetup && (
                <section>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Connected channels</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {connectionsList.map((c) => {
                      const on = !!selectedConn[c.key];
                      return (
                        <div
                          key={c.key}
                          className={`rounded-xl border p-2.5 flex items-center gap-2 text-sm ${
                            on ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 text-muted-foreground"
                          }`}
                        >
                          <c.icon className={`w-4 h-4 ${on ? "text-primary" : ""}`} />
                          <span className="flex-1 truncate">{c.label}</span>
                          {on ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <span className="text-[10px]">Off</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {selectedConn.zapier_webhook_url && (
                    <div className="mt-2 rounded-xl bg-muted/30 p-2.5 text-xs flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-muted-foreground">Zapier:</span>
                      <span className="text-foreground truncate">{selectedConn.zapier_webhook_url}</span>
                    </div>
                  )}
                </section>
              )}

              {/* Intelligence Brain summary */}
              {selectedSetup && Object.keys(selectedBrain).length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" /> Intelligence Brain
                  </h4>
                  <div className="rounded-xl border border-border p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    {[
                      { label: "Min income ratio", value: selectedBrain.min_income_ratio ? `${selectedBrain.min_income_ratio}×` : "—" },
                      { label: "Approve threshold", value: selectedBrain.approve_threshold ?? "—" },
                      { label: "Review threshold", value: selectedBrain.review_threshold ?? "—" },
                      { label: "Auto-decisions", value: selectedBrain.auto_decisions ? "On" : "Off" },
                    ].map((b) => (
                      <div key={b.label}>
                        <p className="text-xs text-muted-foreground">{b.label}</p>
                        <p className="font-semibold text-foreground">{String(b.value)}</p>
                      </div>
                    ))}
                  </div>
                  {Array.isArray(selectedBrain.required_documents) && selectedBrain.required_documents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedBrain.required_documents.map((doc: string) => (
                        <Badge key={doc} variant="outline" className="text-[10px] gap-1">
                          <Shield className="w-2.5 h-2.5" /> {doc}
                        </Badge>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Onboarding setup CTA */}
              <section>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Onboarding status</h4>
                <div className="rounded-2xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{setupStatusLabel}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedSetup
                          ? selectedSetup.completed && selectedSetup.completed_at
                            ? `Completed ${formatDate(selectedSetup.completed_at)}`
                            : `Last updated ${formatDate(selectedSetup.updated_at)}`
                          : "No agency onboarding has been started yet."}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {selectedSetup?.completed ? "Portal ready" : selectedSetup ? `Step ${selectedSetup.current_step + 1} of 5` : "Start setup"}
                    </Badge>
                  </div>
                  <Button
                    className="w-full rounded-xl gradient-primary text-primary-foreground hover:opacity-90"
                    onClick={() => {
                      const agencyId = selectedAgency.id;
                      setSelectedAgency(null);
                      navigate(`/admin/agencies/${agencyId}/setup`);
                    }}
                  >
                    {selectedSetup?.completed ? "Review Agency Setup" : selectedSetup ? "Resume Agency Setup" : "Start Agency Setup"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </section>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default Agencies;
