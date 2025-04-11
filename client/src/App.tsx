import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import PortfolioPage from "@/pages/portfolio-page";
import AiInsightsPage from "@/pages/ai-insights-page";
import EducationPage from "@/pages/education-page";
import AdminUsersPage from "@/pages/admin/users-page";
import AdminDashboard from "@/pages/admin/dashboard";
import { AuthProvider } from "./hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useAuth } from "./hooks/use-auth";

function ProtectedRoute({ 
  component: Component, 
  adminOnly = false
}: { 
  component: React.ComponentType; 
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/auth";
    return null;
  }

  if (adminOnly && user.role !== "admin") {
    window.location.href = "/";
    return null;
  }

  return <Component />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/">
        <ProtectedRoute component={HomePage} />
      </Route>
      <Route path="/portfolio">
        <ProtectedRoute component={PortfolioPage} />
      </Route>
      <Route path="/ai-insights">
        <ProtectedRoute component={AiInsightsPage} />
      </Route>
      <Route path="/education">
        <ProtectedRoute component={EducationPage} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsersPage} adminOnly={true} />
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} adminOnly={true} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <>
        <AppRoutes />
        <Toaster />
      </>
    </AuthProvider>
  );
}

export default App;
