import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { orders, shirts, photoPackages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isStripeTestMode } from '@/utils/stripe';
import { serverEnv, getWebhookSecret as getValidatedWebhookSecret } from '@/utils/env';
import * as postmark from 'postmark';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

// Initialize Postmark client for order confirmation emails
const postmarkClient = process.env.POSTMARK_API_TOKEN
  ? new postmark.Client(process.env.POSTMARK_API_TOKEN)
  : null;

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

/**
 * Sends order confirmation email to customer
 * This function is called within the database transaction to ensure atomicity
 */
async function sendOrderConfirmationEmail(
  orderData: {
    id: number;
    email: string;
    name: string;
    orderType: string;
    productName: string;
    quantity: number;
    totalAmount: string;
    productDetails: Record<string, unknown>;
  }[],
  sessionId: string,
  isTest: boolean
): Promise<void> {
  if (!postmarkClient) {
    console.warn('Postmark not configured, skipping order confirmation email');
    return;
  }

  try {
    const firstOrder = orderData[0];
    const grandTotal = orderData.reduce((sum, order) =>
      sum + parseFloat(order.totalAmount), 0
    ).toFixed(2);

    const itemsHtml = orderData.map(order => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${order.productName}</strong>
          ${order.orderType === 'shirt' ? `<br/>Size: ${order.productDetails.size || 'N/A'}` : ''}
          ${order.orderType === 'photo_package' && order.productDetails.eventDate ?
            `<br/>Event Date: ${order.productDetails.eventDate}` : ''}
          ${order.orderType === 'photo_package' && order.productDetails.eventLocation ?
            `<br/>Location: ${order.productDetails.eventLocation}` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${order.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          $${parseFloat(order.totalAmount).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const testModeNotice = isTest ? `
      <div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <strong>⚠️ TEST MODE ORDER</strong><br/>
        This is a test order. No actual payment was processed.
      </div>
    ` : '';

    await postmarkClient.sendEmail({
      From: 'nick@nickdobosmedia.com',
      To: firstOrder.email,
      Subject: `${isTest ? '[TEST] ' : ''}Order Confirmation - Nick Dobos Media`,
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Confirmation</h2>
          ${testModeNotice}
          <p>Hi ${firstOrder.name},</p>
          <p>Thank you for your order! We've received your payment and will process your order shortly.</p>

          <h3 style="color: #555; margin-top: 30px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">
                  Total:
                </td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;">
                  $${grandTotal}
                </td>
              </tr>
            </tbody>
          </table>

          <p style="margin-top: 30px; color: #666;">
            We'll send you another email when your order ships. If you have any questions,
            please don't hesitate to contact us at nick@nickdobosmedia.com.
          </p>

          <p style="margin-top: 20px; color: #999; font-size: 12px;">
            Order Reference: ${sessionId}
          </p>
        </div>
      `,
      TextBody: `
        Order Confirmation - Nick Dobos Media
        ${isTest ? '\n*** TEST MODE ORDER - No actual payment processed ***\n' : ''}

        Hi ${firstOrder.name},

        Thank you for your order! We've received your payment and will process your order shortly.

        Order Details:
        ${orderData.map(order => `
        - ${order.productName}
          Quantity: ${order.quantity}
          Price: $${parseFloat(order.totalAmount).toFixed(2)}
        `).join('\n')}

        Total: $${grandTotal}

        We'll send you another email when your order ships.

        Order Reference: ${sessionId}
      `,
      MessageStream: 'outbound'
    });

    console.log(`Order confirmation email sent to ${firstOrder.email} (${isTest ? 'TEST' : 'LIVE'} mode)`);
  } catch (error) {
    // Don't throw - we want the transaction to succeed even if email fails
    // Email failures should not prevent order confirmation
    console.error('Failed to send order confirmation email:', error);
    throw error; // Re-throw to rollback transaction - email is critical
  }
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

        // Use a database transaction to ensure atomicity and prevent race conditions
        // All database updates and email sending must happen within this transaction
        let result;
        try {
          result = await db.transaction(async (tx) => {
            // IDEMPOTENCY CHECK: Fetch existing orders first
            const existingOrders = await tx
              .select()
              .from(orders)
              .where(eq(orders.stripeSessionId, session.id));

            if (existingOrders.length === 0) {
              console.error(`[WEBHOOK ERROR] No orders found for session ${session.id}`);
              throw new Error('Order not found');
            }

            // CRITICAL IDEMPOTENCY: Check if ALL orders are already confirmed
            // This prevents duplicate processing when Stripe retries webhooks
            const alreadyConfirmed = existingOrders.every(order => order.status === 'confirmed');
            if (alreadyConfirmed) {
              console.log(`[WEBHOOK IDEMPOTENT] Session ${session.id} already fully processed, skipping`);
              return { skipped: true, orderCount: existingOrders.length };
            }

            // Update ONLY pending orders to confirmed (idempotent update)
            // This ensures we don't re-update already confirmed orders
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

            // Fetch product details for email within the same transaction
            const orderDataForEmail = await Promise.all(
              updatedOrders.map(async (order) => {
                let productName = 'Unknown Product';
                let productDetails: Record<string, unknown> = {};

                if (order.orderType === 'shirt') {
                  const [shirt] = await tx
                    .select()
                    .from(shirts)
                    .where(eq(shirts.id, order.productId))
                    .limit(1);

                  if (shirt) {
                    productName = shirt.name;
                    productDetails = {
                      size: order.productOptions?.size || order.size,
                      description: shirt.description,
                    };
                  }
                } else if (order.orderType === 'photo_package') {
                  const [photoPackage] = await tx
                    .select()
                    .from(photoPackages)
                    .where(eq(photoPackages.id, order.productId))
                    .limit(1);

                  if (photoPackage) {
                    productName = photoPackage.name;
                    productDetails = {
                      category: photoPackage.category,
                      description: photoPackage.description,
                      eventDate: order.productOptions?.eventDate,
                      eventLocation: order.productOptions?.eventLocation,
                      eventType: order.productOptions?.eventType,
                      additionalDetails: order.productOptions?.additionalDetails,
                      studentFirstName: order.productOptions?.studentFirstName,
                      studentLastName: order.productOptions?.studentLastName,
                      teacher: order.productOptions?.teacher,
                      school: order.productOptions?.school,
                      parentFirstName: order.productOptions?.parentFirstName,
                      parentLastName: order.productOptions?.parentLastName,
                    };
                  }
                }

                return {
                  id: order.id,
                  email: order.email,
                  name: order.name,
                  orderType: order.orderType,
                  productName,
                  quantity: order.quantity,
                  totalAmount: order.totalAmount,
                  productDetails,
                };
              })
            );

            // Send confirmation email within transaction
            // If email fails, transaction will rollback
            await sendOrderConfirmationEmail(orderDataForEmail, session.id, isTest);

            return { skipped: false, orderCount: updatedOrders.length };
          });
        } catch (transactionError) {
          // Transaction failed - all changes were rolled back automatically
          const err = transactionError as Error;
          console.error(`[WEBHOOK TRANSACTION FAILED] Session ${session.id}:`, {
            message: err.message,
            stack: err.stack,
          });
          // Re-throw to trigger Stripe retry mechanism
          throw new Error(`Transaction failed: ${err.message}`);
        }

        if (result.skipped) {
          console.log(`[WEBHOOK IDEMPOTENT] Session ${session.id} - ${result.orderCount} orders already confirmed, skipped duplicate processing (${isTest ? 'TEST' : 'LIVE'} mode)`);
        } else {
          console.log(`[WEBHOOK SUCCESS] Session ${session.id} - ${result.orderCount} order(s) confirmed and email sent (${isTest ? 'TEST' : 'LIVE'} mode)`);
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
