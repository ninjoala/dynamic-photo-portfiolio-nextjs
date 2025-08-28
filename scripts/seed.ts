import { db } from '../src/db';
import { shirts } from '../src/db/schema';

async function main() {
  try {
    if (!db) {
      console.error('❌ Database connection not available');
      process.exit(1);
    }
    
    console.log('Starting database seed...');
    
    // Check if shirts already exist
    const existing = await db.select().from(shirts);
    if (existing.length > 0) {
      console.log(`Found ${existing.length} existing shirts. Skipping seed.`);
      return;
    }
    
    console.log('Inserting shirts...');
    const insertedShirts = await db!.insert(shirts).values([
      {
        name: 'Beat Everybody',
        description: 'Beat Everybody shirt with bold design and message',
        price: '25.00',
        images: [
          'https://wasabindmdemo.imgix.net/shared/t-shirt-1.jpg?fit=crop&crop=entropy&q=80&fm=webp',
          'https://wasabindmdemo.imgix.net/shared/t-shirt-1.jpg?fit=crop&crop=entropy&q=80&fm=webp',
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
        active: true,
      },
      {
        name: 'Cougar Comeback',
        description: 'The original Cougar Comeback shirt featuring our iconic design',
        price: '25.00',
        images: [
          'https://wasabindmdemo.imgix.net/shared/t-shirt-1.jpg?fit=crop&crop=entropy&q=80&fm=webp',
          'https://wasabindmdemo.imgix.net/shared/t-shirt-1.jpg?fit=crop&crop=entropy&q=80&fm=webp',
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