import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import AgencyRoute from "@/components/AgencyRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import TenantAuth from "./pages/TenantAuth.tsx";
import Apply from "./pages/Apply.tsx";
import TenantOnboarding from "./pages/TenantOnboarding.tsx";
import ApplicationStatus from "./pages/ApplicationStatus.tsx";
import AdminLayout from "./components/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import Applications from "./pages/admin/Applications.tsx";
import Agencies from "./pages/admin/Agencies.tsx";
import AdminSettings from "./pages/admin/Settings.tsx";
import AgencyLayout from "./components/AgencyLayout.tsx";
import AgencyDashboard from "./pages/agency/Dashboard.tsx";
import Tenants from "./pages/agency/Tenants.tsx";
import Listings from "./pages/agency/Listings.tsx";
import AgencySettings from "./pages/agency/Settings.tsx";
import AgencyOnboarding from "./pages/agency/Onboarding.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/tenant/auth" element={<TenantAuth />} />
            <Route path="/onboarding" element={<ProtectedRoute><TenantOnboarding /></ProtectedRoute>} />
            <Route path="/application-status" element={<ProtectedRoute><ApplicationStatus /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="applications" element={<Applications />} />
              <Route path="agencies" element={<Agencies />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/agency" element={<AgencyRoute><AgencyLayout /></AgencyRoute>}>
              <Route index element={<AgencyDashboard />} />
              <Route path="tenants" element={<Tenants />} />
              <Route path="listings" element={<Listings />} />
              <Route path="settings" element={<AgencySettings />} />
            </Route>
            <Route path="/agency/onboarding" element={<AgencyRoute><AgencyOnboarding /></AgencyRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
