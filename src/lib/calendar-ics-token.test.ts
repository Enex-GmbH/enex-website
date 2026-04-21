import { describe, it, expect, beforeEach } from "vitest";
import {
  createCalendarIcsQueryParams,
  verifyCalendarIcsQuery,
} from "./calendar-ics-token";

describe("calendar-ics-token", () => {
  beforeEach(() => {
    process.env.CALENDAR_ICS_SECRET = "unit-test-secret";
  });

  it("accepts a valid signature", () => {
    const ref = "ENX-ABCDEF";
    const { exp, sig } = createCalendarIcsQueryParams(ref, 3600);
    expect(verifyCalendarIcsQuery(ref, exp, sig)).toBe(true);
  });

  it("rejects tampered signature", () => {
    const ref = "ENX-ABCDEF";
    const { exp } = createCalendarIcsQueryParams(ref, 3600);
    expect(verifyCalendarIcsQuery(ref, exp, "deadbeef")).toBe(false);
  });
});
