"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  userId: z.number(),
  name: z.string().min(2, "Der Name muss mindestens 2 Zeichen lang sein").optional(),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein").optional(),
  phone: z
    .string()
    .optional()
    .transform((val) => (val === "" || !val ? null : val))
    .nullable(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function updateUser(
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

    const validatedData = updateUserSchema.parse(data);

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

    // Check if email is being changed and if it's already taken by another user
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailUser = await db.query.users.findFirst({
        where: eq(users.email, validatedData.email),
      });

      if (emailUser && emailUser.id !== validatedData.userId) {
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
      role?: string;
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
      updateData.phone = validatedData.phone;
    }
    if (validatedData.role !== undefined) {
      updateData.role = validatedData.role;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, validatedData.userId));

    return {
      success: true,
      message: "Benutzer erfolgreich aktualisiert.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Ungültige Eingabedaten",
      };
    }

    console.error("Update user error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
