import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export { INQUIRY_INTERESTS } from "../constants";

const InquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    interest: { type: String, default: "Other", maxlength: 60 },
    subject: { type: String, default: "", trim: true, maxlength: 200 },
    reference: { type: String, default: "", maxlength: 200 },
    condo: { type: Schema.Types.ObjectId, ref: "Condo", default: null },
    message: { type: String, required: true, maxlength: 5000 },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new", index: true },
  },
  { timestamps: true },
);
InquirySchema.index({ createdAt: -1 });

export type InquiryDoc = InferSchemaType<typeof InquirySchema>;
export const Inquiry: Model<InquiryDoc> =
  (models.Inquiry as Model<InquiryDoc>) || model<InquiryDoc>("Inquiry", InquirySchema);
