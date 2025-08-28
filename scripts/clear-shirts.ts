import { db } from '../src/db';
import { shirts } from '../src/db/schema';

async function clearShirts() {
  try {
    if (!db) {
      console.error('❌ Database connection not available');
      process.exit(1);
    }
    
    console.log('Clearing existing shirts...');
    const deleted = await db.delete(shirts);
    console.log('✅ Cleared all shirts from database');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing shirts:', error);
    process.exit(1);
  }
}

clearShirts();