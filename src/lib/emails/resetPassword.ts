import { resend } from "./client";

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: email,
      subject: "Passwort zurücksetzen",
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Passwort zurücksetzen</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 8px;">
                        <h1 style="color: #000; margin-top: 0;">Passwort zurücksetzen</h1>
                        <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
                        <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
                        <p style="margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                                Passwort zurücksetzen
                            </a>
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            Dieser Link ist 1 Stunde gültig. Wenn Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
                        </p>
                        <p style="color: #666; font-size: 14px;">
                            Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>
                            <a href="${resetUrl}" style="color: #0066cc; word-break: break-all;">${resetUrl}</a>
                        </p>
                    </div>
                </body>
                </html>
            `,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
