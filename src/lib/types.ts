export interface CondoT {
  _id: string;
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
  featureGroups: { heading: string; items: string[] }[];
  images: string[];
  mapQuery: string;
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostT {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body: string;
  coverImage: string;
  publishedAt: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryT {
  _id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  subject: string;
  reference: string;
  condo: Pick<CondoT, "_id" | "name" | "slug" | "published"> | null;
  message: string;
  status: "new" | "read" | "resolved";
  createdAt: string;
}

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };
