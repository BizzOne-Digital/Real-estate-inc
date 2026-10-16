import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { ZodError } from "zod";
import { AuthError, requireAdmin, type CurrentAdmin } from "./auth";
import { CONTENT_TAG } from "./data";
import type { ActionResult } from "./types";
import { firstError } from "./validation";

export class ActionError extends Error {}

/**
 * Wraps every admin server action: verifies the session server-side first, then maps
 * known failures to friendly messages. Server Actions also enforce same-origin requests.
 */
export async function guarded<T = undefined>(fn: (admin: CurrentAdmin) => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    const admin = await requireAdmin();
    return await fn(admin);
  } catch (err) {
    if (err instanceof AuthError) return { ok: false, error: "Your session has expired. Please sign in again." };
    if (err instanceof ActionError) return { ok: false, error: err.message };
    if (err instanceof ZodError) return { ok: false, error: firstError(err) };
    if ((err as { code?: number })?.code === 11000) return { ok: false, error: "That slug is already in use. Choose another." };
    console.error("[admin action]", err);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }
}

/** Refresh cached public content after any admin change. */
export function revalidateContent() {
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

export function assertObjectId(id: unknown): string {
  if (typeof id !== "string" || !/^[a-f0-9]{24}$/i.test(id)) throw new ActionError("Invalid id.");
  return id;
}
