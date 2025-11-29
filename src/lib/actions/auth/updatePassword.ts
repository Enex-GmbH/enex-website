"use server";

import { db } from "@/lib/db/client";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { resetPasswordSchema } from "@/lib/validations/auth-schemas";
import bcrypt from "bcryptjs";
import { eq, and, gt } from "drizzle-orm";

export async function updatePassword(
    data: unknown
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const validatedData = resetPasswordSchema.parse(data);

        // Find valid reset token
        const resetTokenRecord = await db.query.passwordResetTokens.findFirst({
            where: and(
                eq(passwordResetTokens.token, validatedData.token),
                gt(passwordResetTokens.expires, new Date())
            ),
        });

        if (!resetTokenRecord) {
            return {
                success: false,
                error: "Ungültiger oder abgelaufener Token. Bitte fordern Sie einen neuen Link an.",
            };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Update user password
        await db
            .update(users)
            .set({
                password: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, resetTokenRecord.userId));

        // Delete used reset token
        await db
            .delete(passwordResetTokens)
            .where(eq(passwordResetTokens.id, resetTokenRecord.id));

        return {
            success: true,
            message: "Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.",
        };
    } catch (error) {
        if (error instanceof Error && error.name === "ZodError") {
            return {
                success: false,
                error: "Ungültige Eingabedaten",
            };
        }

        console.error("Password update error:", error);
        return {
            success: false,
            error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        };
    }
}

