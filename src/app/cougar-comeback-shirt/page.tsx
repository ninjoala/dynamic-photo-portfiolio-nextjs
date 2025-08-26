import { Metadata } from 'next';
import PreorderClient from './PreorderClient';
import { db } from '@/db';
import { shirts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const metadata: Metadata = {
  title: 'Cougar Comeback Shirt - Preorder Now',
  description: 'Limited edition Cougar Comeback shirts. Secure yours with a preorder today!',
};

async function getActiveShirts() {
  try {
    const activeShirts = await db
      .select()
      .from(shirts)
      .where(eq(shirts.active, true));
    return activeShirts;
  } catch (error) {
    console.error('Error fetching shirts:', error);
    return [];
  }
}

export default async function CougarComebackShirtPage() {
  const availableShirts = await getActiveShirts();

  return (
    <div className="min-h-screen bg-gray-50">
      <PreorderClient shirts={availableShirts} />
    </div>
  );
}