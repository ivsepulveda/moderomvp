import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ArrowRight, ArrowLeft, Building2, Globe, BarChart3, Upload, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormData {
  agencyName: string;
  website: string;
  idealistaProfile: string;
  activeListings: string;
  monthlyInquiries: string;
  email: string;
  yearsOperating: string;
  associations: string;
  pitch: string;
  logoFile: File | null;
  crmSystem: string;
  crmOther: string;
  emailProvider: string;
}

const STEPS = [
  { title: "Agency Details", icon: Building2 },
  { title: "Market Presence", icon: BarChart3 },
  { title: "Branding & Pitch", icon: FileText },
];

function computeFlags(data: FormData): string[] {
  const flags: string[] = [];
  if (data.email.endsWith("@gmail.com") || data.email.endsWith("@hotmail.com") || data.email.endsWith("@yahoo.com")) {
    flags.push("Personal email");
  }
  if (!data.website) flags.push("No website");
  if (data.activeListings === "<10") flags.push("Low listings (<10)");
  return flags;
}

const ApplicationForm = () => {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    agencyName: "",
    website: "",
    idealistaProfile: "",
    activeListings: "",
    monthlyInquiries: "",
    email: "",
    yearsOperating: "",
    associations: "",
    pitch: "",
    logoFile: null,
  });

  const update = (field: keyof FormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 0) return formData.agencyName && formData.email && formData.website;
    if (step === 1) return formData.activeListings && formData.yearsOperating;
    if (step === 2) return formData.pitch.length > 20;
    return false;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const flags = computeFlags(formData);
      const { error } = await supabase.from("applications").insert({
        agency_name: formData.agencyName.trim(),
        email: formData.email.trim(),
        website: formData.website.trim() || null,
        idealista_profile: formData.idealistaProfile.trim() || null,
        active_listings: formData.activeListings || null,
        monthly_inquiries: formData.monthlyInquiries || null,
        years_operating: formData.yearsOperating || null,
        associations: formData.associations.trim() || null,
        pitch: formData.pitch.trim() || null,
        flags,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error("Failed to submit application. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 px-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-orange">
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Application Received</h2>
        <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
          Thank you for applying to Modero. Our team will review your application within 48 hours. 
          You'll receive a confirmation at <strong className="text-foreground">{formData.email}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-10 px-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                i < step ? "gradient-primary text-primary-foreground shadow-orange" :
                i === step ? "gradient-primary text-primary-foreground shadow-orange scale-110" :
                "bg-secondary text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {s.title}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-2 rounded-full transition-colors ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
        {step === 0 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Agency Information</h3>
              <p className="text-sm text-muted-foreground">Tell us about your rental agency</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agencyName">Agency Name *</Label>
                <Input id="agencyName" placeholder="e.g. Madrid Premier Rentals" value={formData.agencyName} onChange={(e) => update("agencyName", e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Business Email *</Label>
                <Input id="email" type="email" placeholder="info@youragency.com" value={formData.email} onChange={(e) => update("email", e.target.value)} className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Must be a business domain — personal Gmail is not accepted</p>
              </div>
              <div>
                <Label htmlFor="website">Agency Website *</Label>
                <div className="relative mt-1.5">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="website" placeholder="https://youragency.com" value={formData.website} onChange={(e) => update("website", e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="idealista">Idealista Profile Link</Label>
                <Input id="idealista" placeholder="https://idealista.com/pro/your-agency" value={formData.idealistaProfile} onChange={(e) => update("idealistaProfile", e.target.value)} className="mt-1.5" />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Market Presence</h3>
              <p className="text-sm text-muted-foreground">Help us understand your market position</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Active Listings on Idealista *</Label>
                <Select value={formData.activeListings} onValueChange={(v) => update("activeListings", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<10">Less than 10</SelectItem>
                    <SelectItem value="10-25">10 – 25</SelectItem>
                    <SelectItem value="25-50">25 – 50</SelectItem>
                    <SelectItem value="50-100">50 – 100</SelectItem>
                    <SelectItem value="100+">100+</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Minimum 10 active listings required</p>
              </div>
              <div>
                <Label>Average Monthly Inquiries</Label>
                <Select value={formData.monthlyInquiries} onValueChange={(v) => update("monthlyInquiries", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select range" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<20">Less than 20</SelectItem>
                    <SelectItem value="20-50">20 – 50</SelectItem>
                    <SelectItem value="50-100">50 – 100</SelectItem>
                    <SelectItem value="100-200">100 – 200</SelectItem>
                    <SelectItem value="200+">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Years Operating *</Label>
                <Select value={formData.yearsOperating} onValueChange={(v) => update("yearsOperating", v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<1">Less than 1 year</SelectItem>
                    <SelectItem value="1-3">1 – 3 years</SelectItem>
                    <SelectItem value="3-5">3 – 5 years</SelectItem>
                    <SelectItem value="5-10">5 – 10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="associations">Professional Associations</Label>
                <Input id="associations" placeholder="e.g. APEMIP, GIPE, FIAIP, CEPI" value={formData.associations} onChange={(e) => update("associations", e.target.value)} className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Optional — membership is weighted positively</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Branding & Commitment</h3>
              <p className="text-sm text-muted-foreground">Show us why you're serious about tenant pre-qualification</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Agency Logo</Label>
                <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {formData.logoFile ? formData.logoFile.name : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => update("logoFile", e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pitch">Why digital tenant pre-qualification matters to your agency *</Label>
                <Textarea
                  id="pitch"
                  placeholder="Tell us about the challenges you face with tenant screening and why Modero's approach resonates with your business..."
                  value={formData.pitch}
                  onChange={(e) => update("pitch", e.target.value)}
                  className="mt-1.5 min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.pitch.length}/500 characters (minimum 20)</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="hero" onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-2">
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleSubmit} disabled={!canProceed() || submitting} className="gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Submit Application <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;
