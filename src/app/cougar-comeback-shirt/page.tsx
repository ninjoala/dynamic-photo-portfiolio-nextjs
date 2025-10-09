import { Metadata } from 'next';
import Link from 'next/link';
// Unused imports commented out since sale is concluded
// import PreorderClient from './PreorderClient';
// import { db } from '@/db';
// import { shirts, orders } from '@/db/schema';
// import { eq } from 'drizzle-orm';
// import Stripe from 'stripe';

// Force dynamic rendering since we need live database data
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cougar Comeback Shirt - Preorder Now',
  description: 'Limited edition Cougar Comeback shirts. Secure yours with a preorder today!',
};

// Disabled functions - sale concluded
/*
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
*/

export default async function CougarComebackShirtPage() {
  // Sale has concluded - show thank you message instead
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Sale Concluded
        </h1>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-xl text-gray-700 mb-4">
            This sale has concluded. Thank you for supporting Nick Dobos Media!
          </p>
          <p className="text-gray-600">
            We appreciate everyone who participated in this limited edition shirt sale.
            Stay tuned for future merchandise opportunities!
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}