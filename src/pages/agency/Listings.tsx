import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Euro, Users, Eye } from "lucide-react";

const listings = [
  { id: 1, address: "Calle Gran Vía 42, 3B", city: "Madrid", price: "€1,200/mo", bedrooms: 2, inquiries: 8, qualified: 5, status: "active" },
  { id: 2, address: "Calle Serrano 12, 5A", city: "Madrid", price: "€2,100/mo", bedrooms: 3, inquiries: 12, qualified: 9, status: "active" },
  { id: 3, address: "Rua Augusta 15, 2D", city: "Lisbon", price: "€950/mo", bedrooms: 1, inquiries: 15, qualified: 7, status: "active" },
  { id: 4, address: "Av. Liberdade 100, 1E", city: "Lisbon", price: "€1,800/mo", bedrooms: 2, inquiries: 6, qualified: 4, status: "active" },
  { id: 5, address: "Via Roma 88, Int 4", city: "Rome", price: "€1,400/mo", bedrooms: 2, inquiries: 3, qualified: 1, status: "paused" },
  { id: 6, address: "Calle Alcalá 90, 2A", city: "Madrid", price: "€1,600/mo", bedrooms: 3, inquiries: 0, qualified: 0, status: "leased" },
];

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  leased: "bg-blue-100 text-blue-800 border-blue-200",
};

const Listings = () => {
  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Listings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your properties and inquiry gates</p>
      </div>

      <div className="grid gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="shadow-card hover:shadow-card-hover transition-all border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{listing.address}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {listing.city}</span>
                      <span className="flex items-center gap-1"><Euro className="w-3 h-3" /> {listing.price}</span>
                      <span>{listing.bedrooms} bed{listing.bedrooms > 1 ? "s" : ""}</span>
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
                  <Badge variant="outline" className={`text-xs capitalize ${statusStyles[listing.status]}`}>
                    {listing.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Listings;
