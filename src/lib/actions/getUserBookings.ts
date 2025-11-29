"use server";

import { db } from "../db/client";
import { bookings } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

/**
 * Get all bookings for a user by email
 * @param email - Customer email address
 * @returns Array of bookings or error
 */
export async function getUserBookings(
  email: string
): Promise<{
  success: boolean;
  bookings?: typeof bookings.$inferSelect[];
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

    const userBookings = await db
      .select()
      .from(bookings)
      .where(
        eq(bookings.customerEmail, email)
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

