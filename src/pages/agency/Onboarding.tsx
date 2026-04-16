import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import ModeroLogo from "@/components/ModeroLogo";
import {
  Building2, Mail, ArrowRight, ArrowLeft, Check, UserPlus, Users, Shield,
  Eye, CalendarCheck, ListChecks, Home, Trash2,
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
interface AgentDraft {
  id: string;
  name: string;
  email: string;
  phone: string;
  permissions: {
    view_tenants: boolean;
    approve_tenants: boolean;
    schedule_viewings: boolean;
    manage_listings: boolean;
  };
}

const DEFAULT_PERMISSIONS = {
  view_tenants: true,
  approve_tenants: false,
  schedule_viewings: true,
  manage_listings: false,
};

const STEPS = [
  { label: "Agency Profile", icon: Building2 },
  { label: "Notification Email", icon: Mail },
  { label: "Add Team Members", icon: Users },
];

const AgencyOnboarding = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Profile
  const [agencyName, setAgencyName] = useState(profile?.agency_name || "");
  const [website, setWebsite] = useState("");
  const [idealistaProfile, setIdealistaProfile] = useState("");
  const [activeListings, setActiveListings] = useState("");
  const [yearsOperating, setYearsOperating] = useState("");

  // Step 2: Notification email
  const [notificationEmail, setNotificationEmail] = useState(profile?.email || "");

  // Step 3: Agents
  const [agents, setAgents] = useState<AgentDraft[]>([]);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgent, setNewAgent] = useState<AgentDraft>({
    id: crypto.randomUUID(),
    name: "",
    email: "",
    phone: "",
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  const addAgent = () => {
    if (!newAgent.name.trim() || !newAgent.email.trim()) {
      toast.error("Agent name and email are required");
      return;
    }
    setAgents((prev) => [...prev, { ...newAgent, id: crypto.randomUUID() }]);
    setNewAgent({
      id: crypto.randomUUID(),
      name: "",
      email: "",
      phone: "",
      permissions: { ...DEFAULT_PERMISSIONS },
    });
    setShowAddAgent(false);
    toast.success("Agent added");
  };

  const removeAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const canProceed = () => {
    if (step === 0) return agencyName.trim().length > 0;
    if (step === 1) return notificationEmail.trim().length > 0;
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          agency_name: agencyName,
          notification_email: notificationEmail,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Insert agents
      if (agents.length > 0) {
        const agentRows = agents.map((a) => ({
          agency_id: user.id,
          name: a.name,
          email: a.email,
          phone: a.phone || null,
          permissions: a.permissions,
        }));
        const { error: agentsError } = await supabase.from("agency_agents").insert(agentRows);
        if (agentsError) throw agentsError;
      }

      toast.success("Onboarding complete! Welcome to Modero.");
      navigate("/agency");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const PermissionToggle = ({
    label,
    icon: Icon,
    checked,
    onChange,
  }: {
    label: string;
    icon: React.ElementType;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <ModeroLogo size="sm" />
        <Badge variant="outline" className="text-primary border-primary/30">Agency Setup</Badge>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={i} className="flex items-center gap-2">
                  {i > 0 && (
                    <div className={`w-12 h-0.5 ${isDone ? "bg-primary" : "bg-border"}`} />
                  )}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isDone
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Agency Profile */}
          {step === 0 && (
            <Card className="shadow-card border-border">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto">
                    <Building2 className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Agency Profile</h2>
                  <p className="text-sm text-muted-foreground">Tell us about your agency</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Agency Name *</Label>
                    <Input
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="e.g. Madrid Premier Rentals"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://youragency.com"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Idealista Profile</Label>
                      <Input
                        value={idealistaProfile}
                        onChange={(e) => setIdealistaProfile(e.target.value)}
                        placeholder="https://idealista.com/pro/..."
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Active Listings</Label>
                      <Input
                        value={activeListings}
                        onChange={(e) => setActiveListings(e.target.value)}
                        placeholder="e.g. 25"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Years Operating</Label>
                      <Input
                        value={yearsOperating}
                        onChange={(e) => setYearsOperating(e.target.value)}
                        placeholder="e.g. 5-10"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Notification Email */}
          {step === 1 && (
            <Card className="shadow-card border-border">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto">
                    <Mail className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Notification Email</h2>
                  <p className="text-sm text-muted-foreground">
                    This email will be used to send tenant notifications (viewing confirmations, updates, etc.)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Notification Email Address *</Label>
                    <Input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      placeholder="e.g. viewings@youragency.com"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tenants will see this email when they receive viewing confirmations and status updates.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">How it works</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          When you approve a tenant or schedule a viewing, the tenant will receive an email notification.
                          The "reply-to" will be set to this email so tenants can respond directly to your agency.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Add Agents */}
          {step === 2 && (
            <Card className="shadow-card border-border">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center mx-auto">
                    <Users className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Add Team Members</h2>
                  <p className="text-sm text-muted-foreground">
                    Add agents to your team and set their permissions. You can always add more later in Settings.
                  </p>
                </div>

                {/* Existing agents */}
                {agents.length > 0 && (
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {agent.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {agent.permissions.view_tenants && (
                              <Badge variant="outline" className="text-xs"><Eye className="w-3 h-3" /></Badge>
                            )}
                            {agent.permissions.approve_tenants && (
                              <Badge variant="outline" className="text-xs"><Check className="w-3 h-3" /></Badge>
                            )}
                            {agent.permissions.schedule_viewings && (
                              <Badge variant="outline" className="text-xs"><CalendarCheck className="w-3 h-3" /></Badge>
                            )}
                            {agent.permissions.manage_listings && (
                              <Badge variant="outline" className="text-xs"><Home className="w-3 h-3" /></Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeAgent(agent.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add agent form */}
                {showAddAgent ? (
                  <div className="space-y-4 p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                    <h4 className="font-semibold text-foreground text-sm">New Agent</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name *</Label>
                        <Input
                          value={newAgent.name}
                          onChange={(e) => setNewAgent((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Agent name"
                          className="rounded-xl h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email *</Label>
                        <Input
                          type="email"
                          value={newAgent.email}
                          onChange={(e) => setNewAgent((p) => ({ ...p, email: e.target.value }))}
                          placeholder="agent@agency.com"
                          className="rounded-xl h-9"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Phone (optional)</Label>
                        <Input
                          value={newAgent.phone}
                          onChange={(e) => setNewAgent((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+34 600 000 000"
                          className="rounded-xl h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permissions</Label>
                      <div className="rounded-xl border border-border bg-card p-3">
                        <PermissionToggle
                          label="View Tenants"
                          icon={Eye}
                          checked={newAgent.permissions.view_tenants}
                          onChange={(v) =>
                            setNewAgent((p) => ({
                              ...p,
                              permissions: { ...p.permissions, view_tenants: v },
                            }))
                          }
                        />
                        <PermissionToggle
                          label="Approve / Reject Tenants"
                          icon={Check}
                          checked={newAgent.permissions.approve_tenants}
                          onChange={(v) =>
                            setNewAgent((p) => ({
                              ...p,
                              permissions: { ...p.permissions, approve_tenants: v },
                            }))
                          }
                        />
                        <PermissionToggle
                          label="Schedule Viewings"
                          icon={CalendarCheck}
                          checked={newAgent.permissions.schedule_viewings}
                          onChange={(v) =>
                            setNewAgent((p) => ({
                              ...p,
                              permissions: { ...p.permissions, schedule_viewings: v },
                            }))
                          }
                        />
                        <PermissionToggle
                          label="Manage Listings"
                          icon={Home}
                          checked={newAgent.permissions.manage_listings}
                          onChange={(v) =>
                            setNewAgent((p) => ({
                              ...p,
                              permissions: { ...p.permissions, manage_listings: v },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="hero" className="rounded-xl" onClick={addAgent}>
                        <UserPlus className="w-4 h-4 mr-2" /> Add Agent
                      </Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => setShowAddAgent(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-dashed border-2 h-14"
                    onClick={() => setShowAddAgent(true)}
                  >
                    <UserPlus className="w-5 h-5 mr-2" /> Add Team Member
                  </Button>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  You can skip this step and add team members later from Settings → Team.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                variant="hero"
                className="rounded-xl"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="hero"
                className="rounded-xl"
                onClick={handleFinish}
                disabled={saving}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                ) : (
                  <>
                    Complete Setup <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyOnboarding;
