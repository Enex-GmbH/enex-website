"use server";

import { db } from "../db/client";
import { timeSlots } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { resolveFranchiseId } from "../franchise";
import { headers } from "next/headers";
import { formatDateForDb } from "../booking-helpers";

/**
 * Get all available time slots for a specific date
 * @param date - Date object for the booking
 * @returns Array of available time slot strings
 */
export async function getAvailableTimeSlots(
  date: Date
): Promise<{ time: string; available: boolean }[]> {
  try {
    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    const defaultTimeSlots = ["09:30", "11:00", "13:00", "15:00", "17:00"];

    const dateStr = formatDateForDb(date);

    // Get all time slots for this date and franchise
    const slots = await db
      .select()
      .from(timeSlots)
      .where(
        and(eq(timeSlots.franchiseId, franchiseId), eq(timeSlots.date, dateStr))
      );

    // If no slots exist in DB, return all default slots as available
    if (slots.length === 0) {
      return defaultTimeSlots.map((time) => ({
        time,
        available: true,
      }));
    }

    // Map existing slots to availability
    // A slot is unavailable if:
    // 1. It's marked as booked (isBooked = true), OR
    // 2. It has a bookingId assigned (even if pending payment)
    const slotMap = new Map(
      slots.map((slot) => [
        slot.time,
        !slot.isBooked && !slot.bookingId, // Available only if not booked AND no bookingId
      ])
    );

    // Return all default slots with their availability status
    return defaultTimeSlots.map((time) => ({
      time,
      available: slotMap.get(time) ?? true, // Default to available if not in DB
    }));
  } catch (error) {
    console.error("Error getting available time slots:", error);
    // Return default slots as available on error
    const defaultTimeSlots = ["09:30", "11:00", "13:00", "15:00", "17:00"];
    return defaultTimeSlots.map((time) => ({
      time,
      available: true,
    }));
  }
}

/**
 * Get available time slots for multiple dates (for calendar view)
 * @param startDate - Start date for the range
 * @param endDate - End date for the range
 * @returns Map of date strings to available time slots
 */
export async function getAvailableTimeSlotsForRange(
  startDate: Date,
  endDate: Date
): Promise<Record<string, { time: string; available: boolean }[]>> {
  try {
    const headersList = await headers();
    await resolveFranchiseId(headersList);

    const result: Record<string, { time: string; available: boolean }[]> = {};
    const currentDate = new Date(startDate);

    // Iterate through each date in the range
    while (currentDate <= endDate) {
      const dateStr = formatDateForDb(currentDate);
      const slots = await getAvailableTimeSlots(currentDate);
      result[dateStr] = slots;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  } catch (error) {
    console.error("Error getting available time slots for range:", error);
    return {};
  }
}
