import { db } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Check current structure
    const checkResult = await db.execute(
      sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'sessions'
        ORDER BY ordinal_position
      `
    );

    const columns = checkResult.rows || [];
    const hasIdColumn = columns.some((col: any) => col.column_name === "id");
    const sessionTokenIsPrimary = columns.some(
      (col: any) => col.column_name === "session_token"
    );

    // Check primary key constraints
    const pkResult = await db.execute(
      sql`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = 'sessions'::regclass
        AND i.indisprimary
      `
    );

    const primaryKeys = (pkResult.rows || []).map((row: any) => row.attname);

    console.log("Current sessions table structure:", {
      columns: columns.map((c: any) => c.column_name),
      primaryKeys,
    });

    // If id column exists and is primary key, we need to migrate
    if (hasIdColumn && primaryKeys.includes("id")) {
      console.log("Migrating sessions table structure...");

      // Step 1: Drop foreign key constraints that might reference sessions
      // (NextAuth typically doesn't have FKs pointing to sessions, but check anyway)

      // Step 2: Drop the old primary key constraint on id
      await db.execute(
        sql`ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_pkey"`
      );
      console.log("✅ Dropped old primary key constraint");

      // Step 3: Drop the id column
      await db.execute(sql`ALTER TABLE "sessions" DROP COLUMN IF EXISTS "id"`);
      console.log("✅ Dropped id column");

      // Step 4: Make session_token the primary key (if it's not already)
      if (!primaryKeys.includes("session_token")) {
        await db.execute(
          sql`ALTER TABLE "sessions" ADD PRIMARY KEY ("session_token")`
        );
        console.log("✅ Set session_token as primary key");
      }

      return NextResponse.json({
        success: true,
        message: "Successfully migrated sessions table structure",
        changes: {
          droppedIdColumn: true,
          setSessionTokenAsPrimary: !primaryKeys.includes("session_token"),
        },
      });
    } else if (!hasIdColumn && primaryKeys.includes("session_token")) {
      return NextResponse.json({
        success: true,
        message: "Sessions table structure is already correct",
        alreadyMigrated: true,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Unexpected sessions table structure. Please check manually.",
        currentStructure: {
          columns: columns.map((c: any) => c.column_name),
          primaryKeys,
        },
      });
    }
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
