import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Users, Shield, AlertTriangle, CheckCircle, XCircle, Clock, Search, X, Eye, Briefcase, Mail, Phone, FileText, Globe, MapPin, IdCard, CreditCard, Link2, User, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TenantData {
  id: number;
  name: string;
  email: string;
  phone: string;
  property: string;
  score: number;
  status: "qualified" | "review" | "flagged";
  income: string;
  incomeMonthly: number;
  idVerified: boolean;
  linkedIn: boolean;
  avatar?: string;
  nationality: string;
  countryOfBirth: string;
  ageRange: string;
  idType: string;
  idNumber: string;
  biometricPassed: boolean;
  employer: string;
  jobTitle: string;
  employmentYears: string;
  contractType: string;
  salaryPaymentDate: string;
  businessEmailMatch: boolean;
  linkedinHeadline: string;
  linkedinProfile: string;
  dbCreditScore: number | null;
  dbCreditRating: string;
  documents: { name: string; uploaded: boolean; verified: boolean }[];
  residencyHistory: { country: string; years: string }[];
  livedAbroad: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  rentApplied: number;
  incomeRatio: number;
  appliedDate: string;
  fraudFlag: boolean;
  fraudReasons: string[];
  scoreBreakdown: { category: string; score: number; max: number; color: string }[];
}

const tenants: TenantData[] = [
  {
    id: 1, name: "Carlos Mendez", email: "carlos@accenture.com", phone: "+34 612 345 678",
    property: "Calle Gran Vía 42, 3B", score: 8.5, status: "qualified",
    income: "€3,200/mo", incomeMonthly: 3200, idVerified: true, linkedIn: true,
    nationality: "Spanish", countryOfBirth: "Spain", ageRange: "30-35",
    idType: "DNI", idNumber: "12345678Z", biometricPassed: true,
    employer: "Accenture Spain", jobTitle: "Senior Consultant", employmentYears: "4 years",
    contractType: "Indefinido", salaryPaymentDate: "28th", businessEmailMatch: true,
    linkedinHeadline: "Senior Consultant at Accenture | Digital Transformation",
    linkedinProfile: "linkedin.com/in/carlosmendez",
    dbCreditScore: 82, dbCreditRating: "Good",
    documents: [
      { name: "Payslips (3 months)", uploaded: true, verified: true },
      { name: "Work Contract", uploaded: true, verified: true },
      { name: "Tax Return 2025", uploaded: true, verified: false },
      { name: "DNI Scan", uploaded: true, verified: true },
    ],
    residencyHistory: [{ country: "Spain", years: "All 5 years" }],
    livedAbroad: false, emailVerified: true, phoneVerified: true,
    rentApplied: 2200, incomeRatio: 1.45, appliedDate: "2026-04-15",
    fraudFlag: false, fraudReasons: [],
    scoreBreakdown: [
      { category: "D&B Credit", score: 25, max: 30, color: "bg-orange-500" },
      { category: "LinkedIn", score: 20, max: 20, color: "bg-blue-500" },
      { category: "Identity", score: 18, max: 20, color: "bg-emerald-500" },
      { category: "Residency", score: 12, max: 15, color: "bg-purple-500" },
      { category: "Verifications", score: 10, max: 15, color: "bg-amber-500" },
    ],
  },
  {
    id: 2, name: "Sophie Laurent", email: "sophie@loreal.com", phone: "+33 6 12 34 56 78",
    property: "Calle Serrano 12, 5A", score: 9.1, status: "qualified",
    income: "€4,800/mo", incomeMonthly: 4800, idVerified: true, linkedIn: true,
    nationality: "French", countryOfBirth: "France", ageRange: "35-40",
    idType: "NIE", idNumber: "X1234567A", biometricPassed: true,
    employer: "L'Oréal", jobTitle: "Marketing Director", employmentYears: "6 years",
    contractType: "CDI (Indefinido)", salaryPaymentDate: "1st", businessEmailMatch: true,
    linkedinHeadline: "Marketing Director at L'Oréal | Beauty & Innovation",
    linkedinProfile: "linkedin.com/in/sophielaurent",
    dbCreditScore: 91, dbCreditRating: "Excellent",
    documents: [
      { name: "Payslips (3 months)", uploaded: true, verified: true },
      { name: "Work Contract", uploaded: true, verified: true },
      { name: "Tax Return 2025", uploaded: true, verified: true },
      { name: "NIE Card", uploaded: true, verified: true },
    ],
    residencyHistory: [{ country: "Spain", years: "3 years" }, { country: "France", years: "2 years" }],
    livedAbroad: true, emailVerified: true, phoneVerified: true,
    rentApplied: 1400, incomeRatio: 3.43, appliedDate: "2026-04-14",
    fraudFlag: false, fraudReasons: [],
    scoreBreakdown: [
      { category: "D&B Credit", score: 28, max: 30, color: "bg-orange-500" },
      { category: "LinkedIn", score: 20, max: 20, color: "bg-blue-500" },
      { category: "Identity", score: 20, max: 20, color: "bg-emerald-500" },
      { category: "Residency", score: 13, max: 15, color: "bg-purple-500" },
      { category: "Verifications", score: 10, max: 15, color: "bg-amber-500" },
    ],
  },
  {
    id: 3, name: "João Silva", email: "joao@deloitte.pt", phone: "+351 923 456 789",
    property: "Av. Liberdade 100, 1E", score: 7.4, status: "qualified",
    income: "€2,900/mo", incomeMonthly: 2900, idVerified: true, linkedIn: false,
    nationality: "Portuguese", countryOfBirth: "Portugal", ageRange: "26-30",
    idType: "Passport", idNumber: "PP654321", biometricPassed: true,
    employer: "Deloitte Portugal", jobTitle: "Auditor", employmentYears: "3 years",
    contractType: "Sem Termo (Indefinido)", salaryPaymentDate: "25th", businessEmailMatch: true,
    linkedinHeadline: "", linkedinProfile: "",
    dbCreditScore: 74, dbCreditRating: "Good",
    documents: [
      { name: "Payslips (3 months)", uploaded: true, verified: true },
      { name: "Work Contract", uploaded: true, verified: true },
      { name: "Passport Scan", uploaded: true, verified: true },
    ],
    residencyHistory: [{ country: "Portugal", years: "All 5 years" }],
    livedAbroad: false, emailVerified: true, phoneVerified: true,
    rentApplied: 1800, incomeRatio: 1.61, appliedDate: "2026-04-14",
    fraudFlag: false, fraudReasons: [],
    scoreBreakdown: [
      { category: "D&B Credit", score: 20, max: 30, color: "bg-orange-500" },
      { category: "LinkedIn", score: 0, max: 20, color: "bg-blue-500" },
      { category: "Identity", score: 18, max: 20, color: "bg-emerald-500" },
      { category: "Residency", score: 15, max: 15, color: "bg-purple-500" },
      { category: "Verifications", score: 12, max: 15, color: "bg-amber-500" },
    ],
  },
  {
    id: 4, name: "Ana Ferreira", email: "ana@ferreira.pt", phone: "+351 912 345 678",
    property: "Rua Augusta 15, 2D", score: 6.2, status: "review",
    income: "€2,100/mo", incomeMonthly: 2100, idVerified: true, linkedIn: false,
    nationality: "Portuguese", countryOfBirth: "Portugal", ageRange: "28-32",
    idType: "Passport", idNumber: "PP123456", biometricPassed: true,
    employer: "Freelance", jobTitle: "Graphic Designer", employmentYears: "2 years freelance",
    contractType: "Freelance / Recibos Verdes", salaryPaymentDate: "Variable", businessEmailMatch: false,
    linkedinHeadline: "", linkedinProfile: "",
    dbCreditScore: 58, dbCreditRating: "Fair",
    documents: [
      { name: "Payslips (3 months)", uploaded: false, verified: false },
      { name: "Tax Return 2025", uploaded: true, verified: false },
      { name: "Bank Statements", uploaded: true, verified: true },
      { name: "Passport Scan", uploaded: true, verified: true },
    ],
    residencyHistory: [{ country: "Portugal", years: "All 5 years" }],
    livedAbroad: false, emailVerified: true, phoneVerified: true,
    rentApplied: 1100, incomeRatio: 1.91, appliedDate: "2026-04-15",
    fraudFlag: false, fraudReasons: [],
    scoreBreakdown: [
      { category: "D&B Credit", score: 15, max: 30, color: "bg-orange-500" },
      { category: "LinkedIn", score: 0, max: 20, color: "bg-blue-500" },
      { category: "Identity", score: 18, max: 20, color: "bg-emerald-500" },
      { category: "Residency", score: 15, max: 15, color: "bg-purple-500" },
      { category: "Verifications", score: 14, max: 15, color: "bg-amber-500" },
    ],
  },
  {
    id: 5, name: "Marco Rossi", email: "marco@gmail.com", phone: "+39 333 456 789",
    property: "Via Roma 88, Int 4", score: 3.1, status: "flagged",
    income: "Not verified", incomeMonthly: 0, idVerified: false, linkedIn: false,
    nationality: "Italian", countryOfBirth: "Italy", ageRange: "25-30",
    idType: "Passport", idNumber: "YA1234567", biometricPassed: false,
    employer: "Unknown", jobTitle: "N/A", employmentYears: "N/A",
    contractType: "N/A", salaryPaymentDate: "N/A", businessEmailMatch: false,
    linkedinHeadline: "", linkedinProfile: "",
    dbCreditScore: null, dbCreditRating: "Not available",
    documents: [
      { name: "Payslips (3 months)", uploaded: false, verified: false },
      { name: "Work Contract", uploaded: false, verified: false },
      { name: "Passport Scan", uploaded: true, verified: false },
    ],
    residencyHistory: [{ country: "Italy", years: "3 years" }, { country: "Unknown", years: "2 years" }],
    livedAbroad: true, emailVerified: true, phoneVerified: false,
    rentApplied: 1400, incomeRatio: 0, appliedDate: "2026-04-15",
    fraudFlag: true, fraudReasons: ["No income verification", "Passport not verified", "Incomplete documents"],
    scoreBreakdown: [
      { category: "D&B Credit", score: 0, max: 30, color: "bg-orange-500" },
      { category: "LinkedIn", score: 0, max: 20, color: "bg-blue-500" },
      { category: "Identity", score: 5, max: 20, color: "bg-emerald-500" },
      { category: "Residency", score: 3, max: 15, color: "bg-purple-500" },
      { category: "Verifications", score: 8, max: 15, color: "bg-amber-500" },
    ],
  },
];

const statusStyles: Record<string, string> = {
  qualified: "bg-green-100 text-green-800 border-green-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  flagged: "bg-red-100 text-red-800 border-red-200",
};

const scoreColor = (score: number) => {
  if (score >= 7.5) return "text-emerald-600";
  if (score >= 5) return "text-amber-600";
  return "text-destructive";
};

const Tenants = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<TenantData | null>(null);

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.property.toLowerCase().includes(search.toLowerCase()) ||
    t.employer.toLowerCase().includes(search.toLowerCase())
  );

  const totalScore = selected?.scoreBreakdown.reduce((a, b) => a + b.score, 0) ?? 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tenant Inquiries</h2>
        <p className="text-muted-foreground text-sm mt-1">Pre-qualified tenant applications for your listings</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tenants, properties or employers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((tenant) => (
          <Card
            key={tenant.id}
            className="shadow-card hover:shadow-card-hover transition-all border-border cursor-pointer group"
            onClick={() => setSelected(tenant)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    {tenant.avatar ? <AvatarImage src={tenant.avatar} alt={tenant.name} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {tenant.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{tenant.name}</h3>
                    <p className="text-xs text-muted-foreground">{tenant.property}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {tenant.idVerified && (
                        <span className="flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle className="w-3 h-3" /> ID Verified
                        </span>
                      )}
                      {tenant.linkedIn && (
                        <span className="flex items-center gap-1 text-xs text-blue-700">
                          <CheckCircle className="w-3 h-3" /> LinkedIn
                        </span>
                      )}
                      {!tenant.idVerified && (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <AlertTriangle className="w-3 h-3" /> ID Missing
                        </span>
                      )}
                      {tenant.fraudFlag && (
                        <Badge variant="destructive" className="text-[10px] h-5">Flagged</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className={`text-lg font-bold ${scoreColor(tenant.score)}`}>{tenant.score}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Trust Score</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">{tenant.income}</p>
                    <p className="text-xs text-muted-foreground">Income</p>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize ${statusStyles[tenant.status]}`}>
                    {tenant.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Tenant Profile Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-card z-10 border-b border-border p-5 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    {selected.avatar ? <AvatarImage src={selected.avatar} alt={selected.name} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {selected.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs capitalize ${statusStyles[selected.status]}`}>{selected.status}</Badge>
                      {selected.fraudFlag && (
                        <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="w-3 h-3" /> Fraud Flag</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* Trust Score + Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">100-Point Trust Score</h4>
                  <span className={`text-2xl font-black ${scoreColor(selected.score)}`}>{totalScore}<span className="text-sm font-semibold text-muted-foreground"> / 100</span></span>
                </div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden flex">
                  {selected.scoreBreakdown.map((seg) => (
                    seg.score > 0 && (
                      <div key={seg.category} className={`${seg.color} h-full transition-all duration-500`} style={{ width: `${seg.score}%` }} title={`${seg.category}: ${seg.score}/${seg.max}`} />
                    )
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {selected.scoreBreakdown.map((seg) => (
                    <div key={seg.category} className="text-center">
                      <div className={`w-2.5 h-2.5 rounded-sm ${seg.color} mx-auto mb-1 ${seg.score === 0 ? "opacity-30" : ""}`} />
                      <p className="text-[10px] text-muted-foreground leading-tight">{seg.category}</p>
                      <p className={`text-xs font-bold ${seg.score === 0 ? "text-muted-foreground" : "text-foreground"}`}>{seg.score}/{seg.max}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fraud Alert */}
              {selected.fraudFlag && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">Fraud Flags Detected</span>
                  </div>
                  <ul className="space-y-1">
                    {selected.fraudReasons.map((r, i) => (
                      <li key={i} className="text-xs text-destructive flex items-center gap-1.5"><XCircle className="w-3 h-3 shrink-0" /> {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Property Applied */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" /> Property Applied For</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Property</p><p className="text-sm font-medium text-foreground">{selected.property}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Rent</p><p className="text-sm font-medium text-foreground">€{selected.rentApplied}/mo</p></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Income Ratio</p><p className={`text-sm font-bold ${selected.incomeRatio >= 3 ? "text-emerald-600" : selected.incomeRatio >= 2 ? "text-amber-600" : "text-destructive"}`}>{selected.incomeRatio > 0 ? `${selected.incomeRatio.toFixed(1)}×` : "N/A"}</p></div>
                </div>
                <p className="text-xs text-muted-foreground">Applied on {new Date(selected.appliedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              <Separator />

              {/* Personal Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /> Personal Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Nationality", value: selected.nationality },
                    { label: "Country of Birth", value: selected.countryOfBirth },
                    { label: "Age Range", value: selected.ageRange },
                    { label: "Email", value: selected.email },
                    { label: "Phone", value: selected.phone },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-sm font-medium text-foreground truncate">{item.value}</p></div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Identity */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><IdCard className="w-4 h-4 text-muted-foreground" /> Identity Verification</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">ID Type</p><p className="text-sm font-medium text-foreground">{selected.idType}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">ID Number</p><p className="text-sm font-medium text-foreground font-mono">{selected.idNumber}</p></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">ID Verified</p><div className="flex items-center gap-1 mt-0.5">{selected.idVerified ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-destructive" />}<span className="text-sm font-medium">{selected.idVerified ? "Yes" : "No"}</span></div></div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Biometric</p><div className="flex items-center gap-1 mt-0.5">{selected.biometricPassed ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-destructive" />}<span className="text-sm font-medium">{selected.biometricPassed ? "Passed" : "Failed"}</span></div></div>
                </div>
              </div>

              <Separator />

              {/* Employment */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Briefcase className="w-4 h-4 text-muted-foreground" /> Employment & Income</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Employer", value: selected.employer },
                    { label: "Job Title", value: selected.jobTitle },
                    { label: "Time at Company", value: selected.employmentYears },
                    { label: "Contract Type", value: selected.contractType },
                    { label: "Monthly Income", value: selected.income },
                    { label: "Salary Date", value: selected.salaryPaymentDate },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">{item.label}</p><p className="text-sm font-medium text-foreground">{item.value}</p></div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  {selected.businessEmailMatch ? (
                    <><CheckCircle className="w-4 h-4 text-emerald-600" /><span className="text-emerald-600 font-medium">Business email matches employer</span></>
                  ) : (
                    <><AlertTriangle className="w-4 h-4 text-amber-600" /><span className="text-amber-600">Email does not match employer domain</span></>
                  )}
                </div>
              </div>

              <Separator />

              {/* LinkedIn */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Link2 className="w-4 h-4 text-muted-foreground" /> LinkedIn</h4>
                {selected.linkedIn ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-600" /><span className="text-sm font-medium text-blue-800">Verified</span></div>
                    <p className="text-xs text-blue-700">{selected.linkedinHeadline}</p>
                    <p className="text-xs text-blue-600">{selected.linkedinProfile}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/30 rounded-xl flex items-center gap-2"><XCircle className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Not verified</span></div>
                )}
              </div>

              <Separator />

              {/* D&B Credit */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><CreditCard className="w-4 h-4 text-muted-foreground" /> D&B Credit Report</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Credit Score</p>
                    <p className={`text-lg font-bold ${selected.dbCreditScore !== null ? (selected.dbCreditScore >= 70 ? "text-emerald-600" : selected.dbCreditScore >= 50 ? "text-amber-600" : "text-destructive") : "text-muted-foreground"}`}>
                      {selected.dbCreditScore ?? "—"}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3"><p className="text-xs text-muted-foreground">Rating</p><p className="text-sm font-medium text-foreground">{selected.dbCreditRating}</p></div>
                </div>
              </div>

              <Separator />

              {/* Residency */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground" /> 5-Year Residency History</h4>
                <div className="space-y-1.5">
                  {selected.residencyHistory.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-2.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{r.country}</span>
                      <span className="text-muted-foreground">— {r.years}</span>
                    </div>
                  ))}
                </div>
                {selected.livedAbroad && <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Lived abroad — Foreign National ID may be required</p>}
              </div>

              <Separator />

              {/* Documents */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> Documents</h4>
                <div className="space-y-1.5">
                  {selected.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                      <span className="text-sm text-foreground">{doc.name}</span>
                      <div className="flex items-center gap-2">
                        {doc.uploaded ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Uploaded</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">Missing</Badge>
                        )}
                        {doc.verified ? (
                          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Verified</Badge>
                        ) : doc.uploaded ? (
                          <Badge variant="outline" className="text-[10px] bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Contact Verifications */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Shield className="w-4 h-4 text-muted-foreground" /> Contact Verifications</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-3">
                    {selected.emailVerified ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-destructive" />}
                    <span>Email {selected.emailVerified ? "Verified" : "Not Verified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-3">
                    {selected.phoneVerified ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-destructive" />}
                    <span>Phone {selected.phoneVerified ? "Verified" : "Not Verified"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 sticky bottom-0 bg-card pb-1">
                <Button variant="hero" className="flex-1 rounded-xl gap-2" onClick={() => setSelected(null)}>
                  <CheckCircle className="w-4 h-4" /> Approve
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => setSelected(null)}>
                  <Eye className="w-4 h-4" /> Schedule Viewing
                </Button>
                <Button variant="destructive" className="rounded-xl gap-2" onClick={() => setSelected(null)}>
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tenants;
