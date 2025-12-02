"use server";

import { db } from "../../db/client";
import { bookings, timeSlots, bookingEvents } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { requireAdmin } from "../../auth/authorization";
import { sendBookingUpdateEmail } from "../../emails/bookingUpdate";

/**
 * Update booking details (admin only)
 * @param bookingId - The booking ID to update
 * @param updates - Fields to update
 * @returns Success status or error
 */
export async function updateBooking(
  bookingId: number,
  updates: {
    date?: string;
    time?: string;
    status?: string;
    address?: string;
    postalCode?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerFirstName?: string;
    customerLastName?: string;
    totalPrice?: number;
    notes?: string;
  }
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

    // Get existing booking
    const [existingBooking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.franchiseId, franchiseId)
        )
      )
      .limit(1);

    if (!existingBooking) {
      return {
        success: false,
        message: "Booking not found",
      };
    }

    // Prepare update data
    const updateData: Partial<typeof bookings.$inferInsert> = {};

    // Handle date/time changes - need to update time slots
    if (updates.date || updates.time) {
      const newDate = updates.date || existingBooking.date;
      const newTime = updates.time || existingBooking.time;

      // Free up old time slot
      await db
        .update(timeSlots)
        .set({
          isBooked: false,
          bookingId: null,
        })
        .where(
          and(
            eq(timeSlots.franchiseId, franchiseId),
            eq(timeSlots.date, existingBooking.date),
            eq(timeSlots.time, existingBooking.time),
            eq(timeSlots.bookingId, bookingId)
          )
        );

      // Reserve new time slot
      const [existingSlot] = await db
        .select()
        .from(timeSlots)
        .where(
          and(
            eq(timeSlots.franchiseId, franchiseId),
            eq(timeSlots.date, newDate),
            eq(timeSlots.time, newTime)
          )
        )
        .limit(1);

      if (existingSlot) {
        await db
          .update(timeSlots)
          .set({
            bookingId: bookingId,
            isBooked: existingBooking.status === "confirmed",
          })
          .where(eq(timeSlots.id, existingSlot.id));
      } else {
        await db.insert(timeSlots).values({
          franchiseId,
          date: newDate,
          time: newTime,
          bookingId: bookingId,
          isBooked: existingBooking.status === "confirmed",
        });
      }

      updateData.date = newDate;
      updateData.time = newTime;
    }

    // Handle status changes - log event
    if (updates.status && updates.status !== existingBooking.status) {
      await db.insert(bookingEvents).values({
        franchiseId,
        bookingId,
        fromStatus: existingBooking.status,
        toStatus: updates.status,
      });

      // Update time slot booking status if status changed to/from confirmed
      if (updates.status === "confirmed" || existingBooking.status === "confirmed") {
        const bookingDate = updates.date || existingBooking.date;
        const bookingTime = updates.time || existingBooking.time;

        await db
          .update(timeSlots)
          .set({
            isBooked: updates.status === "confirmed",
          })
          .where(
            and(
              eq(timeSlots.franchiseId, franchiseId),
              eq(timeSlots.date, bookingDate),
              eq(timeSlots.time, bookingTime),
              eq(timeSlots.bookingId, bookingId)
            )
          );
      }

      updateData.status = updates.status;
    }

    // Handle other field updates
    if (updates.address) updateData.address = updates.address;
    if (updates.postalCode) updateData.postalCode = updates.postalCode;
    if (updates.customerEmail) updateData.customerEmail = updates.customerEmail;
    if (updates.customerPhone) updateData.customerPhone = updates.customerPhone;
    if (updates.customerFirstName) updateData.customerFirstName = updates.customerFirstName;
    if (updates.customerLastName) updateData.customerLastName = updates.customerLastName;
    if (updates.totalPrice !== undefined) updateData.totalPrice = updates.totalPrice;
    if (updates.notes) updateData.parkingNotes = updates.notes;

    // Update booking
    const [updatedBooking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updatedBooking) {
      return {
        success: false,
        message: "Failed to update booking",
      };
    }

    // Track changes for email notification
    const changes: any = {};
    if (updates.date && updates.date !== existingBooking.date) {
      changes.date = { old: existingBooking.date, new: updatedBooking.date };
    }
    if (updates.time && updates.time !== existingBooking.time) {
      changes.time = { old: existingBooking.time, new: updatedBooking.time };
    }
    if (updates.status && updates.status !== existingBooking.status) {
      changes.status = { old: existingBooking.status, new: updatedBooking.status };
    }
    if (updates.address && updates.address !== existingBooking.address) {
      changes.address = { old: existingBooking.address, new: updatedBooking.address };
    }
    if (updates.postalCode && updates.postalCode !== existingBooking.postalCode) {
      changes.postalCode = { old: existingBooking.postalCode, new: updatedBooking.postalCode };
    }
    if (updates.totalPrice !== undefined && updates.totalPrice !== existingBooking.totalPrice) {
      changes.totalPrice = { old: existingBooking.totalPrice, new: updatedBooking.totalPrice };
    }
    if (updates.customerEmail && updates.customerEmail !== existingBooking.customerEmail) {
      changes.customerEmail = { old: existingBooking.customerEmail, new: updatedBooking.customerEmail };
    }
    if (updates.customerPhone && updates.customerPhone !== existingBooking.customerPhone) {
      changes.customerPhone = { old: existingBooking.customerPhone, new: updatedBooking.customerPhone };
    }
    if (updates.customerFirstName && updates.customerFirstName !== existingBooking.customerFirstName) {
      changes.customerFirstName = { old: existingBooking.customerFirstName, new: updatedBooking.customerFirstName };
    }
    if (updates.customerLastName && updates.customerLastName !== existingBooking.customerLastName) {
      changes.customerLastName = { old: existingBooking.customerLastName, new: updatedBooking.customerLastName };
    }
    if (updates.notes && updates.notes !== (existingBooking.parkingNotes || "")) {
      changes.notes = { old: existingBooking.parkingNotes || null, new: updatedBooking.parkingNotes || "" };
    }

    // Send email notification if there are changes
    if (Object.keys(changes).length > 0) {
      try {
        const emailResult = await sendBookingUpdateEmail(updatedBooking, changes);
        if (!emailResult.success) {
          console.error("Failed to send booking update email:", emailResult.error);
          // Don't fail the update if email fails, just log it
        }
      } catch (emailError) {
        console.error("Error sending booking update email:", emailError);
        // Don't fail the update if email fails
      }
    }

    return {
      success: true,
      booking: updatedBooking,
    };
  } catch (error) {
    console.error("Error updating booking:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while updating the booking",
    };
  }
}

