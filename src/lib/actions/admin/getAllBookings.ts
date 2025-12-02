"use server";

import { db } from "../../db/client";
import { bookings } from "../../db/schema";
import { desc, eq, and, or, like } from "drizzle-orm";
import { headers } from "next/headers";
import { requireAdmin } from "../../auth/authorization";

/**
 * Get all bookings for admin dashboard
 * @param filters - Optional filters for status, search, etc.
 * @returns Array of all bookings or error
 */
export async function getAllBookings(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  bookings?: typeof bookings.$inferSelect[];
  total?: number;
  message?: string;
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

    // Build where conditions
    const conditions = [eq(bookings.franchiseId, franchiseId)];

    if (filters?.status) {
      conditions.push(eq(bookings.status, filters.status));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(bookings.reference, searchTerm),
          like(bookings.customerEmail, searchTerm),
          like(bookings.customerFirstName, searchTerm),
          like(bookings.customerLastName, searchTerm),
          like(bookings.address, searchTerm)
        )!
      );
    }

    // Get total count
    const totalResult = await db
      .select({ count: bookings.id })
      .from(bookings)
      .where(and(...conditions));

    const total = totalResult.length;

    // Get bookings with pagination
    let query = db
      .select()
      .from(bookings)
      .where(and(...conditions))
      .orderBy(desc(bookings.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    const allBookings = await query;

    return {
      success: true,
      bookings: allBookings,
      total,
    };
  } catch (error) {
    console.error("Error getting all bookings:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while retrieving bookings",
    };
  }
}

