import ModeroLogo from "@/components/ModeroLogo";
import ApplicationForm from "@/components/ApplicationForm";
import {
  Shield,
  Zap,
  Users,
  CheckCircle,
  Building,
  LogIn,
  ChevronDown,
  Inbox,
  Link2,
  MessageSquare,
  Filter,
  Flame,
  EyeOff,
  Gift,
  Handshake,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import dashboardOverview from "@/assets/dashboard-hero-overview.png";
import dashboardTenant from "@/assets/dashboard-hero-tenant.png";

const StatBadge = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-primary">{value}</div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </div>
);

const StepCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border group">
    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-orange group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-primary-foreground" />
    </div>
    <h3 className="font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const Index = () => {
  const [showForm, setShowForm] = useState(false);

  const openApply = () => {
    setShowForm(true);
    setTimeout(
      () => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto">
        <ModeroLogo />
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Modero Login
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <a href="/login?type=admin" className="cursor-pointer gap-2">
                  <Shield className="w-4 h-4" />
                  Admin Login
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/login?type=agency" className="cursor-pointer gap-2">
                  <Building className="w-4 h-4" />
                  Agency Login
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="hero" size="lg" onClick={openApply}>
            Start Qualification
          </Button>
        </div>
      </nav>

      {/* Hero — The Idealista Paradox */}
      <section className="px-6 md:px-12 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4" />
            The Idealista Paradox
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6 tracking-tight">
            150 WhatsApps. 50 emails.{" "}
            <span className="text-primary">One listing.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            In Spain, Portugal and Italy, an Idealista listing is both a blessing and a curse.
            You post a property at 10:00 AM, and by 11:00 AM your agents are no longer
            Real Estate Experts — they're full-time filters, drowning in unqualified leads.
          </p>
          <p className="text-lg text-foreground font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            Modero is the only system that makes the inquiry flood disappear,
            so you can focus on closing.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={openApply}>
              Start Qualification
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() =>
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How It Works
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 md:gap-20 mt-16 py-8 border-y border-border">
          <StatBadge value="6 mo" label="Free Trial" />
          <StatBadge value="0" label="Dashboards to Learn" />
          <StatBadge value="100%" label="Inbox Relief" />
        </div>
      </section>

      {/* The Solution — The Invisible Co-pilot */}
      <section id="how-it-works" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <EyeOff className="w-4 h-4" />
            The Invisible Co-pilot
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            We don't sell you another dashboard.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We don't ask your team to learn new software. Modero is an Invisible Co-pilot
            that works in the background of your existing workflow — so your agents stay
            in their email or CRM, but only ever see High-Value Segments.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <StepCard
            icon={Link2}
            title="Instant Sync"
            description="We link directly to your Idealista listings — no migration, no setup pain."
          />
          <StepCard
            icon={MessageSquare}
            title="Auto-Response"
            description="The moment an inquiry hits, Modero engages the tenant immediately, 24/7."
          />
          <StepCard
            icon={Filter}
            title="Qualification Gate"
            description="It asks the hard questions: income, employment stability, move-in dates, household composition."
          />
          <StepCard
            icon={Flame}
            title="The Hot List"
            description="You don't see the 190 unqualified leads. Only the 10 pre-qualified tenants ready for a viewing."
          />
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Inbox className="w-4 h-4" />
            From Noise to Hot List
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Your Idealista inbox, finally clean.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every inquiry pre-scored. Every tenant verified. Only the ones worth your time.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
          <div className="group flex flex-col">
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-border/40 shadow-2xl shadow-primary/10 transition-transform duration-500 group-hover:-translate-y-1 aspect-[16/10] bg-card">
              <img
                src={dashboardOverview}
                alt="Modero agency dashboard showing the Hot List of pre-qualified tenants"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover block"
              />
            </div>
            <div className="mt-5 px-1">
              <h3 className="font-bold text-foreground text-lg">The Hot List view</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Optional — for the agencies that want to peek behind the curtain.
              </p>
            </div>
          </div>

          <div className="group flex flex-col">
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-border/40 shadow-2xl shadow-primary/10 transition-transform duration-500 group-hover:-translate-y-1 aspect-[16/10] bg-card">
              <img
                src={dashboardTenant}
                alt="Modero tenant qualification breakdown across income, employment, identity and residency"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover block"
              />
            </div>
            <div className="mt-5 px-1">
              <h3 className="font-bold text-foreground text-lg">Tenant Qualification Profile</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Income, employment, ID and residency — combined into one decisive answer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 6-Month Offer */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-card max-w-5xl mx-auto p-10 md:p-14">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              The 6-Month Partnership Offer
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 max-w-2xl">
              Six months. Full system. Zero cost.
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-8">
              We're not looking for every agency — we're looking for{" "}
              <span className="text-foreground font-semibold">Serious Partners</span> managing
              significant rental portfolios who are tired of the chaos. Because we believe in
              our <span className="italic">Understanding First</span> philosophy, we're offering
              a 6-Month Free Trial of the full Modero Intelligence Layer.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-secondary/50 p-6 border border-border">
                <Handshake className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-2">What we invest</h3>
                <p className="text-sm text-muted-foreground">
                  Our full technology stack — Idealista sync, auto-response, qualification gate
                  and Hot List — deployed into your agency for 6 months at zero cost.
                </p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-6 border border-border">
                <Users className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-2">What you contribute</h3>
                <p className="text-sm text-muted-foreground">
                  Ground Truth — real-world feedback and recordings that help us refine the
                  Intelligence Web for the Mediterranean market.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The No-Hassle Setup */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              The No-Hassle Setup
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Set it once. Then forget it exists.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You set it up once. We define your agency's specific{" "}
              <span className="text-foreground font-semibold">Red Lines</span> and{" "}
              <span className="text-foreground font-semibold">Green Lights</span>.
              After that, the system is invisible.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Your team stays in their email or current CRM, but instead of raw noise,
              they receive High-Value Segments. No dashboard. No training sessions.
              Just a co-pilot that never sleeps and never misses a lead.
            </p>
          </div>
          <div className="space-y-3">
            {[
              "No new dashboard to log into",
              "No training sessions for your team",
              "Works inside your existing inbox or CRM",
              "Defined once around your Red Lines & Green Lights",
              "Runs 24/7 — never sleeps, never misses a lead",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border shadow-card"
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Qualification — Are We a Match? */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="bg-card rounded-3xl p-10 md:p-14 shadow-card border border-border max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Are We a Match?
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              This is a high-integrity partnership.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              To see if your agency is a fit for our 6-Month Partnership Phase,
              you must start our qualification process today. We will audit:
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            {[
              {
                title: "Your Portfolio Volume",
                desc: "Are you managing enough doors to benefit from automation?",
              },
              {
                title: "Your Current Workflow",
                desc: "Ready to move from manual filtering to Intelligence-First management?",
              },
              {
                title: "Your Vision",
                desc: "Do you want to lead the PropTech revolution in Southern Europe?",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-2xl bg-secondary/40 border border-border"
              >
                <CheckCircle className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-1 text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          {!showForm && (
            <div className="text-center">
              <Button variant="hero" size="xl" onClick={() => setShowForm(true)}>
                Start the Qualification Process
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Your co-pilot starts working{" "}
            <span className="text-primary">tomorrow.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-3">
            If we're a match, you don't pay a cent for the next 6 months.
          </p>
          <p className="text-base text-foreground font-medium italic mb-10">
            Understanding first. Money last. Let's clean up your Idealista inbox forever.
          </p>
          <Button variant="hero" size="xl" onClick={openApply}>
            Start Qualification
          </Button>
        </div>
      </section>

      {/* Application Form */}
      {showForm && (
        <section id="apply" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Apply for the 6-Month Partnership
            </h2>
            <p className="text-muted-foreground">
              Complete the form below. Applications are reviewed within 48 hours.
            </p>
          </div>
          <ApplicationForm />
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 border-t border-border max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <ModeroLogo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2026 Modero. The Tenant Intelligence Layer for Southern Europe.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
