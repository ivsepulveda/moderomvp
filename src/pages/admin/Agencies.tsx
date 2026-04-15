import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Globe, ExternalLink, Building2, Loader2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ApprovedAgency {
  id: string;
  agency_name: string;
  email: string;
  website: string | null;
  idealista_profile: string | null;
  active_listings: string | null;
  years_operating: string | null;
  created_at: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

const Agencies = () => {
  const [agencies, setAgencies] = useState<ApprovedAgency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Failed to load agencies");
        console.error(error);
      } else {
        setAgencies((data as ApprovedAgency[]) || []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Approved Agencies</h2>
        <p className="text-muted-foreground text-sm mt-1">All agencies currently active on the Modero network</p>
      </div>

      {agencies.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No approved agencies yet</p>
      ) : (
        <div className="grid gap-4">
          {agencies.map((agency) => (
            <Card key={agency.id} className="shadow-card hover:shadow-card-hover transition-all border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-orange">
                      {agency.agency_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{agency.agency_name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {agency.email}</span>
                        {agency.website && (
                          <a href={agency.website.startsWith("http") ? agency.website : `https://${agency.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            <Globe className="w-3 h-3" /> Website <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> {agency.active_listings || "—"} listings
                    </span>
                    {agency.years_operating && (
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {agency.years_operating} yrs
                      </span>
                    )}
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                    <span className="text-xs text-muted-foreground">Joined {formatDate(agency.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agencies;
