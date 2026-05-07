"use server";

import { db } from "../db/client";
import { timeSlots } from "../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { resolveFranchiseId } from "../franchise";
import { headers } from "next/headers";
import { formatDateForDb } from "../booking-helpers";
import type { PlanType } from "@/store/booking-store";
import { getExpectedBookingTimeSlots } from "../booking-time-slots";

type SlotLite = {
  date: string;
  time: string;
  isBooked: boolean | null;
  bookingId: number | null;
};

function computeFullyBookedInRange(
  rows: SlotLite[],
  startDate: Date,
  endDate: Date,
  plan: PlanType
): string[] {
  const byDate = new Map<string, SlotLite[]>();
  for (const row of rows) {
    const list = byDate.get(row.date);
    if (list) list.push(row);
    else byDate.set(row.date, [row]);
  }

  const fullyBookedDates: string[] = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const dateStr = formatDateForDb(cursor);
    const expectedSlots = getExpectedBookingTimeSlots(cursor, plan);

    if (expectedSlots.length === 0) {
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }

    const slots = byDate.get(dateStr) ?? [];

    /* Komplett belegt, wenn jedes erwartete Fenster in der DB liegt und gebucht/reserviert ist. */
    const bookedAll = expectedSlots.filter((time) => {
      const slot = slots.find((s) => s.time === time);
      return slot && (slot.isBooked || slot.bookingId);
    });

    if (bookedAll.length === expectedSlots.length) {
      fullyBookedDates.push(dateStr);
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return fullyBookedDates;
}

/**
 * Get all dates that are fully booked (all time slots are unavailable)
 * @param startDate - Start date for the range to check
 * @param endDate - End date for the range to check
 * @returns Array of date strings (YYYY-MM-DD) that are fully booked
 */
export async function getFullyBookedDates(
  startDate: Date,
  endDate: Date,
  plan: PlanType = "basic"
): Promise<string[]> {
  try {
    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    const startStr = formatDateForDb(startDate);
    const endStr = formatDateForDb(endDate);

    const rows = await db
      .select({
        date: timeSlots.date,
        time: timeSlots.time,
        isBooked: timeSlots.isBooked,
        bookingId: timeSlots.bookingId,
      })
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.franchiseId, franchiseId),
          gte(timeSlots.date, startStr),
          lte(timeSlots.date, endStr)
        )
      );

    return computeFullyBookedInRange(rows, startDate, endDate, plan);
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
export async function isDateFullyBooked(
  date: Date,
  plan: PlanType = "basic"
): Promise<boolean> {
  try {
    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    const dateStr = formatDateForDb(date);

    const rows = await db
      .select({
        date: timeSlots.date,
        time: timeSlots.time,
        isBooked: timeSlots.isBooked,
        bookingId: timeSlots.bookingId,
      })
      .from(timeSlots)
      .where(
        and(eq(timeSlots.franchiseId, franchiseId), eq(timeSlots.date, dateStr))
      );

    const expectedSlots = getExpectedBookingTimeSlots(date, plan);
    if (expectedSlots.length === 0) {
      return false;
    }

    if (rows.length === 0) {
      return false;
    }

    const bookedAll = expectedSlots.filter((time) => {
      const slot = rows.find((s) => s.time === time);
      return slot && (slot.isBooked || slot.bookingId);
    });

    return bookedAll.length === expectedSlots.length;
  } catch (error) {
    console.error("Error checking if date is fully booked:", error);
    return false;
  }
}
