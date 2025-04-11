import { FC } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  PieChart,
  Bot,
  Wallet,
  Users,
  Book,
  Video,
  User,
  Settings,
  Crown,
  LogOut
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
      <div
        className={cn(
          "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
          isActive 
            ? "bg-primary-50 text-primary-600" 
            : "text-slate-700 hover:bg-slate-100"
        )}
        onClick={() => {
          window.location.href = href;
        }}
      >
        {icon}
        {label}
      </div>
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
  
  const navItems = [
    { icon: <Home className="w-5 h-5 mr-2" />, label: "Overview", href: "/" },
    { icon: <PieChart className="w-5 h-5 mr-2" />, label: "Portfolio", href: "/portfolio" },
    { icon: <Bot className="w-5 h-5 mr-2" />, label: "AI Insights", href: "/ai-insights" },
    { icon: <Wallet className="w-5 h-5 mr-2" />, label: "Web3 Wallets", href: "/wallets" },
    { icon: <Users className="w-5 h-5 mr-2" />, label: "Social Trading", href: "/social" },
  ];
  
  const learnItems = [
    { icon: <Book className="w-5 h-5 mr-2" />, label: "Education Hub", href: "/education" },
    { icon: <Video className="w-5 h-5 mr-2" />, label: "Tutorials", href: "/tutorials" },
  ];
  
  const settingsItems = [
    { icon: <User className="w-5 h-5 mr-2" />, label: "Profile", href: "/profile" },
    { icon: <Settings className="w-5 h-5 mr-2" />, label: "Settings", href: "/settings" },
    { icon: <Crown className="w-5 h-5 mr-2" />, label: "Subscription", href: "/subscription" },
  ];
  
  // Admin items only shown to admin users
  const adminItems = user?.role === 'admin' ? [
    { icon: <Users className="w-5 h-5 mr-2" />, label: "User Management", href: "/admin/users" },
    { icon: <PieChart className="w-5 h-5 mr-2" />, label: "Admin Dashboard", href: "/admin/dashboard" },
  ] : [];
  
  return (
    <aside className="bg-white border-r border-slate-200 w-64 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 text-white w-8 h-8 rounded-md flex items-center justify-center">
            <PieChart className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold">ProfitWise AI</h1>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto pt-5 pb-5">
        <div className="px-3 mb-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Dashboard
          </div>
          <ul className="space-y-1">
            {navItems.map((item) => (
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
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
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
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
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div 
          className="flex items-center text-sm font-medium text-slate-700 cursor-pointer"
          onClick={() => {
            window.location.href = "/profile";
            if (handleLinkClick) handleLinkClick();
          }}
        >
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
            <span className="text-primary-700">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <div className="font-medium">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username}
            </div>
            <div className="text-xs text-slate-500">
              {user?.subscriptionTier === 'basic' ? 'Basic Plan' : user?.subscriptionTier === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
