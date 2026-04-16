import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Building2, Mail, Calendar, MessageSquare, Zap, Shield, ExternalLink, Check, X } from "lucide-react";
import { toast } from "sonner";

interface ConnectionItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  account?: string;
}

const AgencySettings = () => {
  const { profile } = useAuth();

  const [zapierWebhook, setZapierWebhook] = useState("");

  const [emailConnections] = useState<ConnectionItem[]>([
    { id: "gmail", name: "Gmail", description: "Connect your business Gmail account", icon: <Mail className="w-5 h-5 text-red-500" />, connected: false },
    { id: "outlook", name: "Outlook", description: "Connect your Outlook email", icon: <Mail className="w-5 h-5 text-blue-500" />, connected: false },
  ]);

  const [calendarConnections] = useState<ConnectionItem[]>([
    { id: "google-calendar", name: "Google Calendar", description: "Sync viewings with Google Calendar", icon: <Calendar className="w-5 h-5 text-green-500" />, connected: false },
    { id: "outlook-calendar", name: "Outlook Calendar", description: "Sync viewings with Outlook Calendar", icon: <Calendar className="w-5 h-5 text-blue-500" />, connected: false },
  ]);

  const handleConnect = (service: string) => {
    toast.info(`${service} integration coming soon`);
  };

  const handleSaveZapier = () => {
    if (!zapierWebhook) {
      toast.error("Please enter your Zapier webhook URL");
      return;
    }
    toast.success("Zapier webhook saved successfully");
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage your agency profile, connections, and qualification rules</p>
      </div>

      {/* Agency Profile */}
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

      {/* Email Connections */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Email
          </CardTitle>
          <p className="text-xs text-muted-foreground">Connect your business email to send and receive tenant communications</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {emailConnections.map((conn) => (
            <div key={conn.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                {conn.icon}
                <div>
                  <p className="text-sm font-medium text-foreground">{conn.name}</p>
                  <p className="text-xs text-muted-foreground">{conn.description}</p>
                </div>
              </div>
              {conn.connected ? (
                <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                  <Check className="w-3 h-3" /> Connected
                </Badge>
              ) : (
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleConnect(conn.name)}>
                  Connect
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Calendar Connections */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Calendar
          </CardTitle>
          <p className="text-xs text-muted-foreground">Sync property viewings and tenant meetings with your calendar</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {calendarConnections.map((conn) => (
            <div key={conn.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                {conn.icon}
                <div>
                  <p className="text-sm font-medium text-foreground">{conn.name}</p>
                  <p className="text-xs text-muted-foreground">{conn.description}</p>
                </div>
              </div>
              {conn.connected ? (
                <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
                  <Check className="w-3 h-3" /> Connected
                </Badge>
              ) : (
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleConnect(conn.name)}>
                  Connect
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* WhatsApp Business */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> WhatsApp Business
          </CardTitle>
          <p className="text-xs text-muted-foreground">Send viewing confirmations and tenant updates via WhatsApp</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-foreground">WhatsApp Business API</p>
                <p className="text-xs text-muted-foreground">Connect your WhatsApp Business account</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleConnect("WhatsApp Business")}>
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zapier */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> Zapier Integrations
          </CardTitle>
          <p className="text-xs text-muted-foreground">Automate workflows by connecting Modero to 5,000+ apps via Zapier</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Zapier Webhook URL</Label>
            <Input
              value={zapierWebhook}
              onChange={(e) => setZapierWebhook(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Create a Zap with a Webhook trigger, then paste the URL here.{" "}
              <a href="https://zapier.com/app/zaps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Open Zapier <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
          <Button variant="hero" size="lg" className="rounded-xl" onClick={handleSaveZapier}>
            Save Webhook
          </Button>
        </CardContent>
      </Card>

      {/* Pre-Qualification Settings (Trust Score) */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Pre-Qualification Rules
          </CardTitle>
          <p className="text-xs text-muted-foreground">Set the thresholds used to evaluate tenant applications for your agency</p>
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
            <p className="text-xs text-muted-foreground">Monthly income must be this multiple of rent (e.g. 3× means €3,000 income for €1,000 rent)</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-reject below threshold</Label>
              <p className="text-xs text-muted-foreground">Automatically reject tenants who score below the minimum</p>
            </div>
            <Switch />
          </div>
          <Button variant="hero" size="lg" className="rounded-xl">
            Save Rules
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencySettings;
