
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from "@/hooks/use-toast";

export function PaymentForm({ plan }: { plan: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      
      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.STRIPE_PUBLIC_KEY!);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" placeholder="Card Number" required />
          <div className="grid grid-cols-3 gap-4">
            <Input type="text" placeholder="MM/YY" required />
            <Input type="text" placeholder="CVC" required />
            <Input type="text" placeholder="ZIP" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : "Subscribe Now"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
