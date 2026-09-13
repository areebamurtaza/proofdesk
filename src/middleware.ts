// filepath: src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that require authenticated agency staff access
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/deliverables(.*)",
  "/api/deliverables(.*)",
  "/api/upload(.*)",
]);

export default clerkMiddleware((auth, req) => {
  // If requesting agency routes, enforce Clerk session
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};