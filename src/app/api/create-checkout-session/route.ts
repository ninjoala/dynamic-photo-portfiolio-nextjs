import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { shirts, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }
    
    const { shirtId, size, quantity, email, name, phone } = await request.json();

    const [shirt] = await db
      .select()
      .from(shirts)
      .where(eq(shirts.id, shirtId))
      .limit(1);

    if (!shirt) {
      return NextResponse.json({ error: 'Shirt not found' }, { status: 404 });
    }

    const totalAmount = parseFloat(shirt.price) * quantity;

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
      line_items: [
        {
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
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/cougar-comeback-shirt/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cougar-comeback-shirt`,
      customer_email: email,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        shirtId: shirtId.toString(),
        size,
        quantity: quantity.toString(),
        customerName: name,
      },
    });

    await db
      .insert(orders)
      .values({
        email,
        name,
        phone,
        shirtId,
        size,
        quantity,
        totalAmount: totalAmount.toFixed(2),
        stripeSessionId: session.id,
        status: 'pending',
      })
      .returning();

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