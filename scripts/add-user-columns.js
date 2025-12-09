// Simple script to add columns - run with: node scripts/add-user-columns.js
// Make sure DATABASE_URL is set in your environment

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addColumns() {
  try {
    console.log('Adding phone and deleted_at columns to users table...');
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(40);
    `);
    await pool.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
    `);
    console.log('✅ Successfully added phone and deleted_at columns to users table');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addColumns();
