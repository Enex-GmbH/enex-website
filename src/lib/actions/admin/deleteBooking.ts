"use server";

import { db } from "../../db/client";
import { bookings, timeSlots, payments, bookingEvents } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { requireAdmin } from "../../auth/authorization";
import { resolveFranchiseId } from "../../franchise";

/**
 * Delete a booking (admin only)
 * This will also free up the associated time slot and log the deletion
 * @param bookingId - The booking ID to delete
 * @returns Success status or error
 */
export async function deleteBooking(bookingId: number): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    // Require admin access
    await requireAdmin();

    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    // Get booking to verify it exists
    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, bookingId), eq(bookings.franchiseId, franchiseId))
      )
      .limit(1);

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    // Free up the time slot
    await db
      .update(timeSlots)
      .set({
        isBooked: false,
        bookingId: null,
      })
      .where(
        and(
          eq(timeSlots.franchiseId, franchiseId),
          eq(timeSlots.date, booking.date),
          eq(timeSlots.time, booking.time),
          eq(timeSlots.bookingId, bookingId)
        )
      );

    // Delete related records (in order due to foreign keys)
    // Note: Payments might have foreign key constraints, so we handle them first
    await db.delete(payments).where(eq(payments.bookingId, bookingId));

    // Delete booking events
    await db
      .delete(bookingEvents)
      .where(eq(bookingEvents.bookingId, bookingId));

    // Delete the booking
    await db.delete(bookings).where(eq(bookings.id, bookingId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while deleting the booking",
    };
  }
}
