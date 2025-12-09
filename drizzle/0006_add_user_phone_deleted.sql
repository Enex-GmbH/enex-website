-- Add phone and deleted_at columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(40);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
