import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionPlan } from "@shared/schema";
import { Helmet } from "react-helmet-async";

export default function SubscriptionPage() {
  const { user } = useAuth();
  
  const { data: subscriptionPlans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscriptions"],
  });

  return (
    <>
      <Helmet>
        <title>Subscription Plans | ProfitWise AI</title>
      </Helmet>
      <div className="flex h-screen bg-slate-50">
        <MobileSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Choose the plan that works best for you and upgrade your investment experience with powerful AI-driven insights.
                </p>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans?.map((plan) => {
                    const isCurrentPlan = user?.subscriptionTier === plan.name.toLowerCase();
                    const isPro = plan.name === "Pro";
                    const features = typeof plan.features === 'string' 
                      ? JSON.parse(plan.features as string) 
                      : plan.features;
                    
                    return (
                      <Card key={plan.id} className={`relative ${isPro ? 'border-primary-500 shadow-lg' : ''}`}>
                        {plan.isPopular && (
                          <div className="absolute -top-3 left-0 right-0 flex justify-center">
                            <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                              <Crown className="h-3 w-3" />
                              MOST POPULAR
                            </span>
                          </div>
                        )}
                        <CardHeader>
                          <CardTitle className={isPro ? "text-primary-600" : ""}>{plan.name}</CardTitle>
                          <CardDescription>{plan.description}</CardDescription>
                          <div className="mt-2">
                            <span className={`text-2xl font-bold ${isPro ? "text-primary-600" : ""}`}>{plan.price}</span>
                            {plan.name !== "Basic" && <span className="text-slate-500">/mo</span>}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ul className="space-y-2">
                            {Array.isArray(features) && features.map((feature, i) => (
                              <li key={i} className="flex gap-2">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            variant={isPro ? "default" : "outline"}
                            disabled={isCurrentPlan}
                          >
                            {isCurrentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              <div className="mt-12 bg-slate-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Enterprise Solutions</h2>
                <p className="text-slate-600 mb-4">
                  Need a custom solution for your organization? Contact us for a tailored approach to your investment needs.
                </p>
                <Button variant="outline">Contact Sales</Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}