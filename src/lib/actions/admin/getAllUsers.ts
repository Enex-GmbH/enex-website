"use server";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { eq, isNull, or, and } from "drizzle-orm";

export async function getAllUsers(): Promise<{
  success: boolean;
  users?: Array<{
    id: number;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
    deactivated: boolean;
    deletedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }>;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: "Sie müssen angemeldet sein.",
      };
    }

    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Sie haben keine Berechtigung für diese Aktion.",
      };
    }

    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        deactivated: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    return {
      success: true,
      users: allUsers,
    };
  } catch (error) {
    console.error("Get all users error:", error);
    return {
      success: false,
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    };
  }
}
