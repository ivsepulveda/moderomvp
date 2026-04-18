import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Building2, MapPin, Euro, Users, Eye, X, Calendar, User, Phone,
  Mail, TrendingUp, ChevronRight, Shield, Clock, ArrowUpRight, Home,
  DollarSign, FileText, Pencil, Save, XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ListingDetail {
  id: number;
  address: string;
  city: string;
  country: string;
  price: string;
  priceNum: number;
  deposit: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  idealistaId: string;
  status: "active" | "paused" | "leased";
  publishedDate: string;
  responsibleAgent: string;
  agentEmail: string;
  landlordName: string;
  landlordPhone: string;
  landlordEmail: string;
  inquiries: number;
  preScreened: number;
  qualified: number;
  viewingsScheduled: number;
  leaseSigned: number;
  avgDaysToLease: number;
  vacancyCostSaved: string;
  roi: string;
}

const initialListings: ListingDetail[] = [
  {
    id: 1, address: "Calle Gran Vía 42, 3B", city: "Madrid", country: "Spain",
    price: "€2,200/mo", priceNum: 2200, deposit: "€4,400 (2 months)", bedrooms: 3, bathrooms: 2, sqm: 110,
    idealistaId: "IDL-38291045", status: "active", publishedDate: "2026-03-01",
    responsibleAgent: "María García", agentEmail: "maria@premierrentals.es",
    landlordName: "Eduardo Fernández", landlordPhone: "+34 611 222 333", landlordEmail: "eduardo@propietarios.es",
    inquiries: 13, preScreened: 10, qualified: 8, viewingsScheduled: 4, leaseSigned: 0,
    avgDaysToLease: 0, vacancyCostSaved: "€2,640", roi: "320%",
  },
  {
    id: 2, address: "Calle Serrano 12, 5A", city: "Madrid", country: "Spain",
    price: "€3,100/mo", priceNum: 3100, deposit: "€6,200 (2 months)", bedrooms: 4, bathrooms: 2, sqm: 145,
    idealistaId: "IDL-49172836", status: "active", publishedDate: "2026-02-15",
    responsibleAgent: "Carlos Ruiz", agentEmail: "carlos@premierrentals.es",
    landlordName: "Isabel Martínez", landlordPhone: "+34 622 333 444", landlordEmail: "isabel@inversiones.es",
    inquiries: 18, preScreened: 14, qualified: 11, viewingsScheduled: 6, leaseSigned: 0,
    avgDaysToLease: 0, vacancyCostSaved: "€4,960", roi: "410%",
  },
  {
    id: 3, address: "Rua Augusta 15, 2D", city: "Lisbon", country: "Portugal",
    price: "€1,100/mo", priceNum: 1100, deposit: "€2,200 (2 months)", bedrooms: 1, bathrooms: 1, sqm: 55,
    idealistaId: "IDL-57283910", status: "active", publishedDate: "2026-03-10",
    responsibleAgent: "Ana Santos", agentEmail: "ana@premierrentals.es",
    landlordName: "Miguel Costa", landlordPhone: "+351 912 345 678", landlordEmail: "miguel@propriedades.pt",
    inquiries: 15, preScreened: 11, qualified: 7, viewingsScheduled: 5, leaseSigned: 1,
    avgDaysToLease: 22, vacancyCostSaved: "€1,320", roi: "280%",
  },
  {
    id: 4, address: "Av. Liberdade 100, 1E", city: "Lisbon", country: "Portugal",
    price: "€1,800/mo", priceNum: 1800, deposit: "€3,600 (2 months)", bedrooms: 2, bathrooms: 1, sqm: 85,
    idealistaId: "IDL-61048273", status: "active", publishedDate: "2026-03-20",
    responsibleAgent: "Ana Santos", agentEmail: "ana@premierrentals.es",
    landlordName: "Sofia Almeida", landlordPhone: "+351 923 456 789", landlordEmail: "sofia@investimentos.pt",
    inquiries: 6, preScreened: 5, qualified: 4, viewingsScheduled: 2, leaseSigned: 0,
    avgDaysToLease: 0, vacancyCostSaved: "€1,080", roi: "190%",
  },
  {
    id: 5, address: "Via Roma 88, Int 4", city: "Rome", country: "Italy",
    price: "€1,400/mo", priceNum: 1400, deposit: "€4,200 (3 months)", bedrooms: 2, bathrooms: 1, sqm: 75,
    idealistaId: "IDL-73920184", status: "paused", publishedDate: "2026-01-20",
    responsibleAgent: "María García", agentEmail: "maria@premierrentals.es",
    landlordName: "Giovanni Bianchi", landlordPhone: "+39 333 456 789", landlordEmail: "giovanni@immobili.it",
    inquiries: 3, preScreened: 2, qualified: 1, viewingsScheduled: 0, leaseSigned: 0,
    avgDaysToLease: 0, vacancyCostSaved: "€420", roi: "85%",
  },
  {
    id: 6, address: "Calle Alcalá 90, 2A", city: "Madrid", country: "Spain",
    price: "€1,600/mo", priceNum: 1600, deposit: "€3,200 (2 months)", bedrooms: 3, bathrooms: 1, sqm: 95,
    idealistaId: "IDL-84019372", status: "leased", publishedDate: "2025-12-01",
    responsibleAgent: "Carlos Ruiz", agentEmail: "carlos@premierrentals.es",
    landlordName: "Alejandro López", landlordPhone: "+34 633 444 555", landlordEmail: "alejandro@viviendas.es",
    inquiries: 21, preScreened: 16, qualified: 12, viewingsScheduled: 8, leaseSigned: 1,
    avgDaysToLease: 18, vacancyCostSaved: "€3,840", roi: "520%",
  },
];

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  leased: "bg-blue-100 text-blue-800 border-blue-200",
};

const Listings = () => {
  const [listings, setListings] = useState<ListingDetail[]>(initialListings);
  const [selected, setSelected] = useState<ListingDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ListingDetail>>({});

  const startEditing = () => {
    if (!selected) return;
    setEditForm({ ...selected });
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setEditForm({});
  };

  const saveEditing = () => {
    if (!selected || !editForm) return;
    const priceNum = editForm.priceNum ?? selected.priceNum;
    const updated: ListingDetail = {
      ...selected,
      ...editForm,
      priceNum,
      price: `€${priceNum.toLocaleString()}/mo`,
    };
    setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setSelected(updated);
    setEditing(false);
    setEditForm({});
    toast.success("Listing updated successfully");
  };

  const updateField = (field: keyof ListingDetail, value: string | number) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Listings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your properties and inquiry gates</p>
      </div>

      <div className="grid gap-4">
        {listings.map((listing) => (
          <Card
            key={listing.id}
            className="shadow-card hover:shadow-card-hover transition-all border-border cursor-pointer group"
            onClick={() => { setSelected(listing); setEditing(false); }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{listing.address}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.city}</span>
                      <span className="flex items-center gap-1"><Euro className="w-3 h-3" /> {listing.price}</span>
                      <span>{listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""} · {listing.bathrooms} bath</span>
                      <span className="text-muted-foreground/60">{listing.idealistaId}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                      <Eye className="w-4 h-4 text-muted-foreground" /> {listing.inquiries}
                    </div>
                    <p className="text-xs text-muted-foreground">Inquiries</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                      <Users className="w-4 h-4" /> {listing.qualified}
                    </div>
                    <p className="text-xs text-muted-foreground">Qualified</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600">
                      <TrendingUp className="w-4 h-4" /> {listing.roi}
                    </div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                  </div>
                  <Badge variant="outline" className={`text-xs capitalize ${statusStyles[listing.status]}`}>
                    {listing.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setSelected(null); setEditing(false); }}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-orange">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{editing ? (editForm.address ?? selected.address) : selected.address}</CardTitle>
                    <p className="text-sm text-muted-foreground">{editing ? `${editForm.city ?? selected.city}, ${editForm.country ?? selected.country}` : `${selected.city}, ${selected.country}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!editing ? (
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" onClick={startEditing}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs" onClick={cancelEditing}>
                        <XCircle className="w-3.5 h-3.5" /> Cancel
                      </Button>
                      <Button variant="hero" size="sm" className="rounded-xl gap-1.5 text-xs" onClick={saveEditing}>
                        <Save className="w-3.5 h-3.5" /> Save
                      </Button>
                    </>
                  )}
                  <Badge variant="outline" className={`text-xs capitalize ${statusStyles[selected.status]}`}>
                    {selected.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => { setSelected(null); setEditing(false); }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Info */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Property Details</h4>
                {editing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Address</Label>
                      <Input value={editForm.address ?? ""} onChange={(e) => updateField("address", e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">City</Label>
                      <Input value={editForm.city ?? ""} onChange={(e) => updateField("city", e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Country</Label>
                      <Input value={editForm.country ?? ""} onChange={(e) => updateField("country", e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Monthly Rent (€)</Label>
                      <Input type="number" value={editForm.priceNum ?? ""} onChange={(e) => updateField("priceNum", Number(e.target.value))} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Deposit</Label>
                      <Input value={editForm.deposit ?? ""} onChange={(e) => updateField("deposit", e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Bedrooms</Label>
                      <Input type="number" value={editForm.bedrooms ?? ""} onChange={(e) => updateField("bedrooms", Number(e.target.value))} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Bathrooms</Label>
                      <Input type="number" value={editForm.bathrooms ?? ""} onChange={(e) => updateField("bathrooms", Number(e.target.value))} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Size (m²)</Label>
                      <Input type="number" value={editForm.sqm ?? ""} onChange={(e) => updateField("sqm", Number(e.target.value))} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Idealista ID</Label>
                      <Input value={editForm.idealistaId ?? ""} onChange={(e) => updateField("idealistaId", e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Status</Label>
                      <Select value={editForm.status ?? selected.status} onValueChange={(v) => updateField("status", v)}>
                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="leased">Leased</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Monthly Rent", value: selected.price, icon: Euro },
                      { label: "Deposit", value: selected.deposit, icon: DollarSign },
                      { label: "Bedrooms", value: `${selected.bedrooms}`, icon: Home },
                      { label: "Bathrooms", value: `${selected.bathrooms}`, icon: Home },
                      { label: "Size", value: `${selected.sqm} m²`, icon: Building2 },
                      { label: "Idealista ID", value: selected.idealistaId, icon: FileText },
                      { label: "Published", value: new Date(selected.publishedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }), icon: Calendar },
                      { label: "Days Listed", value: `${Math.floor((Date.now() - new Date(selected.publishedDate).getTime()) / 86400000)}`, icon: Clock },
                    ].map((item) => (
                      <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                        <p className="text-sm font-medium text-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Responsible Agent */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Responsible Agent</h4>
                {editing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Agent Name</Label>
                      <Input value={editForm.responsibleAgent ?? ""} onChange={(e) => updateField("responsibleAgent", e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Agent Email</Label>
                      <Input value={editForm.agentEmail ?? ""} onChange={(e) => updateField("agentEmail", e.target.value)} className="rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                      {selected.responsibleAgent.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{selected.responsibleAgent}</p>
                      <p className="text-xs text-muted-foreground">{selected.agentEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Landlord Info */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Landlord</h4>
                {editing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Name</Label>
                      <Input value={editForm.landlordName ?? ""} onChange={(e) => updateField("landlordName", e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone</Label>
                      <Input value={editForm.landlordPhone ?? ""} onChange={(e) => updateField("landlordPhone", e.target.value)} className="rounded-lg" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input value={editForm.landlordEmail ?? ""} onChange={(e) => updateField("landlordEmail", e.target.value)} className="rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/30 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selected.landlordName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selected.landlordPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selected.landlordEmail}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Inquiry Funnel */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Inquiry Funnel</h4>
                <div className="space-y-2.5">
                  {[
                    { stage: "Total Inquiries", count: selected.inquiries, pct: 100 },
                    { stage: "Pre-Screened", count: selected.preScreened, pct: selected.inquiries ? Math.round((selected.preScreened / selected.inquiries) * 100) : 0 },
                    { stage: "Qualified", count: selected.qualified, pct: selected.inquiries ? Math.round((selected.qualified / selected.inquiries) * 100) : 0 },
                    { stage: "Viewing Scheduled", count: selected.viewingsScheduled, pct: selected.inquiries ? Math.round((selected.viewingsScheduled / selected.inquiries) * 100) : 0 },
                    { stage: "Lease Signed", count: selected.leaseSigned, pct: selected.inquiries ? Math.round((selected.leaseSigned / selected.inquiries) * 100) : 0 },
                  ].map((s) => (
                    <div key={s.stage} className="space-y-1">
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
              </div>

              {/* ROI Stats */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">ROI & Performance</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-primary">{selected.roi}</p>
                    <p className="text-xs text-muted-foreground mt-1">Screening ROI</p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-emerald-600">{selected.vacancyCostSaved}</p>
                    <p className="text-xs text-muted-foreground mt-1">Vacancy Cost Saved</p>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-blue-600">{selected.avgDaysToLease || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg. Days to Lease</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Listings;
