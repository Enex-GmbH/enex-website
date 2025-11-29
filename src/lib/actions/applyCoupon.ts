"use server";

/**
 * Validate and apply a coupon code
 * @param couponCode - The coupon code to validate
 * @param totalPrice - The total price before discount
 * @returns Object with discount information or error
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
    // Normalize coupon code
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      return {
        success: false,
        message: "Coupon code is required",
      };
    }

    // TODO: Implement actual coupon validation logic
    // This should query a coupons table in your database
    // Example structure:
    // - coupons table with: code, discount_type (percentage/fixed), discount_value, valid_from, valid_until, usage_limit, etc.

    // Mock coupon codes for now
    const mockCoupons: Record<
      string,
      { discount: number; type: "percentage" | "fixed" }
    > = {
      WELCOME10: { discount: 10, type: "percentage" },
      SAVE20: { discount: 20, type: "percentage" },
      FIXED50: { discount: 50, type: "fixed" },
    };

    const coupon = mockCoupons[code];

    if (!coupon) {
      return {
        success: false,
        message: "Invalid coupon code",
      };
    }

    // Calculate discount
    let discountAmount: number;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((totalPrice * coupon.discount) / 100);
    } else {
      discountAmount = coupon.discount;
    }

    // Ensure discount doesn't exceed total price
    discountAmount = Math.min(discountAmount, totalPrice);

    const discountedPrice = totalPrice - discountAmount;

    return {
      success: true,
      discount: discountAmount,
      discountedPrice,
      message: `Coupon applied: ${coupon.discount}${coupon.type === "percentage" ? "%" : "€"} off`,
    };
  } catch (error) {
    console.error("Error applying coupon:", error);
    return {
      success: false,
      message: "Error applying coupon code",
    };
  }
}

