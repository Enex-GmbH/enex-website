"use server";

import { db } from "../../db/client";
import { bookings, timeSlots, bookingEvents } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { requireAdmin } from "../../auth/authorization";
import { sendBookingCancellationEmail } from "../../emails/bookingUpdate";

/**
 * Cancel a booking (admin only)
 * This updates the status to cancelled and frees up the time slot
 * @param bookingId - The booking ID to cancel
 * @param reason - Optional cancellation reason
 * @returns Success status or error
 */
export async function cancelBooking(
  bookingId: number,
  reason?: string
): Promise<{
  success: boolean;
  message?: string;
  booking?: typeof bookings.$inferSelect;
}> {
  try {
    // Require admin access
    await requireAdmin();

    const headersList = await headers();
    // const franchiseId = await getFranchiseIdFromHeaders(headersList);
    const franchiseId = 1;

    if (!franchiseId) {
      return {
        success: false,
        message: "Franchise not found",
      };
    }

    // Get booking
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

    if (booking.status === "cancelled") {
      return {
        success: false,
        message: "Booking is already cancelled",
      };
    }

    // Update booking status
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: "cancelled",
        parkingNotes: reason
          ? `${booking.parkingNotes || ""}\n[Cancelled: ${reason}]`.trim()
          : booking.parkingNotes,
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      return {
        success: false,
        message: "Failed to cancel booking",
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

    // Log the cancellation event
    await db.insert(bookingEvents).values({
      franchiseId,
      bookingId,
      fromStatus: booking.status,
      toStatus: "cancelled",
    });

    // Send cancellation email to customer
    try {
      const emailResult = await sendBookingCancellationEmail(
        updatedBooking,
        reason
      );
      if (!emailResult.success) {
        console.error(
          "Failed to send booking cancellation email:",
          emailResult.error
        );
        // Don't fail the cancellation if email fails, just log it
      }
    } catch (emailError) {
      console.error("Error sending booking cancellation email:", emailError);
      // Don't fail the cancellation if email fails
    }

    return {
      success: true,
      booking: updatedBooking,
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while cancelling the booking",
    };
  }
}
