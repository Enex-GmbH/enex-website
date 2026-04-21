import { describe, expect, it } from "vitest";
import {
  getBookingTotals,
  getPlanBaseEur,
  PLAN_BASE_PRICES_EUR,
  sumBookingTotal,
} from "./pricing";

describe("pricing", () => {
  it("PDF 2026: exclusive SUV base", () => {
    expect(PLAN_BASE_PRICES_EUR.exclusive.suv).toBe(580);
  });

  it("sums toll, tiered plan, and add-ons in EUR", () => {
    const loc = { tollFeeEur: 5 };
    const pkg = {
      selectedPlan: "basic" as const,
      carType: "kleinwagen" as const,
      addOns: [{ priceEur: 10 }],
    };
    const planEur = getPlanBaseEur("basic", "kleinwagen"); // 150
    expect(sumBookingTotal(loc, pkg)).toBe(planEur + 5 + 10);
    expect(getBookingTotals(loc, pkg)).toEqual({ eur: planEur + 5 + 10 });
  });

  it("Standardwagen uses PDF middle column", () => {
    expect(getPlanBaseEur("premium", "standardwagen")).toBe(330);
  });
});
