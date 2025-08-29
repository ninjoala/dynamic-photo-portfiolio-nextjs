import { Metadata } from 'next';
import PreorderClient from './PreorderClient';
import { db } from '@/db';
import { shirts, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// Force dynamic rendering since we need live database data
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cougar Comeback Shirt - Preorder Now',
  description: 'Limited edition Cougar Comeback shirts. Secure yours with a preorder today!',
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

async function syncRecentPendingOrders() {
  try {
    // Get pending orders from the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.status, 'pending'));
    
    const recentOrders = pendingOrders.filter(o => 
      o.createdAt && new Date(o.createdAt) > oneDayAgo
    );
    
    // Sync recent orders with Stripe
    for (const order of recentOrders) {
      if (!order.stripeSessionId) continue;
      
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
          
          console.log(`Synced order ${order.id}: confirmed`);
        }
      } catch (error) {
        // If the session doesn't exist (404), mark the order as invalid/expired
        const stripeError = error as { statusCode?: number; code?: string; message?: string };
        if (stripeError?.statusCode === 404 || stripeError?.code === 'resource_missing') {
          await db
            .update(orders)
            .set({
              status: 'invalid',
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));
          
          console.log(`Marked order ${order.id} as invalid (session not found)`);
        } else {
          // For other errors, log but don't break the page load
          console.error(`Failed to sync order ${order.id}:`, stripeError.message || stripeError);
        }
      }
    }
  } catch (error) {
    console.error('Error syncing pending orders:', error);
  }
}

async function getActiveShirts() {
  try {
    // Skip if database is not available (e.g., during build)
    if (!db) {
      console.log('Database not available, returning empty shirt list');
      return [];
    }
    
    const activeShirts = await db
      .select()
      .from(shirts)
      .where(eq(shirts.active, true));
    return activeShirts;
  } catch (error) {
    console.error('Error fetching shirts:', error);
    return [];
  }
}

export default async function CougarComebackShirtPage() {
  // Sync recent pending orders in the background (non-blocking)
  syncRecentPendingOrders();
  
  const availableShirts = await getActiveShirts();

  return (
    <div className="min-h-screen bg-gray-50">
      <PreorderClient shirts={availableShirts} />
    </div>
  );
}