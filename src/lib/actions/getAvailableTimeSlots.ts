"use server";

import { db } from "../db/client";
import { timeSlots } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { resolveFranchiseId } from "../franchise";
import { headers } from "next/headers";
import { formatDateForDb } from "../booking-helpers";
import type { PlanType } from "@/store/booking-store";
import {
  filterSlotsEligibleForBookingDay,
  getExpectedBookingTimeSlots,
} from "../booking-time-slots";

/**
 * Get all available time slots for a specific date
 * @param date - Date object for the booking
 * @returns Array of available time slot strings
 */
export async function getAvailableTimeSlots(
  date: Date,
  plan: PlanType = "basic"
): Promise<{ time: string; available: boolean }[]> {
  try {
    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    const expectedSlots = getExpectedBookingTimeSlots(date, plan);
    if (expectedSlots.length === 0) {
      return [];
    }

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
      return filterSlotsEligibleForBookingDay(
        expectedSlots.map((time) => ({ time, available: true })),
        date
      );
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
    const merged = expectedSlots.map((time) => ({
      time,
      available: slotMap.get(time) ?? true, // Default to available if not in DB
    }));
    return filterSlotsEligibleForBookingDay(merged, date);
  } catch (error) {
    console.error("Error getting available time slots:", error);
    // Return default slots as available on error
    const expectedSlots = getExpectedBookingTimeSlots(date, plan);
    if (expectedSlots.length === 0) {
      return [];
    }
    return filterSlotsEligibleForBookingDay(
      expectedSlots.map((time) => ({ time, available: true })),
      date
    );
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
  endDate: Date,
  plan: PlanType = "basic"
): Promise<Record<string, { time: string; available: boolean }[]>> {
  try {
    const headersList = await headers();
    await resolveFranchiseId(headersList);

    const result: Record<string, { time: string; available: boolean }[]> = {};
    const currentDate = new Date(startDate);

    // Iterate through each date in the range
    while (currentDate <= endDate) {
      const dateStr = formatDateForDb(currentDate);
      const slots = await getAvailableTimeSlots(currentDate, plan);
      result[dateStr] = slots;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  } catch (error) {
    console.error("Error getting available time slots for range:", error);
    return {};
  }
}
