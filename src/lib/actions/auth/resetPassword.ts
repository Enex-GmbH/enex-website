"use server";

import { db } from "@/lib/db/client";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { forgotPasswordSchema } from "@/lib/validations/auth-schemas";
import { sendPasswordResetEmail } from "@/lib/emails/resetPassword";
import { eq, and, gt } from "drizzle-orm";
import { randomBytes } from "crypto";

export async function requestPasswordReset(
  data: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const validatedData = forgotPasswordSchema.parse(data);

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return {
        success: true,
        message:
          "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.",
      };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    // Delete any existing reset tokens for this user
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, user.id));

    // Create new reset token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expires,
    });

    // Send reset email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      return {
        success: false,
        error:
          "Fehler beim Senden der E-Mail. Bitte versuchen Sie es später erneut.",
      };
    }

    return {
      success: true,
      message:
        "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Ungültige E-Mail-Adresse",
      };
    }

    console.error("Password reset request error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
