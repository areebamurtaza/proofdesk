import { NextRequest } from "next/server";

/**
 * Robustly resolves the application's base URL / origin across:
 * - Localhost development (http://localhost:3000)
 * - Vercel Preview & Production deployments (https://*.vercel.app or custom domains)
 * - Custom domains specified in NEXT_PUBLIC_APP_URL
 */
export function getAppOrigin(request?: NextRequest): string {
  // 1. Check request origin header (sent automatically by browser on fetch/POST)
  const reqOrigin = request?.headers.get("origin");
  if (reqOrigin && !reqOrigin.includes("localhost")) {
    return reqOrigin.replace(/\/$/, "");
  }

  // 2. Check x-forwarded-host & x-forwarded-proto (standard on Vercel and reverse proxies)
  const forwardedHost = request?.headers.get("x-forwarded-host");
  const forwardedProto = request?.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost && !forwardedHost.includes("localhost")) {
    return `${forwardedProto}://${forwardedHost}`.replace(/\/$/, "");
  }

  // 3. Check Host header
  const host = request?.headers.get("host");
  if (host && !host.includes("localhost")) {
    const proto = request?.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`.replace(/\/$/, "");
  }

  // 4. Check VERCEL_PROJECT_PRODUCTION_URL or VERCEL_URL (injected by Vercel automatically)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  // 5. Check NEXT_PUBLIC_APP_URL (if provided and not pointing to localhost on production)
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (configuredAppUrl && !configuredAppUrl.includes("localhost")) {
    return configuredAppUrl.replace(/\/$/, "");
  }

  // 6. If request is from localhost in local development
  if (reqOrigin) {
    return reqOrigin.replace(/\/$/, "");
  }

  if (request?.nextUrl?.origin) {
    return request.nextUrl.origin.replace(/\/$/, "");
  }

  return configuredAppUrl || "http://localhost:3000";
}
