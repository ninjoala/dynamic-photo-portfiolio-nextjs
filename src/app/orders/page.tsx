import { Metadata } from 'next';
import PhotoPackageClient from './components/PhotoPackageClient';
import { db } from '@/db';
import { photoPackages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering since we need live database data
export const dynamic = 'force-dynamic';

// Ordering deadline: Midnight ET on Nov 25, 2025 = 5 AM UTC
const ORDER_DEADLINE = new Date('2025-11-25T05:00:00.000Z');

export const metadata: Metadata = {
    title: 'Photo Packages - Order Now',
    description: 'Browse and order professional photography packages for your event.',
};

async function getActivePhotoPackages() {
    try {
        // Skip if database is not available (e.g., during build)
        if (!db) {
            console.log('Database not available, returning empty package list');
            return [];
        }

        const activePackages = await db
            .select()
            .from(photoPackages)
            .where(eq(photoPackages.active, true))
            .orderBy(photoPackages.displayOrder);

        return activePackages;
    } catch (error) {
        console.error('Error fetching photo packages:', error);
        return [];
    }
}

export default async function OrdersPage() {
    // Check if ordering deadline has passed
    if (new Date() >= ORDER_DEADLINE) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Ordering Has Closed</h1>
                    <p className="text-gray-600">The deadline for photo package orders has passed. Thank you for your interest!</p>
                </div>
            </div>
        );
    }

    const packages = await getActivePhotoPackages();

    return <PhotoPackageClient packages={packages} />;
}
