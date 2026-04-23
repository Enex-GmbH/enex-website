"use server";

import { db } from "@/lib/db/client";
import { appSettings } from "@/lib/db/schema";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";

export async function getMaintenanceMode(): Promise<{
  success: boolean;
  enabled?: boolean;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Sie müssen angemeldet sein." };
    }

    if (session.user.role !== "admin") {
      return { success: false, error: "Keine Berechtigung." };
    }

    const [row] = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.id, 1))
      .limit(1);

    return {
      success: true,
      enabled: row?.maintenanceEnabled ?? false,
    };
  } catch (error) {
    console.error("getMaintenanceMode:", error);
    return {
      success: false,
      error: "Einstellung konnte nicht geladen werden.",
    };
  }
}
