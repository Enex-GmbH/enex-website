"use server";

import { db } from "../db/client";
import { timeSlots } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { resolveFranchiseId } from "../franchise";
import { headers } from "next/headers";
import { formatDateForDb } from "../booking-helpers";

/**
 * Check if a specific time slot is available for booking
 * @param date - Date object for the booking
 * @param time - Time slot string (e.g., "09:30")
 * @returns Object with availability status
 */
export async function checkAvailability(
  date: Date,
  time: string
): Promise<{ available: boolean; message?: string }> {
  try {
    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    const dateStr = formatDateForDb(date);

    // Check if time slot exists and is available
    const slot = await db
      .select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.franchiseId, franchiseId),
          eq(timeSlots.date, dateStr),
          eq(timeSlots.time, time)
        )
      )
      .limit(1);

    if (slot.length === 0) {
      // Time slot doesn't exist in DB - consider it available
      // You may want to create it on-the-fly or return unavailable
      return {
        available: true,
      };
    }

    const timeSlot = slot[0];

    if (timeSlot.isBooked) {
      return {
        available: false,
        message: "This time slot is already booked",
      };
    }

    if (timeSlot.bookingId) {
      return {
        available: false,
        message: "This time slot is reserved",
      };
    }

    return {
      available: true,
    };
  } catch (error) {
    console.error("Error checking availability:", error);
    return {
      available: false,
      message: "Error checking availability",
    };
  }
}
