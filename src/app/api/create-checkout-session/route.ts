import { NextRequest, NextResponse } from 'next/server';
// Unused imports commented out since sale is concluded
// import Stripe from 'stripe';
// import { db } from '@/db';
// import { shirts, orders } from '@/db/schema';
// import { eq } from 'drizzle-orm';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-07-30.basil',
// });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  // Sale has concluded - disable all new orders
  return NextResponse.json(
    { error: 'This sale has concluded. Thank you for your interest!' },
    { status: 410 } // 410 Gone - indicates the resource is no longer available
  );
}

// Original implementation commented out below
/*
import Stripe from 'stripe';
import { db } from '@/db';
import { shirts, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST_DISABLED(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const body = await request.json();

    // Check if it's a multi-item cart checkout or single item
    const isCartCheckout = body.items && Array.isArray(body.items);
    
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: {
          name: string;
          description?: string;
          images?: string[];
        };
        unit_amount: number;
      };
      quantity: number;
    }> = [];
    const orderItems: Array<{
      shirtId: number;
      size: string;
      quantity: number;
      price: string;
      name: string;
    }> = [];
    let customerEmail = body.email || '';
    let customerName = body.name || '';
    let customerPhone = body.phone || '';
    
    if (isCartCheckout) {
      // Handle multiple cart items
      for (const item of body.items) {
        const [shirt] = await db
          .select()
          .from(shirts)
          .where(eq(shirts.id, item.shirtId))
          .limit(1);
        
        if (!shirt) {
          return NextResponse.json({ error: `Shirt with ID ${item.shirtId} not found` }, { status: 404 });
        }
        
        // Calculate item total for this specific item (used for individual order records)

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${shirt.name} - Size ${item.size}`,
              description: shirt.description || undefined,
              images: shirt.images?.length ? [shirt.images[0]] : undefined,
            },
            unit_amount: Math.round(parseFloat(shirt.price) * 100),
          },
          quantity: item.quantity,
        });
        
        orderItems.push({
          shirtId: item.shirtId,
          size: item.size,
          quantity: item.quantity,
          price: shirt.price,
          name: shirt.name
        });
      }
    } else {
      // Handle single item (backward compatibility)
      const { shirtId, size, quantity } = body;
      customerEmail = body.email;
      customerName = body.name;
      customerPhone = body.phone;
      
      const [shirt] = await db
        .select()
        .from(shirts)
        .where(eq(shirts.id, shirtId))
        .limit(1);

      if (!shirt) {
        return NextResponse.json({ error: 'Shirt not found' }, { status: 404 });
      }

      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${shirt.name} - Size ${size}`,
            description: shirt.description || undefined,
            images: shirt.images?.length ? [shirt.images[0]] : undefined,
          },
          unit_amount: Math.round(parseFloat(shirt.price) * 100),
        },
        quantity,
      });
      
      orderItems.push({
        shirtId,
        size,
        quantity,
        price: shirt.price,
        name: shirt.name
      });
    }

    // Get base URL with robust fallback logic
    const getBaseUrl = () => {
      // First priority: explicitly set base URL
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
      }

      // Second priority: Vercel environment variables
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
      }
      if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
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
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
      origin: request.headers.get('origin'),
      host: request.headers.get('host'),
    });
    console.log('Using base URL:', baseUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/cougar-comeback-shirt/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cougar-comeback-shirt`,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        customerName: customerName,
        itemCount: orderItems.length.toString(),
        orderType: isCartCheckout ? 'cart' : 'single'
      },
    });

    // Insert multiple order records (one for each cart item)
    for (const item of orderItems) {
      await db
        .insert(orders)
        .values({
          email: customerEmail,
          name: customerName,
          phone: customerPhone,
          shirtId: item.shirtId,
          size: item.size,
          quantity: item.quantity,
          totalAmount: (parseFloat(item.price) * item.quantity).toFixed(2),
          stripeSessionId: session.id,
          status: 'pending',
        });
    }

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
*/