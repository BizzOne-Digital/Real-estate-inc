import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    description: { type: String, default: "", maxlength: 5000 },
    price: { type: Number, default: null, min: 0 },
    materials: { type: [String], default: [] },
    dimensions: { type: String, default: "", maxlength: 300 },
    finishes: { type: [String], default: [] },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);
ProductSchema.index({ published: 1, category: 1, createdAt: -1 });
ProductSchema.index({ published: 1, featured: -1, createdAt: -1 });
ProductSchema.index({ images: 1 });

export type ProductDoc = InferSchemaType<typeof ProductSchema>;
export const Product: Model<ProductDoc> =
  (models.Product as Model<ProductDoc>) || model<ProductDoc>("Product", ProductSchema);
