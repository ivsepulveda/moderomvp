import { useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Home,
  MapPin,
  Hash,
  Info,
  Phone,
  Globe,
  ClipboardCheck,
} from "lucide-react";

type Lang = "en" | "es" | "pt" | "it";

const translations = {
  en: {
    header: { alreadyQualified: "Already qualified?", signIn: "Sign in" },
    inquiry: {
      badge: "Application received",
      via: "via Idealista",
      title: "You've applied to rent",
      titleFallback: "a property",
      titleWith: "with",
      intro:
        "You're receiving this link because you applied for this property through Idealista. To proceed with your application, you need to complete a short pre-qualification.",
      agency: "Agency",
      property: "Property",
      address: "Address",
      ref: "Idealista reference",
      contact: "Agency contact",
      whyTitle: "Why pre-qualification?",
      whyBody:
        "This process allows the agency to verify your profile and confirm whether you meet the requirements as a qualified tenant. It helps the agency review applications more efficiently and ensures that only relevant candidates move forward to viewings.",
      cta: "Start Pre-Qualification",
      ctaTime: "Takes under 3 minutes · 100% free",
    },
    pitch: {
      badge: "Tenant Pre-Qualification",
      h1a: "Get pre-qualified once.",
      h1b: "Rent faster, everywhere.",
      sub: "Modero is the trust layer for rental agencies in Spain, Portugal and Italy. Build a verified tenant profile in minutes — and unlock priority access to listings from every agency in our network.",
    },
    stats: [
      { value: "<3 min", label: "Average completion" },
      { value: "87%", label: "Approval rate" },
      { value: "100%", label: "Free for tenants" },
    ],
    benefits: [
      { title: "Skip the queue", desc: "Pre-qualified tenants get viewing slots before unverified applicants." },
      { title: "Verified once, reused everywhere", desc: "Your Modero profile works across every agency in our network." },
      { title: "Under 3 minutes", desc: "Guided steps. Auto-fill from LinkedIn. No paperwork upload marathons." },
      { title: "You stay in control", desc: "Bank-grade encryption. You decide which agencies see your file." },
    ],
    howItWorks: "How it works",
    steps: [
      { title: "Create account", desc: "Email + password. 30 seconds." },
      { title: "Verify identity", desc: "ID, income & employment in-app." },
      { title: "Get your Trust Score", desc: "Share with any Modero agency instantly." },
    ],
    trust: { gdpr: "GDPR compliant", encryption: "Bank-grade encryption", trusted: "Trusted by leading agencies" },
    form: {
      titleSignUp: "Start your pre-qualification",
      titleSignIn: "Welcome back",
      subSignUp: "Create your free tenant account in 30 seconds.",
      subSignIn: "Sign in to continue your application.",
      fullName: "Full name",
      fullNamePh: "John Doe",
      email: "Email",
      emailPh: "you@email.com",
      password: "Password",
      passwordHint: "Minimum 6 characters",
      submitSignUp: "Start Pre-Qualification",
      submitSignIn: "Sign in",
      perksSignUp: ["No fees, no commitment", "Reused across every Modero agency", "You control who sees your data"],
      switchToSignIn: "Already have an account?",
      switchToSignUp: "New here?",
      switchSignIn: "Sign in",
      switchSignUp: "Create one",
      legal: "By continuing you agree to Modero's Terms & Privacy Policy.",
    },
    welcomeToast: { title: "Welcome to Modero", desc: "Let's complete your tenant qualification." },
    errorToast: "Error",
    languageLabel: "Language",
  },
  es: {
    header: { alreadyQualified: "¿Ya estás cualificado?", signIn: "Iniciar sesión" },
    inquiry: {
      badge: "Solicitud recibida",
      via: "vía Idealista",
      title: "Has solicitado alquilar",
      titleFallback: "una propiedad",
      titleWith: "con",
      intro:
        "Recibes este enlace porque has solicitado esta propiedad a través de Idealista. Para continuar con tu solicitud, debes completar una breve pre-cualificación.",
      agency: "Agencia",
      property: "Propiedad",
      address: "Dirección",
      ref: "Referencia Idealista",
      contact: "Contacto de la agencia",
      whyTitle: "¿Por qué la pre-cualificación?",
      whyBody:
        "Este proceso permite a la agencia verificar tu perfil y confirmar si cumples los requisitos como inquilino cualificado. Ayuda a revisar las solicitudes de forma más eficiente y garantiza que solo los candidatos relevantes pasen a la visita.",
      cta: "Iniciar pre-cualificación",
      ctaTime: "Menos de 3 minutos · 100% gratis",
    },
    pitch: {
      badge: "Pre-cualificación de inquilinos",
      h1a: "Cualifícate una vez.",
      h1b: "Alquila más rápido, en todas partes.",
      sub: "Modero es la capa de confianza para agencias inmobiliarias en España, Portugal e Italia. Crea un perfil verificado en minutos y obtén acceso prioritario a las propiedades de toda nuestra red.",
    },
    stats: [
      { value: "<3 min", label: "Tiempo medio" },
      { value: "87%", label: "Tasa de aprobación" },
      { value: "100%", label: "Gratis para inquilinos" },
    ],
    benefits: [
      { title: "Sáltate la cola", desc: "Los inquilinos pre-cualificados consiguen visitas antes que los no verificados." },
      { title: "Verificado una vez, reutilizado en todas partes", desc: "Tu perfil Modero funciona con todas las agencias de la red." },
      { title: "Menos de 3 minutos", desc: "Pasos guiados. Auto-rellenado desde LinkedIn. Sin maratones de documentos." },
      { title: "Tú tienes el control", desc: "Cifrado de nivel bancario. Tú decides qué agencias ven tu expediente." },
    ],
    howItWorks: "Cómo funciona",
    steps: [
      { title: "Crea tu cuenta", desc: "Email + contraseña. 30 segundos." },
      { title: "Verifica tu identidad", desc: "DNI, ingresos y empleo en la app." },
      { title: "Obtén tu Trust Score", desc: "Compártelo con cualquier agencia Modero al instante." },
    ],
    trust: { gdpr: "Cumple GDPR", encryption: "Cifrado bancario", trusted: "Confían las mejores agencias" },
    form: {
      titleSignUp: "Inicia tu pre-cualificación",
      titleSignIn: "Bienvenido de nuevo",
      subSignUp: "Crea tu cuenta gratuita de inquilino en 30 segundos.",
      subSignIn: "Inicia sesión para continuar con tu solicitud.",
      fullName: "Nombre completo",
      fullNamePh: "Juan Pérez",
      email: "Email",
      emailPh: "tu@email.com",
      password: "Contraseña",
      passwordHint: "Mínimo 6 caracteres",
      submitSignUp: "Iniciar pre-cualificación",
      submitSignIn: "Iniciar sesión",
      perksSignUp: ["Sin tarifas ni compromiso", "Reutilizable en toda la red Modero", "Tú decides quién ve tus datos"],
      switchToSignIn: "¿Ya tienes cuenta?",
      switchToSignUp: "¿Eres nuevo?",
      switchSignIn: "Iniciar sesión",
      switchSignUp: "Crear cuenta",
      legal: "Al continuar aceptas los Términos y la Política de Privacidad de Modero.",
    },
    welcomeToast: { title: "Bienvenido a Modero", desc: "Vamos a completar tu cualificación." },
    errorToast: "Error",
    languageLabel: "Idioma",
  },
  pt: {
    header: { alreadyQualified: "Já está qualificado?", signIn: "Iniciar sessão" },
    inquiry: {
      badge: "Candidatura recebida",
      via: "via Idealista",
      title: "Candidatou-se a arrendar",
      titleFallback: "um imóvel",
      titleWith: "com",
      intro:
        "Está a receber este link porque se candidatou a este imóvel através do Idealista. Para prosseguir com a sua candidatura, precisa de completar uma breve pré-qualificação.",
      agency: "Agência",
      property: "Imóvel",
      address: "Morada",
      ref: "Referência Idealista",
      contact: "Contacto da agência",
      whyTitle: "Porquê a pré-qualificação?",
      whyBody:
        "Este processo permite à agência verificar o seu perfil e confirmar se cumpre os requisitos como inquilino qualificado. Ajuda a agência a rever as candidaturas de forma eficiente e garante que apenas candidatos relevantes avançam para visitas.",
      cta: "Iniciar pré-qualificação",
      ctaTime: "Menos de 3 minutos · 100% grátis",
    },
    pitch: {
      badge: "Pré-qualificação de inquilinos",
      h1a: "Qualifique-se uma vez.",
      h1b: "Arrende mais rápido, em todo o lado.",
      sub: "A Modero é a camada de confiança para agências imobiliárias em Espanha, Portugal e Itália. Crie um perfil verificado em minutos e desbloqueie acesso prioritário aos imóveis de toda a rede.",
    },
    stats: [
      { value: "<3 min", label: "Tempo médio" },
      { value: "87%", label: "Taxa de aprovação" },
      { value: "100%", label: "Grátis para inquilinos" },
    ],
    benefits: [
      { title: "Salte a fila", desc: "Inquilinos pré-qualificados obtêm visitas antes dos não verificados." },
      { title: "Verificado uma vez, reutilizado sempre", desc: "O seu perfil Modero funciona em todas as agências da rede." },
      { title: "Menos de 3 minutos", desc: "Passos guiados. Auto-preenchimento do LinkedIn. Sem maratonas de documentos." },
      { title: "Tem o controlo", desc: "Encriptação bancária. Decide que agências vêem o seu perfil." },
    ],
    howItWorks: "Como funciona",
    steps: [
      { title: "Crie a conta", desc: "Email + palavra-passe. 30 segundos." },
      { title: "Verifique identidade", desc: "ID, rendimento e emprego na app." },
      { title: "Obtenha o Trust Score", desc: "Partilhe com qualquer agência Modero." },
    ],
    trust: { gdpr: "Compatível com GDPR", encryption: "Encriptação bancária", trusted: "Usado pelas melhores agências" },
    form: {
      titleSignUp: "Inicie a sua pré-qualificação",
      titleSignIn: "Bem-vindo de volta",
      subSignUp: "Crie a sua conta de inquilino gratuita em 30 segundos.",
      subSignIn: "Inicie sessão para continuar a candidatura.",
      fullName: "Nome completo",
      fullNamePh: "João Silva",
      email: "Email",
      emailPh: "voce@email.com",
      password: "Palavra-passe",
      passwordHint: "Mínimo 6 caracteres",
      submitSignUp: "Iniciar pré-qualificação",
      submitSignIn: "Iniciar sessão",
      perksSignUp: ["Sem taxas, sem compromisso", "Reutilizável em toda a rede Modero", "Controla quem vê os seus dados"],
      switchToSignIn: "Já tem conta?",
      switchToSignUp: "Novo por aqui?",
      switchSignIn: "Iniciar sessão",
      switchSignUp: "Criar conta",
      legal: "Ao continuar aceita os Termos e a Política de Privacidade da Modero.",
    },
    welcomeToast: { title: "Bem-vindo à Modero", desc: "Vamos completar a sua qualificação." },
    errorToast: "Erro",
    languageLabel: "Idioma",
  },
  it: {
    header: { alreadyQualified: "Già qualificato?", signIn: "Accedi" },
    inquiry: {
      badge: "Candidatura ricevuta",
      via: "tramite Idealista",
      title: "Hai fatto richiesta per affittare",
      titleFallback: "un immobile",
      titleWith: "con",
      intro:
        "Stai ricevendo questo link perché hai fatto richiesta per questo immobile tramite Idealista. Per procedere con la tua candidatura, devi completare una breve pre-qualifica.",
      agency: "Agenzia",
      property: "Immobile",
      address: "Indirizzo",
      ref: "Riferimento Idealista",
      contact: "Contatto agenzia",
      whyTitle: "Perché la pre-qualifica?",
      whyBody:
        "Questo processo permette all'agenzia di verificare il tuo profilo e confermare se soddisfi i requisiti come inquilino qualificato. Aiuta a esaminare le candidature in modo più efficiente e garantisce che solo i candidati rilevanti passino alla visita.",
      cta: "Inizia la pre-qualifica",
      ctaTime: "Meno di 3 minuti · 100% gratis",
    },
    pitch: {
      badge: "Pre-qualifica inquilini",
      h1a: "Qualificati una volta.",
      h1b: "Affitta più velocemente, ovunque.",
      sub: "Modero è il livello di fiducia per le agenzie immobiliari in Spagna, Portogallo e Italia. Crea un profilo verificato in pochi minuti e ottieni accesso prioritario agli immobili di tutta la rete.",
    },
    stats: [
      { value: "<3 min", label: "Tempo medio" },
      { value: "87%", label: "Tasso di approvazione" },
      { value: "100%", label: "Gratis per gli inquilini" },
    ],
    benefits: [
      { title: "Salta la coda", desc: "Gli inquilini pre-qualificati ottengono visite prima dei non verificati." },
      { title: "Verificato una volta, riutilizzato ovunque", desc: "Il tuo profilo Modero funziona con tutte le agenzie della rete." },
      { title: "Meno di 3 minuti", desc: "Passaggi guidati. Auto-compilazione da LinkedIn. Niente maratone di documenti." },
      { title: "Mantieni il controllo", desc: "Crittografia bancaria. Decidi tu chi vede i tuoi dati." },
    ],
    howItWorks: "Come funziona",
    steps: [
      { title: "Crea l'account", desc: "Email + password. 30 secondi." },
      { title: "Verifica identità", desc: "ID, reddito e lavoro nell'app." },
      { title: "Ottieni il Trust Score", desc: "Condividi con qualsiasi agenzia Modero." },
    ],
    trust: { gdpr: "Conforme al GDPR", encryption: "Crittografia bancaria", trusted: "Scelto dalle migliori agenzie" },
    form: {
      titleSignUp: "Inizia la tua pre-qualifica",
      titleSignIn: "Bentornato",
      subSignUp: "Crea il tuo account inquilino gratuito in 30 secondi.",
      subSignIn: "Accedi per continuare la tua candidatura.",
      fullName: "Nome completo",
      fullNamePh: "Mario Rossi",
      email: "Email",
      emailPh: "tu@email.com",
      password: "Password",
      passwordHint: "Minimo 6 caratteri",
      submitSignUp: "Inizia la pre-qualifica",
      submitSignIn: "Accedi",
      perksSignUp: ["Nessun costo, nessun impegno", "Riutilizzabile in tutta la rete Modero", "Decidi tu chi vede i tuoi dati"],
      switchToSignIn: "Hai già un account?",
      switchToSignUp: "Nuovo qui?",
      switchSignIn: "Accedi",
      switchSignUp: "Crea account",
      legal: "Continuando accetti i Termini e l'Informativa Privacy di Modero.",
    },
    welcomeToast: { title: "Benvenuto in Modero", desc: "Completiamo la tua qualifica." },
    errorToast: "Errore",
    languageLabel: "Lingua",
  },
} as const;

const detectInitialLang = (override?: string | null): Lang => {
  const valid: Lang[] = ["en", "es", "pt", "it"];
  if (override && valid.includes(override.toLowerCase() as Lang)) {
    return override.toLowerCase() as Lang;
  }
  if (typeof navigator !== "undefined") {
    const nav = navigator.language?.slice(0, 2).toLowerCase();
    if (nav && valid.includes(nav as Lang)) return nav as Lang;
  }
  return "en";
};

const TenantAuth = () => {
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState<Lang>(detectInitialLang(searchParams.get("lang")));
  const t = translations[lang];

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(searchParams.get("name") || "");
  const [loading, setLoading] = useState(false);
  // Sign-up was removed: tenants only enter pre-qualification via the magic
  // link emailed to them after their Idealista inquiry. The page now only
  // offers a Sign-in form for tenants who already have an account.
  const isSignUp = false;
  const navigate = useNavigate();
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);
  const inquiryRef = useRef<HTMLDivElement>(null);

  const agencyName = searchParams.get("agency");
  const agencyEmail = searchParams.get("agency_email");
  const agencyPhone = searchParams.get("agency_phone");
  const propertyTitle = searchParams.get("property");
  const propertyAddress = searchParams.get("address");
  const idealistaRef = searchParams.get("ref") || searchParams.get("idealista");
  const rent = searchParams.get("rent");
  const source = searchParams.get("source");

  const hasAgencyContact = !!(agencyEmail || agencyPhone);
  // Always show the inquiry context block. Use placeholders when params are missing
  // so tenants always see what they applied to and why pre-qualification is needed.
  const displayAgencyName = agencyName || "the agency";
  const displayPropertyTitle = propertyTitle;
  const displayAddress = propertyAddress || "—";
  const displayRef = idealistaRef || "—";

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
            data: { full_name: fullName, user_type: "tenant", preferred_language: lang },
          },
        });
        if (error) throw error;
        toast({ title: t.welcomeToast.title, description: t.welcomeToast.desc });
        navigate("/onboarding");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/onboarding");
      }
    } catch (error: any) {
      toast({ title: t.errorToast, description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const benefitIcons = [Zap, ShieldCheck, Clock, LockIcon];
  const benefits = useMemo(
    () => t.benefits.map((b, i) => ({ ...b, icon: benefitIcons[i] })),
    [t]
  );
  const stepNumbers = ["01", "02", "03"];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <ModeroLogo size="default" />
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                <SelectTrigger
                  className="h-9 w-[110px] rounded-lg border-border/60 bg-background text-sm"
                  aria-label={t.languageLabel}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                  <SelectItem value="pt">🇵🇹 Português</SelectItem>
                  <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <span className="hidden md:inline text-sm text-muted-foreground">
              {t.header.alreadyQualified}
            </span>
            <button
              onClick={scrollToForm}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t.header.signIn}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-16 grid lg:grid-cols-5 gap-12">
        {/* Left: Pitch */}
        <div className="lg:col-span-3 space-y-10">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 via-primary/[0.03] to-transparent p-6 lg:p-7 space-y-5 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                {t.inquiry.badge}
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {t.inquiry.via}
              </span>
            </div>

            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground leading-snug">
                {t.inquiry.title}{" "}
                {displayPropertyTitle ? (
                  <span className="text-primary">{displayPropertyTitle}</span>
                ) : (
                  <>
                    {t.inquiry.titleFallback}
                    {agencyName && (
                      <>
                        {" "}
                        {t.inquiry.titleWith}{" "}
                        <span className="text-primary">{agencyName}</span>
                      </>
                    )}
                  </>
                )}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {t.inquiry.intro}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60">
                <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                    {t.inquiry.agency}
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">{displayAgencyName}</div>
                </div>
              </div>
              {displayPropertyTitle && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60">
                  <Home className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                      {t.inquiry.property}
                    </div>
                    <div className="text-sm font-semibold text-foreground truncate">
                      {displayPropertyTitle}
                      {rent && <span className="text-muted-foreground font-normal"> · €{rent}/mo</span>}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                    {t.inquiry.address}
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">{displayAddress}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-background/60 border border-border/60">
                <Hash className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                    {t.inquiry.ref}
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate font-mono">
                    {displayRef === "—" ? "—" : `#${displayRef}`}
                  </div>
                </div>
              </div>
            </div>

            {hasAgencyContact && (
              <div className="p-4 rounded-xl bg-background/60 border border-border/60 space-y-2">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                  {t.inquiry.contact}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                  {agencyEmail && (
                    <a
                      href={`mailto:${agencyEmail}`}
                      className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4 text-primary" />
                      {agencyEmail}
                    </a>
                  )}
                  {agencyPhone && (
                    <a
                      href={`tel:${agencyPhone}`}
                      className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                      {agencyPhone}
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{t.inquiry.whyTitle}</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{t.inquiry.whyBody}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <Button
                onClick={scrollToForm}
                variant="hero"
                size="lg"
                className="h-12 rounded-xl text-base px-6"
              >
                <ClipboardCheck className="w-5 h-5 mr-2" />
                {t.inquiry.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <span className="text-xs text-muted-foreground">{t.inquiry.ctaTime}</span>
            </div>
          </div>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">{t.pitch.badge}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
              {t.pitch.h1a}
              <br />
              <span className="text-primary">{t.pitch.h1b}</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              {t.pitch.sub}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 py-6 border-y border-border/60">
            {t.stats.map((s) => (
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
            <h2 className="text-xl font-bold text-foreground">{t.howItWorks}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {t.steps.map((s, i) => (
                <div key={s.title} className="p-5 rounded-2xl bg-secondary/40 border border-border/40">
                  <div className="text-xs font-mono text-primary mb-2">{stepNumbers[i]}</div>
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
              {t.trust.gdpr}
            </div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary" />
              {t.trust.encryption}
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              {t.trust.trusted}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-2" ref={formRef}>
          <div className="lg:sticky lg:top-24">
            <div className="rounded-3xl bg-card border border-border/60 shadow-elegant p-7 lg:p-8 space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-bold text-foreground">
                  {isSignUp ? t.form.titleSignUp : t.form.titleSignIn}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? t.form.subSignUp : t.form.subSignIn}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      {t.form.fullName}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder={t.form.fullNamePh}
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
                    {t.form.email}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t.form.emailPh}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 rounded-xl bg-background border-border/60"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t.form.password}
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
                  <p className="text-xs text-muted-foreground">{t.form.passwordHint}</p>
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
                      {isSignUp ? t.form.submitSignUp : t.form.submitSignIn}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {isSignUp && (
                  <div className="pt-1 space-y-2">
                    {t.form.perksSignUp.map((p) => (
                      <div key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                )}
              </form>

              <div className="text-center text-sm text-muted-foreground border-t border-border/50 pt-4">
                {t.form.switchToSignUp}{" "}
                <span className="text-foreground font-medium">
                  {t.inquiry.cta}
                </span>{" "}
                — {t.inquiry.ctaTime}
              </div>
            </div>

            <p className="text-xs text-muted-foreground/70 text-center mt-4">
              {t.form.legal}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantAuth;
