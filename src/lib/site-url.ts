/**
 * Canonical site origin for metadata, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://www.example.de).
 * On Vercel, VERCEL_URL is used as a fallback when the public URL is unset.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (explicit) {
    return explicit.startsWith("http") ? explicit : `https://${explicit}`;
  }
  const vercel = process.env.VERCEL_URL?.trim().replace(/\/+$/, "");
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }
  return "http://localhost:3000";
}
