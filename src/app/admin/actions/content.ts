"use server";

import { connectDB } from "@/lib/db";
import { Inquiry, PageContent, SiteSettings, type PageKey } from "@/lib/models";
import { ActionError, assertObjectId, guarded, revalidateContent } from "@/lib/admin-action";
import { cleanupOrphanUploads, cleanupReplacedUploads } from "@/lib/uploads";
import { aboutSchema, contactPageSchema, homeSchema, infoPageSchema, settingsSchema, testimonialsPageSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

const PAGE_SCHEMAS = {
  home: homeSchema,
  about: aboutSchema,
  contact: contactPageSchema,
  featured: infoPageSchema,
  relocation: infoPageSchema,
  mortgage: infoPageSchema,
  "land-transfer-tax": infoPageSchema,
  testimonials: testimonialsPageSchema,
} as const;

export async function savePageContent(key: PageKey, input: unknown) {
  return guarded(async () => {
    const schema = PAGE_SCHEMAS[key];
    if (!schema) throw new ActionError("Unknown page.");
    const data = schema.parse(input);
    await connectDB();
    const before = await PageContent.findOne({ key }).lean();
    await PageContent.updateOne({ key }, { $set: { data } }, { upsert: true, runValidators: true });
    await cleanupReplacedUploads(before?.data, data);
    revalidateContent();
    return { ok: true, message: "Page content saved." };
  });
}

export async function saveSettings(input: unknown) {
  return guarded(async () => {
    const data = settingsSchema.parse(input);
    await connectDB();
    const before = await SiteSettings.findOne({ key: "site" }).lean();
    await SiteSettings.updateOne({ key: "site" }, { $set: { data } }, { upsert: true, runValidators: true });
    await cleanupReplacedUploads(before?.data, data);
    revalidateContent();
    return { ok: true, message: "Settings saved." };
  });
}

/** Removes uploads that were never saved to any content (e.g. abandoned edits) after a 24h grace period. */
export async function cleanupUnusedMedia() {
  return guarded<{ removed: number }>(async () => {
    const removed = await cleanupOrphanUploads();
    return { ok: true, data: { removed }, message: `Removed ${removed} unused upload${removed === 1 ? "" : "s"}.` };
  });
}

export async function setInquiryStatus(id: string, status: "new" | "read" | "resolved") {
  return guarded(async () => {
    assertObjectId(id);
    if (!["new", "read", "resolved"].includes(status)) throw new ActionError("Invalid status.");
    await connectDB();
    const res = await Inquiry.updateOne({ _id: id }, { $set: { status } });
    if (res.matchedCount === 0) throw new ActionError("Inquiry not found.");
    revalidatePath("/admin", "layout");
    return { ok: true, message: `Marked as ${status}.` };
  });
}

export async function deleteInquiry(id: string) {
  return guarded(async () => {
    assertObjectId(id);
    await connectDB();
    const res = await Inquiry.deleteOne({ _id: id });
    if (res.deletedCount === 0) throw new ActionError("Inquiry not found.");
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Inquiry deleted." };
  });
}
