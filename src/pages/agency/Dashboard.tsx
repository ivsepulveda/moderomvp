import { useEffect, useMemo, useState } from "react";
import { Building2, Users, TrendingUp, Clock, Shield, ArrowUpRight, ChevronDown, ChevronRight, CheckCircle, XCircle, Eye, X, Briefcase, Mail, Phone, FileText, AlertTriangle, Globe, MapPin, IdCard, CreditCard, Calendar, Link2, User, Camera, Settings2, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { submittedApplicationDemo } from "@/data/submittedApplication";
import LiveApplicationsPanel from "@/components/LiveApplicationsPanel";

const stats = [
  { label: "Active Listings", value: "34", icon: Building2, change: "+2 this week", trend: "up" },
  { label: "Tenant Inquiries", value: "68", icon: Users, change: "+1 onboarding submission", trend: "up" },
  { label: "Pre-Qualified", value: "42", icon: Shield, change: "62% rate", trend: "up" },
  { label: "Avg. Trust Score", value: "7.8", icon: TrendingUp, change: "+0.3 vs last month", trend: "up" },
];

interface TenantInquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  score: number;
  status: "qualified" | "review" | "flagged" | "pending";
  time: string;
  appliedDate: string;
  avatar?: string;
  nationality: string;
  countryOfBirth: string;
  ageRange: string;
  idType: "DNI" | "NIE" | "Passport";
  idNumber: string;
  idVerified: boolean;
  biometricPassed: boolean;
  income: string;
  incomeMonthly: number;
  employer: string;
  jobTitle: string;
  employmentYears: string;
  contractType: string;
  salaryPaymentDate: string;
  businessEmailMatch: boolean;
  linkedinVerified: boolean;
  linkedinProfile: string;
  linkedinHeadline: string;
  dbCreditScore: number | null;
  dbCreditRating: string;
  documents: { name: string; uploaded: boolean; verified: boolean }[];
  documentsComplete: boolean;
  residencyHistory: { country: string; years: string }[];
  livedAbroad: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  scoreBreakdown: { category: string; score: number; max: number; color: string }[];
  fraudFlag: boolean;
  fraudReasons: string[];
  propertyApplied: string;
  rentApplied: number;
  incomeRatio: number;
}

interface Listing {
  id: number;
  title: string;
  address: string;
  rent: string;
  inquiries: TenantInquiry[];
}

interface AgencySetupSummary {
  id: string;
  current_step: number;
  completed: boolean;
  listings: unknown[] | null;
  team_members: unknown[] | null;
  updated_at: string;
}

const listings: Listing[] = [
  {
    id: 1,
    title: "Luxury Apartment",
    address: "Calle Gran Vía 42, 3B, Madrid",
    rent: "€2,200/mo",
    inquiries: [
      // Newest: tenant who just completed /onboarding submission
      submittedApplicationDemo as any,
      {
        id: 1, name: "Carlos Mendez", email: "carlos@accenture.com", phone: "+34 612 345 678",
        score: 8.5, status: "qualified", time: "10 min ago", appliedDate: "2026-04-15",
        nationality: "Spanish", countryOfBirth: "Spain", ageRange: "30-35",
        idType: "DNI", idNumber: "12345678Z", idVerified: true, biometricPassed: true,
        income: "€3,200/mo", incomeMonthly: 3200, employer: "Accenture Spain", jobTitle: "Senior Consultant",
        employmentYears: "4 years", contractType: "Indefinido", salaryPaymentDate: "28th of month",
        businessEmailMatch: true,
        linkedinVerified: true, linkedinProfile: "linkedin.com/in/carlosmendez", linkedinHeadline: "Senior Consultant at Accenture | Digital Transformation",
        dbCreditScore: 82, dbCreditRating: "Good",
        documents: [
          { name: "Payslips (3 months)", uploaded: true, verified: true },
          { name: "Work Contract", uploaded: true, verified: true },
          { name: "Tax Return 2025", uploaded: true, verified: false },
          { name: "DNI Scan", uploaded: true, verified: true },
        ],
        documentsComplete: true,
        residencyHistory: [{ country: "Spain", years: "All 5 years" }],
        livedAbroad: false,
        emailVerified: true, phoneVerified: true,
        scoreBreakdown: [
          { category: "D&B Credit", score: 25, max: 30, color: "bg-orange-500" },
          { category: "LinkedIn", score: 20, max: 20, color: "bg-blue-500" },
          { category: "Identity", score: 18, max: 20, color: "bg-emerald-500" },
          { category: "Residency", score: 12, max: 15, color: "bg-purple-500" },
          { category: "Verifications", score: 10, max: 15, color: "bg-amber-500" },
        ],
        fraudFlag: false, fraudReasons: [],
        propertyApplied: "Calle Gran Vía 42, 3B", rentApplied: 2200, incomeRatio: 1.45,
      },
      {
        id: 3, name: "Marco Rossi", email: "marco@gmail.com", phone: "+39 333 456 789",
        score: 3.1, status: "flagged", time: "1 hour ago", appliedDate: "2026-04-15",
        nationality: "Italian", countryOfBirth: "Italy", ageRange: "25-30",
        idType: "Passport", idNumber: "YA1234567", idVerified: false, biometricPassed: false,
        income: "Not verified", incomeMonthly: 0, employer: "Unknown", jobTitle: "N/A",
        employmentYears: "N/A", contractType: "N/A", salaryPaymentDate: "N/A",
        businessEmailMatch: false,
        linkedinVerified: false, linkedinProfile: "", linkedinHeadline: "",
        dbCreditScore: null, dbCreditRating: "Not available",
        documents: [
          { name: "Payslips (3 months)", uploaded: false, verified: false },
          { name: "Work Contract", uploaded: false, verified: false },
          { name: "Passport Scan", uploaded: true, verified: false },
        ],
        documentsComplete: false,
        residencyHistory: [{ country: "Italy", years: "3 years" }, { country: "Unknown", years: "2 years" }],
        livedAbroad: true,
        emailVerified: true, phoneVerified: false,
        scoreBreakdown: [
          { category: "D&B Credit", score: 0, max: 30, color: "bg-orange-500" },
          { category: "LinkedIn", score: 0, max: 20, color: "bg-blue-500" },
          { category: "Identity", score: 5, max: 20, color: "bg-emerald-500" },
          { category: "Residency", score: 3, max: 15, color: "bg-purple-500" },
          { category: "Verifications", score: 8, max: 15, color: "bg-amber-500" },
        ],
        fraudFlag: true, fraudReasons: ["No income verification", "Passport not verified", "Incomplete documents"],
        propertyApplied: "Calle Gran Vía 42, 3B", rentApplied: 2200, incomeRatio: 0,
      },
    ],
  },
  {
    id: 2,
    title: "Modern Studio",
    address: "Calle Serrano 12, 5A, Madrid",
    rent: "€1,400/mo",
    inquiries: [
      {
        id: 4, name: "Sophie Laurent", email: "sophie@loreal.com", phone: "+33 6 12 34 56 78",
        score: 9.1, status: "qualified", time: "2 hours ago", appliedDate: "2026-04-14",
        nationality: "French", countryOfBirth: "France", ageRange: "35-40",
        idType: "NIE", idNumber: "X1234567A", idVerified: true, biometricPassed: true,
        income: "€4,800/mo", incomeMonthly: 4800, employer: "L'Oréal", jobTitle: "Marketing Director",
        employmentYears: "6 years", contractType: "CDI (Indefinido)", salaryPaymentDate: "1st of month",
        businessEmailMatch: true,
        linkedinVerified: true, linkedinProfile: "linkedin.com/in/sophielaurent", linkedinHeadline: "Marketing Director at L'Oréal | Beauty & Innovation",
        dbCreditScore: 91, dbCreditRating: "Excellent",
        documents: [
          { name: "Payslips (3 months)", uploaded: true, verified: true },
          { name: "Work Contract", uploaded: true, verified: true },
          { name: "Tax Return 2025", uploaded: true, verified: true },
          { name: "NIE Card", uploaded: true, verified: true },
        ],
        documentsComplete: true,
        residencyHistory: [{ country: "Spain", years: "3 years" }, { country: "France", years: "2 years" }],
        livedAbroad: true,
        emailVerified: true, phoneVerified: true,
        scoreBreakdown: [
          { category: "D&B Credit", score: 28, max: 30, color: "bg-orange-500" },
          { category: "LinkedIn", score: 20, max: 20, color: "bg-blue-500" },
          { category: "Identity", score: 20, max: 20, color: "bg-emerald-500" },
          { category: "Residency", score: 13, max: 15, color: "bg-purple-500" },
          { category: "Verifications", score: 10, max: 15, color: "bg-amber-500" },
        ],
        fraudFlag: false, fraudReasons: [],
        propertyApplied: "Calle Serrano 12, 5A", rentApplied: 1400, incomeRatio: 3.43,
      },
    ],
  },
  {
    id: 3,
    title: "Cozy 2-Bedroom",
    address: "Rua Augusta 15, 2D, Lisbon",
    rent: "€1,100/mo",
    inquiries: [
      {
        id: 2, name: "Ana Ferreira", email: "ana@ferreira.pt", phone: "+351 912 345 678",
        score: 6.2, status: "review", time: "25 min ago", appliedDate: "2026-04-15",
        nationality: "Portuguese", countryOfBirth: "Portugal", ageRange: "28-32",
        idType: "Passport", idNumber: "PP123456", idVerified: true, biometricPassed: true,
        income: "€2,100/mo", incomeMonthly: 2100, employer: "Freelance", jobTitle: "Graphic Designer",
        employmentYears: "2 years freelance", contractType: "Freelance / Recibos Verdes", salaryPaymentDate: "Variable",
        businessEmailMatch: false,
        linkedinVerified: false, linkedinProfile: "", linkedinHeadline: "",
        dbCreditScore: 58, dbCreditRating: "Fair",
        documents: [
          { name: "Payslips (3 months)", uploaded: false, verified: false },
          { name: "Tax Return 2025", uploaded: true, verified: false },
          { name: "Bank Statements", uploaded: true, verified: true },
          { name: "Passport Scan", uploaded: true, verified: true },
        ],
        documentsComplete: false,
        residencyHistory: [{ country: "Portugal", years: "All 5 years" }],
        livedAbroad: false,
        emailVerified: true, phoneVerified: true,
        scoreBreakdown: [
          { category: "D&B Credit", score: 15, max: 30, color: "bg-orange-500" },
          { category: "LinkedIn", score: 0, max: 20, color: "bg-blue-500" },
          { category: "Identity", score: 18, max: 20, color: "bg-emerald-500" },
          { category: "Residency", score: 15, max: 15, color: "bg-purple-500" },
          { category: "Verifications", score: 14, max: 15, color: "bg-amber-500" },
        ],
        fraudFlag: false, fraudReasons: [],
        propertyApplied: "Rua Augusta 15, 2D", rentApplied: 1100, incomeRatio: 1.91,
      },
      {
        id: 5, name: "João Silva", email: "joao@deloitte.pt", phone: "+351 923 456 789",
        score: 7.4, status: "qualified", time: "3 hours ago", appliedDate: "2026-04-14",
        nationality: "Portuguese", countryOfBirth: "Portugal", ageRange: "26-30",
        idType: "Passport", idNumber: "PP654321", idVerified: true, biometricPassed: true,
        income: "€2,900/mo", incomeMonthly: 2900, employer: "Deloitte Portugal", jobTitle: "Auditor",
        employmentYears: "3 years", contractType: "Sem Termo (Indefinido)", salaryPaymentDate: "25th of month",
        businessEmailMatch: true,
        linkedinVerified: true, linkedinProfile: "linkedin.com/in/joaosilva", linkedinHeadline: "Auditor at Deloitte | Assurance & Advisory",
        dbCreditScore: 74, dbCreditRating: "Good",
        documents: [
          { name: "Payslips (3 months)", uploaded: true, verified: true },
          { name: "Work Contract", uploaded: true, verified: true },
          { name: "Passport Scan", uploaded: true, verified: true },
        ],
        documentsComplete: true,
        residencyHistory: [{ country: "Portugal", years: "All 5 years" }],
        livedAbroad: false,
        emailVerified: true, phoneVerified: true,
        scoreBreakdown: [
          { category: "D&B Credit", score: 20, max: 30, color: "bg-orange-500" },
          { category: "LinkedIn", score: 18, max: 20, color: "bg-blue-500" },
          { category: "Identity", score: 18, max: 20, color: "bg-emerald-500" },
          { category: "Residency", score: 12, max: 15, color: "bg-purple-500" },
          { category: "Verifications", score: 6, max: 15, color: "bg-amber-500" },
        ],
        fraudFlag: false, fraudReasons: [],
        propertyApplied: "Rua Augusta 15, 2D", rentApplied: 1100, incomeRatio: 2.64,
      },
    ],
  },
];

const statusStyles: Record<string, string> = {
  qualified: "bg-green-100 text-green-800 border-green-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  flagged: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-gray-100 text-gray-800 border-gray-200",
};

const scoreColor = (score: number) => {
  if (score >= 7.5) return "text-emerald-600";
  if (score >= 5) return "text-amber-600";
  return "text-destructive";
};

const AgencyDashboard = () => {
  const { profile, user } = useAuth();
  const [expandedListings, setExpandedListings] = useState<number[]>([1]);
  const [selectedInquiry, setSelectedInquiry] = useState<TenantInquiry | null>(null);
  const [tenantActions, setTenantActions] = useState<Record<number, { status: "approved" | "rejected"; viewing?: { date: string; time: string } }>>({});
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [viewingDate, setViewingDate] = useState("");
  const [viewingTime, setViewingTime] = useState("10:00");
  const [agencySetup, setAgencySetup] = useState<AgencySetupSummary | null>(null);

  const storageKey = useMemo(() => `modero-tenant-actions:${user?.id || "guest"}`, [user?.id]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setTenantActions(JSON.parse(stored));
      } catch {
        setTenantActions({});
      }
    } else {
      setTenantActions({});
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tenantActions));
  }, [storageKey, tenantActions]);

  useEffect(() => {
    if (!profile?.email) return;

    const fetchSetup = async () => {
      const { data, error } = await supabase
        .from("agency_setup")
        .select("id,current_step,completed,listings,team_members,updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setAgencySetup(data as AgencySetupSummary);
      }
    };

    fetchSetup();
  }, [profile?.email]);

  const toggleListing = (id: number) => {
    setExpandedListings((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleApprove = (inquiry: TenantInquiry) => {
    setTenantActions(prev => ({ ...prev, [inquiry.id]: { status: "approved" } }));
    toast.success(`${inquiry.name} has been approved`);
  };

  const handleReject = (inquiry: TenantInquiry) => {
    setTenantActions(prev => ({ ...prev, [inquiry.id]: { status: "rejected" } }));
    toast.error(`${inquiry.name} has been rejected`);
    setSelectedInquiry(null);
  };

  const handleScheduleViewing = () => {
    if (!selectedInquiry || !viewingDate || !viewingTime) return;
    setTenantActions(prev => ({
      ...prev,
      [selectedInquiry.id]: { ...prev[selectedInquiry.id], viewing: { date: viewingDate, time: viewingTime } },
    }));
    setShowScheduleDialog(false);
    setViewingDate("");
    setViewingTime("10:00");
    toast.success(`Viewing saved for ${selectedInquiry.name} on ${new Date(viewingDate).toLocaleDateString("en-GB", { day: "numeric", month: "long" })} at ${viewingTime}`);
  };

  const totalScore = selectedInquiry?.scoreBreakdown.reduce((a, b) => a + b.score, 0) ?? 0;
  const setupListingsCount = agencySetup && Array.isArray(agencySetup.listings) ? agencySetup.listings.length : 0;
  const setupTeamCount = agencySetup && Array.isArray(agencySetup.team_members) ? agencySetup.team_members.length : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {profile?.agency_name || "Agency Dashboard"}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Your tenant intelligence overview</p>
      </div>

      {agencySetup && (
        <Card className="shadow-card border-border">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground">Agency setup synced</h3>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {agencySetup.completed ? "Portal ready" : `Step ${agencySetup.current_step + 1} of 5`}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Your admin-configured onboarding is stored in the agency portal and available across your workspace.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Configured listings</p>
                  <p className="text-lg font-semibold text-foreground mt-1">{setupListingsCount}</p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Configured team</p>
                  <p className="text-lg font-semibold text-foreground mt-1">{setupTeamCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <LiveApplicationsPanel />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-all duration-300 border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3 text-primary" />
                      {stat.change}
                    </p>
                  </div>
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-orange">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tenant Inquiries by Listing */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Tenant Inquiries by Listing</h3>
          <a href="/agency/tenants" className="text-sm text-primary hover:underline font-medium">View all →</a>
        </div>

        {listings.map((listing) => {
          const isExpanded = expandedListings.includes(listing.id);
          return (
            <Card key={listing.id} className="shadow-card border-border overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => toggleListing(listing.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{listing.title}</h4>
                    <p className="text-xs text-muted-foreground">{listing.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">{listing.rent}</Badge>
                  <Badge className="bg-primary/10 text-primary text-xs hover:bg-primary/10">
                    {listing.inquiries.length} {listing.inquiries.length === 1 ? "inquiry" : "inquiries"}
                  </Badge>
                  {(() => {
                    const viewingCount = listing.inquiries.filter(i => tenantActions[i.id]?.viewing).length;
                    return viewingCount > 0 ? (
                      <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                        <Calendar className="w-3 h-3" /> {viewingCount} viewing{viewingCount > 1 ? "s" : ""}
                      </Badge>
                    ) : null;
                  })()}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border">
                  {listing.inquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-accent/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-10 h-10">
                          {inquiry.avatar ? <AvatarImage src={inquiry.avatar} alt={inquiry.name} /> : null}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {inquiry.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-medium text-foreground text-sm truncate">{inquiry.name}</p>
                            {(inquiry as any).submittedViaOnboarding && (
                              <Badge variant="outline" className="text-[9px] h-4 bg-primary/10 text-primary border-primary/30 px-1.5">
                                Onboarding submitted
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{inquiry.employer} · {inquiry.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            <span className={`text-sm font-bold ${scoreColor(inquiry.score)}`}>{inquiry.score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Trust Score</p>
                        </div>
                        <Badge variant="outline" className={`text-xs capitalize ${statusStyles[inquiry.status]}`}>
                          {tenantActions[inquiry.id]?.status === "approved" ? "approved" : tenantActions[inquiry.id]?.status === "rejected" ? "rejected" : inquiry.status}
                        </Badge>
                        {tenantActions[inquiry.id]?.viewing && (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(tenantActions[inquiry.id].viewing!.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {inquiry.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Upcoming Viewings This Week */}
      {(() => {
        const allViewings = listings.flatMap(listing =>
          listing.inquiries
            .filter(i => tenantActions[i.id]?.viewing)
            .map(i => ({
              ...i,
              listing,
              viewing: tenantActions[i.id].viewing!,
            }))
        ).sort((a, b) => {
          const da = new Date(`${a.viewing.date}T${a.viewing.time}`);
          const db = new Date(`${b.viewing.date}T${b.viewing.time}`);
          return da.getTime() - db.getTime();
        });

        // Get current week range
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Days of the week
        const weekDays: { label: string; date: Date }[] = [];
        for (let d = 0; d < 7; d++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + d);
          weekDays.push({
            label: day.toLocaleDateString("en-GB", { weekday: "short" }),
            date: day,
          });
        }

        return (
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Upcoming Viewings
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {allViewings.length} scheduled
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {allViewings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No viewings scheduled yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Approve a tenant and schedule a viewing to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Week overview */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {weekDays.map((wd) => {
                      const dayStr = wd.date.toISOString().split("T")[0];
                      const dayViewings = allViewings.filter(v => v.viewing.date === dayStr);
                      const isToday = dayStr === now.toISOString().split("T")[0];
                      return (
                        <div
                          key={dayStr}
                          className={`rounded-xl p-2 text-center transition-all ${
                            isToday ? "bg-primary/10 border border-primary/30" : "bg-muted/30"
                          } ${dayViewings.length > 0 ? "ring-1 ring-primary/20" : ""}`}
                        >
                          <p className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                            {wd.label}
                          </p>
                          <p className={`text-sm font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                            {wd.date.getDate()}
                          </p>
                          {dayViewings.length > 0 && (
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mx-auto mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Viewing list */}
                  <div className="space-y-2">
                    {allViewings.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-accent/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedInquiry(v)}
                      >
                        <div className="w-12 text-center shrink-0">
                          <p className="text-lg font-bold text-primary">
                            {new Date(v.viewing.date).getDate()}
                          </p>
                          <p className="text-[10px] text-muted-foreground uppercase">
                            {new Date(v.viewing.date).toLocaleDateString("en-GB", { month: "short" })}
                          </p>
                        </div>
                        <Separator orientation="vertical" className="h-10" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                                {v.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{v.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{v.listing.title} · {v.listing.address}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-foreground">{v.viewing.time}</p>
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            Confirmed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Fair-Rent Intelligence</CardTitle>
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                25–35% of net income
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sustainable rent range per qualified tenant — use to advise landlords.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {listings.flatMap((listing) =>
                listing.inquiries
                  .filter((i) => i.incomeMonthly > 0 && (i.status === "qualified" || i.status === "review"))
                  .map((i) => {
                    const lo = Math.round(i.incomeMonthly * 0.25);
                    const hi = Math.round(i.incomeMonthly * 0.35);
                    const inRange = i.rentApplied >= lo && i.rentApplied <= hi;
                    const overpaying = i.rentApplied > hi;
                    return (
                      <div key={`${listing.id}-${i.id}`} className="p-3 rounded-xl bg-muted/30 border border-border">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{i.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{listing.title} · €{i.incomeMonthly.toLocaleString()}/mo net</p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] shrink-0 ${
                              inRange ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              overpaying ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {inRange ? "Fair" : overpaying ? "Overpaying" : "Below range"}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Listing rent</span>
                          <span className="font-semibold text-foreground">€{i.rentApplied.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Sustainable range</span>
                          <span className="font-semibold text-primary">€{lo.toLocaleString()} – €{hi.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inquiry Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { stage: "Total Inquiries", count: 67, pct: 100 },
                { stage: "Pre-Screened", count: 52, pct: 78 },
                { stage: "Qualified", count: 41, pct: 61 },
                { stage: "Viewing Scheduled", count: 28, pct: 42 },
                { stage: "Lease Signed", count: 12, pct: 18 },
              ].map((s) => (
                <div key={s.stage} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{s.stage}</span>
                    <span className="text-muted-foreground">{s.count} ({s.pct}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== FULL TENANT PROFILE MODAL ===== */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInquiry(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3 sticky top-0 bg-card z-10 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    {selectedInquiry.avatar ? <AvatarImage src={selectedInquiry.avatar} alt={selectedInquiry.name} /> : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {selectedInquiry.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedInquiry.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs capitalize ${statusStyles[selectedInquiry.status]}`}>
                        {selectedInquiry.status}
                      </Badge>
                      {selectedInquiry.fraudFlag && (
                        <Badge variant="destructive" className="text-xs gap-1">
                          <AlertTriangle className="w-3 h-3" /> Fraud Flag
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedInquiry(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-5">
              {/* Trust Score + Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">100-Point Trust Score</h4>
                  <span className={`text-2xl font-black ${scoreColor(selectedInquiry.score)}`}>{totalScore}<span className="text-sm font-semibold text-muted-foreground"> / 100</span></span>
                </div>
                <div className="w-full h-4 rounded-full bg-muted overflow-hidden flex">
                  {selectedInquiry.scoreBreakdown.map((seg) => (
                    seg.score > 0 && (
                      <div
                        key={seg.category}
                        className={`${seg.color} h-full transition-all duration-500`}
                        style={{ width: `${seg.score}%` }}
                        title={`${seg.category}: ${seg.score}/${seg.max}`}
                      />
                    )
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {selectedInquiry.scoreBreakdown.map((seg) => (
                    <div key={seg.category} className="text-center">
                      <div className={`w-2.5 h-2.5 rounded-sm ${seg.color} mx-auto mb-1 ${seg.score === 0 ? "opacity-30" : ""}`} />
                      <p className="text-[10px] text-muted-foreground leading-tight">{seg.category}</p>
                      <p className={`text-xs font-bold ${seg.score === 0 ? "text-muted-foreground" : "text-foreground"}`}>{seg.score}/{seg.max}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fraud Alert */}
              {selectedInquiry.fraudFlag && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-semibold text-destructive">Fraud Flags Detected</span>
                  </div>
                  <ul className="space-y-1">
                    {selectedInquiry.fraudReasons.map((r, i) => (
                      <li key={i} className="text-xs text-destructive flex items-center gap-1.5">
                        <XCircle className="w-3 h-3 shrink-0" /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* Property Applied */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" /> Property Applied For
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Property</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.propertyApplied}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Rent</p>
                    <p className="text-sm font-medium text-foreground">€{selectedInquiry.rentApplied}/mo</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Income Ratio</p>
                    <p className={`text-sm font-bold ${selectedInquiry.incomeRatio >= 3 ? "text-emerald-600" : selectedInquiry.incomeRatio >= 2 ? "text-amber-600" : "text-destructive"}`}>
                      {selectedInquiry.incomeRatio > 0 ? `${selectedInquiry.incomeRatio.toFixed(1)}×` : "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Applied on {new Date(selectedInquiry.appliedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <Separator />

              {/* Personal Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" /> Personal Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "Nationality", value: selectedInquiry.nationality },
                    { label: "Country of Birth", value: selectedInquiry.countryOfBirth },
                    { label: "Age Range", value: selectedInquiry.ageRange },
                    { label: "Email", value: selectedInquiry.email },
                    { label: "Phone", value: selectedInquiry.phone },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Identity Documents */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <IdCard className="w-4 h-4 text-muted-foreground" /> Identity Verification
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">ID Type</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.idType}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">ID Number</p>
                    <p className="text-sm font-medium text-foreground font-mono">{selectedInquiry.idNumber}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">ID Verified</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {selectedInquiry.idVerified ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-destructive" />}
                      <span className="text-sm font-medium">{selectedInquiry.idVerified ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Biometric Match</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {selectedInquiry.biometricPassed ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-destructive" />}
                      <span className="text-sm font-medium">{selectedInquiry.biometricPassed ? "Passed" : "Failed"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Employment & Income */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" /> Employment & Income
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Employer", value: selectedInquiry.employer },
                    { label: "Job Title", value: selectedInquiry.jobTitle },
                    { label: "Time at Company", value: selectedInquiry.employmentYears },
                    { label: "Contract Type", value: selectedInquiry.contractType },
                    { label: "Monthly Income", value: selectedInquiry.income },
                    { label: "Salary Payment Date", value: selectedInquiry.salaryPaymentDate },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  {selectedInquiry.businessEmailMatch ? (
                    <><CheckCircle className="w-4 h-4 text-emerald-600" /><span className="text-emerald-600 font-medium">Business email matches employer domain</span></>
                  ) : (
                    <><AlertTriangle className="w-4 h-4 text-amber-600" /><span className="text-amber-600">Business email does not match employer</span></>
                  )}
                </div>
              </div>

              <Separator />

              {/* LinkedIn */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground" /> LinkedIn
                </h4>
                {selectedInquiry.linkedinVerified ? (
                  <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-base font-bold text-blue-900">Verified</span>
                    </div>
                    <p className="text-sm font-medium text-blue-700">{selectedInquiry.linkedinHeadline}</p>
                    <a
                      href={selectedInquiry.linkedinProfile.startsWith("http") ? selectedInquiry.linkedinProfile : `https://${selectedInquiry.linkedinProfile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 underline underline-offset-2"
                    >
                      <Link2 className="w-4 h-4" />
                      {selectedInquiry.linkedinProfile}
                    </a>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/30 rounded-xl flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Not verified</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* D&B Credit */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" /> D&B Credit Report
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Credit Score</p>
                    <p className={`text-lg font-bold ${selectedInquiry.dbCreditScore !== null ? (selectedInquiry.dbCreditScore >= 70 ? "text-emerald-600" : selectedInquiry.dbCreditScore >= 50 ? "text-amber-600" : "text-destructive") : "text-muted-foreground"}`}>
                      {selectedInquiry.dbCreditScore !== null ? selectedInquiry.dbCreditScore : "—"}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.dbCreditRating}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Residency History */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" /> 5-Year Residency History
                </h4>
                <div className="space-y-1.5">
                  {selectedInquiry.residencyHistory.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-2.5">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">{r.country}</span>
                      <span className="text-muted-foreground">— {r.years}</span>
                    </div>
                  ))}
                </div>
                {selectedInquiry.livedAbroad && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Lived abroad in the last 5 years — Foreign National ID may be required
                  </p>
                )}
              </div>

              <Separator />

              {/* Documents */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Documents
                </h4>
                <div className="space-y-1.5">
                  {selectedInquiry.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground">{doc.name}</span>
                      </div>
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
                        {doc.uploaded && (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary/80">
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financing Selected (onboarding submissions) */}
              {(selectedInquiry as any).submittedViaOnboarding && (selectedInquiry as any).qualifiedForFinancing && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" /> Financing Selected
                    </h4>
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Provider</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {(selectedInquiry as any).financingProvider}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-1">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Term</p>
                          <p className="text-sm font-semibold text-foreground">{(selectedInquiry as any).financingMonths} mo</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Deposit</p>
                          <p className="text-sm font-semibold text-foreground">€{(selectedInquiry as any).financingDeposit?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Monthly</p>
                          <p className="text-sm font-semibold text-foreground">€{(selectedInquiry as any).financingMonthly}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Verifications */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" /> Contact Verifications
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-3">
                    {selectedInquiry.emailVerified ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-destructive" />}
                    <span>Email {selectedInquiry.emailVerified ? "Verified" : "Not Verified"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-3">
                    {selectedInquiry.phoneVerified ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-destructive" />}
                    <span>Phone {selectedInquiry.phoneVerified ? "Verified" : "Not Verified"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 sticky bottom-0 bg-card pb-1">
                {(() => {
                  const action = tenantActions[selectedInquiry.id];
                  const isApproved = action?.status === "approved";
                  const isRejected = action?.status === "rejected";
                  const hasViewing = !!action?.viewing;

                  if (isRejected) {
                    return (
                      <div className="flex-1 text-center py-3 rounded-xl bg-destructive/10 border border-destructive/20">
                        <p className="text-sm font-semibold text-destructive flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4" /> Application Rejected
                        </p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {!isApproved && (
                        <Button variant="hero" className="flex-1 rounded-xl gap-2" onClick={() => handleApprove(selectedInquiry)}>
                          <CheckCircle className="w-4 h-4" /> Approve
                        </Button>
                      )}
                      {isApproved && !hasViewing && (
                        <Button variant="outline" className="flex-1 rounded-xl gap-2 border-border" onClick={() => setShowScheduleDialog(true)}>
                          <Eye className="w-4 h-4" /> Schedule Viewing
                        </Button>
                      )}
                      {isApproved && hasViewing && (
                        <div className="flex-1 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
                          <p className="text-sm font-semibold text-emerald-800 flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" /> Viewing on {new Date(action.viewing!.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} at {action.viewing!.time}
                          </p>
                        </div>
                      )}
                      {!isApproved && (
                        <Button variant="destructive" className="rounded-xl gap-2" onClick={() => handleReject(selectedInquiry)}>
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                      )}
                      {isApproved && !hasViewing && (
                        <Button variant="destructive" className="rounded-xl gap-2" onClick={() => handleReject(selectedInquiry)}>
                          <XCircle className="w-4 h-4" /> Reject
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Viewing Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Schedule Viewing
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {selectedInquiry && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {selectedInquiry.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedInquiry.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedInquiry.propertyApplied}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <Input
                type="date"
                value={viewingDate}
                onChange={(e) => setViewingDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <Input
                type="time"
                value={viewingTime}
                onChange={(e) => setViewingTime(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1 rounded-xl gap-2"
                onClick={handleScheduleViewing}
                disabled={!viewingDate || !viewingTime}
              >
                <Calendar className="w-4 h-4" /> Confirm Viewing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgencyDashboard;
