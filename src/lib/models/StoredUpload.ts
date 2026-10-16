import { Schema, model, models, type Model } from "mongoose";

export const UPLOAD_FOLDERS = ["condos", "posts", "pages", "misc", "products", "gallery"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export interface StoredUploadDoc {
  folder: UploadFolder;
  filename: string;
  mimeType: string;
  size: number;
  data: Buffer;
  createdAt?: Date;
  updatedAt?: Date;
}

const StoredUploadSchema = new Schema<StoredUploadDoc>(
  {
    folder: { type: String, required: true, enum: UPLOAD_FOLDERS },
    filename: { type: String, required: true, maxlength: 120 },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 1 },
    // Excluded by default so listings and JSON responses never carry binary payloads.
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true },
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
StoredUploadSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const { data: _data, ...rest } = ret;
    void _data;
    return rest;
  },
});

export const StoredUpload: Model<StoredUploadDoc> =
  (models.StoredUpload as Model<StoredUploadDoc>) || model<StoredUploadDoc>("StoredUpload", StoredUploadSchema);
