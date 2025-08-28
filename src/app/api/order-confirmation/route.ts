import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, shirts } from '@/db/schema';
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
    const orderItems = await db
      .select({
        id: orders.id,
        size: orders.size,
        quantity: orders.quantity,
        totalAmount: orders.totalAmount,
        shirtName: shirts.name,
        status: orders.status,
        email: orders.email,
        name: orders.name,
      })
      .from(orders)
      .leftJoin(shirts, eq(orders.shirtId, shirts.id))
      .where(eq(orders.stripeSessionId, sessionId));

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

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