import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Add phone and deleted_at columns if they don't exist
    await db.execute(
      sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(40)`
    );
    await db.execute(
      sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp`
    );

    // Check if deactivated column exists
    const checkResult = await db.execute(
      sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'deactivated'
      `
    );

    // If column doesn't exist, add it
    if (!checkResult.rows || checkResult.rows.length === 0) {
      // Add column as nullable first
      await db.execute(
        sql`ALTER TABLE "users" ADD COLUMN "deactivated" boolean DEFAULT false`
      );

      // Set default value for existing rows
      await db.execute(
        sql`UPDATE "users" SET "deactivated" = false WHERE "deactivated" IS NULL`
      );

      // Make it NOT NULL
      await db.execute(
        sql`ALTER TABLE "users" ALTER COLUMN "deactivated" SET NOT NULL`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully added phone, deleted_at, and deactivated columns",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
