import { Schema, model, models, type Model, type Types } from "mongoose";

export interface CondoFeatureGroup {
  heading: string;
  items: string[];
}

export interface CondoDoc {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  address: string;
  city: string;
  neighbourhood: string;
  intersection: string;
  developer: string;
  summary: string;
  description: string;
  details: { label: string; value: string }[];
  featureGroups: CondoFeatureGroup[];
  images: string[];
  mapQuery: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CondoSchema = new Schema<CondoDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    address: { type: String, default: "", maxlength: 300 },
    city: { type: String, default: "", maxlength: 80, index: true },
    neighbourhood: { type: String, default: "", maxlength: 120 },
    intersection: { type: String, default: "", maxlength: 160 },
    developer: { type: String, default: "", maxlength: 120 },
    summary: { type: String, default: "", maxlength: 500 },
    description: { type: String, default: "", maxlength: 20000 },
    details: { type: [{ label: String, value: String, _id: false }], default: [] },
    featureGroups: { type: [{ heading: String, items: [String], _id: false }], default: [] },
    images: { type: [String], default: [] },
    mapQuery: { type: String, default: "", maxlength: 300 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
CondoSchema.index({ published: 1, featured: -1, order: 1, name: 1 });
CondoSchema.index({ images: 1 });

export const Condo: Model<CondoDoc> = (models.Condo as Model<CondoDoc>) || model<CondoDoc>("Condo", CondoSchema);
