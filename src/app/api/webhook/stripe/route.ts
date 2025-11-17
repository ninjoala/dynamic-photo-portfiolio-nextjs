import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isStripeTestMode } from '@/utils/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Validate required parameters before attempting verification
  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (!db) {
      console.error('Database not available for webhook processing');
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract payment intent ID
        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

        // Detect test mode from session ID
        const isTest = isStripeTestMode(session.id);

        await db
          .update(orders)
          .set({
            status: 'confirmed',
            stripePaymentIntentId: paymentIntentId,
            isTest, // Update the test flag based on session detection
            shippingAddress: session.customer_details?.address ? {
              line1: session.customer_details.address.line1!,
              line2: session.customer_details.address.line2 || undefined,
              city: session.customer_details.address.city!,
              state: session.customer_details.address.state!,
              postalCode: session.customer_details.address.postal_code!,
              country: session.customer_details.address.country!,
            } : undefined,
            updatedAt: new Date(),
          })
          .where(eq(orders.stripeSessionId, session.id));

        console.log(`Order ${session.id} marked as confirmed (${isTest ? 'TEST' : 'LIVE'} mode)`);
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        
        await db
          .update(orders)
          .set({
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(eq(orders.stripeSessionId, expiredSession.id));
        
        console.log(`Order ${expiredSession.id} marked as cancelled`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}