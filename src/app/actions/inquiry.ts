"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Condo, Inquiry } from "@/lib/models";
import { inquirySchema } from "@/lib/validation";

export interface InquiryState {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    interest: String(formData.get("interest") ?? ""),
    reference: String(formData.get("reference") ?? ""),
    condo: String(formData.get("condo") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success", message: "" };
  }

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please correct the highlighted fields.", fieldErrors, values: raw };
  }

  try {
    await connectDB();
    const d = parsed.data;
    const recent = await Inquiry.countDocuments({ email: d.email, createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) } });
    if (recent >= 5) {
      return { status: "error", message: "You have sent several messages recently. Please try again later.", values: raw };
    }
    let condoId = null;
    let condoName = "";
    if (d.condo) {
      const condo = await Condo.findOne({ slug: d.condo, published: true }, { name: 1 }).lean();
      if (condo) {
        condoId = condo._id;
        condoName = condo.name;
      }
    }
    await Inquiry.create({
      name: d.name,
      email: d.email,
      phone: d.phone,
      interest: d.interest,
      subject: condoName ? `${d.interest}: ${condoName}` : d.interest,
      reference: d.reference,
      condo: condoId,
      message: d.message,
    });
    revalidatePath("/admin", "layout");
    return { status: "success", message: "" };
  } catch (err) {
    console.error("[inquiry] failed", err);
    return {
      status: "error",
      message: "We could not send your message right now. Please try again in a moment, or call us directly.",
      values: raw,
    };
  }
}
