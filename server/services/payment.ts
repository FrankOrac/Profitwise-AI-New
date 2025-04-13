
import Stripe from 'stripe';
import { storage } from '../storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class PaymentService {
  async createCheckoutSession(userId: number, plan: string) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: await this.getUserEmail(userId),
      line_items: [{
        price: this.getPriceId(plan),
        quantity: 1,
      }],
      success_url: `${process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL}/subscription`,
    });

    return session;
  }

  private async getUserEmail(userId: number) {
    const user = await storage.getUser(userId);
    return user.email;
  }

  private getPriceId(plan: string): string {
    // Replace these IDs with your actual Stripe price IDs
    const priceIds: Record<string, string> = {
      basic: 'price_H5j6K8L9',      // Basic plan price ID
      pro: 'price_M3n4P5q6',        // Pro plan price ID  
      enterprise: 'price_R7s8T9u0'   // Enterprise plan price ID
    };
    return priceIds[plan.toLowerCase()];
  }
}

export const paymentService = new PaymentService();
