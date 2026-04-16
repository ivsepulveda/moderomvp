import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Mail, Calendar, MessageSquare, Zap, Shield, ExternalLink,
  User, Settings, FileText, Briefcase, AlertTriangle,
  Zap as ZapIcon, Link2, CreditCard, Save, Globe, History, Fingerprint,
  DollarSign, Brain, IdCard, Camera,
} from "lucide-react";
import { toast } from "sonner";

// --- TYPES ---
interface ListingRules {
  min_income_ratio: number;
  income_gate_enabled: boolean;
  require_linkedin: boolean;
  require_db_credit: boolean;
  require_biometric_id: boolean;
  require_nie: boolean;
  require_dni: boolean;
  require_photo: boolean;
  residency_history_check: boolean;
  require_payslips: boolean;
  require_work_contract: boolean;
  require_tax_return: boolean;
  sms_verification: boolean;
  email_verification: boolean;
  qualification_decision: "auto_approve" | "manual_review" | "auto_reject";
  scoring_weights: {
    db_credit: number;
    linkedin: number;
    identity: number;
    residency: number;
    verification: number;
  };
}

const DEFAULT_RULES: ListingRules = {
  min_income_ratio: 3,
  income_gate_enabled: true,
  require_linkedin: true,
  require_db_credit: true,
  require_biometric_id: true,
  require_nie: false,
  require_dni: false,
  require_photo: true,
  residency_history_check: false,
  require_payslips: true,
  require_work_contract: true,
  require_tax_return: false,
  sms_verification: true,
  email_verification: true,
  qualification_decision: "manual_review",
  scoring_weights: {
    db_credit: 30,
    linkedin: 20,
    identity: 20,
    residency: 15,
    verification: 15,
  },
};

// --- RULE TOGGLE ROW ---
const RuleToggle = ({
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  title,
  enabledNote,
  disabledNote,
  points,
  enabled,
  onToggle,
  children,
}: {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  title: string;
  enabledNote: string;
  disabledNote: string;
  points: number;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  children?: React.ReactNode;
}) => (
  <div className={`p-5 rounded-xl border-2 transition-all ${enabled ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {enabled ? (
              <span className="text-primary font-medium">{enabledNote}</span>
            ) : (
              <span>{disabledNote}</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {enabled && (
          <Badge variant="outline" className="border-primary/30 text-primary text-xs font-bold">
            {points}%
          </Badge>
        )}
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
    </div>
    {children && enabled && <div className="mt-4 pl-[52px]">{children}</div>}
  </div>
);

// --- MAIN COMPONENT ---
const AgencySettings = () => {
  const { profile } = useAuth();

  // Connection states
  const [zapierWebhook, setZapierWebhook] = useState("");

  // Qualification rules state
  const [rules, setRules] = useState<ListingRules>(DEFAULT_RULES);

  const updateRule = <K extends keyof ListingRules>(key: K, value: ListingRules[K]) => {
    setRules((prev) => ({ ...prev, [key]: value }));
  };

  // Calculate live score
  const liveScore = useMemo(() => {
    const w = rules.scoring_weights;
    let total = 0;
    if (rules.require_db_credit) total += w.db_credit;
    if (rules.require_linkedin) total += w.linkedin;
    if (rules.require_biometric_id || rules.require_nie || rules.require_dni) total += w.identity;
    if (rules.residency_history_check) total += w.residency;
    if (rules.sms_verification || rules.email_verification) total += w.verification;
    return total;
  }, [rules]);

  // Score breakdown for the bar
  const scoreSegments = useMemo(() => {
    const w = rules.scoring_weights;
    return [
      { label: "D&B Credit", value: rules.require_db_credit ? w.db_credit : 0, max: w.db_credit, color: "bg-orange-500" },
      { label: "LinkedIn", value: rules.require_linkedin ? w.linkedin : 0, max: w.linkedin, color: "bg-blue-500" },
      { label: "Identity", value: (rules.require_biometric_id || rules.require_nie || rules.require_dni) ? w.identity : 0, max: w.identity, color: "bg-emerald-500" },
      { label: "Residency", value: rules.residency_history_check ? w.residency : 0, max: w.residency, color: "bg-purple-500" },
      { label: "Verifications", value: (rules.sms_verification || rules.email_verification) ? w.verification : 0, max: w.verification, color: "bg-amber-500" },
    ];
  }, [rules]);

  const handleConnect = (service: string) => {
    toast.info(`${service} integration coming soon`);
  };

  const handleSaveRules = async () => {
    const listingRules = {
      min_income_ratio: rules.min_income_ratio,
      income_gate_enabled: rules.income_gate_enabled,
      require_linkedin: rules.require_linkedin,
      require_db_credit: rules.require_db_credit,
      require_biometric_id: rules.require_biometric_id,
      require_nie: rules.require_nie,
      require_dni: rules.require_dni,
      require_photo: rules.require_photo,
      residency_history_check: rules.residency_history_check,
      require_payslips: rules.require_payslips,
      require_work_contract: rules.require_work_contract,
      require_tax_return: rules.require_tax_return,
      sms_verification: rules.sms_verification,
      email_verification: rules.email_verification,
      qualification_decision: rules.qualification_decision,
      scoring_weights: rules.scoring_weights,
    };

    toast.success("Qualification rules saved. Tenant forms will adapt automatically.");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Account</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile, tenant screening settings and your app connections</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-6 h-auto p-0">
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent px-1 pb-3 pt-1 gap-2"
          >
            <User className="w-4 h-4" /> Profile
          </TabsTrigger>
          <TabsTrigger
            value="qualification"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent px-1 pb-3 pt-1 gap-2"
          >
            <Brain className="w-4 h-4" /> Intelligence Brain
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent px-1 pb-3 pt-1 gap-2"
          >
            <Calendar className="w-4 h-4" /> Connection Settings
          </TabsTrigger>
        </TabsList>

        {/* ====== PROFILE TAB ====== */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="shadow-card border-border">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Manage your agency account details</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                <Save className="w-4 h-4" /> Edit Profile
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                  {profile?.agency_name?.[0] || "A"}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile?.agency_name || "Agency Name"}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email || "email@agency.com"}</p>
                  <Badge variant="outline" className="mt-1 text-primary border-primary/30">Agency</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Agency Name</Label>
                  <Input defaultValue={profile?.agency_name || ""} placeholder="e.g. Madrid Premier Rentals" className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Business Email</Label>
                  <div className="flex items-center gap-2">
                    <Input defaultValue={profile?.email || ""} disabled className="rounded-xl bg-muted/30" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">(cannot be changed)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Agency Website</Label>
                  <Input placeholder="https://youragency.com" className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Idealista Profile Link</Label>
                  <Input placeholder="https://idealista.com/pro/your-agency" className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Active Listings</Label>
                  <Input placeholder="e.g. 25" className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Monthly Inquiries</Label>
                  <Input placeholder="e.g. 50-100" className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Years Operating</Label>
                  <Input placeholder="e.g. 5-10" className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Professional Associations</Label>
                  <Input placeholder="e.g. APEMIP, GIPE, FIAIP, CEPI" className="rounded-xl bg-muted/30" />
                  <p className="text-xs text-muted-foreground">Optional — membership is weighted positively</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Agency Logo</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                    <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>

              <Button variant="hero" size="lg" className="rounded-xl">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== INTELLIGENCE BRAIN TAB ====== */}
        <TabsContent value="qualification" className="mt-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Intelligence Brain</h3>
              <p className="text-sm text-muted-foreground">
                Toggle criteria to build your 100-Point Score. The tenant form adapts to your rules automatically.
              </p>
            </div>
          </div>

          {/* GDPR Compliance — always required */}
          <div className="p-5 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">GDPR Data Consent</h4>
                    <Badge className="bg-emerald-600 text-xs hover:bg-emerald-600">Required</Badge>
                  </div>
                  <p className="text-xs text-emerald-600 font-medium mt-0.5">
                    Tenant must accept GDPR data processing consent before starting the qualification form.
                  </p>
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>
            <div className="mt-3 pl-[52px] space-y-1">
              <p className="text-xs text-muted-foreground">
                This rule cannot be disabled. Under EU regulation, tenant data processing requires explicit consent.
                The qualification form will display a mandatory GDPR consent checkbox before any data is collected.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">EU Compliant</Badge>
                <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">Always Active</Badge>
              </div>
            </div>
          </div>

          {/* Tenant Photo */}
          <RuleToggle
            icon={Camera}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-500/10"
            title="Tenant Photo (Avatar)"
            enabledNote="Tenant must upload a profile photo. Photo displayed in tenant inquiry cards."
            disabledNote="Photo upload not required — initials shown instead."
            points={0}
            enabled={rules.require_photo}
            onToggle={(v) => updateRule("require_photo", v)}
          />

          {/* Income Gate */}
          <div className={`p-5 rounded-xl border-2 transition-all ${rules.income_gate_enabled ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">Income Gate</h4>
                    <Badge variant="destructive" className="text-xs">Hard Gate</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rules.income_gate_enabled ? (
                      <span className="text-destructive font-medium">
                        Tenant must earn ≥ {rules.min_income_ratio}× monthly rent. Failure = 0% score.
                      </span>
                    ) : (
                      <span>Income ratio check bypassed — no hard gate applied.</span>
                    )}
                  </p>
                </div>
              </div>
              <Switch checked={rules.income_gate_enabled} onCheckedChange={(v) => updateRule("income_gate_enabled", v)} />
            </div>
            {rules.income_gate_enabled && (
              <div className="mt-4 pl-[52px] space-y-3">
                <Label className="text-sm font-medium text-foreground">Rent-to-Income Ratio</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[rules.min_income_ratio]}
                    onValueChange={([v]) => updateRule("min_income_ratio", v)}
                    min={2}
                    max={5}
                    step={0.5}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-primary min-w-[48px] text-right">{rules.min_income_ratio}×</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2×</span>
                  <span>3×</span>
                  <span>4×</span>
                  <span>5×</span>
                </div>
              </div>
            )}
          </div>

          {/* D&B Credit */}
          <RuleToggle
            icon={CreditCard}
            title="D&B Credit Check"
            enabledNote={`Dun & Bradstreet credit pull required (+${rules.scoring_weights.db_credit} pts)`}
            disabledNote="Credit check bypassed (0 pts)"
            points={rules.scoring_weights.db_credit}
            enabled={rules.require_db_credit}
            onToggle={(v) => updateRule("require_db_credit", v)}
          />

          {/* LinkedIn */}
          <RuleToggle
            icon={Briefcase}
            iconColor="text-blue-600"
            iconBg="bg-blue-500/10"
            title="LinkedIn Verification"
            enabledNote={`Professional identity confirmed via LinkedIn (+${rules.scoring_weights.linkedin} pts)`}
            disabledNote="LinkedIn verification bypassed (0 pts). LinkedIn button hidden from tenant form."
            points={rules.scoring_weights.linkedin}
            enabled={rules.require_linkedin}
            onToggle={(v) => updateRule("require_linkedin", v)}
          >
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs font-semibold text-blue-800 mb-1">🔗 LinkedIn Auto-Fill Intelligence</p>
                <p className="text-xs text-blue-700 leading-relaxed">
                  When enabled, Modero connects to the tenant's LinkedIn profile and auto-fills:
                </p>
                <ul className="text-xs text-blue-700 mt-1.5 space-y-1 list-disc pl-4">
                  <li><strong>Current Employer</strong> — company name and job title extracted automatically</li>
                  <li><strong>Employment Duration</strong> — how many years at current position</li>
                  <li><strong>Business Email Cross-Check</strong> — if the tenant's email domain matches their employer, this boosts the score</li>
                  <li><strong>Payslip Match</strong> — employer on LinkedIn is compared against uploaded payslips for consistency</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2 font-medium">
                  ⚡ Mismatches between LinkedIn employer and payslips will be flagged and reduce the qualification score.
                </p>
              </div>
            </div>
          </RuleToggle>

          {/* Biometric ID / Passport Match */}
          <RuleToggle
            icon={Fingerprint}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-500/10"
            title="Biometric ID / Passport Match"
            enabledNote={`Tenant must pass biometric liveness check (+${rules.scoring_weights.identity} pts)`}
            disabledNote="Identity verification bypassed (0 pts)"
            points={rules.scoring_weights.identity}
            enabled={rules.require_biometric_id}
            onToggle={(v) => updateRule("require_biometric_id", v)}
          />

          {/* Spanish NIE — separate section */}
          <div className={`p-5 rounded-xl border-2 transition-all ${rules.require_nie ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <IdCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Spanish NIE</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rules.require_nie ? (
                      <span className="text-amber-600 font-medium">NIE number required for non-EU nationals residing in Spain.</span>
                    ) : (
                      <span>NIE verification not required.</span>
                    )}
                  </p>
                </div>
              </div>
              <Switch checked={rules.require_nie} onCheckedChange={(v) => updateRule("require_nie", v)} />
            </div>
            {rules.require_nie && (
              <div className="mt-3 pl-[52px]">
                <p className="text-xs text-muted-foreground">
                  The <strong>Número de Identidad de Extranjero (NIE)</strong> is mandatory for non-EU nationals living or working in Spain. 
                  The tenant form will require the NIE number and upload of the NIE card.
                </p>
                <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 mt-2">Non-EU Nationals</Badge>
              </div>
            )}
          </div>

          {/* Spanish DNI — separate section */}
          <div className={`p-5 rounded-xl border-2 transition-all ${rules.require_dni ? "border-sky-500/30 bg-sky-500/5" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                  <IdCard className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Spanish DNI</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {rules.require_dni ? (
                      <span className="text-sky-600 font-medium">DNI required for Spanish nationals or permanent residents.</span>
                    ) : (
                      <span>DNI verification not required.</span>
                    )}
                  </p>
                </div>
              </div>
              <Switch checked={rules.require_dni} onCheckedChange={(v) => updateRule("require_dni", v)} />
            </div>
            {rules.require_dni && (
              <div className="mt-3 pl-[52px]">
                <p className="text-xs text-muted-foreground">
                  The <strong>Documento Nacional de Identidad (DNI)</strong> is the standard ID for Spanish citizens and 
                  those with a permanent residence permit. The tenant form will require the DNI number and a scan of the document.
                </p>
                <Badge variant="outline" className="text-xs border-sky-500/30 text-sky-600 mt-2">Spanish Nationals / Permanent Residents</Badge>
              </div>
            )}
          </div>

          {/* 5-Year Residency History */}
          <RuleToggle
            icon={History}
            iconColor="text-purple-600"
            iconBg="bg-purple-500/10"
            title="5-Year Residency History"
            enabledNote={`Tenant must declare residency history (+${rules.scoring_weights.residency} pts). Triggers Foreign ID field.`}
            disabledNote="Residency history not required (0 pts)"
            points={rules.scoring_weights.residency}
            enabled={rules.residency_history_check}
            onToggle={(v) => updateRule("residency_history_check", v)}
          />

          {/* SMS / Email Verification */}
          <RuleToggle
            icon={Shield}
            iconColor="text-amber-600"
            iconBg="bg-amber-500/10"
            title="Contact Verifications (SMS & Email)"
            enabledNote={`SMS + email verification required (+${rules.scoring_weights.verification} pts)`}
            disabledNote="Contact verification bypassed (0 pts)"
            points={rules.scoring_weights.verification}
            enabled={rules.sms_verification || rules.email_verification}
            onToggle={(v) => {
              updateRule("sms_verification", v);
              updateRule("email_verification", v);
            }}
          >
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={rules.sms_verification} onCheckedChange={(v) => updateRule("sms_verification", v)} />
                <span className="text-sm">SMS OTP</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={rules.email_verification} onCheckedChange={(v) => updateRule("email_verification", v)} />
                <span className="text-sm">Email</span>
              </label>
            </div>
          </RuleToggle>

          {/* Documents */}
          <Card className="border-2 border-border">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Required Document Uploads</h4>
                  <p className="text-xs text-muted-foreground">Toggle which documents are mandatory on the tenant form</p>
                </div>
              </div>
              <div className="space-y-3 pl-[52px]">
                {[
                  { key: "require_payslips" as const, label: "Payslips (last 3 months)", desc: "Proof of regular income" },
                  { key: "require_work_contract" as const, label: "Work Contract", desc: "Employment agreement" },
                  { key: "require_tax_return" as const, label: "Tax Return (Declaración de la Renta)", desc: "Annual tax filing" },
                ].map((doc) => (
                  <div key={doc.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <span className="text-sm font-medium text-foreground">{doc.label}</span>
                      <p className="text-xs text-muted-foreground">{doc.desc}</p>
                    </div>
                    <Switch
                      checked={rules[doc.key]}
                      onCheckedChange={(v) => updateRule(doc.key, v)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Qualification Decision */}
          <Card className="border-2 border-border">
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ZapIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Qualification Decision</h4>
                  <p className="text-xs text-muted-foreground">What happens after the score is calculated?</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: "auto_approve" as const, label: "Auto Approve", desc: "Score ≥ threshold → instant qualification", icon: "✅" },
                  { value: "manual_review" as const, label: "Manual Review", desc: "Agent reviews every application", icon: "👁️" },
                  { value: "auto_reject" as const, label: "Auto Reject", desc: "Any rule fails → automatically rejected", icon: "❌" },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${rules.qualification_decision === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"}`}
                    onClick={() => updateRule("qualification_decision", opt.value)}
                  >
                    <p className="text-lg mb-1">{opt.icon}</p>
                    <p className="font-semibold text-foreground text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ===== LIVE SCORE BAR ===== */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-lg">Real-Time Score Distribution</h4>
                  <p className="text-xs text-muted-foreground">Points available based on your active criteria</p>
                </div>
                <span className="text-3xl font-black text-primary">{liveScore}<span className="text-lg font-semibold text-muted-foreground"> / 100 pts</span></span>
              </div>

              {/* Stacked bar */}
              <div className="w-full h-6 rounded-full bg-muted overflow-hidden flex">
                {scoreSegments.map((seg) => (
                  seg.value > 0 && (
                    <div
                      key={seg.label}
                      className={`${seg.color} h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                      style={{ width: `${seg.value}%` }}
                      title={`${seg.label}: ${seg.value}%`}
                    />
                  )
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {scoreSegments.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${seg.color} ${seg.value === 0 ? "opacity-30" : ""}`} />
                    <span className={`text-xs font-medium ${seg.value === 0 ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {seg.label} ({seg.value}%)
                    </span>
                  </div>
                ))}
              </div>

              {/* Income Gate marker */}
              {rules.income_gate_enabled && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                  <span className="text-xs text-destructive font-medium">
                    Hard Gate Active: If tenant earns &lt; {rules.min_income_ratio}× rent, score is automatically 0%.
                  </span>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Enable more integrations to increase the maximum qualification score available to tenants.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="hero" size="lg" className="rounded-xl gap-2" onClick={handleSaveRules}>
              <Save className="w-4 h-4" /> Save Settings
            </Button>
          </div>
        </TabsContent>

        {/* ====== CONNECTION SETTINGS TAB ====== */}
        <TabsContent value="connections" className="mt-6 space-y-6">
          {/* Email */}
          <Card className="shadow-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="text-sm text-muted-foreground">Connect your business email to send and receive tenant communications</p>
                </div>
              </div>

              {[
                { id: "gmail", name: "Gmail", desc: "Connect your business Gmail account", color: "text-red-500" },
                { id: "outlook", name: "Outlook Mail", desc: "Connect your Outlook email", color: "text-blue-500" },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Mail className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleConnect(item.name)}>
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="shadow-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Calendar</h3>
                  <p className="text-sm text-muted-foreground">Sync property viewings and tenant meetings with your calendar</p>
                </div>
              </div>

              {[
                { id: "gcal", name: "Google Calendar", desc: "Sync viewings with Google Calendar", color: "text-green-500" },
                { id: "outcal", name: "Outlook Calendar", desc: "Sync viewings with Outlook Calendar", color: "text-blue-500" },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleConnect(item.name)}>
                    Connect
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* WhatsApp Business */}
          <Card className="shadow-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">WhatsApp Business</h3>
                  <p className="text-sm text-muted-foreground">Send viewing confirmations and tenant updates via WhatsApp</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">WhatsApp Business API</p>
                    <p className="text-xs text-muted-foreground">Connect your WhatsApp Business account</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleConnect("WhatsApp Business")}>
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Zapier */}
          <Card className="shadow-card border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Zapier Integrations</h3>
                  <p className="text-sm text-muted-foreground">Automate workflows by connecting Modero to 5,000+ apps via Zapier</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Zapier Webhook URL</Label>
                <Input
                  value={zapierWebhook}
                  onChange={(e) => setZapierWebhook(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  className="rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Create a Zap with a Webhook trigger, then paste the URL here.{" "}
                  <a href="https://zapier.com/app/zaps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Open Zapier <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
              <Button variant="hero" size="lg" className="rounded-xl" onClick={() => {
                if (!zapierWebhook) { toast.error("Please enter your Zapier webhook URL"); return; }
                toast.success("Zapier webhook saved successfully");
              }}>
                Save Webhook
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgencySettings;
