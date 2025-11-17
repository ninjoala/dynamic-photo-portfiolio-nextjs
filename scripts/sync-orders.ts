import { db } from '../src/db';
import { orders } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { isStripeTestMode } from '../src/utils/stripe';
import { serverEnv } from '../src/utils/env';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

async function syncOrders() {
  if (!db) {
    console.error('❌ Database connection not available');
    process.exit(1);
  }
  
  console.log('Fetching all pending orders...');
  
  const pendingOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.status, 'pending'));

  console.log(`Found ${pendingOrders.length} pending orders`);

  for (const order of pendingOrders) {
    if (!order.stripeSessionId) {
      console.log(`Order ${order.id}: No Stripe session ID`);
      continue;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

      // Extract payment intent ID
      const paymentIntentId = typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

      // Detect test mode from session ID
      const isTest = isStripeTestMode(session.id);

      if (session.payment_status === 'paid') {
        await db
          .update(orders)
          .set({
            status: 'confirmed',
            stripePaymentIntentId: paymentIntentId,
            isTest,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));

        console.log(`✅ Order ${order.id}: PAID - Updated to confirmed (${isTest ? 'TEST' : 'LIVE'})`);
      } else if (session.status === 'expired') {
        await db
          .update(orders)
          .set({
            status: 'expired',
            isTest,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));

        console.log(`⏰ Order ${order.id}: EXPIRED (${isTest ? 'TEST' : 'LIVE'})`);
      } else {
        console.log(`⏳ Order ${order.id}: Still pending (${session.payment_status}) - ${isTest ? 'TEST' : 'LIVE'} mode`);
      }
    } catch (error: any) {
      console.error(`❌ Order ${order.id}: Error - ${error.message}`);
    }
  }

  console.log('\nSync complete!');
  process.exit(0);
}

syncOrders().catch(console.error);