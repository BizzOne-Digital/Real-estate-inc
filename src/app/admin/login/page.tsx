import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  let signedIn = false;
  try {
    signedIn = Boolean(await getCurrentAdmin());
  } catch {
    // Database unavailable: still show the form, the action reports the error.
  }
  if (signedIn) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <p className="font-display text-3xl text-navy">Studio Admin</p>
        <p className="mt-1 text-sm text-gray-500">Sign in to manage the website.</p>
        <LoginForm />
      </div>
    </div>
  );
}
