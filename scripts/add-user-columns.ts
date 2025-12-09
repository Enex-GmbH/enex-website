import { config } from "dotenv";
import { Pool } from "@neondatabase/serverless";

// Load environment variables
config({ path: ".env.local" });
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

async function addColumns() {
  try {
    console.log("Adding phone and deleted_at columns to users table...");
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(40);
    `);
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
    `);
    console.log("✅ Successfully added phone and deleted_at columns to users table");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding columns:", error);
    await pool.end();
    process.exit(1);
  }
}

addColumns();
