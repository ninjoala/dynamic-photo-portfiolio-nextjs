import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isStripeTestMode } from '@/utils/stripe';
import { serverEnv, getWebhookSecret as getValidatedWebhookSecret } from '@/utils/env';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

/**
 * Validates and sanitizes shipping address from Stripe
 */
function validateShippingAddress(address: Stripe.Address | null | undefined): {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
} | undefined {
  if (!address) return undefined;

  // Stripe requires these fields for US addresses
  if (!address.line1 || !address.city || !address.state || !address.postal_code || !address.country) {
    console.warn('Incomplete shipping address from Stripe:', address);
    return undefined;
  }

  return {
    line1: address.line1,
    line2: address.line2 || undefined,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
  };
}

/**
 * Gets the appropriate webhook secret based on test vs live mode
 * Uses centralized env validation from @/utils/env
 */
function getWebhookSecret(): string {
  return getValidatedWebhookSecret();
}

/**
 * Type guard for Stripe Checkout Session
 */
function isCheckoutSession(object: unknown): object is Stripe.Checkout.Session {
  return typeof object === 'object' && object !== null && 'object' in object && (object as { object: string }).object === 'checkout.session';
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Validate required parameters before attempting verification
  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let webhookSecret: string;
  try {
    webhookSecret = getWebhookSecret();
  } catch (err) {
    console.error('Webhook secret configuration error:', err);
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  // Always verify webhook signature - NEVER skip this step
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (!db) {
      console.error('Database not available for webhook processing');
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Type guard to ensure we have a checkout session
        if (!isCheckoutSession(session)) {
          console.error('Invalid checkout session object received');
          return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
        }

        // Validate session ID exists
        if (!session.id) {
          console.error('Checkout session missing ID');
          return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
        }

        // Extract payment intent ID with proper typing
        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

        // Validate payment intent exists
        if (!paymentIntentId) {
          console.error('Checkout session missing payment_intent:', session.id);
          return NextResponse.json({ error: 'Missing payment intent' }, { status: 400 });
        }

        // Detect test mode from session ID
        const isTest = isStripeTestMode(session.id);

        // Validate and sanitize shipping address
        const shippingAddress = validateShippingAddress(session.customer_details?.address);

        // Use a database transaction to ensure atomicity
        const result = await db.transaction(async (tx) => {
          // First, check if order exists and hasn't already been confirmed
          const existingOrders = await tx
            .select()
            .from(orders)
            .where(eq(orders.stripeSessionId, session.id));

          if (existingOrders.length === 0) {
            console.error(`No orders found for session ${session.id}`);
            throw new Error('Order not found');
          }

          // Check for duplicate webhook processing (idempotency)
          const alreadyConfirmed = existingOrders.every(order => order.status === 'confirmed');
          if (alreadyConfirmed) {
            console.log(`Session ${session.id} already processed, skipping duplicate webhook`);
            return { skipped: true, orderCount: existingOrders.length };
          }

          // Update all orders for this session
          const updatedOrders = await tx
            .update(orders)
            .set({
              status: 'confirmed',
              stripePaymentIntentId: paymentIntentId,
              isTest,
              shippingAddress,
              updatedAt: new Date(),
            })
            .where(eq(orders.stripeSessionId, session.id))
            .returning();

          return { skipped: false, orderCount: updatedOrders.length };
        });

        if (result.skipped) {
          console.log(`Duplicate webhook for session ${session.id} - ${result.orderCount} orders already confirmed (${isTest ? 'TEST' : 'LIVE'} mode)`);
        } else {
          console.log(`${result.orderCount} order(s) for session ${session.id} marked as confirmed (${isTest ? 'TEST' : 'LIVE'} mode)`);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;

        // Type guard to ensure we have a checkout session
        if (!isCheckoutSession(session)) {
          console.error('Invalid checkout session object received');
          return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
        }

        // Validate session ID exists
        if (!session.id) {
          console.error('Checkout session missing ID');
          return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
        }

        // Use a database transaction for atomicity
        const result = await db.transaction(async (tx) => {
          // Check if orders exist
          const existingOrders = await tx
            .select()
            .from(orders)
            .where(eq(orders.stripeSessionId, session.id));

          if (existingOrders.length === 0) {
            console.warn(`No orders found for expired session ${session.id}`);
            return { orderCount: 0 };
          }

          // Update orders to cancelled
          const updatedOrders = await tx
            .update(orders)
            .set({
              status: 'cancelled',
              updatedAt: new Date(),
            })
            .where(eq(orders.stripeSessionId, session.id))
            .returning();

          return { orderCount: updatedOrders.length };
        });

        console.log(`${result.orderCount} order(s) for session ${session.id} marked as cancelled`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const err = error as Error;
    console.error('Error processing webhook:', {
      message: err.message,
      stack: err.stack,
      eventType: event?.type,
      eventId: event?.id,
    });
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
