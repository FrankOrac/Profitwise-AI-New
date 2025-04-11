import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { AuthContext } from "@/hooks/use-auth";
import { useContext } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  try {
    const { user, isLoading } = useAuth();

    if (isLoading) {
      return (
        <Route path={path}>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        </Route>
      );
    }

    if (!user) {
      return (
        <Route path={path}>
          <Redirect to="/auth" />
        </Route>
      );
    }
    
    // For admin-only routes
    if (path.startsWith('/admin') && user.role !== 'admin') {
      return (
        <Route path={path}>
          <Redirect to="/" />
        </Route>
      );
    }

    return <Route path={path} component={Component} />;
  } catch (error) {
    console.error("Auth error:", error);
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
}
