import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, AlertTriangle, CheckCircle, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const tenants = [
  { id: 1, name: "Carlos Mendez", email: "carlos@email.com", property: "Calle Gran Vía 42, 3B", score: 8.5, status: "qualified", income: "€3,200/mo", idVerified: true, linkedIn: true },
  { id: 2, name: "Sophie Laurent", email: "sophie@email.com", property: "Calle Serrano 12, 5A", score: 9.1, status: "qualified", income: "€4,800/mo", idVerified: true, linkedIn: true },
  { id: 3, name: "João Silva", email: "joao@email.com", property: "Av. Liberdade 100, 1E", score: 7.4, status: "qualified", income: "€2,900/mo", idVerified: true, linkedIn: false },
  { id: 4, name: "Ana Ferreira", email: "ana@email.com", property: "Rua Augusta 15, 2D", score: 6.2, status: "review", income: "€2,100/mo", idVerified: true, linkedIn: false },
  { id: 5, name: "Marco Rossi", email: "marco@email.com", property: "Via Roma 88, Int 4", score: 3.1, status: "flagged", income: "Not verified", idVerified: false, linkedIn: false },
];

const statusStyles: Record<string, string> = {
  qualified: "bg-green-100 text-green-800 border-green-200",
  review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  flagged: "bg-red-100 text-red-800 border-red-200",
};

const Tenants = () => {
  const [search, setSearch] = useState("");
  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.property.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tenant Inquiries</h2>
        <p className="text-muted-foreground text-sm mt-1">Pre-qualified tenant applications for your listings</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tenants or properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((tenant) => (
          <Card key={tenant.id} className="shadow-card hover:shadow-card-hover transition-all border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-orange">
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                    <p className="text-xs text-muted-foreground">{tenant.property}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {tenant.idVerified && (
                        <span className="flex items-center gap-1 text-xs text-green-700">
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
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-lg font-bold text-foreground">{tenant.score}</span>
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
    </div>
  );
};

export default Tenants;
