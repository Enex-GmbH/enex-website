"use server";

import { db } from "../db/client";
import { timeSlots } from "../db/schema";
import { eq, and, or } from "drizzle-orm";
import { resolveFranchiseId } from "../franchise";
import { headers } from "next/headers";
import { formatDateForDb } from "../booking-helpers";

const defaultTimeSlots = ["09:30", "11:00", "13:00", "15:00", "17:00"];

/**
 * Get all dates that are fully booked (all time slots are unavailable)
 * @param startDate - Start date for the range to check
 * @param endDate - End date for the range to check
 * @returns Array of date strings (YYYY-MM-DD) that are fully booked
 */
export async function getFullyBookedDates(
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  try {
    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    const fullyBookedDates: string[] = [];
    const currentDate = new Date(startDate);

    // Iterate through each date in the range
    while (currentDate <= endDate) {
      const dateStr = formatDateForDb(currentDate);

      // Get all time slots for this date
      const slots = await db
        .select()
        .from(timeSlots)
        .where(
          and(
            eq(timeSlots.franchiseId, franchiseId),
            eq(timeSlots.date, dateStr)
          )
        );

      // Check if all default time slots are booked or have a bookingId
      const bookedSlots = slots.filter(
        (slot) => slot.isBooked || slot.bookingId
      );

      // If we have slots in DB, check if all are booked
      if (slots.length > 0) {
        // Count how many of the default slots are booked
        const bookedDefaultSlots = defaultTimeSlots.filter((time) => {
          const slot = slots.find((s) => s.time === time);
          return slot && (slot.isBooked || slot.bookingId);
        });

        // If all default slots are booked, mark this date as fully booked
        if (bookedDefaultSlots.length === defaultTimeSlots.length) {
          fullyBookedDates.push(dateStr);
        }
      }
      // If no slots exist in DB, the date is available (not fully booked)

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return fullyBookedDates;
  } catch (error) {
    console.error("Error getting fully booked dates:", error);
    return [];
  }
}

/**
 * Check if a specific date is fully booked
 * @param date - Date to check
 * @returns true if the date is fully booked
 */
export async function isDateFullyBooked(date: Date): Promise<boolean> {
  try {
    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    const dateStr = formatDateForDb(date);

    // Get all time slots for this date
    const slots = await db
      .select()
      .from(timeSlots)
      .where(
        and(eq(timeSlots.franchiseId, franchiseId), eq(timeSlots.date, dateStr))
      );

    // If no slots exist, the date is available
    if (slots.length === 0) {
      return false;
    }

    // Check if all default time slots are booked
    const bookedDefaultSlots = defaultTimeSlots.filter((time) => {
      const slot = slots.find((s) => s.time === time);
      return slot && (slot.isBooked || slot.bookingId);
    });

    // Date is fully booked if all default slots are booked
    return bookedDefaultSlots.length === defaultTimeSlots.length;
  } catch (error) {
    console.error("Error checking if date is fully booked:", error);
    return false; // Default to available on error
  }
}
