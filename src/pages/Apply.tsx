import ModeroLogo from "@/components/ModeroLogo";
import ApplicationForm from "@/components/ApplicationForm";
import { Shield } from "lucide-react";

const Apply = () => {
  return (
    <div className="min-h-screen gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <ModeroLogo size="lg" />
          <h1 className="text-3xl font-bold text-foreground mt-4">
            Join the Modero Network
          </h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Apply to become a verified Modero partner agency. We review every application within 48 hours.
          </p>
        </div>

        {/* Application Form */}
        <ApplicationForm />

        {/* Back link */}
        <div className="text-center mt-8">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to modero.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default Apply;
