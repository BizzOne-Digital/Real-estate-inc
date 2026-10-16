import { Schema, model, models, type Model, type Types } from "mongoose";

/** Temporary state for chunked uploads. Never publicly readable; removed on completion or by TTL. */
export interface UploadSessionDoc {
  uploadId: string;
  admin: Types.ObjectId;
  folder: string;
  mimeType: string;
  totalSize: number;
  totalChunks: number;
  status: "uploading" | "finalizing";
  expiresAt: Date;
}

const UploadSessionSchema = new Schema<UploadSessionDoc>(
  {
    uploadId: { type: String, required: true, unique: true },
    admin: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    folder: { type: String, required: true },
    mimeType: { type: String, required: true },
    totalSize: { type: Number, required: true },
    totalChunks: { type: Number, required: true },
    status: { type: String, enum: ["uploading", "finalizing"], default: "uploading" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
UploadSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export interface UploadChunkDoc {
  uploadId: string;
  chunkIndex: number;
  data: Buffer;
  size: number;
  expiresAt: Date;
}

const UploadChunkSchema = new Schema<UploadChunkDoc>({
  uploadId: { type: String, required: true },
  chunkIndex: { type: Number, required: true, min: 0 },
  data: { type: Buffer, required: true },
  size: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});
UploadChunkSchema.index({ uploadId: 1, chunkIndex: 1 }, { unique: true });
UploadChunkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const UploadSession: Model<UploadSessionDoc> =
  (models.UploadSession as Model<UploadSessionDoc>) || model<UploadSessionDoc>("UploadSession", UploadSessionSchema);
export const UploadChunk: Model<UploadChunkDoc> =
  (models.UploadChunk as Model<UploadChunkDoc>) || model<UploadChunkDoc>("UploadChunk", UploadChunkSchema);
