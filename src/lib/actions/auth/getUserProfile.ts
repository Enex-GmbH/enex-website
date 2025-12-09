"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { sql } from "drizzle-orm";

export async function getUserProfile(): Promise<{
  success: boolean;
  user?: {
    id: number;
    name: string | null;
    email: string;
    phone: string | null;
  };
  error?: string;
}> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sie müssen angemeldet sein.",
      };
    }

    const userId = parseInt(session.user.id);

    // First, try to add the columns if they don't exist (one-time migration)
    try {
      await db.execute(
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(40)`
      );
      await db.execute(
        sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp`
      );
    } catch (migrationError) {
      // Ignore migration errors (columns might already exist or we don't have permission)
      // This is a best-effort migration
      console.log("Migration check:", migrationError instanceof Error ? migrationError.message : "Unknown");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Benutzer nicht gefunden.",
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  } catch (error) {
    console.error("Get user profile error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
