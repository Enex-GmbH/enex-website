"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validations/auth-schemas";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function register(
  data: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      return {
        success: false,
        error: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    await db.insert(users).values({
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    });

    return {
      success: true,
      message: "Registrierung erfolgreich. Sie können sich jetzt anmelden.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Ungültige Eingabedaten",
      };
    }

    console.error("Registration error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
