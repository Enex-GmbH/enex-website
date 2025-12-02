"use server";

import { db } from "../db/client";
import { bookings, payments, timeSlots, bookingEvents } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { getFranchiseIdFromHeaders } from "../franchise";
import { headers } from "next/headers";
import { sendBookingConfirmationEmail } from "../emails/bookingConfirmation";

/**
 * Confirm a booking after successful payment
 * Updates booking status, marks time slot as booked, creates payment record, and logs event
 * @param bookingId - The booking ID to confirm
 * @param paymentIntentId - Stripe payment intent ID
 * @param amount - Payment amount in cents
 * @returns Success status or error
 */
export async function confirmBooking(
  bookingId: number,
  paymentIntentId: string,
  amount: number
): Promise<{
  success: boolean;
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
        message: "Franchise not found",
      };
    }

    // Get booking to verify it exists and is in pending status
    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.franchiseId, franchiseId),
          eq(bookings.status, "pending")
        )
      )
      .limit(1);

    if (!booking) {
      return {
        success: false,
        message: "Booking not found or already confirmed",
      };
    }

    // Start transaction-like operations
    // Note: Drizzle doesn't have built-in transactions with neon-serverless,
    // so we'll do sequential operations. Consider using a transaction wrapper if needed.

    // 1. Update booking status to "confirmed"
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: "confirmed",
        stripePaymentIntentId: paymentIntentId,
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      return {
        success: false,
        message: "Failed to update booking status",
      };
    }

    // 2. Mark time slot as booked
    await db
      .update(timeSlots)
      .set({
        isBooked: true,
      })
      .where(
        and(
          eq(timeSlots.franchiseId, franchiseId),
          eq(timeSlots.date, booking.date),
          eq(timeSlots.time, booking.time),
          eq(timeSlots.bookingId, bookingId)
        )
      );

    // 3. Create payment record
    await db.insert(payments).values({
      franchiseId,
      bookingId,
      stripePaymentIntentId: paymentIntentId,
      amount,
      status: "succeeded",
      currency: booking.currency,
    });

    // 4. Create booking event log for status change
    await db.insert(bookingEvents).values({
      franchiseId,
      bookingId,
      fromStatus: "pending",
      toStatus: "confirmed",
    });

    // 5. Send confirmation email to customer
    try {
      const emailResult = await sendBookingConfirmationEmail(updatedBooking);
      if (!emailResult.success) {
        console.error(
          "Failed to send booking confirmation email:",
          emailResult.error
        );
        // Don't fail the booking confirmation if email fails, just log it
      }
    } catch (emailError) {
      console.error("Error sending booking confirmation email:", emailError);
      // Don't fail the booking confirmation if email fails
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error confirming booking:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while confirming the booking",
    };
  }
}

/**
 * Get booking by reference (for confirmation page and booking management)
 * @param reference - Booking reference number
 * @returns Booking data or null
 */
export async function getBookingByReference(reference: string): Promise<{
  success: boolean;
  booking?: typeof bookings.$inferSelect;
  message?: string;
}> {
  try {
    const headersList = await headers();
    // const franchiseId = await getFranchiseIdFromHeaders(headersList);
    const franchiseId = 1;

    if (!franchiseId) {
      return {
        success: false,
        message: "Franchise not found",
      };
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.reference, reference),
          eq(bookings.franchiseId, franchiseId)
        )
      )
      .limit(1);

    if (!booking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    return {
      success: true,
      booking,
    };
  } catch (error) {
    console.error("Error getting booking:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while retrieving the booking",
    };
  }
}
