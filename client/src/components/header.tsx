import { useState } from "react";
import { Search, Bell, HelpCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileSidebar from "@/components/ui/mobile-sidebar";

export function Header() {
  const [walletConnected, setWalletConnected] = useState(false);
  
  const handleConnectWallet = () => {
    setWalletConnected(true);
  };
  
  return (
    <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex md:hidden">
        <MobileSidebar />
      </div>
      
      <div className="md:flex items-center space-x-4 hidden">
        <div className="relative">
          <Input 
            type="text" 
            placeholder="Search markets, assets..." 
            className="w-64 pl-3 pr-9" 
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-slate-500">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500">
          <HelpCircle className="h-5 w-5" />
        </Button>
        
        {walletConnected ? (
          <Button variant="secondary" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Wallet Connected</span>
            <span className="inline sm:hidden">Connected</span>
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="flex items-center"
            onClick={handleConnectWallet}
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="inline sm:hidden">Connect</span>
          </Button>
        )}
      </div>
    </header>
  );
}

export default Header;
