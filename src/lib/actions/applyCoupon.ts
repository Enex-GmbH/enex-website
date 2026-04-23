"use server";

import { db } from "@/lib/db/client";
import { coupons } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import {
  computeDiscountCents,
  normalizeCouponCode,
  type CouponDiscountType,
} from "@/lib/coupon-pricing";

function isCouponDiscountType(v: string): v is CouponDiscountType {
  return v === "percentage" || v === "fixed";
}

/**
 * Validate and apply a coupon code
 * @param couponCode - The coupon code to validate
 * @param totalPrice - The total price before discount (euro cents)
 */
export async function applyCoupon(
  couponCode: string,
  totalPrice: number
): Promise<{
  success: boolean;
  discount?: number;
  discountedPrice?: number;
  message?: string;
}> {
  try {
    const code = normalizeCouponCode(couponCode);

    if (!code) {
      return {
        success: false,
        message: "Coupon code is required",
      };
    }

    const [row] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code), eq(coupons.isActive, true)))
      .limit(1);

    if (!row) {
      return {
        success: false,
        message: "Invalid coupon code",
      };
    }

    if (!isCouponDiscountType(row.discountType)) {
      return {
        success: false,
        message: "Invalid coupon code",
      };
    }

    const { discountCents, finalCents } = computeDiscountCents(totalPrice, {
      discountType: row.discountType,
      discountValue: row.discountValue,
    });

    const label =
      row.discountType === "percentage"
        ? `${row.discountValue}%`
        : `${(row.discountValue / 100).toFixed(2)}€`;

    return {
      success: true,
      discount: discountCents,
      discountedPrice: finalCents,
      message: `Coupon applied: ${label} off`,
    };
  } catch (error) {
    console.error("Error applying coupon:", error);
    return {
      success: false,
      message: "Error applying coupon code",
    };
  }
}
