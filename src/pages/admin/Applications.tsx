import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CheckCircle, XCircle, Clock, Globe, Mail, Building2, BarChart3,
  ExternalLink, AlertTriangle, GripVertical
} from "lucide-react";

interface Application {
  id: number;
  name: string;
  email: string;
  website: string;
  idealista: string;
  listings: string;
  inquiries: string;
  years: string;
  associations: string;
  pitch: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  flags: string[];
}

const MOCK_APPS: Application[] = [
  {
    id: 1, name: "Barcelona Prime Rentals", email: "info@bcnprime.es", website: "https://bcnprime.es",
    idealista: "https://idealista.com/pro/bcnprime", listings: "25-50", inquiries: "50-100", years: "5-10",
    associations: "CEPI", pitch: "We handle 40+ rentals/month and lose too much time on unqualified leads. Modero's automated pre-screening would let us focus on serious tenants.", status: "pending", date: "2 hours ago",
    flags: [],
  },
  {
    id: 2, name: "Lisboa Casa Agency", email: "hello@lisboaacasa.pt", website: "https://lisboaacasa.pt",
    idealista: "https://idealista.com/pro/lisboaacasa", listings: "50-100", inquiries: "100-200", years: "10+",
    associations: "APEMIP, GIPE", pitch: "As one of Lisbon's largest rental agencies, digital tenant verification is critical for our landlord relationships. We want to be early adopters of Modero.", status: "pending", date: "5 hours ago",
    flags: [],
  },
  {
    id: 3, name: "Roma Living Srl", email: "contact@romaliving.it", website: "https://romaliving.it",
    idealista: "", listings: "10-25", inquiries: "20-50", years: "3-5",
    associations: "FIAIP", pitch: "The Italian rental market desperately needs better tenant screening. We've been looking for a solution like Modero for years and are ready to commit fully.", status: "pending", date: "1 day ago",
    flags: [],
  },
  {
    id: 4, name: "Solo Rentals Guy", email: "juan.garcia@gmail.com", website: "",
    idealista: "", listings: "<10", inquiries: "<20", years: "<1",
    associations: "", pitch: "I want to try this for my listings.", status: "pending", date: "1 day ago",
    flags: ["Personal email", "No website", "Low listings (<10)"],
  },
  {
    id: 5, name: "Madrid Select Homes", email: "admin@madridselect.es", website: "https://madridselect.es",
    idealista: "https://idealista.com/pro/madridselect", listings: "100+", inquiries: "200+", years: "10+",
    associations: "CEPI, GIPE", pitch: "We manage 150+ rental units across Madrid. Our landlords demand pre-qualified tenants and we currently do this manually. Modero would transform our operations.", status: "approved", date: "2 days ago",
    flags: [],
  },
  {
    id: 6, name: "Porto Rental Co", email: "geral@portorental.pt", website: "https://portorental.pt",
    idealista: "", listings: "<10", inquiries: "<20", years: "1-3",
    associations: "", pitch: "Small but growing agency in Porto.", status: "rejected", date: "3 days ago",
    flags: ["Low listings (<10)"],
  },
];

const columns: { key: Application["status"]; label: string; icon: React.ElementType; color: string }[] = [
  { key: "pending", label: "Pending Review", icon: Clock, color: "text-yellow-600" },
  { key: "approved", label: "Approved", icon: CheckCircle, color: "text-green-600" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-destructive" },
];

const Applications = () => {
  const [apps, setApps] = useState<Application[]>(MOCK_APPS);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const updateStatus = (id: number, status: Application["status"]) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    setSelectedApp(null);
    setShowRejectDialog(false);
    setRejectReason("");
  };

  const getApps = (status: Application["status"]) => apps.filter((a) => a.status === status);

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Agency Applications</h2>
        <p className="text-muted-foreground text-sm mt-1">Review and manage incoming agency applications</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const Icon = col.icon;
          const colApps = getApps(col.key);
          return (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Icon className={`w-5 h-5 ${col.color}`} />
                <h3 className="font-semibold text-foreground">{col.label}</h3>
                <Badge variant="secondary" className="ml-auto text-xs">{colApps.length}</Badge>
              </div>
              <div className="space-y-3 min-h-[200px] bg-secondary/30 rounded-2xl p-3">
                {colApps.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No applications</p>
                )}
                {colApps.map((app) => (
                  <Card
                    key={app.id}
                    className="shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer border-border group"
                    onClick={() => setSelectedApp(app)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-foreground text-sm truncate">{app.name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">{app.email}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{app.listings} listings</span>
                            <span className="text-xs text-muted-foreground">{app.date}</span>
                          </div>
                          {app.flags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <AlertTriangle className="w-3 h-3 text-destructive flex-shrink-0" />
                              <span className="text-xs text-destructive truncate">{app.flags.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApp && !showRejectDialog} onOpenChange={() => setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
                  {selectedApp.name.charAt(0)}
                </div>
                {selectedApp.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" /> {selectedApp.email}
                </div>
                {selectedApp.website && (
                  <a href={selectedApp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Globe className="w-4 h-4" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedApp.idealista && (
                  <a href={selectedApp.idealista} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline col-span-2">
                    <ExternalLink className="w-4 h-4" /> Idealista Profile
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Listings", value: selectedApp.listings, icon: Building2 },
                  { label: "Inquiries/mo", value: selectedApp.inquiries, icon: BarChart3 },
                  { label: "Years", value: selectedApp.years, icon: Clock },
                ].map((s) => (
                  <div key={s.label} className="bg-secondary rounded-xl p-3 text-center">
                    <s.icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <p className="text-sm font-semibold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {selectedApp.associations && (
                <div>
                  <Label className="text-xs text-muted-foreground">Associations</Label>
                  <p className="text-sm text-foreground mt-0.5">{selectedApp.associations}</p>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Why they're serious</Label>
                <p className="text-sm text-foreground mt-0.5 leading-relaxed">{selectedApp.pitch}</p>
              </div>

              {selectedApp.flags.length > 0 && (
                <div className="bg-destructive/10 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Flags
                  </p>
                  {selectedApp.flags.map((f) => (
                    <p key={f} className="text-xs text-destructive">• {f}</p>
                  ))}
                </div>
              )}
            </div>

            {selectedApp.status === "pending" && (
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(true);
                  }}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button variant="hero" onClick={() => updateStatus(selectedApp.id, "approved")}>
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={() => setShowRejectDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="reason">Why is this application being rejected?</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Fewer than 10 active listings, personal email address..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => selectedApp && updateStatus(selectedApp.id, "rejected")}
              disabled={!rejectReason}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
