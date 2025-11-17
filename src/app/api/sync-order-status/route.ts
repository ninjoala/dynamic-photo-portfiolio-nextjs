import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isStripeTestMode } from '@/utils/stripe';
import { serverEnv } from '@/utils/env';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    let orderId: number | undefined;
    let sessionId: string | undefined;

    try {
      const body = await request.json();
      orderId = body.orderId;
      sessionId = body.sessionId;
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    // Validate input parameters
    if (!orderId && !sessionId) {
      return NextResponse.json({
        error: 'Missing required parameter: orderId or sessionId'
      }, { status: 400 });
    }

    if (orderId !== undefined && (typeof orderId !== 'number' || orderId <= 0)) {
      return NextResponse.json({
        error: 'Invalid orderId: must be a positive number'
      }, { status: 400 });
    }

    if (sessionId !== undefined) {
      if (typeof sessionId !== 'string') {
        return NextResponse.json({
          error: 'Invalid sessionId: must be a string'
        }, { status: 400 });
      }

      // Validate Stripe session ID format: cs_test_xxx or cs_live_xxx
      if (!/^cs_(test|live)_[a-zA-Z0-9]+$/.test(sessionId)) {
        return NextResponse.json({
          error: 'Invalid sessionId format: must match cs_test_* or cs_live_*'
        }, { status: 400 });
      }
    }

    // Get the order from database
    const [order] = await db
      .select()
      .from(orders)
      .where(sessionId ? eq(orders.stripeSessionId, sessionId) : eq(orders.id, orderId!))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.stripeSessionId) {
      return NextResponse.json({ 
        error: 'Order has no Stripe session ID',
        order: { id: order.id, status: order.status }
      }, { status: 400 });
    }

    // Fetch the session from Stripe
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId, {
        expand: ['payment_intent', 'line_items'],
      });

      // Determine the actual payment status
      let newStatus = order.status;
      let paymentIntentId = null;
      let shippingAddress = order.shippingAddress;

      if (session.payment_status === 'paid') {
        newStatus = 'confirmed';
        paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;

        // Update shipping address if available (using customer_details which has shipping info)
        if (session.customer_details?.address) {
          shippingAddress = {
            line1: session.customer_details.address.line1!,
            line2: session.customer_details.address.line2 || undefined,
            city: session.customer_details.address.city!,
            state: session.customer_details.address.state!,
            postalCode: session.customer_details.address.postal_code!,
            country: session.customer_details.address.country!,
          };
        }
      } else if (session.payment_status === 'unpaid' && session.status === 'expired') {
        newStatus = 'expired';
      } else if (session.payment_status === 'unpaid' && session.status === 'open') {
        newStatus = 'pending';
      }

      // Detect test mode from session ID
      const isTest = isStripeTestMode(session.id);

      // Update the order in the database
      const [updatedOrder] = await db
        .update(orders)
        .set({
          status: newStatus,
          stripePaymentIntentId: paymentIntentId,
          isTest,
          shippingAddress,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id))
        .returning();

      return NextResponse.json({
        order: updatedOrder,
        stripeSession: {
          id: session.id,
          paymentStatus: session.payment_status,
          status: session.status,
          amountTotal: session.amount_total ? session.amount_total / 100 : null,
        },
        synced: true,
        statusChanged: order.status !== newStatus,
      });

    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      
      // If session not found in Stripe, mark as invalid
      if ((stripeError as {code?: string}).code === 'resource_missing') {
        await db
          .update(orders)
          .set({
            status: 'invalid',
            updatedAt: new Date(),
          })
          .where(eq(orders.id, order.id));

        return NextResponse.json({
          error: 'Session not found in Stripe',
          order: { id: order.id, status: 'invalid' },
        }, { status: 404 });
      }

      throw stripeError;
    }

  } catch (error) {
    console.error('Error syncing order status:', error);
    return NextResponse.json(
      { error: 'Failed to sync order status' },
      { status: 500 }
    );
  }
}

// GET endpoint to sync all pending orders
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }
    
    // const searchParams = request.nextUrl.searchParams;
    // const syncAll = searchParams.get('all') === 'true';

    // Get all pending orders
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.status, 'pending'));

    const results = [];

    for (const order of pendingOrders) {
      if (!order.stripeSessionId) {
        results.push({
          orderId: order.id,
          status: 'skipped',
          reason: 'No Stripe session ID',
        });
        continue;
      }

      try {
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

        let newStatus = 'pending';
        let paymentIntentId = null;

        if (session.payment_status === 'paid') {
          newStatus = 'confirmed';
          paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
        } else if (session.status === 'expired') {
          newStatus = 'expired';
        }

        // Detect test mode from session ID
        const isTest = isStripeTestMode(session.id);

        if (newStatus !== order.status) {
          await db
            .update(orders)
            .set({
              status: newStatus,
              stripePaymentIntentId: paymentIntentId,
              isTest,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));

          results.push({
            orderId: order.id,
            previousStatus: order.status,
            newStatus,
            isTest,
            synced: true,
          });
        } else {
          results.push({
            orderId: order.id,
            status: order.status,
            isTest,
            synced: false,
            reason: 'Status unchanged',
          });
        }
      } catch (error) {
        results.push({
          orderId: order.id,
          status: 'error',
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json({
      pendingOrdersCount: pendingOrders.length,
      syncedCount: results.filter(r => r.synced).length,
      results,
    });

  } catch (error) {
    console.error('Error syncing pending orders:', error);
    return NextResponse.json(
      { error: 'Failed to sync pending orders' },
      { status: 500 }
    );
  }
}