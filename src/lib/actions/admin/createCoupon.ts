"use server";

import { db } from "@/lib/db/client";
import { coupons } from "@/lib/db/schema";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { normalizeCouponCode } from "@/lib/coupon-pricing";
import { z } from "zod";

const createCouponSchema = z.discriminatedUnion("discountType", [
  z.object({
    code: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/),
    discountType: z.literal("percentage"),
    discountValue: z.number().int().min(1).max(100),
  }),
  z.object({
    code: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[A-Za-z0-9_-]+$/),
    discountType: z.literal("fixed"),
    /** Discount amount in euros (e.g. 25.5); stored as cents */
    discountFixedEur: z.number().positive(),
  }),
]);

export async function createCoupon(
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

    const parsed = createCouponSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(" "),
      };
    }

    const input = parsed.data;
    const code = normalizeCouponCode(input.code);

    const discountValue =
      input.discountType === "percentage"
        ? input.discountValue
        : Math.round(input.discountFixedEur * 100);

    if (input.discountType === "fixed" && discountValue < 1) {
      return {
        success: false,
        error: "Der feste Rabatt muss mindestens 0,01 € betragen.",
      };
    }

    await db.insert(coupons).values({
      code,
      discountType: input.discountType,
      discountValue,
      isActive: true,
    });

    return {
      success: true,
      message: "Gutschein wurde erstellt.",
    };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    const msg = typeof err.message === "string" ? err.message : "";
    if (
      err.code === "23505" ||
      msg.includes("duplicate key") ||
      msg.includes("unique constraint")
    ) {
      return {
        success: false,
        error: "Ein Gutschein mit diesem Code existiert bereits.",
      };
    }
    console.error("createCoupon error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
