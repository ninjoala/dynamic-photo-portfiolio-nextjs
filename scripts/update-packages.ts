import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
    // Import db AFTER dotenv config
    const { db } = await import('../src/db');
    const { photoPackages } = await import('../src/db/schema');
    const { eq } = await import('drizzle-orm');

    try {
        if (!db) {
            console.error('❌ Database connection not available');
            process.exit(1);
        }

        console.log('🔄 Updating photo packages (safe - no data deletion)...\n');

        // Define package data
        const packageData = [
            {
                name: 'Package A - OVATION',
                category: 'real-estate',
                description: 'Full Resolution Digital file, 4 5×7 prints, 10×13 print',
                price: '68.00',
                features: [],
                active: true,
                displayOrder: 0,
            },
            {
                name: 'Package B - SONATA',
                category: 'real-estate',
                description: '4 5×7 prints, 10×13 print',
                price: '38.00',
                features: [],
                active: true,
                displayOrder: 1,
            },
            {
                name: 'Package C - MELODY',
                category: 'real-estate',
                description: '2 5×7 prints, 10×13 print',
                price: '28.00',
                features: [],
                active: true,
                displayOrder: 2,
            },
            {
                name: 'Package D - DIGITAL',
                category: 'real-estate',
                description: 'Full Resolution Digital File',
                price: '36.00',
                features: [],
                active: true,
                displayOrder: 3,
            },
            {
                name: 'Package E - SOLO',
                category: 'real-estate',
                description: '1 8×10 print',
                price: '16.00',
                features: [],
                active: true,
                displayOrder: 4,
            },
            {
                name: 'Package F - DUET',
                category: 'real-estate',
                description: '2 5×7 prints',
                price: '16.00',
                features: [],
                active: true,
                displayOrder: 5,
            },
            {
                name: 'Package G - DEBUT',
                category: 'real-estate',
                description: '10×13 print',
                price: '18.00',
                features: [],
                active: true,
                displayOrder: 6,
            },
            {
                name: 'Package H - WALLET',
                category: 'real-estate',
                description: '4 Wallet Sized Prints',
                price: '10.00',
                features: [],
                active: true,
                displayOrder: 7,
            },
        ];

        // Upsert each package (update if exists, insert if doesn't)
        for (const pkg of packageData) {
            // Check if package exists by name
            const existing = await db
                .select()
                .from(photoPackages)
                .where(eq(photoPackages.name, pkg.name))
                .limit(1);

            if (existing.length > 0) {
                // Update existing package
                await db
                    .update(photoPackages)
                    .set({
                        category: pkg.category,
                        description: pkg.description,
                        price: pkg.price,
                        features: pkg.features,
                        active: pkg.active,
                        displayOrder: pkg.displayOrder,
                    })
                    .where(eq(photoPackages.id, existing[0].id));

                console.log(`✅ Updated: ${pkg.name}`);
            } else {
                // Insert new package
                await db.insert(photoPackages).values(pkg);
                console.log(`➕ Created: ${pkg.name}`);
            }
        }

        console.log('\n✨ Photo packages updated successfully!');
        console.log('📋 Note: This script is safe and does NOT delete any data.');
    } catch (error) {
        console.error('❌ Error updating photo packages:', error);
        process.exit(1);
    }
}

main()
    .then(() => {
        console.log('✅ Update completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Update failed:', error);
        process.exit(1);
    });
