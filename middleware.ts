import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/" ||
    path === "/auth/login" ||
    path === "/auth/register" ||
    path.startsWith("/api/auth") ||
    (path.startsWith("/contests") &&
      !path.includes("/new") &&
      !path.includes("/edit"));

  // Check if user is authenticated - try both cookie names
  const authToken = request.cookies.get("AUTH_TOKEN")?.value;
  const token = request.cookies.get("token")?.value;

  const activeToken = authToken || token;

  let isAuthenticated = false;

  if (activeToken) {
    try {
      // Verify token is valid and not expired
      const decoded = jwtDecode<{ exp: number }>(activeToken);
      isAuthenticated = decoded.exp * 1000 > Date.now();
    } catch (error) {
      isAuthenticated = false;
    }
  }

  // Redirect logic
  if (!isAuthenticated && !isPublicPath) {
    // Store the original URL to redirect back after login
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (
    isAuthenticated &&
    (path === "/auth/login" || path === "/auth/register")
  ) {
    // Redirect to home if already logged in and trying to access auth pages
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/profile/:path*",
    "/bookmarks/:path*",
    "/solutions/:path*",
    "/contests/new",
    "/contests/:id/edit",
    "/auth/:path*",
  ],
};
