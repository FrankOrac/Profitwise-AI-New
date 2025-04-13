import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Basic",
    price: "9.99",
    description: "Essential trading tools and insights",
    features: [
      "Real-time market data",
      "Basic portfolio tracking",
      "Limited AI insights",
      "Email alerts"
    ]
  },
  {
    name: "Pro",
    price: "29.99",
    description: "Advanced features for serious traders",
    features: [
      "Everything in Basic",
      "Advanced AI insights",
      "Social trading features",
      "Priority support",
      "Custom alerts"
    ]
  },
  {
    name: "Enterprise",
    price: "99.99",
    description: "Full suite of professional tools",
    features: [
      "Everything in Pro",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Unlimited portfolios"
    ]
  }
];

export function SubscriptionPlans() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className="flex flex-col">
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-4">${plan.price}/mo</div>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-500 mr-2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.href = '/subscription'} className="w-full">
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
export default SubscriptionPlans;