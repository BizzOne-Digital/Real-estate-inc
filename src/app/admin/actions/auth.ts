"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/lib/models";

export interface LoginState {
  error: string;
  email?: string;
}

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;
// Compared against when the account does not exist, so response timing does not reveal valid emails.
let dummyHash: string | null = null;
function getDummyHash() {
  dummyHash ??= bcrypt.hashSync("no-account-placeholder", 12);
  return dummyHash;
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!email || !password) return { error: "Enter your email and password.", email };

  try {
    await connectDB();
    const user = await AdminUser.findOne({ email }).select("+passwordHash");
    if (user?.lockUntil && user.lockUntil > new Date()) {
      return { error: "Too many failed attempts. Please wait 15 minutes and try again.", email };
    }
    const valid = await bcrypt.compare(password, user?.passwordHash ?? getDummyHash());
    if (!user || !valid) {
      if (user) {
        user.failedLogins = (user.failedLogins ?? 0) + 1;
        if (user.failedLogins >= MAX_FAILED) {
          user.lockUntil = new Date(Date.now() + LOCK_MS);
          user.failedLogins = 0;
        }
        await user.save();
      }
      return { error: "Incorrect email or password.", email };
    }
    user.failedLogins = 0;
    user.set("lockUntil", null);
    user.lastLoginAt = new Date();
    await user.save();
    await createSession(String(user._id));
  } catch (err) {
    console.error("[login]", err);
    return { error: "Sign-in is unavailable right now. Please try again.", email };
  }
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
