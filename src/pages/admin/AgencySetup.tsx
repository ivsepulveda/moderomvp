import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Brain, Building2, Calendar, Check, CheckCircle2, Loader2, Mail, Plus, Settings2, Trash2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApplicationRecord {
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
}

interface ListingDraft {
  id: string;
  title: string;
  address: string;
  rent: string;
  bedrooms: string;
  bathrooms: string;
}

interface TeamMemberDraft {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  assigned_listing_ids: string[];
}

interface AgencySetupRecord {
  application_id: string;
  basic_info: Record<string, any>;
  listings: ListingDraft[];
  connection_settings: Record<string, any>;
  intelligence_brain: Record<string, any>;
  team_members: TeamMemberDraft[];
  current_step: number;
  completed: boolean;
}

const SETUP_STEPS = [
  { label: "Basic Info", icon: Building2 },
  { label: "Set Up Listings", icon: Plus },
  { label: "Connect Settings", icon: Settings2 },
  { label: "Intelligence Brain", icon: Brain },
  { label: "Team Members", icon: Users },
];

const defaultBrain = {
  min_income_ratio: 3,
  require_linkedin: true,
  require_db_credit: true,
  require_biometric_id: true,
  require_payslips: true,
  require_work_contract: true,
  require_tax_return: false,
  residency_history_check: false,
  email_verification: true,
  sms_verification: true,
  qualification_decision: "manual_review",
};

const emptyListing = (): ListingDraft => ({
  id: crypto.randomUUID(),
  title: "",
  address: "",
  rent: "",
  bedrooms: "",
  bathrooms: "",
});

const emptyTeamMember = (): TeamMemberDraft => ({
  id: crypto.randomUUID(),
  name: "",
  email: "",
  phone: "",
  role: "Agent",
  assigned_listing_ids: [],
});

const AgencySetup = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<ApplicationRecord | null>(null);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    agency_name: "",
    email: "",
    website: "",
    idealista_profile: "",
    active_listings: "",
    monthly_inquiries: "",
    years_operating: "",
    associations: "",
    pitch: "",
  });
  const [listings, setListings] = useState<ListingDraft[]>([emptyListing()]);
  const [connectionSettings, setConnectionSettings] = useState({
    notification_email: "",
    calendar_provider: "none",
    inbox_connected: false,
  });
  const [intelligenceBrain, setIntelligenceBrain] = useState(defaultBrain);
  const [teamMembers, setTeamMembers] = useState<TeamMemberDraft[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      const [{ data: app, error: appError }, { data: setup, error: setupError }] = await Promise.all([
        supabase.from("applications").select("*").eq("id", id).single(),
        supabase.from("agency_setup").select("*").eq("application_id", id).maybeSingle(),
      ]);

      if (appError || !app) {
        toast.error("Failed to load agency application");
        navigate("/admin/agencies");
        return;
      }

      if (setupError) {
        toast.error("Failed to load agency setup");
      }

      setApplication(app as ApplicationRecord);

      if (setup) {
        const saved = setup as unknown as AgencySetupRecord;
        const savedBasicInfo = (saved.basic_info && typeof saved.basic_info === "object" && !Array.isArray(saved.basic_info)) ? saved.basic_info : {};
        const savedConnectionSettings = (saved.connection_settings && typeof saved.connection_settings === "object" && !Array.isArray(saved.connection_settings)) ? saved.connection_settings : {};
        const savedIntelligenceBrain = (saved.intelligence_brain && typeof saved.intelligence_brain === "object" && !Array.isArray(saved.intelligence_brain)) ? saved.intelligence_brain : {};
        const savedListings = Array.isArray(saved.listings) ? (saved.listings as unknown as ListingDraft[]) : [];
        const savedTeamMembers = Array.isArray(saved.team_members) ? (saved.team_members as unknown as TeamMemberDraft[]) : [];

        setStep(saved.current_step || 0);
        setCompleted(saved.completed || false);
        setBasicInfo({
          agency_name: savedBasicInfo.agency_name ?? app.agency_name ?? "",
          email: savedBasicInfo.email ?? app.email ?? "",
          website: savedBasicInfo.website ?? app.website ?? "",
          idealista_profile: savedBasicInfo.idealista_profile ?? app.idealista_profile ?? "",
          active_listings: savedBasicInfo.active_listings ?? app.active_listings ?? "",
          monthly_inquiries: savedBasicInfo.monthly_inquiries ?? app.monthly_inquiries ?? "",
          years_operating: savedBasicInfo.years_operating ?? app.years_operating ?? "",
          associations: savedBasicInfo.associations ?? app.associations ?? "",
          pitch: savedBasicInfo.pitch ?? app.pitch ?? "",
        });
        setListings(savedListings.length ? savedListings : [emptyListing()]);
        setConnectionSettings({
          notification_email: savedConnectionSettings.notification_email ?? app.email ?? "",
          calendar_provider: savedConnectionSettings.calendar_provider ?? "none",
          inbox_connected: savedConnectionSettings.inbox_connected ?? false,
        });
        setIntelligenceBrain({ ...defaultBrain, ...(savedIntelligenceBrain as Partial<typeof defaultBrain>) });
        setTeamMembers(savedTeamMembers);
      } else {
        setBasicInfo({
          agency_name: app.agency_name ?? "",
          email: app.email ?? "",
          website: app.website ?? "",
          idealista_profile: app.idealista_profile ?? "",
          active_listings: app.active_listings ?? "",
          monthly_inquiries: app.monthly_inquiries ?? "",
          years_operating: app.years_operating ?? "",
          associations: app.associations ?? "",
          pitch: app.pitch ?? "",
        });
        setConnectionSettings((prev) => ({ ...prev, notification_email: app.email ?? prev.notification_email }));
      }

      setLoading(false);
    };

    fetchData();
  }, [id, navigate]);

  const progress = useMemo(() => ((step + (completed ? 1 : 0)) / SETUP_STEPS.length) * 100, [completed, step]);

  const canContinue = useMemo(() => {
    if (step === 0) return basicInfo.agency_name.trim() && basicInfo.email.trim();
    if (step === 1) return listings.some((listing) => listing.title.trim() && listing.address.trim());
    if (step === 2) return connectionSettings.notification_email.trim();
    return true;
  }, [basicInfo.agency_name, basicInfo.email, connectionSettings.notification_email, listings, step]);

  const saveSetup = async (nextStep: number, markCompleted = false) => {
    if (!id) return false;

    setSaving(true);
    const payload = {
      application_id: id,
      basic_info: basicInfo,
      listings: listings.filter((listing) => listing.title.trim() || listing.address.trim() || listing.rent.trim()),
      connection_settings: connectionSettings,
      intelligence_brain: intelligenceBrain,
      team_members: teamMembers.filter((member) => member.name.trim() || member.email.trim()),
      current_step: nextStep,
      completed: markCompleted,
      completed_at: markCompleted ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("agency_setup").upsert([payload] as any, { onConflict: "application_id" });
    setSaving(false);

    if (error) {
      toast.error(error.message || "Failed to save setup");
      return false;
    }

    setCompleted(markCompleted);
    return true;
  };

  const handleNext = async () => {
    const nextStep = Math.min(step + 1, SETUP_STEPS.length - 1);
    const ok = await saveSetup(nextStep, false);
    if (!ok) return;
    setStep(nextStep);
    toast.success("Agency setup saved");
  };

  const handleSaveDraft = async () => {
    const ok = await saveSetup(step, completed);
    if (ok) toast.success("Draft saved");
  };

  const handleFinish = async () => {
    const ok = await saveSetup(SETUP_STEPS.length - 1, true);
    if (!ok) return;
    toast.success("Agency onboarding completed and synced to the agency portal");
    navigate("/admin/agencies");
  };

  const updateListing = (id: string, key: keyof ListingDraft, value: string) => {
    setListings((prev) => prev.map((listing) => (listing.id === id ? { ...listing, [key]: value } : listing)));
  };

  const updateMember = (id: string, key: keyof TeamMemberDraft, value: string | string[]) => {
    setTeamMembers((prev) => prev.map((member) => (member.id === id ? { ...member, [key]: value } : member)));
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="p-6 md:p-8 max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" className="px-0 mb-2 h-auto text-muted-foreground hover:text-foreground" onClick={() => navigate("/admin/agencies")}> 
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Approved Agencies
          </Button>
          <h2 className="text-2xl font-bold text-foreground">Agency Onboarding Setup</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure the agency portal for {application.agency_name}</p>
        </div>
        <div className="flex items-center gap-3">
          {completed && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Completed</Badge>}
          <Button variant="outline" className="rounded-xl" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Draft"}
          </Button>
        </div>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Setup Progress</p>
              <p className="text-xs text-muted-foreground">Admin onboarding writes directly into the agency portal setup record.</p>
            </div>
            <p className="text-sm font-semibold text-primary">{Math.round(progress)}%</p>
          </div>
          <Progress value={progress} />
          <div className="grid gap-2 md:grid-cols-5">
            {SETUP_STEPS.map((item, index) => {
              const Icon = item.icon;
              const active = index === step;
              const done = completed || index < step;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`rounded-xl border p-3 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/30"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon className={`w-4 h-4 ${active || done ? "text-primary" : "text-muted-foreground"}`} />
                    {done && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-sm font-medium text-foreground mt-3">{item.label}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="shadow-card border-border">
          <CardContent className="p-6 space-y-6">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">1. Basic info</h3>
                  <p className="text-sm text-muted-foreground">Start from the application details and refine what will appear in the agency portal.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Agency name</Label>
                    <Input value={basicInfo.agency_name} onChange={(e) => setBasicInfo((prev) => ({ ...prev, agency_name: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Business email</Label>
                    <Input value={basicInfo.email} onChange={(e) => setBasicInfo((prev) => ({ ...prev, email: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={basicInfo.website} onChange={(e) => setBasicInfo((prev) => ({ ...prev, website: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Idealista profile</Label>
                    <Input value={basicInfo.idealista_profile} onChange={(e) => setBasicInfo((prev) => ({ ...prev, idealista_profile: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Active listings</Label>
                    <Input value={basicInfo.active_listings} onChange={(e) => setBasicInfo((prev) => ({ ...prev, active_listings: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly inquiries</Label>
                    <Input value={basicInfo.monthly_inquiries} onChange={(e) => setBasicInfo((prev) => ({ ...prev, monthly_inquiries: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Years operating</Label>
                    <Input value={basicInfo.years_operating} onChange={(e) => setBasicInfo((prev) => ({ ...prev, years_operating: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Professional associations</Label>
                    <Input value={basicInfo.associations} onChange={(e) => setBasicInfo((prev) => ({ ...prev, associations: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Agency pitch</Label>
                    <Textarea value={basicInfo.pitch} onChange={(e) => setBasicInfo((prev) => ({ ...prev, pitch: e.target.value }))} className="rounded-xl min-h-32" />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">2. Set up listings</h3>
                    <p className="text-sm text-muted-foreground">Create the initial property list the agency team will work from.</p>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={() => setListings((prev) => [...prev, emptyListing()])}>
                    <Plus className="w-4 h-4 mr-2" /> Add Listing
                  </Button>
                </div>
                <div className="space-y-4">
                  {listings.map((listing, index) => (
                    <div key={listing.id} className="rounded-2xl border border-border p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">Listing {index + 1}</p>
                        {listings.length > 1 && (
                          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setListings((prev) => prev.filter((item) => item.id !== listing.id))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                          <Label>Listing title</Label>
                          <Input value={listing.title} onChange={(e) => updateListing(listing.id, "title", e.target.value)} className="rounded-xl" placeholder="e.g. Luxury Apartment in Madrid" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Address</Label>
                          <Input value={listing.address} onChange={(e) => updateListing(listing.id, "address", e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Rent</Label>
                          <Input value={listing.rent} onChange={(e) => updateListing(listing.id, "rent", e.target.value)} className="rounded-xl" placeholder="e.g. 2200" />
                        </div>
                        <div className="space-y-2">
                          <Label>Bedrooms</Label>
                          <Input value={listing.bedrooms} onChange={(e) => updateListing(listing.id, "bedrooms", e.target.value)} className="rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label>Bathrooms</Label>
                          <Input value={listing.bathrooms} onChange={(e) => updateListing(listing.id, "bathrooms", e.target.value)} className="rounded-xl" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">3. Connect settings</h3>
                  <p className="text-sm text-muted-foreground">Set the communication defaults the agency portal should use.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notification email</Label>
                    <Input value={connectionSettings.notification_email} onChange={(e) => setConnectionSettings((prev) => ({ ...prev, notification_email: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Calendar provider</Label>
                    <Select value={connectionSettings.calendar_provider} onValueChange={(value) => setConnectionSettings((prev) => ({ ...prev, calendar_provider: value }))}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="google">Google Calendar</SelectItem>
                        <SelectItem value="outlook">Outlook Calendar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Inbox connection</Label>
                    <div className="h-10 rounded-xl border border-input px-3 flex items-center justify-between">
                      <span className="text-sm text-foreground">Mark inbox as connected</span>
                      <Switch checked={connectionSettings.inbox_connected} onCheckedChange={(checked) => setConnectionSettings((prev) => ({ ...prev, inbox_connected: checked }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <IntelligenceBrainStep
                brain={intelligenceBrain as any}
                onChange={(patch) => setIntelligenceBrain((prev) => ({ ...prev, ...patch }))}
              />
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">5. Team members & listing assignment</h3>
                    <p className="text-sm text-muted-foreground">Define who manages which listings inside the agency portal.</p>
                  </div>
                  <Button variant="outline" className="rounded-xl" onClick={() => setTeamMembers((prev) => [...prev, emptyTeamMember()])}>
                    <Plus className="w-4 h-4 mr-2" /> Add Team Member
                  </Button>
                </div>
                <div className="space-y-4">
                  {teamMembers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                      <p className="text-sm text-muted-foreground">No team members yet. Add at least one to complete the setup.</p>
                    </div>
                  ) : (
                    teamMembers.map((member, index) => (
                      <div key={member.id} className="rounded-2xl border border-border p-4 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">Team member {index + 1}</p>
                          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setTeamMembers((prev) => prev.filter((item) => item.id !== member.id))}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={member.name} onChange={(e) => updateMember(member.id, "name", e.target.value)} className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={member.email} onChange={(e) => updateMember(member.id, "email", e.target.value)} className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input value={member.phone} onChange={(e) => updateMember(member.id, "phone", e.target.value)} className="rounded-xl" />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={member.role} onChange={(e) => updateMember(member.id, "role", e.target.value)} className="rounded-xl" placeholder="e.g. Senior Agent" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Assigned listings</Label>
                          <div className="grid gap-2 md:grid-cols-2">
                            {listings.filter((listing) => listing.title.trim()).map((listing) => {
                              const checked = member.assigned_listing_ids.includes(listing.id);
                              return (
                                <button
                                  key={listing.id}
                                  type="button"
                                  onClick={() => updateMember(member.id, "assigned_listing_ids", checked ? member.assigned_listing_ids.filter((item) => item !== listing.id) : [...member.assigned_listing_ids, listing.id])}
                                  className={`rounded-xl border px-4 py-3 text-left transition-all ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-accent/30"}`}
                                >
                                  <p className="text-sm font-medium text-foreground">{listing.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{listing.address || "Address pending"}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={() => setStep((prev) => Math.max(prev - 1, 0))} disabled={step === 0 || saving}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              {step < SETUP_STEPS.length - 1 ? (
                <Button variant="hero" className="rounded-xl" onClick={handleNext} disabled={!canContinue || saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />} Save & Continue
                </Button>
              ) : (
                <Button variant="hero" className="rounded-xl" onClick={handleFinish} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Portal Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{basicInfo.agency_name || application.agency_name}</p>
                  <p className="text-muted-foreground">{basicInfo.email || application.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Listings</p>
                  <p className="text-lg font-semibold text-foreground">{listings.filter((listing) => listing.title.trim()).length}</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Team members</p>
                  <p className="text-lg font-semibold text-foreground">{teamMembers.filter((member) => member.name.trim()).length}</p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Notification email</p>
                <p className="font-medium text-foreground mt-1">{connectionSettings.notification_email || "Not set"}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Intelligence Brain</p>
                <p className="font-medium text-foreground mt-1">{intelligenceBrain.min_income_ratio.toFixed(1)}x rent • {intelligenceBrain.qualification_decision.replace("_", " ")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-base">What gets stored</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3"><Mail className="w-4 h-4 text-primary mt-0.5" /><span>Agency profile details and contact settings</span></div>
              <div className="flex items-start gap-3"><Plus className="w-4 h-4 text-primary mt-0.5" /><span>Initial listings and assignment-ready inventory</span></div>
              <div className="flex items-start gap-3"><Calendar className="w-4 h-4 text-primary mt-0.5" /><span>Connection defaults for communication and calendar workflow</span></div>
              <div className="flex items-start gap-3"><Brain className="w-4 h-4 text-primary mt-0.5" /><span>Default intelligence rules for tenant screening</span></div>
              <div className="flex items-start gap-3"><Users className="w-4 h-4 text-primary mt-0.5" /><span>Team members plus listing ownership setup</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgencySetup;
