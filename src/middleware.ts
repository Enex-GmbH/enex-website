import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const { pathname } = request.nextUrl;

    // Protect account page - redirect to login if not authenticated
    if (pathname.startsWith("/account") && !token) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (token) {
        if (pathname === "/login" || pathname === "/register") {
            return NextResponse.redirect(new URL("/account", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/account/:path*",
        "/login",
        "/register",
    ],
};

