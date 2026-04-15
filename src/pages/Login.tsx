import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ModeroLogo from "@/components/ModeroLogo";
import { Mail, Lock, ArrowRight, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/admin");
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

  return (
    <div className="min-h-screen flex gradient-hero">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-12 space-y-6">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-orange">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Control Room</h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto">
            Manage your agency network, review applications, and monitor tenant intelligence — all in one place.
          </p>
          <div className="flex items-center justify-center gap-8 pt-4">
            {[
              { value: "150+", label: "Agencies" },
              { value: "99.9%", label: "Uptime" },
              { value: "3", label: "Markets" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <ModeroLogo size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {isSignUp ? "Sign up to access the Control Room" : "Sign in to the Control Room"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@modero.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-card border-border/60 focus:border-primary/40 transition-colors"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-card border-border/60 focus:border-primary/40 transition-colors"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full h-12 rounded-xl text-base" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground" />
              ) : (
                <>
                  <LogInIcon className="w-5 h-5 mr-2" />
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>

          <div className="text-center pt-4">
            <a href="/" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              ← Back to modero.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline icon to avoid naming conflict
const LogInIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export default Login;
