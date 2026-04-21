import type { CarType } from "@/store/booking-store";

/** Plan keys — keep in sync with `PlanType` in `@/store/booking-store`. */
export type PlanPriceKey = "basic" | "premium" | "exclusive";

/**
 * Paket-Basispreise EUR (EnexPreisliste 2026).
 * Spalten = Fahrzeugklasse wie im PDF: Kleinwagen, Standardwagen, SUV.
 */
export const PLAN_BASE_PRICES_EUR: Record<
  PlanPriceKey,
  Record<CarType, number>
> = {
  basic: { kleinwagen: 150, standardwagen: 200, suv: 250 },
  premium: { kleinwagen: 280, standardwagen: 330, suv: 430 },
  exclusive: { kleinwagen: 400, standardwagen: 480, suv: 580 },
};

export function getPlanBaseEur(plan: PlanPriceKey, carType: CarType): number {
  return PLAN_BASE_PRICES_EUR[plan][carType];
}

export interface PricingLocationSlice {
  tollFeeEur: number;
}

export interface PricingPackageSlice {
  selectedPlan: PlanPriceKey;
  /** Defaults to Standardwagen if not yet chosen. */
  carType?: CarType;
  addOns: Array<{ priceEur: number }>;
}

/** Total in euros (toll + plan + add-ons). */
export function sumBookingTotal(
  location: PricingLocationSlice,
  pkg: PricingPackageSlice
): number {
  let total = location.tollFeeEur;
  const carType = pkg.carType ?? "standardwagen";
  total += getPlanBaseEur(pkg.selectedPlan, carType);
  for (const addOn of pkg.addOns) {
    total += addOn.priceEur;
  }
  return total;
}

/** Totals for the booking UI (EUR only). */
export function getBookingTotals(
  location: PricingLocationSlice | null,
  pkg: PricingPackageSlice | null
) {
  if (!location || !pkg) {
    return { eur: 0 };
  }
  return { eur: sumBookingTotal(location, pkg) };
}
