
import Stripe from 'stripe';
import { storage } from '../storage';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable. Please set it in the Secrets tab.');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
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
      basic: 'price_H5j6K8L9',
      pro: 'price_M3n4P5q6',
      enterprise: 'price_R7s8T9u0'
    };
    return priceIds[plan.toLowerCase()];
  }

  async createSubscription(userId: number, paymentMethodId: string, planId: string) {
    const user = await storage.getUser(userId);
    
    let customer = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId: string;
    
    if (customer.data.length === 0) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
        invoice_settings: { default_payment_method: paymentMethodId }
      });
      customerId = newCustomer.id;
    } else {
      customerId = customer.data[0].id;
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId }
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: this.getPriceId(planId) }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    await storage.updateUserSubscription(userId, planId);

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret
    };
  }

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const user = await storage.getUserByStripeCustomerId(invoice.customer as string);
          if (user) {
            await storage.updateUserSubscription(user.id, subscription.items.data[0].price.id);
          }
        }
        break;
        
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        const user = await storage.getUserByStripeCustomerId(subscription.customer as string);
        if (user) {
          await storage.updateUserSubscription(user.id, 'basic');
        }
        break;
    }
  }
}

export const paymentService = new PaymentService();
