"use server";

import { db } from "../db/client";
import {
  bookings,
  timeSlots,
  bookingEvents,
  coupons,
  payments,
  franchises,
} from "../db/schema";
import { eq, and } from "drizzle-orm";
import { resolveFranchiseId } from "../franchise";
import { headers } from "next/headers";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import {
  getBookingSubtotalCentsFromStore,
  transformBookingStoreToDb,
  generateBookingReference,
} from "../booking-helpers";
import { isBookingSlotEligibleForInstantBooking } from "../booking-time-slots";
import {
  computeDiscountCents,
  normalizeCouponCode,
  type CouponDiscountType,
} from "@/lib/coupon-pricing";
import type {
  LocationData,
  PackageData,
  DateTimeData,
  ContactDetails,
  PaymentData,
} from "@/store/booking-store";

function isCouponDiscountType(v: string): v is CouponDiscountType {
  return v === "percentage" || v === "fixed";
}

/**
 * If this slot is held by a pending booking for the same customer, release it so
 * checkout can retry (e.g. after payment/confirm failed or user applied a coupon).
 */
async function releaseStalePendingReservationIfSameCustomer(params: {
  franchiseId: number;
  date: string;
  time: string;
  customerEmail: string;
  userId?: number;
}): Promise<void> {
  const { franchiseId, date, time, customerEmail, userId } = params;
  const emailNorm = customerEmail.trim().toLowerCase();

  const [slot] = await db
    .select()
    .from(timeSlots)
    .where(
      and(
        eq(timeSlots.franchiseId, franchiseId),
        eq(timeSlots.date, date),
        eq(timeSlots.time, time)
      )
    )
    .limit(1);

  if (!slot?.bookingId || slot.isBooked) {
    return;
  }

  const [held] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, slot.bookingId))
    .limit(1);

  if (!held) {
    return;
  }

  const sameEmail = held.customerEmail.trim().toLowerCase() === emailNorm;
  const sameUser =
    userId != null && held.userId != null && held.userId === userId;

  if (
    held.status !== "pending" ||
    held.franchiseId !== franchiseId ||
    (!sameEmail && !sameUser)
  ) {
    return;
  }

  await db
    .update(timeSlots)
    .set({ bookingId: null })
    .where(eq(timeSlots.id, slot.id));

  await db
    .delete(bookingEvents)
    .where(eq(bookingEvents.bookingId, held.id));

  await db.delete(payments).where(eq(payments.bookingId, held.id));

  await db.delete(bookings).where(eq(bookings.id, held.id));
}

/**
 * Create a new booking with status "pending"
 * @param storeData - Complete booking data from Zustand store
 * @returns Created booking data or error
 */
export async function createBooking(storeData: {
  location: LocationData | null;
  package: PackageData | null;
  dateTime: DateTimeData | null;
  contactDetails: ContactDetails | null;
  payment: PaymentData | null;
}): Promise<{
  success: boolean;
  bookingId?: number;
  reference?: string;
  message?: string;
}> {
  try {
    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);

    const [franchiseRow] = await db
      .select({ id: franchises.id })
      .from(franchises)
      .where(eq(franchises.id, franchiseId))
      .limit(1);

    if (!franchiseRow) {
      return {
        success: false,
        message:
          "Kein Mandant für diese Buchung konfiguriert. Bitte Datenbank-Migrationen ausführen (Standard-Mandant fehlt) oder den Administrator kontaktieren.",
      };
    }

    const session = await auth();
    const rawId = session?.user?.id
      ? parseInt(session.user.id, 10)
      : undefined;
    const loggedInUserId =
      rawId != null && !Number.isNaN(rawId) ? rawId : undefined;

    // Validate all required data is present
    if (
      !storeData.location ||
      !storeData.package ||
      !storeData.dateTime ||
      !storeData.contactDetails ||
      !storeData.payment
    ) {
      return {
        success: false,
        message: "Missing required booking information",
      };
    }

    const bookingDateForSlot =
      storeData.dateTime.date instanceof Date
        ? storeData.dateTime.date
        : new Date(storeData.dateTime.date);

    if (
      !isBookingSlotEligibleForInstantBooking(
        storeData.dateTime.timeSlot,
        bookingDateForSlot,
        new Date()
      )
    ) {
      return {
        success: false,
        message:
          "Dieser Zeitrahmen ist für heute nicht mehr buchbar. Bitte wählen Sie eine andere Uhrzeit oder einen anderen Tag.",
      };
    }

    const subtotalCents = getBookingSubtotalCentsFromStore(storeData);
    const rawCoupon = storeData.payment.couponCode?.trim();
    let finalPriceInCents = subtotalCents;

    if (rawCoupon) {
      const code = normalizeCouponCode(rawCoupon);
      const [row] = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, code), eq(coupons.isActive, true)))
        .limit(1);

      if (!row || !isCouponDiscountType(row.discountType)) {
        return {
          success: false,
          message: "Invalid or expired coupon code",
        };
      }

      finalPriceInCents = computeDiscountCents(subtotalCents, {
        discountType: row.discountType,
        discountValue: row.discountValue,
      }).finalCents;
    }

    // Generate unique booking reference
    let reference = generateBookingReference();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure reference is unique
    while (attempts < maxAttempts) {
      const existing = await db
        .select()
        .from(bookings)
        .where(eq(bookings.reference, reference))
        .limit(1);

      if (existing.length === 0) {
        break; // Reference is unique
      }

      reference = generateBookingReference();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return {
        success: false,
        message: "Failed to generate unique booking reference",
      };
    }

    // Transform store data to database format (server-authoritative cents)
    const bookingData = transformBookingStoreToDb(
      storeData,
      franchiseId,
      reference,
      "EUR",
      finalPriceInCents,
      loggedInUserId
    );

    await releaseStalePendingReservationIfSameCustomer({
      franchiseId,
      date: bookingData.date,
      time: bookingData.time,
      customerEmail: bookingData.customerEmail,
      userId: loggedInUserId,
    });

    // Check if time slot is still available
    const slotCheck = await db
      .select()
      .from(timeSlots)
      .where(
        and(
          eq(timeSlots.franchiseId, franchiseId),
          eq(timeSlots.date, bookingData.date),
          eq(timeSlots.time, bookingData.time)
        )
      )
      .limit(1);

    // Check if slot is already booked or has a pending booking
    if (
      slotCheck.length > 0 &&
      (slotCheck[0].isBooked || slotCheck[0].bookingId)
    ) {
      return {
        success: false,
        message: "This time slot is no longer available",
      };
    }

    // Create booking in database
    const [newBooking] = await db
      .insert(bookings)
      .values(bookingData)
      .returning();

    if (!newBooking) {
      return {
        success: false,
        message: "Failed to create booking",
      };
    }

    // Create or update time slot (mark as reserved, not fully booked yet)
    if (slotCheck.length > 0) {
      // Update existing slot
      await db
        .update(timeSlots)
        .set({
          isBooked: false, // Keep as false until payment is confirmed
          bookingId: newBooking.id,
        })
        .where(eq(timeSlots.id, slotCheck[0].id));
    } else {
      // Create new time slot entry
      await db.insert(timeSlots).values({
        franchiseId,
        date: bookingData.date,
        time: bookingData.time,
        isBooked: false, // Will be set to true when payment is confirmed
        bookingId: newBooking.id,
      });
    }

    // Create initial booking event log
    await db.insert(bookingEvents).values({
      franchiseId,
      bookingId: newBooking.id,
      fromStatus: null,
      toStatus: "pending",
    });

    return {
      success: true,
      bookingId: newBooking.id,
      reference: newBooking.reference,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while creating the booking",
    };
  }
}
