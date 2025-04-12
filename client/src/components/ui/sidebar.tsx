import { FC } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  PieChart,
  Bot,
  Wallet,
  Users,
  BookOpen,
  Video,
  User,
  Settings,
  Crown,
  LogOut,
  LineChart,
  Brain,
  Bell,
  PencilLine,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const NavItem: FC<NavItemProps> = ({ icon, label, href, isActive }) => {
  return (
    <li>
      <Link href={href} onClick={() => {}}>
        <div
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
            isActive
              ? "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          )}
        >
          {icon}
          {label}
        </div>
      </Link>
    </li>
  );
};

interface SidebarProps {
  closeMobileSidebar?: () => void;
}

export function Sidebar({ closeMobileSidebar }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLinkClick = () => {
    if (closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuItems = [
    { icon: <Home />, label: "Dashboard", href: "/home" },
    { icon: <LineChart />, label: "Portfolio", href: "/portfolio" },
    { icon: <Brain />, label: "AI Insights", href: "/ai-insights" },
    { icon: <Wallet />, label: "Wallets", href: "/wallets" },
    { icon: <Users />, label: "Social Trading", href: "/social" },
    { icon: <BookOpen />, label: "Education", href: "/education" },
    { icon: <Bell />, label: "Alerts", href: "/alerts" },
    { icon: <PencilLine />, label: "Trade Journal", href: "/journal" },
    { icon: <RefreshCw />, label: "Rebalancing", href: "/rebalance" },
    { icon: <Settings />, label: "Settings", href: "/settings" }
  ];

  //Filter menuItems into Dashboard, Learn, Settings categories.  Admin items remain separate.
  const dashboardItems = menuItems.filter(item => item.href.startsWith('/')); //Consider more robust filtering if needed.
  const learnItems = menuItems.filter(item => item.href === '/education');
  const settingsItems = menuItems.filter(item => item.href === '/settings');


  // Admin items only shown to admin users
  const adminItems = user?.role === 'admin' ? [
    { icon: <Users className="w-5 h-5 mr-2" />, label: "User Management", href: "/admin/users" },
    { icon: <PieChart className="w-5 h-5 mr-2" />, label: "Admin Dashboard", href: "/admin/dashboard" },
  ] : [];

  return (
    <aside className="bg-background border-r border-border w-64 h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 text-white w-8 h-8 rounded-md flex items-center justify-center">
            <PieChart className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold">ProfitWise AI</h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pt-5 pb-5">
        <div className="px-3 mb-6">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Dashboard
          </div>
          <ul className="space-y-1">
            {dashboardItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={location === item.href}
              />
            ))}
          </ul>
        </div>

        <div className="px-3 mb-6">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Learn
          </div>
          <ul className="space-y-1">
            {learnItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={location === item.href}
              />
            ))}
          </ul>
        </div>

        <div className="px-3 mb-6">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Settings
          </div>
          <ul className="space-y-1">
            {settingsItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isActive={location === item.href}
              />
            ))}
          </ul>
        </div>

        {adminItems.length > 0 && (
          <div className="px-3 mb-6">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
              Admin
            </div>
            <ul className="space-y-1">
              {adminItems.map((item) => (
                <NavItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={location === item.href}
                />
              ))}
            </ul>
          </div>
        )}

        <div className="px-3 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:text-red-400"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <Link href="/profile">
          <div className="flex items-center text-sm font-medium text-foreground cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-2">
              <span className="text-primary-700 dark:text-primary-300">
                {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <div className="font-medium">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.subscriptionTier === 'basic' ? 'Basic Plan' : user?.subscriptionTier === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;