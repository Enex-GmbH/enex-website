import { describe, expect, it } from "vitest";
import {
  computeDiscountCents,
  normalizeCouponCode,
} from "./coupon-pricing";

describe("normalizeCouponCode", () => {
  it("trims and uppercases", () => {
    expect(normalizeCouponCode("  save10  ")).toBe("SAVE10");
  });
});

describe("computeDiscountCents", () => {
  it("applies 10% to 10000 cents", () => {
    const r = computeDiscountCents(10000, {
      discountType: "percentage",
      discountValue: 10,
    });
    expect(r.discountCents).toBe(1000);
    expect(r.finalCents).toBe(9000);
  });

  it("applies fixed discount in cents", () => {
    const r = computeDiscountCents(10000, {
      discountType: "fixed",
      discountValue: 2500,
    });
    expect(r.discountCents).toBe(2500);
    expect(r.finalCents).toBe(7500);
  });

  it("caps fixed discount at subtotal", () => {
    const r = computeDiscountCents(10000, {
      discountType: "fixed",
      discountValue: 500_000,
    });
    expect(r.discountCents).toBe(10000);
    expect(r.finalCents).toBe(0);
  });

  it("rounds percentage correctly", () => {
    const r = computeDiscountCents(3333, {
      discountType: "percentage",
      discountValue: 33,
    });
    expect(r.discountCents).toBe(1100);
    expect(r.finalCents).toBe(2233);
  });

  it("returns zeros for non-positive subtotal", () => {
    const r = computeDiscountCents(0, {
      discountType: "percentage",
      discountValue: 50,
    });
    expect(r.discountCents).toBe(0);
    expect(r.finalCents).toBe(0);
  });
});
