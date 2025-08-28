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

    const [order] = await db
      .select({
        id: orders.id,
        size: orders.size,
        quantity: orders.quantity,
        totalAmount: orders.totalAmount,
        shirtName: shirts.name,
      })
      .from(orders)
      .leftJoin(shirts, eq(orders.shirtId, shirts.id))
      .where(eq(orders.stripeSessionId, sessionId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order confirmation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}