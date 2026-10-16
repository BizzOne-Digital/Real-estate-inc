import { Schema, model, models, type Model } from "mongoose";

export const PAGE_KEYS = [
  "home",
  "about",
  "contact",
  "featured",
  "relocation",
  "mortgage",
  "land-transfer-tax",
  "testimonials",
] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export interface PageContentDoc {
  key: PageKey;
  data: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const PageContentSchema = new Schema<PageContentDoc>(
  {
    key: { type: String, required: true, unique: true, enum: PAGE_KEYS },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

export const PageContent: Model<PageContentDoc> =
  (models.PageContent as Model<PageContentDoc>) || model<PageContentDoc>("PageContent", PageContentSchema);
