import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CarType = "Sedan" | "SUV" | "Hatchback" | "Coupe";
export type PlanType = "basic" | "premium" | "exclusive";

export interface AddOn {
  id: string;
  name: string;
  priceEur: number;
  priceDkr: number;
  durationMinutes: number;
}

export interface LocationData {
  postalCode: string;
  address: string;
  zone: "inside" | "outside";
  tollFeeEur: number;
  tollFeeDkr: number;
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
  getTotalPrice: () => { eur: number; dkr: number };
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
        let totalEur = 0;
        let totalDkr = 0;

        // Add toll fee
        if (state.location) {
          totalEur += state.location.tollFeeEur;
          totalDkr += state.location.tollFeeDkr;
        }

        // Add plan base price (would be calculated based on plan and car type)
        if (state.package) {
          const { selectedPlan, carType } = state.package;

          // Base prices per plan (simplified)
          const planPrices = {
            basic: { eur: 60, dkr: 450 },
            premium: { eur: 90, dkr: 675 },
            exclusive: { eur: 150, dkr: 1125 },
          };

          totalEur += planPrices[selectedPlan].eur;
          totalDkr += planPrices[selectedPlan].dkr;

          // Add add-ons
          state.package.addOns.forEach((addOn) => {
            totalEur += addOn.priceEur;
            totalDkr += addOn.priceDkr;
          });
        }

        return { eur: totalEur, dkr: totalDkr };
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
        contactDetails: state.contactDetails,
        payment: state.payment,
      }),
    }
  )
);
