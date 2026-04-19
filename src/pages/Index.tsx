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
  Globe,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import dashboardOverview from "@/assets/dashboard-hero-overview.png";
import dashboardTenant from "@/assets/dashboard-hero-tenant.png";
import { LANGUAGES, landingTranslations, type Lang } from "@/lib/landing-i18n";

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

const detectInitialLang = (): Lang => {
  try {
    const saved = localStorage.getItem("modero_lang");
    if (saved && ["en", "es", "pt", "it"].includes(saved)) return saved as Lang;
  } catch {}
  if (typeof navigator !== "undefined") {
    const nav = navigator.language?.slice(0, 2).toLowerCase();
    if (nav && ["en", "es", "pt", "it"].includes(nav)) return nav as Lang;
  }
  return "en";
};

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [lang, setLang] = useState<Lang>(detectInitialLang());
  const t = landingTranslations[lang];

  useEffect(() => {
    try { localStorage.setItem("modero_lang", lang); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

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
                aria-label={t.nav.language}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
                <span className="sm:hidden">{currentLang.flag}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {LANGUAGES.map((l) => (
                <DropdownMenuItem
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className="cursor-pointer gap-2"
                >
                  <span>{l.flag}</span>
                  <span className="flex-1">{l.label}</span>
                  {l.code === lang && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <LogIn className="w-4 h-4" />
                {t.nav.login}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <a href="/login?type=admin" className="cursor-pointer gap-2">
                  <Shield className="w-4 h-4" />
                  {t.nav.admin}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/login?type=agency" className="cursor-pointer gap-2">
                  <Building className="w-4 h-4" />
                  {t.nav.agency}
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="hero" size="lg" onClick={openApply}>
            {t.nav.cta}
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <AlertTriangle className="w-4 h-4" />
            {t.hero.badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6 tracking-tight">
            {t.hero.titleA}
            <span className="text-primary">{t.hero.titleB}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            {t.hero.p1}
          </p>
          <p className="text-lg text-foreground font-medium max-w-2xl mx-auto leading-relaxed mb-10">
            {t.hero.p2}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={openApply}>
              {t.hero.cta}
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() =>
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {t.hero.how}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-12 md:gap-20 mt-16 py-8 border-y border-border">
          {t.stats.map((s) => (
            <StatBadge key={s.l} value={s.v} label={s.l} />
          ))}
        </div>
      </section>

      {/* Solution */}
      <section id="how-it-works" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <EyeOff className="w-4 h-4" />
            {t.solution.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.solution.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">{t.solution.sub}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[Link2, MessageSquare, Filter, Flame].map((Icon, i) => (
            <StepCard key={i} icon={Icon} title={t.solution.steps[i].t} description={t.solution.steps[i].d} />
          ))}
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Inbox className="w-4 h-4" />
            {t.preview.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t.preview.title}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">{t.preview.sub}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
          <div className="group flex flex-col">
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-border/40 shadow-2xl shadow-primary/10 transition-transform duration-500 group-hover:-translate-y-1 aspect-[16/10] bg-card">
              <img
                src={dashboardOverview}
                alt={t.preview.card1Title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover block"
              />
            </div>
            <div className="mt-5 px-1">
              <h3 className="font-bold text-foreground text-lg">{t.preview.card1Title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.preview.card1Sub}</p>
            </div>
          </div>

          <div className="group flex flex-col">
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-border/40 shadow-2xl shadow-primary/10 transition-transform duration-500 group-hover:-translate-y-1 aspect-[16/10] bg-card">
              <img
                src={dashboardTenant}
                alt={t.preview.card2Title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover block"
              />
            </div>
            <div className="mt-5 px-1">
              <h3 className="font-bold text-foreground text-lg">{t.preview.card2Title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.preview.card2Sub}</p>
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
              {t.offer.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 max-w-2xl">
              {t.offer.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-8">{t.offer.body}</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-secondary/50 p-6 border border-border">
                <Handshake className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-2">{t.offer.investTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.offer.investBody}</p>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-6 border border-border">
                <Users className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-2">{t.offer.contributeTitle}</h3>
                <p className="text-sm text-muted-foreground">{t.offer.contributeBody}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* No-Hassle Setup */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              {t.setup.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.setup.title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{t.setup.p1}</p>
            <p className="text-muted-foreground leading-relaxed">{t.setup.p2}</p>
          </div>
          <div className="space-y-3">
            {t.setup.bullets.map((item) => (
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

      {/* Qualification */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="bg-card rounded-3xl p-10 md:p-14 shadow-card border border-border max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              {t.qual.badge}
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">{t.qual.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t.qual.sub}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
            {t.qual.items.map((item) => (
              <div key={item.t} className="p-5 rounded-2xl bg-secondary/40 border border-border">
                <CheckCircle className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-1 text-sm">{item.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
          {!showForm && (
            <div className="text-center">
              <Button variant="hero" size="xl" onClick={() => setShowForm(true)}>
                {t.qual.cta}
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {t.closing.titleA}
            <span className="text-primary">{t.closing.titleB}</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-3">{t.closing.p1}</p>
          <p className="text-base text-foreground font-medium italic mb-10">{t.closing.p2}</p>
          <Button variant="hero" size="xl" onClick={openApply}>
            {t.closing.cta}
          </Button>
        </div>
      </section>

      {/* Application Form */}
      {showForm && (
        <section id="apply" className="px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">{t.apply.title}</h2>
            <p className="text-muted-foreground">{t.apply.sub}</p>
          </div>
          <ApplicationForm />
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 border-t border-border max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <ModeroLogo size="sm" />
          <p className="text-sm text-muted-foreground">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
