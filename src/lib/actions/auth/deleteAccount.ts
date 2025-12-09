"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { z } from "zod";

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein"),
});

export async function deleteAccount(
  data: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sie müssen angemeldet sein, um Ihr Konto zu löschen.",
      };
    }

    const validatedData = deleteAccountSchema.parse(data);
    const userId = parseInt(session.user.id);

    // Get user and verify password
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
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      return {
        success: false,
        error: "Das Passwort ist falsch.",
      };
    }

    // Soft delete: anonymize user data instead of hard delete
    const anonymizedEmail = `deleted_${Date.now()}_${user.id}@deleted.local`;
    const anonymizedName = "Gelöschter Benutzer";

    await db
      .update(users)
      .set({
        email: anonymizedEmail,
        name: anonymizedName,
        phone: null,
        password: "", // Clear password to prevent login
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Ihr Konto wurde erfolgreich gelöscht.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Ungültige Eingabedaten",
      };
    }

    console.error("Account deletion error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
