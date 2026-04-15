import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Mail, Globe, Shield } from "lucide-react";

const AgencySettings = () => {
  const { profile } = useAuth();

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your agency profile and preferences</p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Agency Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Agency Name</Label>
            <Input defaultValue={profile?.agency_name || ""} placeholder="Your agency name" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input defaultValue={profile?.email || ""} placeholder="contact@agency.com" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input placeholder="https://youragency.com" className="rounded-xl" />
          </div>
          <Button variant="hero" size="lg" className="rounded-xl">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Pre-Qualification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Minimum Trust Score</Label>
            <Input type="number" defaultValue="6" min="1" max="10" className="rounded-xl max-w-[120px]" />
            <p className="text-xs text-muted-foreground">Tenants below this score will be flagged for manual review</p>
          </div>
          <div className="space-y-2">
            <Label>Minimum Income Multiplier</Label>
            <Input type="number" defaultValue="3" min="1" max="10" step="0.5" className="rounded-xl max-w-[120px]" />
            <p className="text-xs text-muted-foreground">Monthly income must be this multiple of rent</p>
          </div>
          <Button variant="hero" size="lg" className="rounded-xl">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencySettings;
