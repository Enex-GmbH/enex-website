"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { z } from "zod";

const toggleUserStatusSchema = z.object({
  userId: z.number(),
  enabled: z.boolean(),
});

export async function toggleUserStatus(
  data: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Sie müssen angemeldet sein.",
      };
    }

    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Sie haben keine Berechtigung für diese Aktion.",
      };
    }

    const validatedData = toggleUserStatusSchema.parse(data);
    const currentUserId = parseInt(session.user.id);

    // Prevent admin from disabling themselves
    if (validatedData.userId === currentUserId && !validatedData.enabled) {
      return {
        success: false,
        error: "Sie können Ihr eigenes Konto nicht deaktivieren.",
      };
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, validatedData.userId),
    });

    if (!existingUser) {
      return {
        success: false,
        error: "Benutzer nicht gefunden.",
      };
    }

    // Update deactivated field: false = enabled, true = disabled
    await db
      .update(users)
      .set({
        deactivated: !validatedData.enabled, // enabled=false means deactivated=true
        updatedAt: new Date(),
      })
      .where(eq(users.id, validatedData.userId));

    return {
      success: true,
      message: validatedData.enabled
        ? "Benutzer erfolgreich aktiviert."
        : "Benutzer erfolgreich deaktiviert.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Ungültige Eingabedaten",
      };
    }

    console.error("Toggle user status error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
