-- Only add the columns we need, skip sessions table changes
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(40);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;