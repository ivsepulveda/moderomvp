import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AgencyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || userRole !== "agency") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AgencyRoute;
