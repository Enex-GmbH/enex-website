import type { bookings } from "@/lib/db/schema";

type Booking = typeof bookings.$inferSelect;

/**
 * Phase 1: no PSP — ensure the client-reported amount matches the persisted booking
 * (mitigates tampered requests; not a substitute for Stripe verification in phase 2).
 */
export function assertConfirmationAmountMatchesBooking(
  booking: Booking,
  amountCents: number
): { ok: true } | { ok: false; message: string } {
  const expectedCents = Math.round(booking.totalPrice * 100);
  if (amountCents !== expectedCents) {
    return {
      ok: false,
      message: "Betrag stimmt nicht mit der Buchung überein.",
    };
  }
  return { ok: true };
}
