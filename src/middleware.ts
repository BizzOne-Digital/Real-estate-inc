import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "furn_admin_session";

/**
 * Convenience redirect only. Real authorization happens server-side in every admin page,
 * server action and API route (see lib/auth.ts).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);
  let res: NextResponse;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasSession) {
    res = NextResponse.redirect(new URL("/admin/login", req.url));
  } else {
    res = NextResponse.next();
  }
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "same-origin");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
