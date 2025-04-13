
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function PaymentForm({ planId }: { planId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const { mutate: createSubscription, isPending } = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements) {
        throw new Error("Stripe not initialized");
      }

      const card = elements.getElement(CardElement);
      if (!card) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      const response = await apiRequest("POST", "/api/subscriptions", {
        paymentMethodId: paymentMethod.id,
        planId,
      });

      const { clientSecret } = await response.json();

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);
      if (confirmError) {
        throw new Error(confirmError.message);
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-md p-3">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button 
            className="w-full" 
            disabled={!stripe || isPending}
            onClick={() => createSubscription()}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Subscribe Now"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentForm;
