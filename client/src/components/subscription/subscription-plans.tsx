import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { SubscriptionPlan } from "@shared/schema";
import { cn } from "@/lib/utils";

export function SubscriptionPlans() {
  const { data: plans = [], isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscriptions"],
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Upgrade Your Financial Intelligence</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Unlock premium features and advanced AI insights to maximize your investment potential.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={cn(
                "border rounded-lg p-6 relative",
                plan.isPopular ? "border-2 border-primary-600" : "border-slate-200"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Free" && <span className="text-slate-500">/mo</span>}
                </div>
                <div className="text-sm text-slate-500 mt-1">{plan.description}</div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature: any, index: number) => (
                  <li key={index} className={cn(
                    "flex items-start",
                    !feature.included && "text-slate-400"
                  )}>
                    {feature.included ? (
                      <Check className="h-4 w-4 text-success mt-1 mr-2" />
                    ) : (
                      <X className="h-4 w-4 mt-1 mr-2" />
                    )}
                    <span className="text-sm">{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={plan.name === "Basic" ? "outline" : (plan.name === "Pro" ? "default" : "outline")}
                className="w-full"
                disabled={plan.name === "Basic"}
              >
                {plan.name === "Basic" ? "Current Plan" : 
                  plan.name === "Pro" ? "Upgrade Now" : "Contact Sales"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionPlans;
