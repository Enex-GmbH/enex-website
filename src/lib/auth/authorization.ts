"use server";

import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

/**
 * Get the current user's session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

/**
 * Require admin access - redirects to login if not authenticated or not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  if (user.role !== "admin") {
    redirect("/account");
  }
  
  return user;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return user;
}

