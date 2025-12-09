// Run this with: node scripts/add-deactivated-column.mjs
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

const db = drizzle(pool);

async function runMigration() {
  try {
    console.log("Running migration to add deactivated column...");
    
    // First check if column exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'deactivated'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log("✅ Column 'deactivated' already exists");
    } else {
      // Add column as nullable first
      await db.execute(
        sql`ALTER TABLE "users" ADD COLUMN "deactivated" boolean DEFAULT false`
      );
      console.log("✅ Added 'deactivated' column");
      
      // Set default value for existing rows
      await db.execute(
        sql`UPDATE "users" SET "deactivated" = false WHERE "deactivated" IS NULL`
      );
      
      // Make it NOT NULL
      await db.execute(
        sql`ALTER TABLE "users" ALTER COLUMN "deactivated" SET NOT NULL`
      );
      console.log("✅ Set NOT NULL constraint");
    }
    
    console.log("\n🎉 Migration completed successfully!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
