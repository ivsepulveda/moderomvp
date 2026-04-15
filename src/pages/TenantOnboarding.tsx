import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ModeroLogo from "@/components/ModeroLogo";
import { ArrowRight, ArrowLeft, User, Briefcase, Upload, CheckCircle, Info } from "lucide-react";

const NATIONALITIES = [
  "Spanish", "Portuguese", "Italian", "French", "German", "British", "Dutch",
  "Belgian", "Swedish", "American", "Brazilian", "Colombian", "Argentine",
  "Mexican", "Chinese", "Indian", "Japanese", "Korean", "Australian", "Other"
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

interface PersonalInfo {
  name: string;
  phone: string;
  nationality: string;
  country_of_birth: string;
  age_range: string;
}

interface EmploymentInfo {
  employment_status: string;
  job_title: string;
  company: string;
  contract_type: string;
  income_monthly: string;
  salary_payment_date: string;
}

const TenantOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const [personal, setPersonal] = useState<PersonalInfo>({
    name: "",
    phone: "",
    nationality: "",
    country_of_birth: "",
    age_range: "",
  });

  const [employment, setEmployment] = useState<EmploymentInfo>({
    employment_status: "",
    job_title: "",
    company: "",
    contract_type: "",
    income_monthly: "",
    salary_payment_date: "",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    passport: null,
    payslip1: null,
    payslip2: null,
    payslip3: null,
    contract: null,
  });

  // Load existing tenant data
  useEffect(() => {
    if (!user) return;
    const loadTenant = async () => {
      const { data: tenant } = await supabase
        .from("tenants")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (tenant) {
        setTenantId(tenant.id);
        setPersonal({
          name: tenant.name || "",
          phone: tenant.phone || "",
          nationality: tenant.nationality || "",
          country_of_birth: tenant.country_of_birth || "",
          age_range: tenant.age_range || "",
        });

        // Check for existing application
        const { data: app } = await supabase
          .from("tenant_applications")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

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
      }
    };
    loadTenant();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/apply");
    }
  }, [authLoading, user, navigate]);

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  const handleSavePersonal = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (tenantId) {
        await supabase
          .from("tenants")
          .update({
            name: personal.name,
            phone: personal.phone,
            nationality: personal.nationality,
            country_of_birth: personal.country_of_birth,
            age_range: personal.age_range,
          })
          .eq("id", tenantId);
      } else {
        const { data } = await supabase
          .from("tenants")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) {
          setTenantId(data.id);
          await supabase
            .from("tenants")
            .update({
              name: personal.name,
              phone: personal.phone,
              nationality: personal.nationality,
              country_of_birth: personal.country_of_birth,
              age_range: personal.age_range,
            })
            .eq("id", data.id);
        }
      }
      setStep(2);
    } catch (error: any) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmployment = async () => {
    if (!tenantId) return;
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
        await supabase
          .from("tenant_applications")
          .update(appData)
          .eq("id", applicationId);
      } else {
        // Create a placeholder application (no property yet — will be linked later)
        const { data, error } = await supabase
          .from("tenant_applications")
          .insert({
            ...appData,
            agency_id: "00000000-0000-0000-0000-000000000000", // placeholder
            property_id: "00000000-0000-0000-0000-000000000000", // placeholder
            status: "pending",
          })
          .select("id")
          .single();
        if (error) throw error;
        if (data) setApplicationId(data.id);
      }
      setStep(3);
    } catch (error: any) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleUploadDocuments = async () => {
    if (!tenantId || !applicationId) return;
    setSaving(true);
    try {
      const fileEntries = Object.entries(files).filter(([, f]) => f !== null);

      for (const [key, file] of fileEntries) {
        if (!file) continue;
        const filePath = `${tenantId}/${applicationId}/${key}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("tenant-documents")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("tenant-documents")
          .getPublicUrl(filePath);

        const docType = key.startsWith("payslip") ? "payslip" : key === "passport" ? "passport" : "contract";

        await supabase.from("documents").insert({
          application_id: applicationId,
          tenant_id: tenantId,
          type: docType,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
        });
      }

      // Mark docs complete if all required uploaded
      const hasPassport = files.passport !== null;
      const hasPayslip = files.payslip1 !== null;
      const hasContract = files.contract !== null;

      if (hasPassport && hasPayslip && hasContract) {
        await supabase
          .from("tenant_applications")
          .update({ documents_complete: true })
          .eq("id", applicationId);
      }

      // Trigger scoring engine
      try {
        const { data: scoreResult, error: scoreError } = await supabase.functions.invoke("calculate-score", {
          body: { application_id: applicationId },
        });
        if (scoreError) console.error("Scoring error:", scoreError);
        else console.log("Score calculated:", scoreResult);
      } catch (scoreErr) {
        console.error("Failed to invoke scoring:", scoreErr);
      }

      toast({ title: "Application submitted!", description: "Your trust score is being calculated." });
      navigate("/application-status");
    } catch (error: any) {
      toast({ title: "Upload error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <ModeroLogo size="sm" />
          <span className="text-sm text-muted-foreground">Step {step} of 3</span>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex justify-between mt-2">
          {["Personal Info", "Employment", "Documents"].map((label, i) => (
            <span
              key={label}
              className={`text-xs font-medium ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Step 1: Personal */}
        {step === 1 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                  <CardDescription>Let's start with the basics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  placeholder="+34 612 345 678"
                  className="h-12 rounded-xl"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> Used for viewing scheduling only
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Select value={personal.nationality} onValueChange={(v) => setPersonal({ ...personal, nationality: v })}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => (
                        <SelectItem key={n} value={n}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Country of Birth</Label>
                  <Input
                    value={personal.country_of_birth}
                    onChange={(e) => setPersonal({ ...personal, country_of_birth: e.target.value })}
                    placeholder="Spain"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Age Range</Label>
                <Select value={personal.age_range} onValueChange={(v) => setPersonal({ ...personal, age_range: v })}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSavePersonal}
                variant="hero"
                size="lg"
                className="w-full h-12 rounded-xl"
                disabled={saving || !personal.name}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                ) : (
                  <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Employment */}
        {step === 2 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Employment & Income</CardTitle>
                  <CardDescription>Help us verify your financial stability</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Employment Status</Label>
                <Select value={employment.employment_status} onValueChange={(v) => setEmployment({ ...employment, employment_status: v })}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={employment.job_title}
                    onChange={(e) => setEmployment({ ...employment, job_title: e.target.value })}
                    placeholder="Product Manager"
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={employment.company}
                    onChange={(e) => setEmployment({ ...employment, company: e.target.value })}
                    placeholder="Tech Corp"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contract Type</Label>
                <Select value={employment.contract_type} onValueChange={(v) => setEmployment({ ...employment, contract_type: v })}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select contract type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income">Net Monthly Income (€)</Label>
                  <Input
                    id="income"
                    type="number"
                    value={employment.income_monthly}
                    onChange={(e) => setEmployment({ ...employment, income_monthly: e.target.value })}
                    placeholder="2500"
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" /> Used only for landlord approval
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payday">Salary Payment Date</Label>
                  <Input
                    id="payday"
                    type="number"
                    min={1}
                    max={31}
                    value={employment.salary_payment_date}
                    onChange={(e) => setEmployment({ ...employment, salary_payment_date: e.target.value })}
                    placeholder="28"
                    className="h-12 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">Day of month (1-31)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleSaveEmployment}
                  variant="hero"
                  size="lg"
                  className="flex-1 h-12 rounded-xl"
                  disabled={saving || !employment.employment_status}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                  ) : (
                    <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl">Document Upload</CardTitle>
                  <CardDescription>Upload your documents to complete your application</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: "passport", label: "Passport or NIE", required: true, desc: "Required for identity verification" },
                { key: "payslip1", label: "Payslip #1 (most recent)", required: true, desc: "Required for income verification" },
                { key: "payslip2", label: "Payslip #2", required: false, desc: "Improves your trust score" },
                { key: "payslip3", label: "Payslip #3", required: false, desc: "Improves your trust score" },
                { key: "contract", label: "Employment Contract", required: true, desc: "Required for employment verification" },
              ].map((doc) => (
                <div key={doc.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {doc.label}
                    {doc.required && <span className="text-xs text-destructive">*</span>}
                  </Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange(doc.key)}
                      className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/80 h-12 rounded-xl border border-input bg-card px-3 cursor-pointer"
                    />
                    {files[doc.key] && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" /> {doc.desc}
                  </p>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleUploadDocuments}
                  variant="hero"
                  size="lg"
                  className="flex-1 h-12 rounded-xl"
                  disabled={saving || !files.passport || !files.payslip1 || !files.contract}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                  ) : (
                    <>Submit Application <CheckCircle className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground pt-2">
                You can also upload documents later. Skip for now and complete when ready.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TenantOnboarding;
