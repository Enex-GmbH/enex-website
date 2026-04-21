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

interface BookingState {
  // Step data
  location: LocationData | null;
  package: PackageData | null;
  dateTime: DateTimeData | null;
  contactDetails: ContactDetails | null;
  payment: PaymentData | null;

  // Actions
  setLocation: (location: LocationData) => void;
  setPackage: (packageData: PackageData) => void;
  setDateTime: (dateTime: DateTimeData) => void;
  setContactDetails: (details: ContactDetails) => void;
  setPayment: (payment: PaymentData) => void;

  // Utility
  resetBooking: () => void;
  getTotalPrice: () => { eur: number };
  isStepComplete: (step: number) => boolean;
}

const initialState = {
  location: null,
  package: null,
  dateTime: null,
  contactDetails: null,
  payment: null,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLocation: (location) => set({ location }),

      setPackage: (packageData) => set({ package: packageData }),

      setDateTime: (dateTime) => set({ dateTime }),

      setContactDetails: (details) => set({ contactDetails: details }),

      setPayment: (payment) => set({ payment }),

      resetBooking: () => set(initialState),

      getTotalPrice: () => {
        const state = get();
        return getBookingTotals(state.location, state.package);
      },

      isStepComplete: (step: number) => {
        const state = get();
        switch (step) {
          case 1:
            return state.location !== null;
          case 2:
            return state.package !== null;
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
        dateTime: state.dateTime,
        // Omit contactDetails and payment from localStorage (PII / agreements)
      }),
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(persistedState as object),
        };
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
