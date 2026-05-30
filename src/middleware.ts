import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
);

// Everything inside the (app) route group requires a signed-in user — plus the
// API routes that read or write user data. (Billing routes stay open: the
// Stripe webhook is server-to-server, and checkout works from public pricing.
// Status routes expose nothing sensitive.)
const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/employees(.*)",
  "/chat(.*)",
  "/workflows(.*)",
  "/documents(.*)",
  "/calls(.*)",
  "/analytics(.*)",
  "/team(.*)",
  "/settings(.*)",
  "/api/chat(.*)",
  "/api/store(.*)",
  "/api/extract(.*)",
]);

export default clerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      if (isProtected(req)) await auth.protect();
    })
  : function middleware() {
      // Demo mode: no auth configured, let every request through.
      return NextResponse.next();
    };

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else.
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};
