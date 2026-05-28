/**
 * Auth is optional. When Clerk keys are present the app enforces real
 * accounts (sign-up / sign-in / protected routes). When they are absent the
 * app stays in demo mode so it keeps running with no configuration.
 *
 * Add the keys (free tier) to enable accounts:
 *   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
 *   CLERK_SECRET_KEY=sk_...
 */
export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/** True on both server and client (publishable key is inlined at build). */
export const clerkEnabled = Boolean(clerkPublishableKey);
