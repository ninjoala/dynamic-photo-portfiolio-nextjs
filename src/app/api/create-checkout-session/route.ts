import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { shirts, photoPackages, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isStripeTestMode } from '@/utils/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
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
      productType: 'shirt' | 'photo_package';
      productId: number;
      productOptions: Record<string, unknown>;
      quantity: number;
      price: string;
      name: string;
    }> = [];
    let customerEmail = body.email || '';
    let customerName = body.name || '';
    let customerPhone = body.phone || '';

    // Extract student and parent info from body level (for photo packages)
    const studentInfo = {
      studentFirstName: body.studentFirstName,
      studentLastName: body.studentLastName,
      teacher: body.teacher,
      school: body.school,
      parentFirstName: body.parentFirstName,
      parentLastName: body.parentLastName,
    };

    if (isCartCheckout) {
      // Handle multiple cart items
      for (const item of body.items) {
        const productType = item.productType || 'shirt'; // Default to 'shirt' for backward compatibility

        if (productType === 'shirt') {
          const [shirt] = await db
            .select()
            .from(shirts)
            .where(eq(shirts.id, item.productId || item.shirtId)) // Support both productId and legacy shirtId
            .limit(1);

          if (!shirt) {
            return NextResponse.json(
              { error: `Shirt ${item.productId || item.shirtId} not found` },
              { status: 404 }
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
              unit_amount: Math.round(parseFloat(shirt.price) * 100),
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
            .where(eq(photoPackages.id, item.productId))
            .limit(1);

          if (!photoPackage) {
            return NextResponse.json(
              { error: `Photo package ${item.productId} not found` },
              { status: 404 }
            );
          }

          if (!photoPackage.active) {
            return NextResponse.json(
              { error: `Photo package "${photoPackage.name}" is no longer available` },
              { status: 400 }
            );
          }

          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: photoPackage.name,
                description: photoPackage.description || undefined,
              },
              unit_amount: Math.round(parseFloat(photoPackage.price) * 100),
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
    } else {
      // Handle single item (backward compatibility)
      const productType = body.productType || 'shirt'; // Default to 'shirt' for backward compatibility
      customerEmail = body.email;
      customerName = body.name;
      customerPhone = body.phone;

      if (productType === 'shirt') {
        const { shirtId, productId, size, quantity } = body;
        const id = productId || shirtId; // Support both productId and legacy shirtId

        const [shirt] = await db
          .select()
          .from(shirts)
          .where(eq(shirts.id, id))
          .limit(1);

        if (!shirt) {
          return NextResponse.json(
            { error: `Shirt ${id} not found` },
            { status: 404 }
          );
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
          productType: 'shirt',
          productId: shirt.id,
          productOptions: { size },
          quantity,
          price: shirt.price,
          name: shirt.name
        });
      } else if (productType === 'photo_package') {
        const { productId, quantity } = body;

        const [photoPackage] = await db
          .select()
          .from(photoPackages)
          .where(eq(photoPackages.id, productId))
          .limit(1);

        if (!photoPackage) {
          return NextResponse.json(
            { error: `Photo package ${productId} not found` },
            { status: 404 }
          );
        }

        if (!photoPackage.active) {
          return NextResponse.json(
            { error: `Photo package "${photoPackage.name}" is no longer available` },
            { status: 400 }
          );
        }

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: photoPackage.name,
              description: photoPackage.description || undefined,
            },
            unit_amount: Math.round(parseFloat(photoPackage.price) * 100),
          },
          quantity,
        });

        orderItems.push({
          productType: 'photo_package',
          productId: photoPackage.id,
          productOptions: {
            ...studentInfo,
          },
          quantity,
          price: photoPackage.price,
          name: photoPackage.name
        });
      }
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
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
      customer_email: customerEmail,
      shipping_address_collection: orderItems.some(item => item.productType === 'shirt') ? {
        allowed_countries: ['US'],
      } : undefined, // Only require shipping for physical products (shirts)
      metadata: {
        customerName: customerName,
        itemCount: orderItems.length.toString(),
        orderType: isCartCheckout ? 'cart' : 'single'
      },
    });

    // Detect if this is a test mode transaction
    const isTest = isStripeTestMode(session.id);

    // Insert multiple order records (one for each cart item)
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
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}