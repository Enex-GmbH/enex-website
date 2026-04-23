"use server";

import { db } from "@/lib/db/client";
import { coupons } from "@/lib/db/schema";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";
import { z } from "zod";

const deleteCouponSchema = z.object({
  id: z.number().int().positive(),
});

export async function deleteCoupon(
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

    const parsed = deleteCouponSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: "Ungültige Anfrage.",
      };
    }

    const deleted = await db
      .delete(coupons)
      .where(eq(coupons.id, parsed.data.id))
      .returning({ id: coupons.id });

    if (deleted.length === 0) {
      return {
        success: false,
        error: "Gutschein wurde nicht gefunden.",
      };
    }

    return {
      success: true,
      message: "Gutschein wurde gelöscht.",
    };
  } catch (error) {
    console.error("deleteCoupon error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
