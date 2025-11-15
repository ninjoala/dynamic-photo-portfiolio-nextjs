import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  // Import db AFTER dotenv config
  const { db } = await import('../src/db');
  const { shirts, photoPackages } = await import('../src/db/schema');
  const { reset, seed } = await import('drizzle-seed');
  try {
    if (!db) {
      console.error('❌ Database connection not available');
      process.exit(1);
    }

    console.log('Starting database seed with drizzle-seed...');

    // Reset shirts table
    console.log('Resetting shirts table...');
    await reset(db, { shirts });

    console.log('Seeding shirts with custom data...');

    // Insert shirts with specific data
    const insertedShirts = await db.insert(shirts).values([
      {
        name: 'Beat Everybody',
        description: 'Cougars On Top: Beat Everybody Tee',
        price: '25.00',
        images: [
          'https://wasabindmdemo.imgix.net/shared/beat-everybody-front.png?fit=crop&crop=entropy&q=80&fm=webp',
          'https://wasabindmdemo.imgix.net/shared/beat-everybody-back.png?fit=crop&crop=entropy&q=80&fm=webp',
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
        active: true,
      },
      {
        name: 'Cougar Comeback',
        description: 'Cougar Comeback: The Rivalry Win Tee',
        price: '25.00',
        images: [
          'https://wasabindmdemo.imgix.net/shared/cougar-comeback-front.png?fit=crop&crop=entropy&q=80&fm=webp',
          'https://wasabindmdemo.imgix.net/shared/cougar-comeback-back.png?fit=crop&crop=entropy&q=80&fm=webp',
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
        active: true,
      },
    ]).returning();

    console.log(`Seeded ${insertedShirts.length} shirts successfully!`);

    // Reset photo packages table
    console.log('Resetting photo packages table...');
    await reset(db, { photoPackages });

    console.log('Seeding photo packages with custom data...');

    // Insert photo packages A through G
    const insertedPackages = await db.insert(photoPackages).values([
      {
        name: 'Package A - OVATION',
        category: 'real-estate',
        description: 'Digital image on USB drive, 4 5×7 prints, 10×13 Group photo',
        price: '68.00',
        features: [],
        active: true,
        displayOrder: 0,
      },
      {
        name: 'Package B - SONATA',
        category: 'real-estate',
        description: '4 5×7 prints, 10×13 Group photo',
        price: '38.00',
        features: [],
        active: true,
        displayOrder: 1,
      },
      {
        name: 'Package C - MELODY',
        category: 'real-estate',
        description: '2 5×7 prints, 10×13 Group photo',
        price: '28.00',
        features: [],
        active: true,
        displayOrder: 2,
      },
      {
        name: 'Package D - DIGITAL',
        category: 'real-estate',
        description: 'Digital image on USB drive, 1 5×7 print (no group)',
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
    ]).returning();

    console.log(`Seeded ${insertedPackages.length} photo packages successfully!`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });