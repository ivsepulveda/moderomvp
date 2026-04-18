import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AgencySidebar } from "@/components/AgencySidebar";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/agency/NotificationBell";

const AgencyLayout = () => {
  const { profile, userRole } = useAuth();

  // Redirect to onboarding if agency hasn't completed it
  if (userRole === "agency" && profile && !profile.onboarding_completed) {
    return <Navigate to="/agency/onboarding" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AgencySidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <h1 className="text-sm font-semibold text-foreground">Agency Portal</h1>
            </div>
            <div className="flex items-center gap-3">
              {profile?.agency_name && (
                <span className="text-xs text-muted-foreground hidden sm:inline">{profile.agency_name}</span>
              )}
              <NotificationBell />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AgencyLayout;
