import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Filter, Brain, Bell, Zap, Mail, AlertTriangle,
  Save, Loader2, Sparkles, Info,
} from "lucide-react";
import { toast } from "sonner";

// Settings persist locally for now (no settings table yet).
// When a settings table is added, swap localStorage for Supabase.
const STORAGE_KEY = "modero.platform.settings";

interface PlatformSettings {
  // Qualification gate
  minListings: number;
  requireBusinessEmail: boolean;
  requireWebsite: boolean;
  requireIdealistaProfile: boolean;
  minYearsOperating: number;
  autoApprove: boolean;
  autoRejectBelowThreshold: boolean;

  // Tenant scoring weights (sum should ~= 100)
  weightIdentity: number;
  weightFinancial: number;
  weightEmployment: number;
  weightDocuments: number;

  // Decision thresholds
  approveThreshold: number;
  reviewThreshold: number;
  fraudPenalty: number;

  // Fraud detection
  fraudCheckLinkedIn: boolean;
  fraudCheckIncomeRatio: boolean;
  fraudIncomeMultiplier: number;
  fraudCheckDocConsistency: boolean;

  // Notifications
  notifyNewApplication: boolean;
  notifyApproval: boolean;
  notifyFraudFlag: boolean;
  notifyLowScore: boolean;
  digestFrequency: "instant" | "hourly" | "daily";

  // Platform
  supportEmail: string;
  reviewSlaHours: number;
}

const DEFAULTS: PlatformSettings = {
  minListings: 10,
  requireBusinessEmail: true,
  requireWebsite: true,
  requireIdealistaProfile: true,
  minYearsOperating: 1,
  autoApprove: false,
  autoRejectBelowThreshold: true,

  weightIdentity: 25,
  weightFinancial: 35,
  weightEmployment: 25,
  weightDocuments: 15,

  approveThreshold: 75,
  reviewThreshold: 55,
  fraudPenalty: 30,

  fraudCheckLinkedIn: true,
  fraudCheckIncomeRatio: true,
  fraudIncomeMultiplier: 3,
  fraudCheckDocConsistency: true,

  notifyNewApplication: true,
  notifyApproval: false,
  notifyFraudFlag: true,
  notifyLowScore: true,
  digestFrequency: "instant",

  supportEmail: "support@modero.com",
  reviewSlaHours: 24,
};

const AdminSettings = () => {
  const [s, setS] = useState<PlatformSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setS({ ...DEFAULTS, ...JSON.parse(stored) }); } catch {}
    }
  }, []);

  const update = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setS((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const save = () => {
    setSaving(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setTimeout(() => {
      setSaving(false);
      setDirty(false);
      toast.success("Settings saved");
    }, 400);
  };

  const reset = () => {
    setS(DEFAULTS);
    setDirty(true);
    toast.info("Reverted to defaults — click Save to apply");
  };

  const weightSum = s.weightIdentity + s.weightFinancial + s.weightEmployment + s.weightDocuments;
  const weightsValid = weightSum === 100;

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Control the rules that drive agency qualification, tenant scoring and fraud detection across Modero
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={reset} disabled={saving}>Reset</Button>
          <Button onClick={save} disabled={!dirty || saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <Info className="w-4 h-4" /> You have unsaved changes
        </div>
      )}

      {/* Agency Qualification Gate */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" /> Agency Qualification Gate
          </CardTitle>
          <CardDescription>
            Auto-flag agency applications that don't meet Modero's exclusivity standard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum Idealista listings</Label>
              <Input type="number" min={1} value={s.minListings} onChange={(e) => update("minListings", +e.target.value)} className="rounded-xl" />
              <p className="text-xs text-muted-foreground">Agencies below this count are auto-flagged</p>
            </div>
            <div className="space-y-2">
              <Label>Minimum years operating</Label>
              <Input type="number" min={0} value={s.minYearsOperating} onChange={(e) => update("minYearsOperating", +e.target.value)} className="rounded-xl" />
              <p className="text-xs text-muted-foreground">0 means no minimum</p>
            </div>
          </div>

          <Separator />

          {[
            { k: "requireBusinessEmail" as const, label: "Require business email", desc: "Reject @gmail, @hotmail, @outlook etc." },
            { k: "requireWebsite" as const, label: "Require active website", desc: "Application must include a working agency URL" },
            { k: "requireIdealistaProfile" as const, label: "Require Idealista profile", desc: "Verify presence on the main listing platform" },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between">
              <div>
                <Label>{row.label}</Label>
                <p className="text-xs text-muted-foreground">{row.desc}</p>
              </div>
              <Switch checked={s[row.k] as boolean} onCheckedChange={(v) => update(row.k, v as never)} />
            </div>
          ))}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                Auto-approve qualified agencies
                <Badge variant="outline" className="text-[10px]">Risky</Badge>
              </Label>
              <p className="text-xs text-muted-foreground">Skip manual review when all gate conditions pass</p>
            </div>
            <Switch checked={s.autoApprove} onCheckedChange={(v) => update("autoApprove", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-reject below threshold</Label>
              <p className="text-xs text-muted-foreground">Instantly reject when 2+ gate conditions fail</p>
            </div>
            <Switch checked={s.autoRejectBelowThreshold} onCheckedChange={(v) => update("autoRejectBelowThreshold", v)} />
          </div>
        </CardContent>
      </Card>

      {/* Tenant Scoring */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" /> Tenant Trust Score Weights
          </CardTitle>
          <CardDescription>
            Control how each signal contributes to a tenant's 0–100 trust score. Total must equal 100.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { k: "weightIdentity" as const, label: "Identity verification", desc: "Biometric ID, NIE, LinkedIn match" },
            { k: "weightFinancial" as const, label: "Financial standing", desc: "Income, credit history, payment punctuality" },
            { k: "weightEmployment" as const, label: "Employment stability", desc: "Contract type, company, tenure" },
            { k: "weightDocuments" as const, label: "Document completeness", desc: "Payslips, tax returns, references" },
          ].map((w) => (
            <div key={w.k}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label>{w.label}</Label>
                  <p className="text-xs text-muted-foreground">{w.desc}</p>
                </div>
                <span className="text-sm font-semibold text-primary tabular-nums w-12 text-right">{s[w.k]}%</span>
              </div>
              <Slider value={[s[w.k] as number]} max={100} step={5} onValueChange={([v]) => update(w.k, v as never)} />
            </div>
          ))}
          <div className={`flex items-center justify-between p-3 rounded-xl ${weightsValid ? "bg-primary/5 border border-primary/20" : "bg-destructive/10 border border-destructive/20"}`}>
            <span className="text-sm font-medium text-foreground">Total weight</span>
            <span className={`text-sm font-bold ${weightsValid ? "text-primary" : "text-destructive"}`}>
              {weightSum}% {weightsValid ? "✓" : `(must equal 100%)`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Decision Thresholds */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Decision Thresholds
          </CardTitle>
          <CardDescription>Score cutoffs that determine tenant outcome</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Auto-approve above</Label>
              <span className="text-sm font-semibold text-green-600">{s.approveThreshold}</span>
            </div>
            <Slider value={[s.approveThreshold]} max={100} min={50} step={5} onValueChange={([v]) => update("approveThreshold", v)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Manual review above</Label>
              <span className="text-sm font-semibold text-yellow-600">{s.reviewThreshold}</span>
            </div>
            <Slider value={[s.reviewThreshold]} max={s.approveThreshold - 5} min={20} step={5} onValueChange={([v]) => update("reviewThreshold", v)} />
            <p className="text-xs text-muted-foreground mt-1">Below {s.reviewThreshold}: auto-reject</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Fraud penalty (points deducted)</Label>
              <span className="text-sm font-semibold text-destructive">−{s.fraudPenalty}</span>
            </div>
            <Slider value={[s.fraudPenalty]} max={100} min={0} step={5} onValueChange={([v]) => update("fraudPenalty", v)} />
          </div>
        </CardContent>
      </Card>

      {/* Fraud Detection */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Fraud Detection Rules
          </CardTitle>
          <CardDescription>Active checks that raise fraud flags during tenant screening</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label>LinkedIn verification</Label>
              <p className="text-xs text-muted-foreground">Cross-check declared employer with LinkedIn profile</p>
            </div>
            <Switch checked={s.fraudCheckLinkedIn} onCheckedChange={(v) => update("fraudCheckLinkedIn", v)} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Income-to-rent ratio check</Label>
              <p className="text-xs text-muted-foreground">Flag when monthly income &lt; rent × multiplier</p>
            </div>
            <Switch checked={s.fraudCheckIncomeRatio} onCheckedChange={(v) => update("fraudCheckIncomeRatio", v)} />
          </div>
          {s.fraudCheckIncomeRatio && (
            <div className="pl-4 border-l-2 border-primary/30">
              <Label>Required income multiplier</Label>
              <div className="flex items-center gap-3 mt-2">
                <Slider value={[s.fraudIncomeMultiplier]} max={5} min={1.5} step={0.5} onValueChange={([v]) => update("fraudIncomeMultiplier", v)} className="flex-1" />
                <span className="text-sm font-semibold text-primary w-12">{s.fraudIncomeMultiplier}×</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Tenant must earn {s.fraudIncomeMultiplier}× monthly rent</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label>Document consistency check</Label>
              <p className="text-xs text-muted-foreground">Detect mismatches between payslips, contracts and ID</p>
            </div>
            <Switch checked={s.fraudCheckDocConsistency} onCheckedChange={(v) => update("fraudCheckDocConsistency", v)} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Admin Notifications
          </CardTitle>
          <CardDescription>What deserves your attention, and how often</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {[
            { k: "notifyNewApplication" as const, label: "New agency applications", icon: Mail },
            { k: "notifyFraudFlag" as const, label: "Fraud flags raised", icon: AlertTriangle },
            { k: "notifyLowScore" as const, label: "Low-trust tenants", icon: AlertTriangle },
            { k: "notifyApproval" as const, label: "Agency approvals (FYI)", icon: Mail },
          ].map((n) => (
            <div key={n.k} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <n.icon className="w-4 h-4 text-muted-foreground" />
                <Label>{n.label}</Label>
              </div>
              <Switch checked={s[n.k] as boolean} onCheckedChange={(v) => update(n.k, v as never)} />
            </div>
          ))}
          <Separator />
          <div className="space-y-2">
            <Label>Delivery frequency</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["instant", "hourly", "daily"] as const).map((f) => (
                <Button
                  key={f}
                  variant={s.digestFrequency === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("digestFrequency", f)}
                  className="capitalize"
                >
                  {f === "instant" && <Zap className="w-3 h-3 mr-1" />} {f}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Operational
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Support email</Label>
            <Input value={s.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Application review SLA (hours)</Label>
            <Input type="number" min={1} value={s.reviewSlaHours} onChange={(e) => update("reviewSlaHours", +e.target.value)} className="rounded-xl max-w-[140px]" />
            <p className="text-xs text-muted-foreground">Pending applications older than this are highlighted on the dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
