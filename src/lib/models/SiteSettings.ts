import { Schema, model, models, type Model } from "mongoose";

export interface SiteSettingsDoc {
  key: "site";
  data: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

const SiteSettingsSchema = new Schema<SiteSettingsDoc>(
  {
    key: { type: String, required: true, unique: true, enum: ["site"], default: "site" },
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

export const SiteSettings: Model<SiteSettingsDoc> =
  (models.SiteSettings as Model<SiteSettingsDoc>) || model<SiteSettingsDoc>("SiteSettings", SiteSettingsSchema);
