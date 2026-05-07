import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getBookingTotals } from "@/lib/pricing";

/** Fahrzeugklasse laut Preisliste (PDF): Kleinwagen, Standardwagen, SUV. */
export type CarType = "kleinwagen" | "standardwagen" | "suv";

const CAR_TYPE_VALUES: CarType[] = ["kleinwagen", "standardwagen", "suv"];

/**
 * Maps persisted values (inkl. alter englischer Typen) auf die drei PDF-Klassen.
 */
export function normalizeCarType(raw: string | undefined | null): CarType {
  if (!raw) return "standardwagen";
  const key = String(raw).trim();
  if ((CAR_TYPE_VALUES as readonly string[]).includes(key)) {
    return key as CarType;
  }
  const legacy: Record<string, CarType> = {
    Hatchback: "kleinwagen",
    Sedan: "standardwagen",
    Coupe: "standardwagen",
    SUV: "suv",
  };
  return legacy[key] ?? "standardwagen";
}
export type PlanType = "basic" | "premium" | "exclusive";

export interface AddOn {
  id: string;
  name: string;
  priceEur: number;
  durationMinutes: number;
}

export interface LocationData {
  postalCode: string;
  address: string;
  zone: "inside" | "outside";
  tollFeeEur: number;
  hasWater: boolean;
  hasElectricity: boolean;
}

export interface PackageData {
  carType: CarType;
  selectedPlan: PlanType;
  addOns: AddOn[];
}

export interface DateTimeData {
  date: Date;
  timeSlot: string;
}

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licensePlate?: string;
  carMake?: string;
  parkingNote?: string;
}

export interface PaymentData {
  couponCode?: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToService: boolean;
}

/** Zur Live-Anzeige in der Sidebar auf der Zahlungsseite; nicht persistiert. */
export interface CouponAdjustment {
  discountCents: number;
  discountedTotalEur: number;
}

interface BookingState {
  // Step data
  location: LocationData | null;
  package: PackageData | null;
  /** True only after submitting the Standort step (guards downstream routes vs. draft store updates). */
  locationStepCommitted: boolean;
  /** True only after submitting the Paket step. */
  packageStepCommitted: boolean;
  dateTime: DateTimeData | null;
  contactDetails: ContactDetails | null;
  payment: PaymentData | null;

  /** Rabatt nach erfolgreicher Gutschein-Validierung (nur payment step). */
  couponAdjustment: CouponAdjustment | null;

  // Actions
  setLocation: (location: LocationData) => void;
  finalizeLocationStep: (location: LocationData) => void;
  setPackage: (packageData: PackageData) => void;
  finalizePackageStep: (packageData: PackageData) => void;
  setDateTime: (dateTime: DateTimeData) => void;
  setContactDetails: (details: ContactDetails) => void;
  setPayment: (payment: PaymentData) => void;
  setCouponAdjustment: (adjustment: CouponAdjustment | null) => void;

  // Utility
  resetBooking: () => void;
  getTotalPrice: () => { eur: number };
  isStepComplete: (step: number) => boolean;
}

const initialState = {
  location: null,
  package: null,
  locationStepCommitted: false,
  packageStepCommitted: false,
  dateTime: null,
  contactDetails: null,
  payment: null,
  couponAdjustment: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLocation: (location) => set({ location }),

      finalizeLocationStep: (location) =>
        set({ location, locationStepCommitted: true }),

      setPackage: (packageData) => set({ package: packageData }),

      finalizePackageStep: (packageData) =>
        set({ package: packageData, packageStepCommitted: true }),

      setDateTime: (dateTime) => set({ dateTime }),

      setContactDetails: (details) => set({ contactDetails: details }),

      setPayment: (payment) => set({ payment }),

      setCouponAdjustment: (couponAdjustment) => set({ couponAdjustment }),

      resetBooking: () => set(initialState),

      getTotalPrice: () => {
        const state = get();
        return getBookingTotals(state.location, state.package);
      },

      isStepComplete: (step: number) => {
        const state = get();
        switch (step) {
          case 1:
            return state.locationStepCommitted && state.location !== null;
          case 2:
            return state.packageStepCommitted && state.package !== null;
          case 3:
            return state.dateTime !== null;
          case 4:
            return state.contactDetails !== null;
          case 5:
            return state.payment !== null;
          default:
            return false;
        }
      },
    }),
    {
      name: "booking-storage",
      partialize: (state) => ({
        location: state.location,
        package: state.package,
        locationStepCommitted: state.locationStepCommitted,
        packageStepCommitted: state.packageStepCommitted,
        dateTime: state.dateTime,
        // Omit contactDetails and payment from localStorage (PII / agreements)
      }),
      merge: (persistedState, currentState) => {
        const raw = persistedState as Record<string, unknown>;
        const merged = {
          ...currentState,
          ...raw,
        };
        /* Legacy payloads had no *_StepCommitted keys — infer completion from persisted data. */
        if (!("locationStepCommitted" in raw)) {
          const loc = merged.location as LocationData | null;
          merged.locationStepCommitted =
            loc !== null &&
            typeof loc.postalCode === "string" &&
            loc.postalCode.trim().length >= 5;
        }
        if (!("packageStepCommitted" in raw)) {
          merged.packageStepCommitted = merged.package !== null;
        }
        if (merged.package?.carType != null) {
          merged.package = {
            ...merged.package,
            carType: normalizeCarType(String(merged.package.carType)),
          };
        }
        return merged;
      },
    }
  )
);
