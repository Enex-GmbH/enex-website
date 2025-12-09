"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { updateProfileSchema } from "@/lib/validations/auth-schemas";
import { eq } from "drizzle-orm";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function updateProfile(
  data: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Sie müssen angemeldet sein, um Ihr Profil zu aktualisieren.",
      };
    }

    const validatedData = updateProfileSchema.parse(data);
    const userId = parseInt(session.user.id);

    // Check if email is being changed and if it's already taken
    if (validatedData.email) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, validatedData.email),
      });

      if (existingUser && existingUser.id !== userId) {
        return {
          success: false,
          error: "Diese E-Mail-Adresse wird bereits verwendet.",
        };
      }
    }

    // Build update object
    const updateData: {
      name?: string;
      email?: string;
      phone?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.email !== undefined) {
      updateData.email = validatedData.email;
    }
    if (validatedData.phone !== undefined) {
      updateData.phone = validatedData.phone || null;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Ihr Profil wurde erfolgreich aktualisiert.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Ungültige Eingabedaten",
      };
    }

    console.error("Profile update error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
