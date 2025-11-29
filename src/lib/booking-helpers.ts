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
}

/**
 * Transform booking store data to database format
 * @param storeData - Data from the booking store
 * @param franchiseId - The franchise ID for this booking
 * @param reference - The booking reference number
 * @param currency - The currency to use (defaults to EUR)
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
  discountedPrice?: number // Optional discounted price (in cents for EUR)
): BookingDbData {
  const { location, package: pkg, dateTime, contactDetails, payment } = storeData;

  if (!location || !pkg || !dateTime || !contactDetails || !payment) {
    throw new Error("All booking steps must be completed");
  }

  // Calculate total price (using EUR as primary currency for now)
  let totalPrice = calculateTotalPrice(location, pkg, currency);
  
  // Apply discount if provided (discountedPrice is in cents, convert to euros)
  if (discountedPrice !== undefined && currency === "EUR") {
    totalPrice = Math.round(discountedPrice / 100); // Convert from cents to euros
  }

  return {
    franchiseId,
    reference,
    // Location data
    postalCode: location.postalCode,
    address: location.address,
    isInsideZone: zoneToBoolean(location.zone),
    tollFee: currency === "EUR" ? location.tollFeeEur : location.tollFeeDkr,
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
    couponCode: payment.couponCode,
    totalPrice,
    currency,
    // Status (defaults to pending)
    status: "pending",
  };
}

/**
 * Calculate total price based on currency
 * @param location - Location data with toll fees
 * @param pkg - Package data with plan and addons
 * @param currency - Currency code (EUR or DKK)
 * @returns Total price in the specified currency
 */
function calculateTotalPrice(
  location: LocationData,
  pkg: PackageData,
  currency: string
): number {
  let total = 0;

  // Add toll fee
  total += currency === "EUR" ? location.tollFeeEur : location.tollFeeDkr;

  // Add plan base price
  const planPrices = {
    basic: { eur: 60, dkr: 450 },
    premium: { eur: 90, dkr: 675 },
    exclusive: { eur: 150, dkr: 1125 },
  };

  total +=
    currency === "EUR"
      ? planPrices[pkg.selectedPlan].eur
      : planPrices[pkg.selectedPlan].dkr;

  // Add add-ons
  pkg.addOns.forEach((addOn) => {
    total += currency === "EUR" ? addOn.priceEur : addOn.priceDkr;
  });

  return total;
}

/**
 * Generate a unique booking reference
 * Format: ENX-{random uppercase alphanumeric}
 * @returns Booking reference string
 */
export function generateBookingReference(): string {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 9)
    .toUpperCase();
  return `ENX-${randomPart}`;
}

