import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { shirts, photoPackages, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isStripeTestMode } from '@/utils/stripe';
import { serverEnv } from '@/utils/env';
import crypto from 'crypto';

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

// TypeScript interfaces for type safety
interface StudentInfo {
  studentFirstName?: string;
  studentLastName?: string;
  teacher?: string;
  school?: string;
  parentFirstName?: string;
  parentLastName?: string;
}

interface CartItem {
  productType: 'shirt' | 'photo_package';
  productId: number;
  shirtId?: number; // Legacy support
  quantity: number;
  size?: string; // For shirts
  price?: string; // Client-provided price (will be verified)
}

interface OrderItemMetadata {
  productType: 'shirt' | 'photo_package';
  productId: number;
  productOptions: Record<string, unknown>;
  quantity: number;
  price: string;
  name: string;
}

interface CheckoutRequestBody {
  // Cart checkout
  items?: CartItem[];
  // Single item checkout (legacy)
  productType?: 'shirt' | 'photo_package';
  productId?: number;
  shirtId?: number; // Legacy
  size?: string;
  quantity?: number;
  // Customer info
  email?: string;
  name?: string;
  phone?: string;
  // Student info (for photo packages)
  studentFirstName?: string;
  studentLastName?: string;
  teacher?: string;
  school?: string;
  parentFirstName?: string;
  parentLastName?: string;
}

// Constants for validation
const MAX_QUANTITY_PER_ITEM = 100;
const MAX_CART_ITEMS = 50;

/**
 * Generates a stable idempotency key based on cart contents
 * This prevents duplicate checkout sessions from being created for the same cart
 */
function generateIdempotencyKey(items: CartItem[], email: string): string {
  // Sort items to ensure consistent hash regardless of order
  const sortedItems = [...items].sort((a, b) => {
    if (a.productType !== b.productType) {
      return a.productType.localeCompare(b.productType);
    }
    return a.productId - b.productId;
  });

  // Create a stable string representation of the cart
  const cartString = sortedItems
    .map(item => `${item.productType}:${item.productId}:${item.quantity}:${item.size || ''}`)
    .join('|');

  // Add email and timestamp (rounded to 5 minutes) to allow retries after some time
  const timestamp = Math.floor(Date.now() / (5 * 60 * 1000)); // 5-minute window
  const hashInput = `${cartString}|${email}|${timestamp}`;

  // Generate SHA-256 hash
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 16);

  return `checkout-${hash}-${timestamp}`;
}

/**
 * Validates cart items and quantities
 */
function validateCartItems(items: CartItem[]): { valid: boolean; error?: string } {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return { valid: false, error: 'Cart is empty. Please add items before checkout.' };
  }

  if (items.length > MAX_CART_ITEMS) {
    return { valid: false, error: `Cart cannot contain more than ${MAX_CART_ITEMS} items.` };
  }

  for (const item of items) {
    if (!item.productType || !['shirt', 'photo_package'].includes(item.productType)) {
      return { valid: false, error: 'Invalid product type in cart.' };
    }

    if (!item.productId && !item.shirtId) {
      return { valid: false, error: 'Missing product ID in cart item.' };
    }

    if (!item.quantity || item.quantity < 1) {
      return { valid: false, error: 'Invalid quantity in cart. Quantity must be at least 1.' };
    }

    if (item.quantity > MAX_QUANTITY_PER_ITEM) {
      return { valid: false, error: `Quantity cannot exceed ${MAX_QUANTITY_PER_ITEM} per item.` };
    }

    if (item.productType === 'shirt' && !item.size) {
      return { valid: false, error: 'Shirt size is required.' };
    }
  }

  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available. Please try again later.' },
        { status: 503 }
      );
    }

    const body = await request.json() as CheckoutRequestBody;

    // Check if it's a multi-item cart checkout or single item
    const isCartCheckout = body.items && Array.isArray(body.items);

    // Normalize to array format for consistent processing
    let items: CartItem[];
    if (isCartCheckout) {
      items = body.items!;
    } else {
      // Convert single item to array format
      const productType = body.productType || 'shirt';
      items = [{
        productType,
        productId: body.productId || body.shirtId || 0,
        shirtId: body.shirtId,
        quantity: body.quantity || 1,
        size: body.size,
      }];
    }

    // Validate cart items
    const validation = validateCartItems(items);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Extract customer info
    const customerEmail = body.email || '';
    const customerName = body.name || '';
    const customerPhone = body.phone || '';

    // Validate customer email
    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    // Extract student and parent info from body level (for photo packages)
    const studentInfo: StudentInfo = {
      studentFirstName: body.studentFirstName,
      studentLastName: body.studentLastName,
      teacher: body.teacher,
      school: body.school,
      parentFirstName: body.parentFirstName,
      parentLastName: body.parentLastName,
    };

    // Generate idempotency key to prevent duplicate submissions
    const idempotencyKey = generateIdempotencyKey(items, customerEmail);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: OrderItemMetadata[] = [];

    // Process each cart item and verify prices against database
    for (const item of items) {
      const productType = item.productType;
      const productId = item.productId || item.shirtId || 0;

      if (productType === 'shirt') {
        const [shirt] = await db
          .select()
          .from(shirts)
          .where(eq(shirts.id, productId))
          .limit(1);

        if (!shirt) {
          return NextResponse.json(
            { error: `Shirt with ID ${productId} not found. Please refresh and try again.` },
            { status: 404 }
          );
        }

        if (!shirt.active) {
          return NextResponse.json(
            { error: `"${shirt.name}" is no longer available.` },
            { status: 400 }
          );
        }

        // CRITICAL: Use database price, not client-provided price
        // This prevents price manipulation attacks
        const databasePrice = parseFloat(shirt.price);
        const priceInCents = Math.round(databasePrice * 100);

        // Validate size is available
        const availableSizes = shirt.sizes || [];
        if (item.size && !availableSizes.includes(item.size)) {
          return NextResponse.json(
            { error: `Size "${item.size}" is not available for "${shirt.name}".` },
            { status: 400 }
          );
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${shirt.name} - Size ${item.size}`,
              description: shirt.description || undefined,
              images: shirt.images?.length ? [shirt.images[0]] : undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: item.quantity,
        });

        orderItems.push({
          productType: 'shirt',
          productId: shirt.id,
          productOptions: { size: item.size },
          quantity: item.quantity,
          price: shirt.price,
          name: shirt.name
        });

      } else if (productType === 'photo_package') {
        const [photoPackage] = await db
          .select()
          .from(photoPackages)
          .where(eq(photoPackages.id, productId))
          .limit(1);

        if (!photoPackage) {
          return NextResponse.json(
            { error: `Photo package with ID ${productId} not found. Please refresh and try again.` },
            { status: 404 }
          );
        }

        if (!photoPackage.active) {
          return NextResponse.json(
            { error: `Photo package "${photoPackage.name}" is no longer available.` },
            { status: 400 }
          );
        }

        // CRITICAL: Use database price, not client-provided price
        // This prevents price manipulation attacks
        const databasePrice = parseFloat(photoPackage.price);
        const priceInCents = Math.round(databasePrice * 100);

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: photoPackage.name,
              description: photoPackage.description || undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: item.quantity,
        });

        orderItems.push({
          productType: 'photo_package',
          productId: photoPackage.id,
          productOptions: {
            ...studentInfo,
          },
          quantity: item.quantity,
          price: photoPackage.price,
          name: photoPackage.name
        });
      }
    }

    // Validate we have items to checkout
    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid items to checkout. Please add items to your cart.' },
        { status: 400 }
      );
    }

    // Get base URL with robust fallback logic
    const getBaseUrl = () => {
      // First priority: explicitly set base URL
      if (serverEnv.NEXT_PUBLIC_BASE_URL) {
        return serverEnv.NEXT_PUBLIC_BASE_URL;
      }

      // Second priority: Vercel environment variables
      if (serverEnv.VERCEL_URL) {
        return `https://${serverEnv.VERCEL_URL}`;
      }
      if (serverEnv.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${serverEnv.NEXT_PUBLIC_VERCEL_URL}`;
      }

      // Third priority: request headers
      const origin = request.headers.get('origin');
      if (origin) {
        return origin;
      }

      const host = request.headers.get('host');
      if (host) {
        // Determine protocol based on host or default to https for production
        const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
        return `${protocol}://${host}`;
      }

      // Fallback for development
      return 'http://localhost:3000';
    };

    const baseUrl = getBaseUrl();

    console.log('Environment variables:', {
      NEXT_PUBLIC_BASE_URL: serverEnv.NEXT_PUBLIC_BASE_URL,
      VERCEL_URL: serverEnv.VERCEL_URL,
      NEXT_PUBLIC_VERCEL_URL: serverEnv.NEXT_PUBLIC_VERCEL_URL,
      origin: request.headers.get('origin'),
      host: request.headers.get('host'),
    });
    console.log('Using base URL:', baseUrl);
    console.log('Idempotency key:', idempotencyKey);

    // Create Stripe checkout session with idempotency key
    // This prevents duplicate session creation if the user double-clicks or the request is retried
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      customer_email: customerEmail,
      shipping_address_collection: orderItems.some(item => item.productType === 'shirt') ? {
        allowed_countries: ['US'],
      } : undefined, // Only require shipping for physical products (shirts)
      metadata: {
        customerName: customerName,
        itemCount: orderItems.length.toString(),
        orderType: isCartCheckout ? 'cart' : 'single',
        idempotencyKey: idempotencyKey,
      },
      // Phone number collection for easier customer support
      phone_number_collection: {
        enabled: true,
      },
    }, {
      // Stripe idempotency key prevents duplicate session creation
      idempotencyKey: idempotencyKey,
    });

    // Detect if this is a test mode transaction
    const isTest = isStripeTestMode(session.id);

    // Insert multiple order records (one for each cart item)
    // These are in "pending" state until the webhook confirms payment
    for (const item of orderItems) {
      await db
        .insert(orders)
        .values({
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          // Legacy fields for backward compatibility
          shirtId: item.productType === 'shirt' ? item.productId : null,
          size: item.productType === 'shirt' ? (item.productOptions.size as string) : null,
          // New polymorphic fields
          orderType: item.productType,
          productId: item.productId,
          productOptions: item.productOptions,
          quantity: item.quantity,
          totalAmount: (parseFloat(item.price) * item.quantity).toFixed(2),
          stripeSessionId: session.id,
          status: 'pending',
          isTest, // Automatically detected from Stripe session ID
        });
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);

    // More detailed error handling for better debugging
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', {
        type: error.type,
        code: error.code,
        message: error.message,
      });

      // Handle specific Stripe errors
      if (error.type === 'StripeCardError') {
        return NextResponse.json(
          { error: 'Payment method error. Please check your card details.' },
          { status: 400 }
        );
      }

      if (error.type === 'StripeRateLimitError') {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      if (error.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { error: 'Invalid request. Please refresh the page and try again.' },
          { status: 400 }
        );
      }

      // Generic Stripe error
      return NextResponse.json(
        { error: 'Payment processing error. Please try again.' },
        { status: 500 }
      );
    }

    // Generic error for non-Stripe errors
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
