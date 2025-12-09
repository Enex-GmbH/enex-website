"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function checkUserStatus(
  email: string
): Promise<{
  exists: boolean;
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
        exists: false,
        isDeactivated: false,
      };
    }

    return {
      exists: true,
      isDeactivated: user.deactivated === true,
    };
  } catch (error) {
    console.error("Check user status error:", error);
    return {
      exists: false,
      isDeactivated: false,
      error: "Ein Fehler ist aufgetreten.",
    };
  }
}
