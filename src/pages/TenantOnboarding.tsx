import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight, ArrowLeft, User, Briefcase, Upload, CheckCircle, Info,
  Shield, ShieldCheck, Camera, Fingerprint, IdCard, History, Link2, Mail, Phone,
  MessageCircle, Sparkles,
} from "lucide-react";

// ---------- constants ----------
const NATIONALITIES = [
  "Spanish", "Portuguese", "Italian", "French", "German", "British", "Dutch",
  "Belgian", "Swedish", "American", "Brazilian", "Colombian", "Argentine",
  "Mexican", "Chinese", "Indian", "Japanese", "Korean", "Australian", "Other",
];
const AGE_RANGES = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"];
const CONTRACT_TYPES = [
  { value: "permanent", label: "Permanent / Indefinido" },
  { value: "temporary", label: "Temporary / Temporal" },
  { value: "freelance", label: "Freelance / Autónomo" },
  { value: "internship", label: "Internship / Prácticas" },
];
const EMPLOYMENT_STATUSES = [
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-employed" },
  { value: "unemployed", label: "Unemployed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
];

// ---------- Brain shape (mirrors agency_setup.intelligence_brain) ----------
interface Brain {
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
  require_gdpr: boolean;
  require_tenant_photo: boolean;
  require_nie: boolean;
  require_dni: boolean;
}

const DEFAULT_BRAIN: Brain = {
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
  require_gdpr: true,
  require_tenant_photo: false,
  require_nie: false,
  require_dni: false,
};

const TenantOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const agencyIdParam = searchParams.get("agency_id");

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [brain, setBrain] = useState<Brain>(DEFAULT_BRAIN);
  const [brainLoading, setBrainLoading] = useState<boolean>(!!agencyIdParam);

  // Step 1 — Consent
  const [consent, setConsent] = useState({ gdpr: false, photo: null as File | null });

  // Step 2 — Identity (now includes contact + verifications)
  const [identity, setIdentity] = useState({
    name: "", phone: "", nationality: "", country_of_birth: "", age_range: "",
    nie: "", dni: "", linkedin_url: "",
    whatsapp_same: true, whatsapp_phone: "", whatsapp_connected: false,
    email_type: "" as "" | "business" | "student" | "private",
    email_code: "", email_verified: false,
    sms_code: "", sms_verified: false,
  });

  // Step 3 — Employment
  const [employment, setEmployment] = useState({
    employment_status: "", job_title: "", company: "",
    contract_type: "", income_monthly: "", salary_payment_date: "",
  });

  // Step 4 — Verifications (residency only now)
  const [verif, setVerif] = useState({
    residency_addresses: "",
  });

  // Step 5 — Documents
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    passport: null, payslip1: null, payslip2: null, payslip3: null,
    contract: null, tax_return: null,
  });

  // ---------- Load Brain from agency_setup ----------
  useEffect(() => {
    if (!agencyIdParam) { setBrainLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("agency_setup")
        .select("intelligence_brain")
        .eq("application_id", agencyIdParam)
        .maybeSingle();
      if (data?.intelligence_brain && typeof data.intelligence_brain === "object") {
        setBrain({ ...DEFAULT_BRAIN, ...(data.intelligence_brain as Partial<Brain>) });
      }
      setBrainLoading(false);
    })();
  }, [agencyIdParam]);

  // ---------- Load existing tenant ----------
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: tenant } = await supabase
        .from("tenants").select("*").eq("user_id", user.id).maybeSingle();
      if (!tenant) return;
      setTenantId(tenant.id);
      setIdentity((p) => ({
        ...p,
        name: tenant.name || "",
        phone: tenant.phone || "",
        nationality: tenant.nationality || "",
        country_of_birth: tenant.country_of_birth || "",
        age_range: tenant.age_range || "",
        linkedin_url: tenant.linkedin_profile || "",
      }));
      const { data: app } = await supabase
        .from("tenant_applications").select("*").eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (app) {
        setApplicationId(app.id);
        setEmployment({
          employment_status: app.employment_status || "",
          job_title: app.job_title || "",
          company: app.company || "",
          contract_type: app.contract_type || "",
          income_monthly: app.income_monthly?.toString() || "",
          salary_payment_date: app.salary_payment_date?.toString() || "",
        });
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/tenant/auth");
  }, [authLoading, user, navigate]);

  // ---------- Adaptive steps ----------
  const steps = useMemo(() => {
    const s = [
      { id: 1, key: "consent", label: "Consent", icon: Shield, active: true },
      { id: 2, key: "identity", label: "Identity", icon: User, active: true },
      { id: 3, key: "employment", label: "Employment", icon: Briefcase, active: true },
      {
        id: 4, key: "verifications", label: "Verifications", icon: ShieldCheck,
        active: brain.residency_history_check,
      },
      {
        id: 5, key: "documents", label: "Documents", icon: Upload,
        active: brain.require_payslips || brain.require_work_contract || brain.require_tax_return || brain.require_biometric_id,
      },
    ];
    return s.filter((x) => x.active).map((x, i) => ({ ...x, displayIndex: i + 1 }));
  }, [brain]);

  const totalSteps = steps.length;
  const currentStepMeta = steps.find((x) => x.id === step) ?? steps[0];
  const progressPercent = (currentStepMeta.displayIndex / totalSteps) * 100;

  // ---------- Profile completeness (boosts trust score) ----------
  const completeness = useMemo(() => {
    const checks: boolean[] = [
      !!consent.gdpr,
      !!identity.name,
      !!identity.phone,
      !!identity.nationality,
      !!identity.country_of_birth,
      !!identity.age_range,
      identity.whatsapp_connected || (identity.whatsapp_same && !!identity.phone),
      !!identity.email_type,
      identity.email_verified,
      identity.sms_verified,
      !brain.require_linkedin || !!identity.linkedin_url,
      !brain.require_nie || !!identity.nie,
      !brain.require_dni || !!identity.dni,
      !!employment.employment_status,
      !!employment.job_title,
      !!employment.company,
      !!employment.contract_type,
      !!employment.income_monthly,
      !!employment.salary_payment_date,
      !brain.require_biometric_id || !!files.passport,
      !brain.require_payslips || !!files.payslip1,
      !!files.payslip2,
      !!files.payslip3,
      !brain.require_work_contract || !!files.contract,
      !brain.require_tax_return || !!files.tax_return,
      !brain.residency_history_check || !!verif.residency_addresses,
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }, [consent, identity, employment, files, verif, brain]);

  // ---------- Per-step completeness (segmented by category) ----------
  type Segment = { label: string; weight: number; filled: boolean; color: string };
  const buildPct = (segs: Segment[]) => {
    const total = segs.reduce((s, x) => s + x.weight, 0) || 1;
    const done = segs.filter((s) => s.filled).reduce((s, x) => s + x.weight, 0);
    return Math.round((done / total) * 100);
  };

  const stepSegments = useMemo<Record<number, Segment[]>>(() => ({
    1: [
      { label: "GDPR", weight: 60, filled: !brain.require_gdpr || consent.gdpr, color: "hsl(24 95% 53%)" },
      { label: "Photo", weight: 40, filled: !brain.require_tenant_photo || !!consent.photo, color: "hsl(217 91% 60%)" },
    ],
    2: [
      { label: "Personal", weight: 30, filled: !!identity.name && !!identity.phone && !!identity.nationality, color: "hsl(24 95% 53%)" },
      { label: "WhatsApp", weight: 15, filled: identity.whatsapp_connected || (identity.whatsapp_same && !!identity.phone), color: "hsl(142 71% 45%)" },
      { label: "Email type", weight: 10, filled: !!identity.email_type, color: "hsl(280 65% 60%)" },
      { label: "Verifications", weight: 20, filled: (!brain.email_verification || identity.email_verified) && (!brain.sms_verification || identity.sms_verified), color: "hsl(38 92% 50%)" },
      { label: "LinkedIn", weight: 15, filled: !brain.require_linkedin || !!identity.linkedin_url, color: "hsl(217 91% 60%)" },
      { label: "ID numbers", weight: 10, filled: (!brain.require_nie || !!identity.nie) && (!brain.require_dni || !!identity.dni), color: "hsl(190 80% 50%)" },
    ],
    3: [
      { label: "Status", weight: 20, filled: !!employment.employment_status, color: "hsl(24 95% 53%)" },
      { label: "Job", weight: 20, filled: !!employment.job_title && !!employment.company, color: "hsl(217 91% 60%)" },
      { label: "Contract", weight: 15, filled: !!employment.contract_type, color: "hsl(280 65% 60%)" },
      { label: "Income", weight: 30, filled: !!employment.income_monthly, color: "hsl(142 71% 45%)" },
      { label: "Pay date", weight: 15, filled: !!employment.salary_payment_date, color: "hsl(38 92% 50%)" },
    ],
    4: [
      { label: "Residency", weight: 100, filled: !brain.residency_history_check || !!verif.residency_addresses, color: "hsl(24 95% 53%)" },
    ],
    5: [
      { label: "ID doc", weight: 25, filled: !brain.require_biometric_id || !!files.passport, color: "hsl(24 95% 53%)" },
      { label: "Payslips", weight: 35, filled: !brain.require_payslips || (!!files.payslip1 && !!files.payslip2 && !!files.payslip3), color: "hsl(217 91% 60%)" },
      { label: "Contract", weight: 25, filled: !brain.require_work_contract || !!files.contract, color: "hsl(142 71% 45%)" },
      { label: "Tax return", weight: 15, filled: !brain.require_tax_return || !!files.tax_return, color: "hsl(38 92% 50%)" },
    ],
  }), [consent, identity, employment, files, verif, brain]);

  const stepCompleteness = useMemo<Record<number, number>>(() => ({
    1: buildPct(stepSegments[1]),
    2: buildPct(stepSegments[2]),
    3: buildPct(stepSegments[3]),
    4: buildPct(stepSegments[4]),
    5: buildPct(stepSegments[5]),
  }), [stepSegments]);

  const StepProgress = ({ stepId }: { stepId: number }) => {
    const segs = stepSegments[stepId] ?? [];
    const total = segs.reduce((s, x) => s + x.weight, 0) || 1;
    const value = stepCompleteness[stepId] ?? 0;
    return (
      <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Step completeness</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary leading-none">{value}</span>
            <span className="text-xs text-muted-foreground">/ 100%</span>
          </div>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          {segs.map((s, i) => (
            <div
              key={i}
              className="h-full transition-all"
              style={{
                width: `${s.filled ? (s.weight / total) * 100 : 0}%`,
                backgroundColor: s.color,
              }}
              title={`${s.label} (${s.weight}%)`}
            />
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
          {segs.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color, opacity: s.filled ? 1 : 0.3 }}
              />
              <span className={`text-[11px] ${s.filled ? "text-foreground" : "text-muted-foreground line-through"}`}>
                {s.label} ({s.weight}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const goNext = () => {
    const idx = steps.findIndex((x) => x.id === step);
    const next = steps[idx + 1];
    if (next) setStep(next.id);
  };
  const goBack = () => {
    const idx = steps.findIndex((x) => x.id === step);
    const prev = steps[idx - 1];
    if (prev) setStep(prev.id);
  };

  // ---------- Save handlers ----------
  const saveIdentity = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let id = tenantId;
      if (!id) {
        const { data } = await supabase.from("tenants").select("id").eq("user_id", user.id).maybeSingle();
        if (data) { id = data.id; setTenantId(id); }
      }
      if (id) {
        await supabase.from("tenants").update({
          name: identity.name,
          phone: identity.phone,
          nationality: identity.nationality,
          country_of_birth: identity.country_of_birth,
          age_range: identity.age_range,
          linkedin_profile: identity.linkedin_url || null,
        }).eq("id", id);
      }
      goNext();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const saveEmployment = async () => {
    if (!tenantId) { goNext(); return; }
    setSaving(true);
    try {
      const appData = {
        tenant_id: tenantId,
        employment_status: employment.employment_status,
        job_title: employment.job_title,
        company: employment.company,
        contract_type: employment.contract_type,
        income_monthly: employment.income_monthly ? parseFloat(employment.income_monthly) : null,
        salary_payment_date: employment.salary_payment_date ? parseInt(employment.salary_payment_date) : null,
      };
      if (applicationId) {
        await supabase.from("tenant_applications").update(appData).eq("id", applicationId);
      } else {
        const { data, error } = await supabase.from("tenant_applications").insert({
          ...appData,
          agency_id: "00000000-0000-0000-0000-000000000000",
          property_id: "00000000-0000-0000-0000-000000000000",
          status: "pending",
        }).select("id").single();
        if (error) throw error;
        if (data) setApplicationId(data.id);
      }
      goNext();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles((p) => ({ ...p, [key]: e.target.files?.[0] || null }));
  };

  const submitDocuments = async () => {
    if (!tenantId || !applicationId) { goNext(); return; }
    setSaving(true);
    try {
      const fileEntries = Object.entries(files).filter(([, f]) => f !== null);
      for (const [key, file] of fileEntries) {
        if (!file) continue;
        const filePath = `${tenantId}/${applicationId}/${key}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("tenant-documents")
          .upload(filePath, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("tenant-documents").getPublicUrl(filePath);
        const docType = key.startsWith("payslip") ? "payslip"
          : key === "passport" ? "passport"
          : key === "tax_return" ? "tax_return" : "contract";
        await supabase.from("documents").insert({
          application_id: applicationId, tenant_id: tenantId, type: docType,
          file_url: urlData.publicUrl, file_name: file.name, file_size: file.size,
        });
      }
      const requiredOk =
        (!brain.require_biometric_id || files.passport) &&
        (!brain.require_payslips || files.payslip1) &&
        (!brain.require_work_contract || files.contract) &&
        (!brain.require_tax_return || files.tax_return);
      if (requiredOk) {
        await supabase.from("tenant_applications").update({ documents_complete: true }).eq("id", applicationId);
      }
      try {
        await supabase.functions.invoke("calculate-score", { body: { application_id: applicationId } });
      } catch (err) { console.error("scoring failed", err); }
      toast({ title: "Application submitted!", description: "Your trust score is being calculated." });
      navigate("/application-status");
    } catch (e: any) {
      toast({ title: "Upload error", description: e.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (authLoading || brainLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const consentValid = !brain.require_gdpr || consent.gdpr;
  const photoValid = !brain.require_tenant_photo || consent.photo !== null;
  const identityValid =
    !!identity.name &&
    (!brain.require_nie || !!identity.nie) &&
    (!brain.require_dni || !!identity.dni) &&
    (!brain.require_linkedin || !!identity.linkedin_url);
  const employmentValid =
    !!employment.employment_status &&
    !!employment.income_monthly;
  const documentsValid =
    (!brain.require_biometric_id || !!files.passport) &&
    (!brain.require_payslips || !!files.payslip1) &&
    (!brain.require_work_contract || !!files.contract) &&
    (!brain.require_tax_return || !!files.tax_return);

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-end">
          <span className="text-sm text-muted-foreground">
            Step {currentStepMeta.displayIndex} of {totalSteps}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between mt-2 gap-2">
          {steps.map((s) => (
            <span
              key={s.id}
              className={`text-xs font-medium ${s.id <= step ? "text-primary" : "text-muted-foreground"}`}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Per-step segmented completeness — moved here from inside the step card */}
        <div className="mt-5">
          <StepProgress stepId={step} />
        </div>

        {/* Profile completeness — overall, boosts trust score */}
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  Profile completeness
                </p>
                <span className="text-sm font-semibold text-primary">{completeness}%</span>
              </div>
              <Progress value={completeness} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                The more accurate information you add, the higher your trust score and the better your chances of approval.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* STEP 1 — Consent */}
        {step === 1 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Consent & Profile</CardTitle>
                  <CardDescription>Required before we collect any of your data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {brain.require_gdpr && (
                <div className="rounded-2xl border-2 border-green-500/30 bg-green-50/60 dark:bg-green-950/20 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5 text-green-700 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">GDPR Data Consent</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
                          Required
                        </span>
                      </div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mt-1">
                        You must accept GDPR data processing consent before continuing the qualification form.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        This rule cannot be disabled. Under EU regulation, processing of your personal data requires explicit consent. Your data will be shared only with the rental agency reviewing your application.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-green-600/40 text-green-700 dark:text-green-400 bg-transparent">
                          EU Compliant
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-green-600/40 text-green-700 dark:text-green-400 bg-transparent">
                          Always Active
                        </span>
                      </div>
                      <div className="mt-4 flex items-start gap-3 pt-4 border-t border-green-600/20">
                        <Checkbox
                          id="gdpr"
                          checked={consent.gdpr}
                          onCheckedChange={(v) => setConsent((p) => ({ ...p, gdpr: v === true }))}
                        />
                        <Label htmlFor="gdpr" className="font-normal text-sm leading-relaxed cursor-pointer">
                          I consent to the processing of my personal data under GDPR for the purpose of tenant pre-qualification.
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {brain.require_tenant_photo && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Camera className="w-4 h-4" /> Profile photo</Label>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setConsent((p) => ({ ...p, photo: e.target.files?.[0] || null }))}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/80 h-12 rounded-xl border border-input bg-card px-3 cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">Shown on your tenant card to the agency.</p>
                </div>
              )}
              <Button
                onClick={goNext} variant="hero" size="lg"
                className="w-full h-12 rounded-xl"
                disabled={!consentValid || !photoValid}
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2 — Identity */}
        {step === 2 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Identity</CardTitle>
                  <CardDescription>Tell us who you are</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={identity.name}
                  onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                  placeholder="John Doe" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={identity.phone}
                  onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                  placeholder="+34 612 345 678" className="h-12 rounded-xl" />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> Please use the phone number linked to your WhatsApp — agencies will contact you there.
                </p>
              </div>

              {/* WhatsApp */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">WhatsApp</p>
                  {identity.whatsapp_connected && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="wa-same"
                    checked={identity.whatsapp_same}
                    onCheckedChange={(v) =>
                      setIdentity({ ...identity, whatsapp_same: v === true, whatsapp_phone: v === true ? "" : identity.whatsapp_phone })
                    }
                  />
                  <Label htmlFor="wa-same" className="font-normal text-sm cursor-pointer">
                    My WhatsApp number is the same as the phone above
                  </Label>
                </div>
                {!identity.whatsapp_same && (
                  <Input
                    value={identity.whatsapp_phone}
                    onChange={(e) => setIdentity({ ...identity, whatsapp_phone: e.target.value })}
                    placeholder="WhatsApp number with country code"
                    className="h-10 rounded-lg"
                  />
                )}
                {!identity.whatsapp_connected ? (
                  <Button
                    type="button" variant="outline" size="sm"
                    onClick={() => setIdentity({ ...identity, whatsapp_connected: true })}
                    disabled={identity.whatsapp_same ? !identity.phone : !identity.whatsapp_phone}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" /> Connect WhatsApp
                  </Button>
                ) : (
                  <p className="text-xs text-green-700">WhatsApp connected ✓</p>
                )}
              </div>

              {/* SMS verification (moved from Verifications step) */}
              {brain.sms_verification && (
                <div className="rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">SMS verification</p>
                    {identity.sms_verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                  </div>
                  {!identity.sms_verified ? (
                    <div className="flex gap-2">
                      <Input placeholder="6-digit code" value={identity.sms_code}
                        onChange={(e) => setIdentity({ ...identity, sms_code: e.target.value })}
                        className="h-10 rounded-lg" />
                      <Button variant="outline" size="sm" type="button"
                        onClick={() => setIdentity({ ...identity, sms_verified: true })}>
                        Verify
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-green-700">Phone verified ✓</p>
                  )}
                </div>
              )}

              {/* Email type + Email verification */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">Email</p>
                  {identity.email_verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">What kind of email is this?</Label>
                  <Select
                    value={identity.email_type}
                    onValueChange={(v) => setIdentity({ ...identity, email_type: v as typeof identity.email_type })}
                  >
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue placeholder="Select email type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business email</SelectItem>
                      <SelectItem value="student">Student email</SelectItem>
                      <SelectItem value="private">Private email</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    A business or student email increases your trust score.
                  </p>
                </div>
                {brain.email_verification && (
                  !identity.email_verified ? (
                    <div className="flex gap-2">
                      <Input placeholder="6-digit code" value={identity.email_code}
                        onChange={(e) => setIdentity({ ...identity, email_code: e.target.value })}
                        className="h-10 rounded-lg" />
                      <Button variant="outline" size="sm" type="button"
                        onClick={() => setIdentity({ ...identity, email_verified: true })}>
                        Verify
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-green-700">Email verified ✓</p>
                  )
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Select value={identity.nationality} onValueChange={(v) => setIdentity({ ...identity, nationality: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age range</Label>
                  <Select value={identity.age_range} onValueChange={(v) => setIdentity({ ...identity, age_range: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Country of birth</Label>
                <Input value={identity.country_of_birth}
                  onChange={(e) => setIdentity({ ...identity, country_of_birth: e.target.value })}
                  placeholder="Spain" className="h-12 rounded-xl" />
              </div>

              {brain.require_nie && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><IdCard className="w-4 h-4" /> Spanish NIE</Label>
                  <Input value={identity.nie}
                    onChange={(e) => setIdentity({ ...identity, nie: e.target.value })}
                    placeholder="X1234567A" className="h-12 rounded-xl" />
                </div>
              )}
              {brain.require_dni && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><IdCard className="w-4 h-4" /> Spanish DNI</Label>
                  <Input value={identity.dni}
                    onChange={(e) => setIdentity({ ...identity, dni: e.target.value })}
                    placeholder="12345678A" className="h-12 rounded-xl" />
                </div>
              )}
              {brain.require_linkedin && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Link2 className="w-4 h-4" /> LinkedIn profile URL</Label>
                  <Input value={identity.linkedin_url}
                    onChange={(e) => setIdentity({ ...identity, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/your-profile" className="h-12 rounded-xl" />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" /> Used to auto-verify your employer
                  </p>
                </div>
              )}
              {brain.require_biometric_id && (
                <div className="rounded-xl border border-dashed border-border p-4 flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Biometric ID check</p>
                    <p className="text-xs text-muted-foreground">You'll upload your passport/NIE in the Documents step. Liveness check happens automatically.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={goBack} variant="outline" size="lg" className="h-12 rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={saveIdentity} variant="hero" size="lg"
                  className="flex-1 h-12 rounded-xl" disabled={saving || !identityValid}>
                  {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                    : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3 — Employment */}
        {step === 3 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Employment & Income</CardTitle>
                  <CardDescription>
                    {brain.min_income_ratio
                      ? `Required: monthly income ≥ ${brain.min_income_ratio}× rent`
                      : "Help us verify your financial stability"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Employment status</Label>
                <Select value={employment.employment_status}
                  onValueChange={(v) => setEmployment({ ...employment, employment_status: v })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job title</Label>
                  <Input value={employment.job_title}
                    onChange={(e) => setEmployment({ ...employment, job_title: e.target.value })}
                    placeholder="Product Manager" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={employment.company}
                    onChange={(e) => setEmployment({ ...employment, company: e.target.value })}
                    placeholder="Tech Corp" className="h-12 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contract type</Label>
                <Select value={employment.contract_type}
                  onValueChange={(v) => setEmployment({ ...employment, contract_type: v })}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Net monthly income (€)</Label>
                  <Input type="number" value={employment.income_monthly}
                    onChange={(e) => setEmployment({ ...employment, income_monthly: e.target.value })}
                    placeholder="2500" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Salary payment day</Label>
                  <Input type="number" min={1} max={31} value={employment.salary_payment_date}
                    onChange={(e) => setEmployment({ ...employment, salary_payment_date: e.target.value })}
                    placeholder="28" className="h-12 rounded-xl" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={goBack} variant="outline" size="lg" className="h-12 rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={saveEmployment} variant="hero" size="lg"
                  className="flex-1 h-12 rounded-xl" disabled={saving || !employmentValid}>
                  {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                    : <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4 — Verifications */}
        {step === 4 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Verifications</CardTitle>
                  <CardDescription>Quick checks required by this agency</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {brain.residency_history_check && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><History className="w-4 h-4" /> Last 5 years of residency</Label>
                  <textarea
                    value={verif.residency_addresses}
                    onChange={(e) => setVerif({ ...verif, residency_addresses: e.target.value })}
                    placeholder="One address per line, with start/end dates"
                    className="w-full min-h-[120px] rounded-xl border border-input bg-card p-3 text-sm"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={goBack} variant="outline" size="lg" className="h-12 rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={goNext} variant="hero" size="lg" className="flex-1 h-12 rounded-xl">
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 5 — Documents */}
        {step === 5 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Documents</CardTitle>
                  <CardDescription>Upload only what this agency requires</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: "passport", label: "Passport or NIE", show: brain.require_biometric_id, required: true },
                { key: "payslip1", label: "Payslip #1 (most recent)", show: brain.require_payslips, required: true },
                { key: "payslip2", label: "Payslip #2", show: brain.require_payslips, required: false },
                { key: "payslip3", label: "Payslip #3", show: brain.require_payslips, required: false },
                { key: "contract", label: "Employment contract", show: brain.require_work_contract, required: true },
                { key: "tax_return", label: "Tax return (Declaración de la Renta)", show: brain.require_tax_return, required: true },
              ].filter((d) => d.show).map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {doc.label}
                    {doc.required && <span className="text-xs text-destructive">*</span>}
                  </Label>
                  <div className="relative">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange(doc.key)}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/80 h-12 rounded-xl border border-input bg-card px-3 cursor-pointer" />
                    {files[doc.key] && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button onClick={goBack} variant="outline" size="lg" className="h-12 rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={submitDocuments} variant="hero" size="lg"
                  className="flex-1 h-12 rounded-xl" disabled={saving || !documentsValid}>
                  {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                    : <>Submit Application <CheckCircle className="w-4 h-4 ml-2" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TenantOnboarding;
