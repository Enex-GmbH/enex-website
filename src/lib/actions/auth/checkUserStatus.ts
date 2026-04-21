"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns whether the account is deactivated. Does not expose whether the
 * email is registered (missing users yield isDeactivated: false).
 */
export async function checkUserStatus(
  email: string
): Promise<{
  isDeactivated: boolean;
  error?: string;
}> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: {
        id: true,
        deactivated: true,
      },
    });

    if (!user) {
      return {
        isDeactivated: false,
      };
    }

    return {
      isDeactivated: user.deactivated === true,
    };
  } catch (error) {
    console.error("Check user status error:", error);
    return {
      isDeactivated: false,
      error: "Ein Fehler ist aufgetreten.",
    };
  }
}
