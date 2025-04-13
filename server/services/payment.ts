
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
    const priceIds: Record<string, string> = {
      basic: process.env.STRIPE_BASIC_PRICE_ID!,
      pro: process.env.STRIPE_PRO_PRICE_ID!,
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!
    };
    return priceIds[plan];
  }
}

export const paymentService = new PaymentService();
