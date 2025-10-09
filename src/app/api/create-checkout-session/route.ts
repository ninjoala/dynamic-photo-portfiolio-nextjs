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
  apiVersion: '2024-11-20.acacia',
});

export async function POST_DISABLED(request: NextRequest) {
  try {
    const { shirtId, size, quantity, email, name, phone } = await request.json();

    const [shirt] = await db
      .select()
      .from(shirts)
      .where(eq(shirts.id, shirtId))
      .limit(1);

    if (!shirt) {
      return NextResponse.json({ error: 'Shirt not found' }, { status: 404 });
    }

<<<<<<< Updated upstream
    const totalAmount = parseFloat(shirt.price) * quantity;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
=======
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
>>>>>>> Stashed changes
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cougar-comeback-shirt/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cougar-comeback-shirt`,
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

    const [order] = await db
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
*/