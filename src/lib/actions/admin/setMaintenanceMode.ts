"use server";

import { db } from "@/lib/db/client";
import { appSettings } from "@/lib/db/schema";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  enabled: z.boolean(),
});

export async function setMaintenanceMode(
  data: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: "Sie müssen angemeldet sein." };
    }

    if (session.user.role !== "admin") {
      return { success: false, error: "Keine Berechtigung." };
    }

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Ungültige Anfrage." };
    }

    const updated = await db
      .update(appSettings)
      .set({
        maintenanceEnabled: parsed.data.enabled,
        updatedAt: new Date(),
      })
      .where(eq(appSettings.id, 1))
      .returning({ id: appSettings.id });

    if (updated.length === 0) {
      await db.insert(appSettings).values({
        id: 1,
        maintenanceEnabled: parsed.data.enabled,
      });
    }

    return {
      success: true,
      message: parsed.data.enabled
        ? "Wartungsmodus ist aktiv."
        : "Wartungsmodus ist ausgeschaltet.",
    };
  } catch (error: unknown) {
    console.error("setMaintenanceMode:", error);
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    const cause =
      typeof error === "object" &&
      error !== null &&
      "cause" in error &&
      typeof (error as { cause?: unknown }).cause === "object" &&
      (error as { cause?: { code?: string } }).cause !== null
        ? (error as { cause: { code?: string } }).cause
        : null;
    const causeCode = cause?.code ? String(cause.code) : "";
    if (code === "42P01" || causeCode === "42P01") {
      return {
        success: false,
        error:
          'Tabelle "app_settings" fehlt. Bitte Schema anwenden: im Projektordner `npm run db:push` ausführen (oder Migration 0009_icy_terrax.sql in der Datenbank ausführen).',
      };
    }
    return {
      success: false,
      error: "Einstellung konnte nicht gespeichert werden.",
    };
  }
}
