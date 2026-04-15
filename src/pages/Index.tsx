import ModeroLogo from "@/components/ModeroLogo";
import ApplicationForm from "@/components/ApplicationForm";
import { Shield, Zap, TrendingUp, Users, CheckCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ValueCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border group">
    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-orange group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-primary-foreground" />
    </div>
    <h3 className="font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const StatBadge = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-primary">{value}</div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </div>
);

const Index = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen gradient-hero">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <ModeroLogo />
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
            Admin Login
          </a>
          <Button variant="hero" size="lg" onClick={() => {
          setShowForm(true);
          setTimeout(() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }), 100);
        }}>
          Apply Now
        </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Exclusive Pre-Qualification Network
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6 tracking-tight">
            The Intelligence Layer for{" "}
            <span className="text-primary">Serious Rental Agencies</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Modero is the real-time tenant intelligence platform built for the high-risk rental markets of Spain, Portugal, and Italy. 
            Pre-qualify tenants, eliminate vacancy bleed, and protect landlords — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={() => {
              setShowForm(true);
              setTimeout(() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }), 100);
            }}>
              Apply to Join Modero
            </Button>
            <Button variant="outline" size="xl" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              How It Works
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-20 mt-16 py-8 border-y border-border">
          <StatBadge value="3x" label="Faster Leasing" />
          <StatBadge value="87%" label="Fraud Reduction" />
          <StatBadge value="€0" label="First Year" />
        </div>
      </section>

      {/* Value Props */}
      <section id="how-it-works" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Why Top Agencies Choose Modero</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Only pre-qualified, serious professional agencies gain access to the platform.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <ValueCard icon={Zap} title="Inquiry Interceptor" description="Auto-forward Idealista inquiries. Tenants are scored in real time before they ever reach your inbox." />
          <ValueCard icon={TrendingUp} title="Revenue Saved Tracker" description="Show landlords exactly how much time and money you saved them. Win more mandates with hard data." />
          <ValueCard icon={Shield} title="Trust Score Engine" description="Income verification, ID checks, LinkedIn validation, residency status — combined into one score." />
          <ValueCard icon={Building} title="Multi-Listing Manager" description="Manage all your properties in one dashboard. Set custom income gates and requirements per listing." />
          <ValueCard icon={Users} title="Exclusive Network" description="Only verified agencies with 10+ active listings qualify. Clean data, real benchmarks, zero noise." />
          <ValueCard icon={CheckCircle} title="GDPR Vault" description="Tenant documents encrypted and compliant. Full audit trail for every verification step." />
        </div>
      </section>

      {/* Eligibility */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="bg-card rounded-3xl p-10 md:p-14 shadow-card border border-border max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Are You Eligible?</h2>
            <p className="text-muted-foreground">Modero is by invitation only. You must meet these minimum criteria.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "Minimum 10 active Idealista listings",
              "Business email domain (no personal Gmail)",
              "Professional agency website",
              "Operating as a licensed rental agency",
              "Based in Spain, Portugal, or Italy",
              "Commitment to digital pre-qualification",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 p-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
          {!showForm && (
            <div className="text-center mt-8">
              <Button variant="hero" size="xl" onClick={() => setShowForm(true)}>
                Start Your Application
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Application Form */}
      {showForm && (
        <section id="apply" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">Apply to Join Modero</h2>
            <p className="text-muted-foreground">Complete the form below. Applications are reviewed within 48 hours.</p>
          </div>
          <ApplicationForm />
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 border-t border-border max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <ModeroLogo size="sm" />
          <p className="text-sm text-muted-foreground">© 2026 Modero. The Tenant Intelligence Layer for Southern Europe.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
