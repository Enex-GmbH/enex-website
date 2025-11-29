// src/lib/franchise.ts
import { db } from "./db/client";
import { franchises } from "./db/schema";
import { eq } from "drizzle-orm";

/**
 * Extract subdomain from hostname
 * @param hostname - The hostname (e.g., "berlin.enex.com" or "www.enex.com")
 * @returns The subdomain slug or null if main site
 */
export function extractSubdomain(hostname: string): string | null {
  // Remove protocol if present
  const cleanHost = hostname.replace(/^https?:\/\//, "").split("/")[0];
  
  // Split by dots
  const parts = cleanHost.split(".");
  
  // If we have at least 3 parts (subdomain.domain.tld) or 4 parts (subdomain.domain.tld.something)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    
    // Check if it's the main site
    if (subdomain === "www" || subdomain === "enex") {
      return null;
    }
    
    return subdomain;
  }
  
  return null;
}

/**
 * Get franchise ID from hostname
 * @param hostname - The hostname from the request
 * @returns The franchise ID or null if main site
 */
export async function getFranchiseIdFromHostname(
  hostname: string
): Promise<number | null> {
  const subdomain = extractSubdomain(hostname);
  
  if (!subdomain) {
    // Main site - return null (you may want to handle this differently)
    return null;
  }
  
  // Query database for franchise by slug
  const franchise = await db
    .select()
    .from(franchises)
    .where(eq(franchises.slug, subdomain))
    .limit(1);
  
  if (franchise.length === 0) {
    // Franchise not found - you may want to throw an error or return null
    return null;
  }
  
  return franchise[0].id;
}

/**
 * Get franchise ID from request headers (for server-side usage)
 * @param headers - Request headers object
 * @returns The franchise ID or null if main site
 */
export async function getFranchiseIdFromHeaders(
  headers: Headers | Record<string, string | string[] | undefined>
): Promise<number | null> {
  // Get hostname from headers
  let hostname: string | undefined;
  
  if (headers instanceof Headers) {
    hostname = headers.get("host") || undefined;
  } else {
    hostname = Array.isArray(headers.host) 
      ? headers.host[0] 
      : headers.host;
  }
  
  if (!hostname) {
    return null;
  }
  
  return getFranchiseIdFromHostname(hostname);
}

/**
 * Get franchise slug from hostname (for client-side usage)
 * @param hostname - The hostname from window.location.hostname
 * @returns The franchise slug or null if main site
 */
export function getFranchiseSlugFromHostname(hostname: string): string | null {
  return extractSubdomain(hostname);
}

