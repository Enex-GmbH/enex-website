export type CouponDiscountType = "percentage" | "fixed";

export interface CouponDiscountInput {
  discountType: CouponDiscountType;
  discountValue: number;
}

/**
 * Normalize coupon codes for storage and lookup (trim + uppercase).
 */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Compute discount and final totals in euro cents.
 * - percentage: discountValue is 1–100
 * - fixed: discountValue is discount amount in cents
 */
export function computeDiscountCents(
  subtotalCents: number,
  row: CouponDiscountInput
): { discountCents: number; finalCents: number } {
  if (subtotalCents <= 0) {
    return { discountCents: 0, finalCents: 0 };
  }

  let discountCents: number;
  if (row.discountType === "percentage") {
    discountCents = Math.round((subtotalCents * row.discountValue) / 100);
  } else {
    discountCents = row.discountValue;
  }

  discountCents = Math.min(Math.max(0, discountCents), subtotalCents);
  const finalCents = subtotalCents - discountCents;
  return { discountCents, finalCents };
}
