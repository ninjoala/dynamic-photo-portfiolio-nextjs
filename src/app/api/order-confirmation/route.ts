import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, shirts, photoPackages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get all orders for this session (for cart support)
    const allOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.stripeSessionId, sessionId));

    if (!allOrders || allOrders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch product details based on order type
    const orderItems = await Promise.all(
      allOrders.map(async (order) => {
        let productName = 'Unknown Product';
        let productDetails = {};

        if (order.orderType === 'shirt') {
          // Join with shirts table
          const [shirt] = await db
            .select()
            .from(shirts)
            .where(eq(shirts.id, order.productId))
            .limit(1);

          if (shirt) {
            productName = shirt.name;
            productDetails = {
              size: order.productOptions?.size || order.size, // Support both new and legacy
              description: shirt.description,
            };
          }
        } else if (order.orderType === 'photo_package') {
          // Join with photoPackages table
          const [photoPackage] = await db
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
            };
          }
        }

        return {
          id: order.id,
          orderType: order.orderType,
          productName,
          quantity: order.quantity,
          totalAmount: order.totalAmount,
          status: order.status,
          email: order.email,
          name: order.name,
          ...productDetails,
        };
      })
    );

    // Calculate total for all items
    const grandTotal = orderItems.reduce((sum, item) =>
      sum + parseFloat(item.totalAmount), 0
    ).toFixed(2);

    // Return order details
    if (orderItems.length === 1) {
      // Single item order (backward compatibility)
      return NextResponse.json({
        ...orderItems[0],
        totalAmount: orderItems[0].totalAmount
      });
    } else {
      // Multiple items order
      return NextResponse.json({
        items: orderItems,
        totalAmount: grandTotal,
        customerName: orderItems[0].name,
        customerEmail: orderItems[0].email,
        itemCount: orderItems.length
      });
    }
  } catch (error) {
    console.error('Error fetching order confirmation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}