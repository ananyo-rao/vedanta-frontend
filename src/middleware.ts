import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/about(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = request.nextUrl;

  // Redirect authenticated users from homepage to app
  if (pathname === "/" && userId) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  // Redirect old /dashboard to new /app/dashboard
  if (pathname === "/dashboard" && userId) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }

  // Redirect non-admins from admin routes to dashboard
  if (pathname.startsWith("/app/admin") && userId) {
    const metadata = sessionClaims?.metadata as Record<string, unknown> | undefined;
    const role = metadata?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/app/dashboard", request.url));
    }
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
