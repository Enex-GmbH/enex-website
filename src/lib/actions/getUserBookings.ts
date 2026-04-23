"use server";

import { db } from "../db/client";
import { bookings } from "../db/schema";
import { eq, desc, and, or, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { resolveFranchiseId } from "../franchise";
import { auth } from "@/app/api/auth/[...nextauth]/route";

/**
 * All bookings for the current user: by account id when logged in, with legacy
 * fall-back to customer_email for rows created before user_id existed.
 */
export async function getUserBookings(): Promise<{
  success: boolean;
  bookings?: (typeof bookings.$inferSelect)[];
  message?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return {
        success: false,
        message: "Nicht angemeldet",
      };
    }

    const userId = parseInt(session.user.id, 10);
    if (Number.isNaN(userId)) {
      return { success: false, message: "Ungültige Sitzung" };
    }

    const headersList = await headers();
    const franchiseId = await resolveFranchiseId(headersList);
    const email = session.user.email;

    const userBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.franchiseId, franchiseId),
          or(
            eq(bookings.userId, userId),
            and(isNull(bookings.userId), eq(bookings.customerEmail, email))
          )
        )
      )
      .orderBy(desc(bookings.createdAt));

    return {
      success: true,
      bookings: userBookings,
    };
  } catch (error) {
    console.error("Error getting user bookings:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while retrieving bookings",
    };
  }
}
