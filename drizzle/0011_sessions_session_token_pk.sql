-- Align `sessions` with src/lib/db/schema.ts and NextAuth Drizzle adapter:
-- migration 0004 used id SERIAL PRIMARY KEY + UNIQUE(session_token); schema uses PK(session_token) only.
-- Run only when legacy `id` column exists so already-fixed DBs stay valid.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'id'
  ) THEN
    ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey";
    ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_session_token_unique";
    ALTER TABLE "sessions" DROP COLUMN "id";
    ALTER TABLE "sessions" ADD PRIMARY KEY ("session_token");
  END IF;
END $$;
