"use server";

import { db } from "@/lib/db/client";
import { coupons } from "@/lib/db/schema";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { desc } from "drizzle-orm";

export type AdminCouponRow = {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  isActive: boolean;
  createdAt: Date | null;
};

export async function getCoupons(): Promise<{
  success: boolean;
  coupons?: AdminCouponRow[];
  error?: string;
}> {
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

    const rows = await db
      .select()
      .from(coupons)
      .orderBy(desc(coupons.createdAt));

    return {
      success: true,
      coupons: rows,
    };
  } catch (error) {
    console.error("getCoupons error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
