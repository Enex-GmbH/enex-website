import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getMaintenanceEnabledEdge } from "@/lib/maintenance/read-flag-edge";

function isStaticLikePath(pathname: string): boolean {
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
    return true;
  }
  if (/\.(ico|png|jpe?g|gif|webp|svg|woff2?|ttf|eot|css|js|map)$/i.test(pathname)) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (isStaticLikePath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  let maintenance = false;
  try {
    maintenance = await getMaintenanceEnabledEdge();
  } catch {
    maintenance = false;
  }

  const isAdmin = token?.role === "admin";

  if (maintenance && !isAdmin) {
    const isAuthApi = pathname.startsWith("/api/auth");
    const isPublicPage =
      pathname === "/maintenance" ||
      pathname.startsWith("/maintenance/") ||
      pathname === "/login" ||
      pathname.startsWith("/login/") ||
      pathname === "/register" ||
      pathname.startsWith("/register/");

    if (!isPublicPage && !isAuthApi) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Service temporarily unavailable" },
          { status: 503 }
        );
      }
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  if (pathname.startsWith("/account") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/profile") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  if (token) {
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
