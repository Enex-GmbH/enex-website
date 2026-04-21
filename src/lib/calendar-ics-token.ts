import { createHmac, timingSafeEqual } from "crypto";

const TTL_DEFAULT_SEC = 90 * 24 * 60 * 60; // 90 days

function getSigningSecret(): string | null {
  return (
    process.env.CALENDAR_ICS_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    null
  );
}

export function createCalendarIcsQueryParams(
  reference: string,
  ttlSeconds: number = TTL_DEFAULT_SEC
): { exp: string; sig: string } {
  const secret = getSigningSecret();
  if (!secret) {
    throw new Error(
      "CALENDAR_ICS_SECRET or NEXTAUTH_SECRET must be set to sign calendar links"
    );
  }

  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${reference}:${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");

  return { exp: String(exp), sig };
}

export function verifyCalendarIcsQuery(
  reference: string,
  exp: string | null,
  sig: string | null
): boolean {
  const secret = getSigningSecret();
  if (!secret || !exp || !sig) return false;

  const expNum = parseInt(exp, 10);
  if (!Number.isFinite(expNum) || expNum < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${reference}:${exp}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");

  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

/**
 * Apple Calendar webcal URL with signed query (host without protocol, e.g. localhost:3000).
 */
export function buildWebcalCalendarUrl(
  hostWithoutProtocol: string,
  reference: string
): string {
  const { exp, sig } = createCalendarIcsQueryParams(reference);
  const path = `/api/calendar/${encodeURIComponent(reference)}.ics`;
  return `webcal://${hostWithoutProtocol}${path}?exp=${encodeURIComponent(exp)}&sig=${encodeURIComponent(sig)}`;
}
