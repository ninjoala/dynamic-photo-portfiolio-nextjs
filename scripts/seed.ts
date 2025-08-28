import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
  // Import db AFTER dotenv config
  const { db } = await import('../src/db');
  const { shirts } = await import('../src/db/schema');
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