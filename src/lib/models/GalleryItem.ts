import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const GalleryItemSchema = new Schema(
  {
    image: { type: String, required: true, maxlength: 500 },
    caption: { type: String, default: "", maxlength: 200 },
    alt: { type: String, default: "", maxlength: 200 },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);
GalleryItemSchema.index({ image: 1 });

export type GalleryItemDoc = InferSchemaType<typeof GalleryItemSchema>;
export const GalleryItem: Model<GalleryItemDoc> =
  (models.GalleryItem as Model<GalleryItemDoc>) || model<GalleryItemDoc>("GalleryItem", GalleryItemSchema);
