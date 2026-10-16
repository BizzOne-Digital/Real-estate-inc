import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 90 },
    description: { type: String, default: "", maxlength: 2000 },
    image: { type: String, default: "", maxlength: 500 },
    order: { type: Number, default: 0 },
    showOnHome: { type: Boolean, default: true },
  },
  { timestamps: true },
);
CategorySchema.index({ order: 1, name: 1 });
CategorySchema.index({ image: 1 });

export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export const Category: Model<CategoryDoc> =
  (models.Category as Model<CategoryDoc>) || model<CategoryDoc>("Category", CategorySchema);
