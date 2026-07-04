import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware for protecting dashboard routes
 * Redirects unauthenticated users to login
 *
 * Protected routes:
 * - /dashboard/*
 * - /interview/*
 * - /profile/*
 * - /resume/*
 * - /settings/*
 */
export async function middleware(request: NextRequest) {
  const session = await auth();

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/interview", "/profile", "/resume", "/settings"];

  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    return Response.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

/**
 * Matcher configuration
 * Applies middleware to specific routes
 */
export const config = {
  matcher: [
  "/dashboard/:path*",
  "/resume/:path*",
  "/interview/:path*",
  "/profile/:path*",
  "/settings/:path*",
],
};
