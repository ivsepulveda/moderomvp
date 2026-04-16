import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Globe, Bell, Users } from "lucide-react";

const AdminSettings = () => {
  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Platform Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Configure global platform preferences</p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input defaultValue="Modero" className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input defaultValue="support@modero.com" placeholder="support@modero.com" className="rounded-xl" />
          </div>
          <Button variant="hero" size="lg" className="rounded-xl">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Agency Onboarding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-approve agencies</Label>
              <p className="text-xs text-muted-foreground">Skip manual review for new agency sign-ups</p>
            </div>
            <Switch />
          </div>
          <div className="space-y-2">
            <Label>Minimum Idealista Listings</Label>
            <Input type="number" defaultValue="10" min="1" className="rounded-xl max-w-[120px]" />
            <p className="text-xs text-muted-foreground">Required listing count for agency qualification</p>
          </div>
        </CardContent>
      </Card>


      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>New agency applications</Label>
              <p className="text-xs text-muted-foreground">Email alert when a new agency applies</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Low trust score alerts</Label>
              <p className="text-xs text-muted-foreground">Notify when a tenant scores below threshold</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
