"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Inquiry, Product } from "@/lib/models";
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
    subject: String(formData.get("subject") ?? ""),
    product: String(formData.get("product") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Honeypot: real visitors never see or fill this field.
  if (String(formData.get("website") ?? "").trim() !== "") {
    return { status: "success", message: "Thank you." };
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
    let productId = null;
    let productName = "";
    if (d.product) {
      const product = await Product.findOne({ slug: d.product, published: true }, { name: 1 }).lean();
      if (product) {
        productId = product._id;
        productName = product.name;
      }
    }
    await Inquiry.create({
      name: d.name,
      email: d.email,
      phone: d.phone,
      subject: d.subject,
      message: d.message,
      product: productId,
      productName,
    });
    revalidatePath("/admin", "layout");
    return { status: "success", message: "" };
  } catch (err) {
    console.error("[inquiry] failed", err);
    return {
      status: "error",
      message: "We could not send your message right now. Please try again in a moment.",
      values: raw,
    };
  }
}
