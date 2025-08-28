import { db } from '../src/db';
import { orders } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
      
      if (session.payment_status === 'paid') {
        await db
          .update(orders)
          .set({
            status: 'confirmed',
            stripePaymentIntentId: typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent?.id,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));
        
        console.log(`✅ Order ${order.id}: PAID - Updated to confirmed`);
      } else if (session.status === 'expired') {
        await db
          .update(orders)
          .set({
            status: 'expired',
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));
        
        console.log(`⏰ Order ${order.id}: EXPIRED`);
      } else {
        console.log(`⏳ Order ${order.id}: Still pending (${session.payment_status})`);
      }
    } catch (error: any) {
      console.error(`❌ Order ${order.id}: Error - ${error.message}`);
    }
  }

  console.log('\nSync complete!');
  process.exit(0);
}

syncOrders().catch(console.error);