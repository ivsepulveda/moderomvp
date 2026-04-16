import { useState } from "react";
import { Building2, Users, TrendingUp, Clock, Shield, ArrowUpRight, ChevronDown, ChevronRight, CheckCircle, XCircle, Eye, X, Briefcase, Mail, Phone, FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  { label: "Active Listings", value: "34", icon: Building2, change: "+2 this week", trend: "up" },
  { label: "Tenant Inquiries", value: "67", icon: Users, change: "+12 this week", trend: "up" },
  { label: "Pre-Qualified", value: "41", icon: Shield, change: "61% rate", trend: "up" },
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
  avatar?: string;
  income: string;
  employer: string;
  jobTitle: string;
  linkedinVerified: boolean;
  idVerified: boolean;
  documentsComplete: boolean;
  contractType: string;
}

interface Listing {
  id: number;
  title: string;
  address: string;
  rent: string;
  inquiries: TenantInquiry[];
}

const listings: Listing[] = [
  {
    id: 1,
    title: "Luxury Apartment",
    address: "Calle Gran Vía 42, 3B, Madrid",
    rent: "€2,200/mo",
    inquiries: [
      { id: 1, name: "Carlos Mendez", email: "carlos@mendez.es", phone: "+34 612 345 678", score: 8.5, status: "qualified", time: "10 min ago", income: "€3,200/mo", employer: "Accenture Spain", jobTitle: "Senior Consultant", linkedinVerified: true, idVerified: true, documentsComplete: true, contractType: "Indefinido" },
      { id: 3, name: "Marco Rossi", email: "marco@gmail.com", phone: "+39 333 456 789", score: 3.1, status: "flagged", time: "1 hour ago", income: "Not verified", employer: "Unknown", jobTitle: "N/A", linkedinVerified: false, idVerified: false, documentsComplete: false, contractType: "N/A" },
    ],
  },
  {
    id: 2,
    title: "Modern Studio",
    address: "Calle Serrano 12, 5A, Madrid",
    rent: "€1,400/mo",
    inquiries: [
      { id: 4, name: "Sophie Laurent", email: "sophie@laurent.fr", phone: "+33 6 12 34 56 78", score: 9.1, status: "qualified", time: "2 hours ago", avatar: "", income: "€4,800/mo", employer: "L'Oréal", jobTitle: "Marketing Director", linkedinVerified: true, idVerified: true, documentsComplete: true, contractType: "CDI" },
    ],
  },
  {
    id: 3,
    title: "Cozy 2-Bedroom",
    address: "Rua Augusta 15, 2D, Lisbon",
    rent: "€1,100/mo",
    inquiries: [
      { id: 2, name: "Ana Ferreira", email: "ana@ferreira.pt", phone: "+351 912 345 678", score: 6.2, status: "review", time: "25 min ago", income: "€2,100/mo", employer: "Freelance", jobTitle: "Graphic Designer", linkedinVerified: false, idVerified: true, documentsComplete: false, contractType: "Freelance" },
      { id: 5, name: "João Silva", email: "joao@silva.pt", phone: "+351 923 456 789", score: 7.4, status: "qualified", time: "3 hours ago", income: "€2,900/mo", employer: "Deloitte Portugal", jobTitle: "Auditor", linkedinVerified: true, idVerified: true, documentsComplete: true, contractType: "Sem Termo" },
    ],
  },
];

const statusStyles: Record<string, string> = {
  qualified: "bg-green-100 text-green-800 border-green-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  flagged: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-gray-100 text-gray-800 border-gray-200",
};

const AgencyDashboard = () => {
  const { profile } = useAuth();
  const [expandedListings, setExpandedListings] = useState<number[]>([1]);
  const [selectedInquiry, setSelectedInquiry] = useState<TenantInquiry | null>(null);

  const toggleListing = (id: number) => {
    setExpandedListings((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back{profile?.agency_name ? `, ${profile.agency_name}` : ""}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Your tenant intelligence overview</p>
      </div>

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
              {/* Listing Header */}
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
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Inquiries List */}
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
                          {inquiry.avatar ? (
                            <AvatarImage src={inquiry.avatar} alt={inquiry.name} />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {inquiry.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{inquiry.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{inquiry.employer} · {inquiry.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            <span className="text-sm font-bold text-foreground">{inquiry.score}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Trust Score</p>
                        </div>
                        <Badge variant="outline" className={`text-xs capitalize ${statusStyles[inquiry.status]}`}>
                          {inquiry.status}
                        </Badge>
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

      {/* Revenue & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Revenue Saved for Landlords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-primary">€12,450</p>
                <p className="text-sm text-muted-foreground mt-1">Total vacancy cost prevented this month</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Avg. Days Saved", value: "18" },
                  { label: "Bad Tenants Blocked", value: "9" },
                  { label: "Landlord NPS", value: "92" },
                ].map((m) => (
                  <div key={m.label} className="bg-secondary rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
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

      {/* Tenant Profile Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInquiry(null)}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    {selectedInquiry.avatar ? (
                      <AvatarImage src={selectedInquiry.avatar} alt={selectedInquiry.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {selectedInquiry.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedInquiry.name}</CardTitle>
                    <Badge variant="outline" className={`text-xs capitalize mt-1 ${statusStyles[selectedInquiry.status]}`}>
                      {selectedInquiry.status}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedInquiry(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Trust Score */}
              <div className="flex items-center justify-center gap-2 py-3 bg-primary/5 rounded-xl">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-3xl font-black text-primary">{selectedInquiry.score}</span>
                <span className="text-sm text-muted-foreground">/ 10 Trust Score</span>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Contact</h4>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedInquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedInquiry.phone}</span>
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Employment</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Employer</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.employer}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Job Title</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.jobTitle}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.income}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Contract Type</p>
                    <p className="text-sm font-medium text-foreground">{selectedInquiry.contractType}</p>
                  </div>
                </div>
              </div>

              {/* Verifications */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Verifications</h4>
                <div className="space-y-1.5">
                  {[
                    { label: "LinkedIn Verified", ok: selectedInquiry.linkedinVerified },
                    { label: "ID Verified", ok: selectedInquiry.idVerified },
                    { label: "Documents Complete", ok: selectedInquiry.documentsComplete },
                  ].map((v) => (
                    <div key={v.label} className="flex items-center gap-2 text-sm">
                      {v.ok ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                      <span className={v.ok ? "text-foreground" : "text-destructive"}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="hero" className="flex-1 rounded-xl gap-2" onClick={() => { setSelectedInquiry(null); }}>
                  <CheckCircle className="w-4 h-4" /> Approve
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => { setSelectedInquiry(null); }}>
                  <Eye className="w-4 h-4" /> Schedule Viewing
                </Button>
                <Button variant="destructive" className="rounded-xl gap-2" onClick={() => { setSelectedInquiry(null); }}>
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AgencyDashboard;
