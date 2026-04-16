import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import {
  Building2, Mail, Calendar, MessageSquare, Zap, Shield, ExternalLink,
  Check, User, Settings, Phone, FileText, Briefcase, AlertTriangle,
  Zap as ZapIcon, Link2, CreditCard, Save,
} from "lucide-react";
import { toast } from "sonner";

const AgencySettings = () => {
  const { profile } = useAuth();

  // Connection states
  const [zapierWebhook, setZapierWebhook] = useState("");

  // Qualification Rules states
  const [requireIdVerification, setRequireIdVerification] = useState(true);
  const [identityBeforeQualification, setIdentityBeforeQualification] = useState(true);
  const [acceptPassport, setAcceptPassport] = useState(true);
  const [acceptNationalId, setAcceptNationalId] = useState(true);
  const [acceptResidencePermit, setAcceptResidencePermit] = useState(false);

  const [phoneVerification, setPhoneVerification] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);
  const [businessEmailVerification, setBusinessEmailVerification] = useState(true);

  const [creditCheckRequired, setCreditCheckRequired] = useState(true);
  const [minCreditScore, setMinCreditScore] = useState("54");

  const [maxRentToIncome, setMaxRentToIncome] = useState("40");
  const [minIncomeMultiplier, setMinIncomeMultiplier] = useState("3");
  const [reqPayslips, setReqPayslips] = useState(true);
  const [reqEmploymentContract, setReqEmploymentContract] = useState(false);
  const [reqTaxDeclaration, setReqTaxDeclaration] = useState(false);

  const [employmentRequired, setEmploymentRequired] = useState(true);
  const [linkedinRequired, setLinkedinRequired] = useState(true);

  const [reqProofOfIncome, setReqProofOfIncome] = useState(true);
  const [reqEmploymentContractDoc, setReqEmploymentContractDoc] = useState(false);
  const [reqIdDocument, setReqIdDocument] = useState(true);
  const [reqTaxDeclarationDoc, setReqTaxDeclarationDoc] = useState(false);

  // Verification Integrations
  const [linkedinVerification, setLinkedinVerification] = useState(true);
  const [biometricVerification, setBiometricVerification] = useState(true);
  const [smsVerification, setSmsVerification] = useState(true);
  const [businessEmailVerify, setBusinessEmailVerify] = useState(true);
  const [creditCheck, setCreditCheck] = useState(false);
  const [bankVerification, setBankVerification] = useState(false);

  // Risk Flags
  const [flagCreditBelow, setFlagCreditBelow] = useState(true);
  const [flagMissingIdentity, setFlagMissingIdentity] = useState(true);
  const [flagIncompleteDocs, setFlagIncompleteDocs] = useState(true);
  const [flagUnverifiedContact, setFlagUnverifiedContact] = useState(true);

  // Qualification Logic
  const [qualificationDecision, setQualificationDecision] = useState("auto_approve");

  // Calculate max verification score
  const verificationScore = [
    linkedinVerification ? 15 : 0,
    biometricVerification ? 25 : 0,
    smsVerification ? 10 : 0,
    businessEmailVerify ? 10 : 0,
    creditCheck ? 30 : 0,
    bankVerification ? 20 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleConnect = (service: string) => {
    toast.info(`${service} integration coming soon`);
  };

  const handleSaveRules = () => {
    toast.success("Qualification rules saved successfully");
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
            <Settings className="w-4 h-4" /> Qualification Rules
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
                <p className="text-sm text-muted-foreground mt-1">Manage your personal account details</p>
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
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">First Name</Label>
                  <Input defaultValue={profile?.full_name?.split(" ")[0] || ""} className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Surname</Label>
                  <Input defaultValue={profile?.full_name?.split(" ").slice(1).join(" ") || ""} className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Company Name</Label>
                  <Input defaultValue={profile?.agency_name || ""} className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Mobile Number</Label>
                  <Input placeholder="+34 600 000 000" className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">City</Label>
                  <Input placeholder="Madrid" className="rounded-xl bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Input defaultValue={profile?.email || ""} disabled className="rounded-xl bg-muted/30" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">(cannot be changed)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== QUALIFICATION RULES TAB ====== */}
        <TabsContent value="qualification" className="mt-6 space-y-6">
          {/* Identity Verification */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Identity Verification</h3>
                  <p className="text-sm text-muted-foreground">Control ID verification requirements</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Require ID Verification</span>
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </div>
                <Switch checked={requireIdVerification} onCheckedChange={setRequireIdVerification} />
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Identity Verified Before Qualification</span>
                <Switch checked={identityBeforeQualification} onCheckedChange={setIdentityBeforeQualification} />
              </div>

              <div className="space-y-2">
                <span className="font-medium text-foreground">Acceptable ID Types</span>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={acceptPassport} onCheckedChange={(c) => setAcceptPassport(!!c)} />
                    <span className="text-sm">Passport</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={acceptNationalId} onCheckedChange={(c) => setAcceptNationalId(!!c)} />
                    <span className="text-sm">National ID</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={acceptResidencePermit} onCheckedChange={(c) => setAcceptResidencePermit(!!c)} />
                    <span className="text-sm">Residence Permit</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Verification */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Contact Verification</h3>
                  <p className="text-sm text-muted-foreground">Verify tenant contact information</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Mobile Phone Verification Required</span>
                <Switch checked={phoneVerification} onCheckedChange={setPhoneVerification} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Email Verification Required</span>
                <Switch checked={emailVerification} onCheckedChange={setEmailVerification} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Business Email Verification Required</span>
                <Switch checked={businessEmailVerification} onCheckedChange={setBusinessEmailVerification} />
              </div>
            </CardContent>
          </Card>

          {/* Creditworthiness */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Creditworthiness</h3>
                  <p className="text-sm text-muted-foreground">Set credit score and check requirements</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Credit Check Required</span>
                <Switch checked={creditCheckRequired} onCheckedChange={setCreditCheckRequired} />
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-foreground">Minimum Credit Score (1–100)</Label>
                <Input
                  type="number"
                  value={minCreditScore}
                  onChange={(e) => setMinCreditScore(e.target.value)}
                  min="1"
                  max="100"
                  className="rounded-xl bg-muted/30 max-w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Income & Affordability */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Income & Affordability</h3>
                  <p className="text-sm text-muted-foreground">Define income and affordability thresholds</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium text-foreground">Max Rent-to-Income Ratio (%)</Label>
                  <Input
                    type="number"
                    value={maxRentToIncome}
                    onChange={(e) => setMaxRentToIncome(e.target.value)}
                    className="rounded-xl bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground">e.g. 40 means rent ≤ 40% of monthly income</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-foreground">Minimum Income Multiplier (x rent)</Label>
                  <Input
                    type="number"
                    value={minIncomeMultiplier}
                    onChange={(e) => setMinIncomeMultiplier(e.target.value)}
                    step="0.5"
                    className="rounded-xl bg-muted/30"
                  />
                  <p className="text-xs text-muted-foreground">e.g. 3 means income must be ≥ 3× monthly rent</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium text-foreground">Required Income Documentation</Label>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={reqPayslips} onCheckedChange={(c) => setReqPayslips(!!c)} />
                    <span className="text-sm">Payslips</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={reqEmploymentContract} onCheckedChange={(c) => setReqEmploymentContract(!!c)} />
                    <span className="text-sm">Employment Contract</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={reqTaxDeclaration} onCheckedChange={(c) => setReqTaxDeclaration(!!c)} />
                    <span className="text-sm">Tax Declaration</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Verification */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Employment Verification</h3>
                  <p className="text-sm text-muted-foreground">Verify employment and professional profiles</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Employment Status Required</span>
                <Switch checked={employmentRequired} onCheckedChange={setEmploymentRequired} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">LinkedIn Profile Verification Required</span>
                <Switch checked={linkedinRequired} onCheckedChange={setLinkedinRequired} />
              </div>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Required Documents</h3>
                  <p className="text-sm text-muted-foreground">Specify which documents tenants must submit</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Proof of Income</span>
                <Switch checked={reqProofOfIncome} onCheckedChange={setReqProofOfIncome} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Employment Contract</span>
                <Switch checked={reqEmploymentContractDoc} onCheckedChange={setReqEmploymentContractDoc} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">ID Document</span>
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                </div>
                <Switch checked={reqIdDocument} onCheckedChange={setReqIdDocument} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Tax Declaration</span>
                <Switch checked={reqTaxDeclarationDoc} onCheckedChange={setReqTaxDeclarationDoc} />
              </div>
            </CardContent>
          </Card>

          {/* Verification Integrations */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Verification Integrations</h3>
                  <p className="text-sm text-muted-foreground">Enable third-party verification providers for your KYC workflow</p>
                  <p className="text-xs text-muted-foreground mt-1">Each enabled integration contributes to the overall tenant verification score.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LinkedIn */}
                <div className={`p-4 rounded-xl border-2 ${linkedinVerification ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">LinkedIn Verification</p>
                      <p className="text-xs text-muted-foreground">LinkedIn</p>
                    </div>
                    <Switch checked={linkedinVerification} onCheckedChange={setLinkedinVerification} />
                  </div>
                  <p className="text-xs text-muted-foreground">Confirm employment history and professional identity by connecting the tenant's LinkedIn profile.</p>
                  <p className="text-xs text-primary font-medium mt-2">+15 pts to verification score</p>
                </div>

                {/* Biometric */}
                <div className={`p-4 rounded-xl border-2 ${biometricVerification ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Biometric ID Verification</p>
                      <p className="text-xs text-muted-foreground">Identomat</p>
                    </div>
                    <Switch checked={biometricVerification} onCheckedChange={setBiometricVerification} />
                  </div>
                  <p className="text-xs text-muted-foreground">Verify ID documents and perform facial biometric checks to confirm the tenant's real identity.</p>
                  <p className="text-xs text-primary font-medium mt-2">+25 pts to verification score</p>
                </div>

                {/* SMS */}
                <div className={`p-4 rounded-xl border-2 ${smsVerification ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">SMS Mobile Verification</p>
                      <p className="text-xs text-muted-foreground">Twilio</p>
                    </div>
                    <Switch checked={smsVerification} onCheckedChange={setSmsVerification} />
                  </div>
                  <p className="text-xs text-muted-foreground">Send a one-time code to the tenant's mobile number to confirm ownership of the phone number.</p>
                  <p className="text-xs text-primary font-medium mt-2">+10 pts to verification score</p>
                </div>

                {/* Business Email */}
                <div className={`p-4 rounded-xl border-2 ${businessEmailVerify ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Business Email Verification</p>
                      <p className="text-xs text-muted-foreground">Email Validation</p>
                    </div>
                    <Switch checked={businessEmailVerify} onCheckedChange={setBusinessEmailVerify} />
                  </div>
                  <p className="text-xs text-muted-foreground">Confirm the validity and ownership of the tenant's business email address domain.</p>
                  <p className="text-xs text-primary font-medium mt-2">+10 pts to verification score</p>
                </div>

                {/* Credit Check */}
                <div className={`p-4 rounded-xl border-2 ${creditCheck ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Credit Check</p>
                      <p className="text-xs text-muted-foreground">Dun & Bradstreet</p>
                    </div>
                    <Switch checked={creditCheck} onCheckedChange={setCreditCheck} />
                  </div>
                  <p className="text-xs text-muted-foreground">Assess financial reliability and creditworthiness through Dun & Bradstreet's comprehensive credit database.</p>
                  <p className="text-xs text-primary font-medium mt-2">+30 pts to verification score</p>
                </div>

                {/* Bank */}
                <div className={`p-4 rounded-xl border-2 ${bankVerification ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">Bank Account Verification</p>
                      <p className="text-xs text-muted-foreground">PSD2 Open Banking</p>
                    </div>
                    <Switch checked={bankVerification} onCheckedChange={setBankVerification} />
                  </div>
                  <p className="text-xs text-muted-foreground">Verify the tenant's bank account and financial information through secure PSD2 open banking authentication.</p>
                  <p className="text-xs text-primary font-medium mt-2">+20 pts to verification score</p>
                </div>
              </div>

              {/* Max Score Bar */}
              <div className="p-4 rounded-xl border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Max Achievable Verification Score</span>
                  <span className="font-bold text-lg text-primary">{verificationScore} / 100 pts</span>
                </div>
                <Progress value={verificationScore} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">Enable more integrations to increase the maximum qualification score available to tenants.</p>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Risk Flags */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Tenant Risk Flags</h3>
                  <p className="text-sm text-muted-foreground">Rules that trigger warnings or manual review</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Flag: Credit Score Below Threshold</span>
                <Switch checked={flagCreditBelow} onCheckedChange={setFlagCreditBelow} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Flag: Missing Identity Verification</span>
                <Switch checked={flagMissingIdentity} onCheckedChange={setFlagMissingIdentity} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Flag: Incomplete Documentation</span>
                <Switch checked={flagIncompleteDocs} onCheckedChange={setFlagIncompleteDocs} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-foreground">Flag: Unverified Contact Information</span>
                <Switch checked={flagUnverifiedContact} onCheckedChange={setFlagUnverifiedContact} />
              </div>
            </CardContent>
          </Card>

          {/* Automatic Qualification Logic */}
          <Card className="shadow-card border-border bg-card">
            <CardContent className="pt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ZapIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Automatic Qualification Logic</h3>
                  <p className="text-sm text-muted-foreground">Define how tenants are qualified based on rule combinations</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-medium text-foreground">Default Qualification Decision</Label>
                <Select value={qualificationDecision} onValueChange={setQualificationDecision}>
                  <SelectTrigger className="rounded-xl bg-muted/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto_approve">Auto Approve — automatically qualify if all rules pass</SelectItem>
                    <SelectItem value="manual_review">Manual Review — landlord reviews every application</SelectItem>
                    <SelectItem value="auto_reject">Auto Reject — any rule fails → automatically rejected</SelectItem>
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${qualificationDecision === 'auto_approve' ? 'border-primary bg-primary/5' : 'border-border'}`}
                    onClick={() => setQualificationDecision('auto_approve')}
                  >
                    <p className="font-semibold text-foreground">Auto Approve</p>
                    <p className="text-xs text-muted-foreground mt-1">All rules pass → instantly qualified</p>
                  </div>
                  <div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${qualificationDecision === 'manual_review' ? 'border-primary bg-primary/5' : 'border-border'}`}
                    onClick={() => setQualificationDecision('manual_review')}
                  >
                    <p className="font-semibold text-foreground">Manual Review</p>
                    <p className="text-xs text-muted-foreground mt-1">Landlord reviews every application</p>
                  </div>
                  <div
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${qualificationDecision === 'auto_reject' ? 'border-primary bg-primary/5' : 'border-border'}`}
                    onClick={() => setQualificationDecision('auto_reject')}
                  >
                    <p className="font-semibold text-foreground">Auto Reject</p>
                    <p className="text-xs text-muted-foreground mt-1">Any rule fails → automatically rejected</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="hero" size="lg" className="rounded-xl gap-2" onClick={handleSaveRules}>
              <Save className="w-4 h-4" /> Save All Rules
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
