import { Metadata } from 'next';
import PhotoPackageClient from './components/PhotoPackageClient';
import { db } from '@/db';
import { photoPackages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering since we need live database data
export const dynamic = 'force-dynamic';

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
    const packages = await getActivePhotoPackages();

    return <PhotoPackageClient packages={packages} />;
}
