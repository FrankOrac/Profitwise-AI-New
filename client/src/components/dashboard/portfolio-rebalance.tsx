import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import MobileSidebar from "@/components/ui/mobile-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PortfolioRebalance() {
  const isMobile = useIsMobile();

  return (
    <>
      <Helmet>
        <title>Portfolio Rebalancing | ProfitWise AI</title>
      </Helmet>
      <div className="flex h-screen bg-slate-50">
        {!isMobile && <Sidebar />}
        <MobileSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">Portfolio Rebalancing</h1>
              <p>Rebalance your portfolio allocations here.</p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}