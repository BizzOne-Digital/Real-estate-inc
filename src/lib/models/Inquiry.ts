import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const InquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    productName: { type: String, default: "", maxlength: 160 },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new", index: true },
  },
  { timestamps: true },
);
InquirySchema.index({ createdAt: -1 });

export type InquiryDoc = InferSchemaType<typeof InquirySchema>;
export const Inquiry: Model<InquiryDoc> =
  (models.Inquiry as Model<InquiryDoc>) || model<InquiryDoc>("Inquiry", InquirySchema);
