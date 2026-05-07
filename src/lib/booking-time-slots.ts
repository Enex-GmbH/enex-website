/**
 * Canonical values for `bookings.time` / `time_slots.time` (and checkout UI labels).
 *
 * Basic & Premium: 4h Fenster Mo–Fr; Samstag ein kürzeres Fenster.
 * Exklusiv: 8h, ein Fenster Mo–Fr 08:00–16:00 (Samstag nicht buchbar).
 * Sonntags: keine Slots (geschlossen).
 */

import type { PlanType } from "@/store/booking-store";

export const BOOKING_SLOTS_WEEKDAY = ["08:00-12:00", "13:00-17:00"] as const;

export const BOOKING_SLOT_SATURDAY = "09:00-13:00";

/** Exklusiv-Paket: voller Arbeitstag */
export const BOOKING_SLOT_EXCLUSIVE_WEEKDAY = "08:00-16:00";

export type BookingSlotLabel =
  | (typeof BOOKING_SLOTS_WEEKDAY)[number]
  | typeof BOOKING_SLOT_SATURDAY
  | typeof BOOKING_SLOT_EXCLUSIVE_WEEKDAY;

/** Erwartbare Slots für Kalenderdatum (Lokalzeit) und Paket; So → []. */
export function getExpectedBookingTimeSlots(
  date: Date,
  plan: PlanType = "basic"
): BookingSlotLabel[] {
  const dow = date.getDay(); // Sun 0 … Sat 6

  if (dow === 0) return [];

  if (plan === "exclusive") {
    /* 8h nur unter der Woche — blockt den Tag als ein Slot */
    if (dow === 6) return [];
    return [BOOKING_SLOT_EXCLUSIVE_WEEKDAY];
  }

  /* basic / premium */
  if (dow === 6) return [BOOKING_SLOT_SATURDAY];
  return [...BOOKING_SLOTS_WEEKDAY];
}

export function isBookingDaySelectable(
  date: Date,
  plan: PlanType = "basic"
): boolean {
  return getExpectedBookingTimeSlots(date, plan).length > 0;
}

export function getDefaultBookingTimeSlotForDate(
  date: Date,
  plan: PlanType = "basic"
): BookingSlotLabel | undefined {
  return getExpectedBookingTimeSlots(date, plan)[0];
}
