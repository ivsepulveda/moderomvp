import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Brain,
  Shield,
  Camera,
  DollarSign,
  CreditCard,
  Briefcase,
  Fingerprint,
  IdCard,
  History,
  ShieldCheck,
  FileText,
  Zap,
  Link2,
  AlertTriangle,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type BrainState = {
  min_income_ratio: number;
  require_linkedin: boolean;
  require_db_credit: boolean;
  require_biometric_id: boolean;
  require_payslips: boolean;
  require_work_contract: boolean;
  require_tax_return: boolean;
  residency_history_check: boolean;
  email_verification: boolean;
  sms_verification: boolean;
  qualification_decision: string;
  // new optional fields
  require_gdpr?: boolean;
  require_tenant_photo?: boolean;
  require_nie?: boolean;
  require_dni?: boolean;
};

interface Props {
  brain: BrainState;
  onChange: (next: Partial<BrainState>) => void;
  onSave?: () => void;
  saving?: boolean;
}

type Tone = "green" | "orange" | "red" | "blue" | "purple" | "neutral";

const toneClasses: Record<Tone, { card: string; iconBg: string; iconColor: string; subtitle: string }> = {
  green: {
    card: "border-emerald-300/60 bg-emerald-50/60 dark:bg-emerald-950/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    subtitle: "text-emerald-700 dark:text-emerald-400",
  },
  orange: {
    card: "border-orange-200 bg-orange-50/60 dark:bg-orange-950/20",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    subtitle: "text-orange-600 dark:text-orange-400",
  },
  red: {
    card: "border-red-200 bg-red-50/60 dark:bg-red-950/20",
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconColor: "text-red-600 dark:text-red-400",
    subtitle: "text-red-600 dark:text-red-400",
  },
  blue: {
    card: "border-border bg-card",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    subtitle: "text-muted-foreground",
  },
  purple: {
    card: "border-border bg-card",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    subtitle: "text-muted-foreground",
  },
  neutral: {
    card: "border-border bg-card",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    subtitle: "text-muted-foreground",
  },
};

interface RuleCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  tone: Tone;
  checked: boolean;
  onToggle: (v: boolean) => void;
  weight?: number;
  weightLabel?: string;
  locked?: boolean;
  badge?: { label: string; tone: "green" | "red" };
  children?: React.ReactNode;
}

const RuleCard = ({
  icon: Icon,
  title,
  subtitle,
  tone,
  checked,
  onToggle,
  weight,
  weightLabel,
  locked,
  badge,
  children,
}: RuleCardProps) => {
  const t = toneClasses[checked ? tone : "neutral"];
  return (
    <div className={`rounded-2xl border-2 transition-all p-5 ${t.card}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${t.iconBg}`}>
          <Icon className={`w-6 h-6 ${t.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-foreground">{title}</h4>
            {badge && (
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full text-white ${
                  badge.tone === "green" ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                {badge.label}
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 font-medium ${checked ? t.subtitle : "text-muted-foreground"}`}>
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {weightLabel !== undefined && checked && (
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                tone === "orange"
                  ? "border-orange-300 text-orange-600 bg-orange-50 dark:bg-orange-950/30"
                  : "border-border text-muted-foreground"
              }`}
            >
              {weightLabel}
            </span>
          )}
          <Switch checked={checked} onCheckedChange={(v) => !locked && onToggle(v)} disabled={locked} />
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

const IntelligenceBrainStep = ({ brain, onChange, onSave, saving }: Props) => {
  // weights (must mirror RealTime score distribution)
  const weights = {
    db_credit: 30,
    linkedin: 20,
    identity: 20, // biometric+nie+dni
    residency: 15,
    verification: 15,
  };

  const totalScore =
    (brain.require_db_credit ? weights.db_credit : 0) +
    (brain.require_linkedin ? weights.linkedin : 0) +
    (brain.require_biometric_id || brain.require_nie || brain.require_dni ? weights.identity : 0) +
    (brain.residency_history_check ? weights.residency : 0) +
    (brain.email_verification || brain.sms_verification ? weights.verification : 0);

  const seg = (active: boolean, value: number) => (active ? value : 0);
  const segments = [
    { label: `D&B Credit (${weights.db_credit}%)`, value: seg(brain.require_db_credit, weights.db_credit), color: "bg-orange-500", dot: "bg-orange-500" },
    { label: `LinkedIn (${weights.linkedin}%)`, value: seg(brain.require_linkedin, weights.linkedin), color: "bg-blue-500", dot: "bg-blue-500" },
    { label: `Identity (${weights.identity}%)`, value: seg(brain.require_biometric_id || !!brain.require_nie || !!brain.require_dni, weights.identity), color: "bg-emerald-500", dot: "bg-emerald-500" },
    { label: `Residency (${weights.residency}%)`, value: seg(brain.residency_history_check, weights.residency), color: "bg-purple-300", dot: "bg-purple-300" },
    { label: `Verifications (${weights.verification}%)`, value: seg(brain.email_verification || brain.sms_verification, weights.verification), color: "bg-amber-500", dot: "bg-amber-500" },
  ];

  const gdpr = brain.require_gdpr ?? true;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
          <Brain className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">Intelligence Brain</h3>
          <p className="text-muted-foreground">
            Toggle criteria to build your 100-Point Score. The tenant form adapts to your rules automatically.
          </p>
        </div>
      </div>

      {/* GDPR (locked, always-on) */}
      <RuleCard
        icon={Shield}
        title="GDPR Data Consent"
        subtitle="Tenant must accept GDPR data processing consent before starting the qualification form."
        tone="green"
        checked={true}
        locked
        onToggle={() => {}}
        badge={{ label: "Required", tone: "green" }}
      >
        <p className="text-sm text-muted-foreground">
          This rule cannot be disabled. Under EU regulation, tenant data processing requires explicit consent. The qualification form will display a mandatory GDPR consent checkbox before any data is collected.
        </p>
        <div className="flex gap-2 mt-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">EU Compliant</span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30">Always Active</span>
        </div>
      </RuleCard>

      {/* Tenant Photo */}
      <RuleCard
        icon={Camera}
        title="Tenant Photo (Avatar)"
        subtitle="Tenant must upload a profile photo. Photo displayed in tenant inquiry cards."
        tone="orange"
        checked={brain.require_tenant_photo ?? false}
        onToggle={(v) => onChange({ require_tenant_photo: v })}
        weightLabel="0%"
      />

      {/* Income Gate */}
      <RuleCard
        icon={DollarSign}
        title="Income Gate"
        subtitle="Tenant must earn ≥ 3× monthly rent. Failure = 0% score."
        tone="red"
        checked={true}
        locked
        onToggle={() => {}}
        badge={{ label: "Hard Gate", tone: "red" }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Rent-to-Income Ratio</span>
            <span className="text-2xl font-bold text-orange-600">{brain.min_income_ratio.toFixed(0)}×</span>
          </div>
          <Slider
            value={[brain.min_income_ratio]}
            min={2}
            max={5}
            step={1}
            onValueChange={([v]) => onChange({ min_income_ratio: v })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2×</span><span>3×</span><span>4×</span><span>5×</span>
          </div>
        </div>
      </RuleCard>

      {/* D&B */}
      <RuleCard
        icon={CreditCard}
        title="D&B Credit Check"
        subtitle="Dun & Bradstreet credit pull required (+30 pts)"
        tone="orange"
        checked={brain.require_db_credit}
        onToggle={(v) => onChange({ require_db_credit: v })}
        weightLabel="30%"
      />

      {/* LinkedIn */}
      <RuleCard
        icon={Briefcase}
        title="LinkedIn Verification"
        subtitle="Professional identity confirmed via LinkedIn (+20 pts)"
        tone="orange"
        checked={brain.require_linkedin}
        onToggle={(v) => onChange({ require_linkedin: v })}
        weightLabel="20%"
      >
        {brain.require_linkedin && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-700 dark:text-blue-400 text-sm">LinkedIn Auto-Fill Intelligence</span>
            </div>
            <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-2">When enabled, Modero connects to the tenant's LinkedIn profile and auto-fills:</p>
            <ul className="text-sm text-blue-700/90 dark:text-blue-300/90 space-y-1.5 ml-1">
              <li>• <strong>Current Employer</strong> — company name and job title extracted automatically</li>
              <li>• <strong>Employment Duration</strong> — how many years at current position</li>
              <li>• <strong>Business Email Cross-Check</strong> — if the tenant's email domain matches their employer, this boosts the score</li>
              <li>• <strong>Payslip Match</strong> — employer on LinkedIn is compared against uploaded payslips for consistency</li>
            </ul>
            <p className="text-sm text-blue-700/90 dark:text-blue-300/90 mt-3 flex items-start gap-1.5">
              <Zap className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Mismatches between LinkedIn employer and payslips will be flagged and reduce the qualification score.</span>
            </p>
          </div>
        )}
      </RuleCard>

      {/* Biometric */}
      <RuleCard
        icon={Fingerprint}
        title="Biometric ID / Passport Match"
        subtitle="Tenant must pass biometric liveness check (+20 pts)"
        tone="orange"
        checked={brain.require_biometric_id}
        onToggle={(v) => onChange({ require_biometric_id: v })}
        weightLabel="20%"
      />

      {/* Spanish NIE */}
      <RuleCard
        icon={IdCard}
        title="Spanish NIE"
        subtitle={brain.require_nie ? "NIE verification required." : "NIE verification not required."}
        tone="orange"
        checked={brain.require_nie ?? false}
        onToggle={(v) => onChange({ require_nie: v })}
      />

      {/* Spanish DNI */}
      <RuleCard
        icon={IdCard}
        title="Spanish DNI"
        subtitle={brain.require_dni ? "DNI verification required." : "DNI verification not required."}
        tone="blue"
        checked={brain.require_dni ?? false}
        onToggle={(v) => onChange({ require_dni: v })}
      />

      {/* Residency */}
      <RuleCard
        icon={History}
        title="5-Year Residency History"
        subtitle={brain.residency_history_check ? "Residency history required (+15 pts)" : "Residency history not required (0 pts)"}
        tone="purple"
        checked={brain.residency_history_check}
        onToggle={(v) => onChange({ residency_history_check: v })}
        weightLabel={brain.residency_history_check ? "15%" : undefined}
      />

      {/* Contact Verifications */}
      <RuleCard
        icon={ShieldCheck}
        title="Contact Verifications (SMS & Email)"
        subtitle="SMS + email verification required (+15 pts)"
        tone="orange"
        checked={brain.sms_verification || brain.email_verification}
        onToggle={(v) => onChange({ sms_verification: v, email_verification: v })}
        weightLabel="15%"
      >
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={brain.sms_verification} onCheckedChange={(v) => onChange({ sms_verification: v })} />
            <span className="text-sm font-medium text-foreground">SMS OTP</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch checked={brain.email_verification} onCheckedChange={(v) => onChange({ email_verification: v })} />
            <span className="text-sm font-medium text-foreground">Email</span>
          </label>
        </div>
      </RuleCard>

      {/* Required Document Uploads */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Required Document Uploads</h4>
            <p className="text-sm text-muted-foreground">Toggle which documents are mandatory on the tenant form</p>
          </div>
        </div>
        <div className="space-y-1 pl-1">
          {[
            { key: "require_payslips", title: "Payslips (last 3 months)", desc: "Proof of regular income" },
            { key: "require_work_contract", title: "Work Contract", desc: "Employment agreement" },
            { key: "require_tax_return", title: "Tax Return (Declaración de la Renta)", desc: "Annual tax filing" },
          ].map((doc, i) => (
            <div
              key={doc.key}
              className={`flex items-center justify-between py-3 ${i < 2 ? "border-b border-border" : ""}`}
            >
              <div>
                <p className="font-semibold text-foreground">{doc.title}</p>
                <p className="text-sm text-muted-foreground">{doc.desc}</p>
              </div>
              <Switch
                checked={Boolean(brain[doc.key as keyof BrainState])}
                onCheckedChange={(v) => onChange({ [doc.key]: v } as Partial<BrainState>)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Qualification Decision */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Qualification Decision</h4>
            <p className="text-sm text-muted-foreground">What happens after the score is calculated?</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: "auto_approve", emoji: "✅", title: "Auto Approve", desc: "Score ≥ threshold → instant qualification" },
            { key: "manual_review", emoji: "👁️", title: "Manual Review", desc: "Agent reviews every application" },
            { key: "auto_reject", emoji: "❌", title: "Auto Reject", desc: "Any rule fails → automatically rejected" },
          ].map((opt) => {
            const active = brain.qualification_decision === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChange({ qualification_decision: opt.key })}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  active ? "border-orange-500 bg-orange-50/60 dark:bg-orange-950/20" : "border-border bg-background hover:border-muted-foreground/40"
                }`}
              >
                <div className="text-2xl mb-2">{opt.emoji}</div>
                <p className="font-bold text-foreground">{opt.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-Time Score Distribution */}
      <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/40 dark:bg-orange-950/20 p-5">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <h4 className="font-bold text-foreground text-lg">Real-Time Score Distribution</h4>
            <p className="text-sm text-muted-foreground">Points available based on your active criteria</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-4xl font-bold text-orange-600">{totalScore}</span>
            <span className="text-lg text-muted-foreground"> / 100 pts</span>
          </div>
        </div>

        {/* Bar */}
        <div className="h-3 w-full rounded-full overflow-hidden bg-muted flex mb-3">
          {segments.map((s, i) => (
            <div key={i} className={s.color} style={{ width: `${s.value}%` }} />
          ))}
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          {segments.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
              <span className={`text-sm ${s.value === 0 ? "text-muted-foreground line-through" : "text-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 p-3 flex items-start gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>Hard Gate Active:</strong> If tenant earns &lt; {brain.min_income_ratio}× rent, score is automatically 0%.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Enable more integrations to increase the maximum qualification score available to tenants.
        </p>
      </div>

      {onSave && (
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving} size="lg" className="rounded-xl gradient-primary text-primary-foreground gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
};

export default IntelligenceBrainStep;
