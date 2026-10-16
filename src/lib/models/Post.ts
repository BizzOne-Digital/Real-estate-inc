import { Schema, model, models, type Model, type Types } from "mongoose";

import { POST_CATEGORIES, type PostCategory } from "../constants";
export { POST_CATEGORIES, type PostCategory };

/** Market Insights / blog article. */
export interface PostDoc {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  category: PostCategory;
  excerpt: string;
  body: string;
  coverImage: string;
  publishedAt: Date;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<PostDoc>(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
    category: { type: String, enum: POST_CATEGORIES, default: "Market Commentary" },
    excerpt: { type: String, default: "", maxlength: 500 },
    body: { type: String, default: "", maxlength: 50000 },
    coverImage: { type: String, default: "", maxlength: 500 },
    publishedAt: { type: Date, default: () => new Date() },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);
PostSchema.index({ published: 1, publishedAt: -1 });
PostSchema.index({ coverImage: 1 });

export const Post: Model<PostDoc> = (models.Post as Model<PostDoc>) || model<PostDoc>("Post", PostSchema);
