import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { shirts, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { shirtId, size, quantity, email, name } = await request.json();

    const [shirt] = await db
      .select()
      .from(shirts)
      .where(eq(shirts.id, shirtId))
      .limit(1);

    if (!shirt) {
      return NextResponse.json({ error: 'Shirt not found' }, { status: 404 });
    }

    const totalAmount = parseFloat(shirt.price) * quantity;

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