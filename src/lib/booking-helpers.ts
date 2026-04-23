// src/lib/booking-helpers.ts
import type {
  LocationData,
  PackageData,
  DateTimeData,
  ContactDetails,
  PaymentData,
  AddOn,
} from "@/store/booking-store";
import { format } from "date-fns";
import { randomBytes } from "crypto";
import { sumBookingTotal } from "@/lib/pricing";
import { normalizeCouponCode } from "@/lib/coupon-pricing";

/**
 * Booking line total in euro cents (for coupons / payment).
 */
export function getBookingSubtotalCentsFromStore(storeData: {
  location: LocationData | null;
  package: PackageData | null;
}): number {
  const { location, package: pkg } = storeData;
  if (!location || !pkg) {
    return 0;
  }
  const euros = sumBookingTotal(
    { tollFeeEur: location.tollFeeEur },
    {
      selectedPlan: pkg.selectedPlan,
      carType: pkg.carType,
      addOns: pkg.addOns,
    }
  );
  return Math.round(euros * 100);
}

/**
 * Convert zone string to boolean for database storage
 * @param zone - "inside" or "outside"
 * @returns true if inside, false if outside
 */
export function zoneToBoolean(zone: "inside" | "outside"): boolean {
  return zone === "inside";
}

/**
 * Format Date object to YYYY-MM-DD string for database storage
 * @param date - Date object
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForDb(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Transform booking store data to database format
 * This function maps the Zustand store structure to the database schema structure
 */
export interface BookingDbData {
  franchiseId: number;
  reference: string;
  postalCode: string;
  address: string;
  isInsideZone: boolean;
  tollFee: number;
  waterAvailable: boolean;
  electricityAvailable: boolean;
  carType: string;
  plan: string;
  addons: AddOn[];
  date: string;
  time: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  licensePlate?: string;
  carMake?: string;
  parkingNotes?: string;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToService: boolean;
  couponCode?: string;
  totalPrice: number;
  currency: string;
  stripePaymentIntentId?: string;
  status: string;
  userId?: number;
}

/**
 * Transform booking store data to database format
 * @param storeData - Data from the booking store
 * @param franchiseId - The franchise ID for this booking
 * @param reference - The booking reference number
 * @param currency - The currency to use (defaults to EUR)
 * @param loggedInUserId - If set, ties the booking to the authenticated user account
 * @returns Data formatted for database insertion
 */
export function transformBookingStoreToDb(
  storeData: {
    location: LocationData | null;
    package: PackageData | null;
    dateTime: DateTimeData | null;
    contactDetails: ContactDetails | null;
    payment: PaymentData | null;
  },
  franchiseId: number,
  reference: string,
  currency: string = "EUR",
  discountedPrice?: number, // Optional discounted price (in cents for EUR)
  loggedInUserId?: number
): BookingDbData {
  const {
    location,
    package: pkg,
    dateTime,
    contactDetails,
    payment,
  } = storeData;

  if (!location || !pkg || !dateTime || !contactDetails || !payment) {
    throw new Error("All booking steps must be completed");
  }

  // Calculate total price (EUR)
  let totalPrice = sumBookingTotal(
    { tollFeeEur: location.tollFeeEur },
    {
      selectedPlan: pkg.selectedPlan,
      carType: pkg.carType,
      addOns: pkg.addOns,
    }
  );

  // Apply discount if provided (discountedPrice is in cents, convert to euros)
  if (discountedPrice !== undefined && currency === "EUR") {
    totalPrice = Math.round(discountedPrice / 100); // Convert from cents to euros
  }

  return {
    franchiseId,
    reference,
    ...(loggedInUserId != null ? { userId: loggedInUserId } : {}),
    // Location data
    postalCode: location.postalCode,
    address: location.address,
    isInsideZone: zoneToBoolean(location.zone),
    tollFee: location.tollFeeEur,
    waterAvailable: location.hasWater,
    electricityAvailable: location.hasElectricity,
    // Package data
    carType: pkg.carType,
    plan: pkg.selectedPlan,
    addons: pkg.addOns,
    // DateTime data
    date: formatDateForDb(dateTime.date),
    time: dateTime.timeSlot,
    // Contact details
    customerFirstName: contactDetails.firstName,
    customerLastName: contactDetails.lastName,
    customerEmail: contactDetails.email,
    customerPhone: contactDetails.phone,
    licensePlate: contactDetails.licensePlate,
    carMake: contactDetails.carMake,
    parkingNotes: contactDetails.parkingNote,
    // Legal agreements
    agreedToTerms: payment.agreedToTerms,
    agreedToPrivacy: payment.agreedToPrivacy,
    agreedToService: payment.agreedToService,
    // Payment data
    couponCode: payment.couponCode?.trim()
      ? normalizeCouponCode(payment.couponCode)
      : undefined,
    totalPrice,
    currency,
    // Status (defaults to pending)
    status: "pending",
  };
}

/**
 * Generate a unique booking reference
 * Format: ENX-{cryptographic random hex}
 * @returns Booking reference string
 */
export function generateBookingReference(): string {
  const randomPart = randomBytes(9).toString("hex").slice(0, 14).toUpperCase();
  return `ENX-${randomPart}`;
}
