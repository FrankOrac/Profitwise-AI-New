import { Helmet } from "react-helmet";
import Sidebar from "@/components/ui/sidebar";
import Header from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import MetricCard from "@/components/dashboard/metric-card";
import PortfolioChart from "@/components/dashboard/portfolio-chart";
import AllocationChart from "@/components/dashboard/allocation-chart";
import AiInsights from "@/components/dashboard/ai-insights";
import TopPerformers from "@/components/dashboard/top-performers";
import EducationCard from "@/components/education/education-card";
import SubscriptionPlans from "@/components/subscription/subscription-plans";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { EducationalContent } from "@shared/schema";
import MobileSidebar from "@/components/ui/mobile-sidebar"; // Added import
import { useIsMobile } from "@/hooks/use-mobile"; // Fixed import name
import { useLocation } from "wouter"; // Added import


export default function HomePage() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile(); // Fixed hook name

  const { data: educationContent = [] } = useQuery<EducationalContent[]>({
    queryKey: ["/api/education"],
  });

  return (
    <>
      <Helmet>
        <title>Dashboard | ProfitWise AI</title>
      </Helmet>

      <div className="flex h-screen bg-slate-50 dark:bg-slate-900"> {/* Changed to flex */}
        {!isMobile && <Sidebar />} {/* Conditionally render Sidebar */}
        <MobileSidebar /> {/* Added MobileSidebar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          <main className="bg-slate-50 p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
              <p className="text-slate-500">
                Welcome back, {user?.firstName || user?.username}. Here's your financial summary.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard 
                title="Portfolio Value" 
                value="$32,594.23" 
                subValue="+$782.14 today" 
                badgeText="+2.4%" 
                badgeVariant="success" 
              />
              <MetricCard 
                title="Total Assets" 
                value="$29,152.89" 
                subValue="Across 3 platforms" 
                badgeText="12" 
              />
              <MetricCard 
                title="Cash Balance" 
                value="$3,441.34" 
                subValue="10.56% of portfolio" 
                badgeText="Low" 
                badgeVariant="warning" 
              />
              <MetricCard 
                title="Risk Score" 
                value="68/100" 
                subValue="Balanced allocation" 
                badgeText="Moderate" 
                badgeVariant="info" 
              />
            </div>

            {/* Portfolio Performance and Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <PortfolioChart className="lg:col-span-2" />
              <AllocationChart />
            </div>

            {/* AI Insights and Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AiInsights />
              <TopPerformers />
            </div>

            {/* Educational Content */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Educational Resources</h2>
                <Link href="/education" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {educationContent?.slice(0, 3).map((content) => (
                  <EducationCard key={content.id} content={content} />
                ))}
              </div>
            </div>

            {/* User Management Section for Admins */}
            {user?.role === 'admin' && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">User Management</h2>
                  <Link href="/admin/users" className="text-primary-600 text-sm font-medium hover:underline">
                    Manage Users
                  </Link>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <MetricCard 
                        title="Total Users"
                        value={educationContent?.length.toString() || "0"}
                        subValue="Active users"
                        badgeText="+12%"
                        badgeVariant="success"
                      />
                      <MetricCard 
                        title="Pro Users"
                        value="24"
                        subValue="Subscribed users"
                        badgeText="+5%"
                        badgeVariant="success"
                      />
                      <MetricCard 
                        title="New Users"
                        value="8"
                        subValue="Last 7 days"
                        badgeText="+3"
                        badgeVariant="info"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Subscription Plans */}
            <SubscriptionPlans />
          </main>
        </div>
      </div>
    </>
  );
}