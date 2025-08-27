import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function addPhoneColumn() {
  try {
    console.log('Adding phone column to orders table...');
    
    // Check if column already exists
    const columnCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'phone';
    `);
    
    if (columnCheck.length > 0) {
      console.log('Phone column already exists!');
      return;
    }
    
    // Add the phone column
    await db.execute(sql`ALTER TABLE orders ADD COLUMN phone text;`);
    
    console.log('✅ Successfully added phone column to orders table');
    
  } catch (error) {
    console.error('❌ Error adding phone column:', error);
  }
  
  process.exit(0);
}

addPhoneColumn().catch(console.error);