import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ModeroLogo from "@/components/ModeroLogo";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
  FileCheck2,
  Building2,
  Lock as LockIcon,
  CheckCircle2,
  Star,
  Zap,
} from "lucide-react";

const TenantAuth = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(searchParams.get("name") || "");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const agencyName = searchParams.get("agency");
  const propertyTitle = searchParams.get("property");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
            data: {
              full_name: fullName,
              user_type: "tenant",
            },
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description:
            "We've sent you a verification link. Please confirm your email to continue your qualification.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/onboarding");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Zap,
      title: "Skip the queue",
      desc: "Pre-qualified tenants get viewing slots before unverified applicants.",
    },
    {
      icon: ShieldCheck,
      title: "Verified once, reused everywhere",
      desc: "Your Modero profile works across every agency in our network.",
    },
    {
      icon: Clock,
      title: "Under 3 minutes",
      desc: "Guided steps. Auto-fill from LinkedIn. No paperwork upload marathons.",
    },
    {
      icon: LockIcon,
      title: "You stay in control",
      desc: "Bank-grade encryption. You decide which agencies see your file.",
    },
  ];

  const steps = [
    { n: "01", title: "Create account", desc: "Email + password. 30 seconds." },
    { n: "02", title: "Verify identity", desc: "ID, income & employment in-app." },
    { n: "03", title: "Get your Trust Score", desc: "Share with any Modero agency instantly." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <ModeroLogo size="md" />
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Already qualified?
            </span>
            <button
              onClick={() => setIsSignUp(false)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-16 grid lg:grid-cols-5 gap-12">
        {/* Left: Pitch */}
        <div className="lg:col-span-3 space-y-10">
          {(agencyName || propertyTitle) && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {agencyName ? `Invited by ${agencyName}` : "Application invitation"}
                {propertyTitle && <span className="text-muted-foreground"> · {propertyTitle}</span>}
              </span>
            </div>
          )}

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Tenant Qualification</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
              Get pre-qualified once.
              <br />
              <span className="text-primary">Rent faster, everywhere.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Modero is the trust layer for rental agencies in Spain, Portugal and Italy.
              Build a verified tenant profile in minutes — and unlock priority access to listings
              from every agency in our network.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 py-6 border-y border-border/60">
            {[
              { value: "<3 min", label: "Average completion" },
              { value: "87%", label: "Approval rate" },
              { value: "100%", label: "Free for tenants" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl lg:text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="grid sm:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">How it works</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {steps.map((s) => (
                <div key={s.n} className="p-5 rounded-2xl bg-secondary/40 border border-border/40">
                  <div className="text-xs font-mono text-primary mb-2">{s.n}</div>
                  <div className="font-semibold text-foreground">{s.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              GDPR compliant
            </div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary" />
              Bank-grade encryption
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Trusted by leading agencies
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-3xl bg-card border border-border/60 shadow-elegant p-7 lg:p-8 space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-foreground">
                  {isSignUp ? "Start your qualification" : "Welcome back"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isSignUp
                    ? "Create your free tenant account in 30 seconds."
                    : "Sign in to continue your application."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-background border-border/60"
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-background border-border/60"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-background border-border/60"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-12 rounded-xl text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
                  ) : (
                    <>
                      {isSignUp ? "Get qualified — it's free" : "Sign in"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="pt-1 space-y-2">
                  {[
                    "No fees, no commitment",
                    "Reused across every Modero agency",
                    "You control who sees your data",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </form>

              <div className="text-center text-sm text-muted-foreground border-t border-border/50 pt-4">
                {isSignUp ? "Already have an account? " : "New here? "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary font-medium hover:underline"
                >
                  {isSignUp ? "Sign in" : "Create one"}
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/70 text-center mt-4">
              By continuing you agree to Modero's Terms & Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAuth;
