// Run this with: node scripts/run-migration.mjs
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

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
    console.log("Running migration to add phone and deleted_at columns...");
    
    await db.execute(
      sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(40)`
    );
    console.log("✅ Added 'phone' column");
    
    await db.execute(
      sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp`
    );
    console.log("✅ Added 'deleted_at' column");
    
    console.log("\n🎉 Migration completed successfully!");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();
