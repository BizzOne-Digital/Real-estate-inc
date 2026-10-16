import "server-only";
import { createHmac, randomBytes } from "crypto";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "./db";
import { AdminSession, AdminUser } from "./models";

export const SESSION_COOKIE = "furn_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export class AuthError extends Error {
  status = 401;
  constructor(message = "Unauthorized") {
    super(message);
  }
}

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  return s;
}

function hashToken(token: string): string {
  return createHmac("sha256", secret()).update(token).digest("hex");
}

export interface CurrentAdmin {
  id: string;
  email: string;
  name: string;
}

export async function createSession(adminId: string): Promise<void> {
  await connectDB();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const ua = (await headers()).get("user-agent")?.slice(0, 300) ?? "";
  await AdminSession.create({ tokenHash: hashToken(token), admin: adminId, expiresAt, userAgent: ua });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await connectDB();
      await AdminSession.deleteOne({ tokenHash: hashToken(token) });
    } catch {
      // Cookie is cleared regardless.
    }
  }
  jar.delete(SESSION_COOKIE);
}

/** Resolve the signed-in admin from the session cookie. Deduplicated per request. */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 200) return null;
  await connectDB();
  const session = await AdminSession.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  const admin = await AdminUser.findById(session.admin).lean();
  if (!admin) return null;
  return { id: String(admin._id), email: admin.email, name: admin.name ?? "" };
});

/** For server actions and API routes: throws when not authenticated. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new AuthError();
  return admin;
}

/** For admin pages: redirects to login when not authenticated. */
export async function requireAdminPage(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/**
 * Cross-site request protection for route handlers. Server Actions already verify Origin
 * against Host; route handlers that mutate state call this explicitly.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host && originHost === host) return true;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    try {
      if (new URL(site).host === originHost) return true;
    } catch {
      /* ignore malformed config */
    }
  }
  return false;
}
