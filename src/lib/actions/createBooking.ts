"use server";

import { db } from "../db/client";
import { bookings, timeSlots, bookingEvents } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { getFranchiseIdFromHeaders } from "../franchise";
import { headers } from "next/headers";
import {
  transformBookingStoreToDb,
  generateBookingReference,
} from "../booking-helpers";
import type {
  LocationData,
  PackageData,
  DateTimeData,
  ContactDetails,
  PaymentData,
} from "@/store/booking-store";

/**
 * Create a new booking with status "pending"
 * @param storeData - Complete booking data from Zustand store
 * @returns Created booking data or error
 */
export async function createBooking(
  storeData: {
    location: LocationData | null;
    package: PackageData | null;
    dateTime: DateTimeData | null;
    contactDetails: ContactDetails | null;
    payment: PaymentData | null;
  },
  discountedPriceInCents?: number // Optional discounted price in cents
): Promise<{
  success: boolean;
  bookingId?: number;
  reference?: string;
  message?: string;
}> {
  try {
    // Get franchise ID from headers
    const headersList = await headers();
    // const franchiseId = await getFranchiseIdFromHeaders(headersList);
    const franchiseId = 1;

    if (!franchiseId) {
      return {
        success: false,
        message: "Franchise not found. Please access the site via a franchise subdomain.",
      };
    }

    // Validate all required data is present
    if (
      !storeData.location ||
      !storeData.package ||
      !storeData.dateTime ||
      !storeData.contactDetails ||
      !storeData.payment
    ) {
      return {
        success: false,
        message: "Missing required booking information",
      };
    }

    // Generate unique booking reference
    let reference = generateBookingReference();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure reference is unique
    while (attempts < maxAttempts) {
      const existing = await db
        .select()
        .from(bookings)
        .where(eq(bookings.reference, reference))
        .limit(1);

      if (existing.length === 0) {
        break; // Reference is unique
      }

      reference = generateBookingReference();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return {
        success: false,
        message: "Failed to generate unique booking reference",
      };
    }

    // Transform store data to database format
    // Pass discounted price if provided (it's in cents, will be converted in the helper)
    const bookingData = transformBookingStoreToDb(
      storeData,
      franchiseId,
      reference,
      "EUR", // Default currency
      discountedPriceInCents
    );

    // Check if time slot is still available
    const slotCheck = await db
      .select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.franchiseId, franchiseId),
          eq(timeSlots.date, bookingData.date),
          eq(timeSlots.time, bookingData.time)
        )
      )
      .limit(1);

    // Check if slot is already booked or has a pending booking
    if (slotCheck.length > 0 && (slotCheck[0].isBooked || slotCheck[0].bookingId)) {
      return {
        success: false,
        message: "This time slot is no longer available",
      };
    }

    // Create booking in database
    const [newBooking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();

    if (!newBooking) {
      return {
        success: false,
        message: "Failed to create booking",
      };
    }

    // Create or update time slot (mark as reserved, not fully booked yet)
    if (slotCheck.length > 0) {
      // Update existing slot
      await db
        .update(timeSlots)
        .set({
          isBooked: false, // Keep as false until payment is confirmed
          bookingId: newBooking.id,
        })
        .where(eq(timeSlots.id, slotCheck[0].id));
    } else {
      // Create new time slot entry
      await db.insert(timeSlots).values({
        franchiseId,
        date: bookingData.date,
        time: bookingData.time,
        isBooked: false, // Will be set to true when payment is confirmed
        bookingId: newBooking.id,
      });
    }

    // Create initial booking event log
    await db.insert(bookingEvents).values({
      franchiseId,
      bookingId: newBooking.id,
      fromStatus: null,
      toStatus: "pending",
    });

    return {
      success: true,
      bookingId: newBooking.id,
      reference: newBooking.reference,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while creating the booking",
    };
  }
}

