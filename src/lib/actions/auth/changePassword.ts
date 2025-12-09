"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { changePasswordSchema } from "@/lib/validations/auth-schemas";
import { eq } from "drizzle-orm";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function changePassword(
  data: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sie müssen angemeldet sein, um Ihr Passwort zu ändern.",
      };
    }

    const validatedData = changePasswordSchema.parse(data);
    const userId = parseInt(session.user.id);

    // Get user and verify current password
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user || !user.password) {
      return {
        success: false,
        error: "Benutzer nicht gefunden.",
      };
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Das aktuelle Passwort ist falsch.",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Ihr Passwort wurde erfolgreich geändert.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Ungültige Eingabedaten",
      };
    }

    console.error("Password change error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
