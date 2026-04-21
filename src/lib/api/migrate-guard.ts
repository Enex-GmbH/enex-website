import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * Blocks migration HTTP routes in production. In non-production, requires
 * Authorization: Bearer <MIGRATION_SECRET> matching env MIGRATION_SECRET.
 */
export function assertMigrationAllowed(
  request: Request
): NextResponse | null {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const secret = process.env.MIGRATION_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        success: false,
        error:
          "MIGRATION_SECRET is not configured. Set it to use migration routes in non-production.",
      },
      { status: 403 }
    );
  }

  const auth = request.headers.get("authorization");
  const expected = `Bearer ${secret}`;
  if (!auth || auth.length !== expected.length) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, {
      status: 401,
    });
  }

  const a = Buffer.from(auth);
  const b = Buffer.from(expected);
  if (!timingSafeEqual(a, b)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, {
      status: 401,
    });
  }

  return null;
}
