import { Switch, Route, useLocation } from "wouter";
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
import { useEffect, useState } from "react";
import LandingPage from "@/pages/landing-page"; // Added import for LandingPage

// Import placeholder pages
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import SubscriptionPage from "@/pages/subscription-page";
import WalletsPage from "@/pages/wallets-page";
import SocialTradingPage from "@/pages/social-trading-page";
import TutorialsPage from "@/pages/tutorials-page";
import FrontendManagement from "./pages/admin/frontend-management"; // Added import for FrontendManagement


// Simple component to display during loading
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}

// Simpler Auth gate that works with wouter
function ProtectedRoute({
  component: Component,
  adminOnly = false
}: {
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth");
      } else if (adminOnly && user.role !== "admin") {
        navigate("/");
      }
    }
  }, [user, isLoading, adminOnly, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  if (adminOnly && user.role !== "admin") {
    return null;
  }

  return <Component />;
}

// Login gate to redirect away if already logged in
function LoginGate() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return null;
  }

  return <AuthPage />;
}

// Main app with all routes
function AppWithAuth() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Switch>
      <Route path="/"> {/* Added route for LandingPage */}
        <LandingPage />
      </Route>
      <Route path="/auth">
        <LoginGate />
      </Route>
      <Route path="/home"> {/*Changed path from / to /home */}
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
      <Route path="/wallets">
        <ProtectedRoute component={WalletsPage} />
      </Route>
      <Route path="/social">
        <ProtectedRoute component={SocialTradingPage} />
      </Route>
      <Route path="/tutorials">
        <ProtectedRoute component={TutorialsPage} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/subscription">
        <ProtectedRoute component={SubscriptionPage} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsersPage} adminOnly={true} />
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute component={AdminDashboard} adminOnly={true} />
      </Route>
      <Route path="/admin/frontend">
        <ProtectedRoute component={FrontendManagement} adminOnly={true} />
      </Route>
      <Route path="/home">
        <ProtectedRoute component={HomePage} />
      </Route>
      <Route path="/education">
        <ProtectedRoute component={EducationPage} />
      </Route>
      <Route path="/users">
        <ProtectedRoute component={UsersPage} adminOnly={true} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
      <Toaster />
    </AuthProvider>
  );
}

export default App;