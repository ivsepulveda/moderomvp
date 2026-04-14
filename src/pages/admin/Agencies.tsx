import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Mail, MapPin, ExternalLink } from "lucide-react";

const agencies = [
  { id: 1, name: "Madrid Select Homes", email: "admin@madridselect.es", website: "madridselect.es", city: "Madrid", country: "Spain", listings: "100+", status: "active", joined: "Mar 2026" },
  { id: 2, name: "Costa Sol Properties", email: "info@costasol.es", website: "costasol.es", city: "Málaga", country: "Spain", listings: "50-100", status: "active", joined: "Mar 2026" },
  { id: 3, name: "Alfama Homes", email: "geral@alfahomes.pt", website: "alfahomes.pt", city: "Lisbon", country: "Portugal", listings: "25-50", status: "active", joined: "Feb 2026" },
];

const Agencies = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Approved Agencies</h2>
        <p className="text-muted-foreground text-sm mt-1">All agencies currently active on the Modero network</p>
      </div>

      <div className="grid gap-4">
        {agencies.map((agency) => (
          <Card key={agency.id} className="shadow-card hover:shadow-card-hover transition-all border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-orange">
                    {agency.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{agency.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {agency.email}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {agency.city}, {agency.country}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{agency.listings} listings</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 capitalize">{agency.status}</Badge>
                  <span className="text-xs text-muted-foreground">Joined {agency.joined}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Agencies;
