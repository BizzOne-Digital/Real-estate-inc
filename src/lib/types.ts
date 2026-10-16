export interface CategoryT {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  showOnHome: boolean;
}

export interface ProductT {
  _id: string;
  name: string;
  slug: string;
  category: Pick<CategoryT, "_id" | "name" | "slug"> | null;
  description: string;
  price: number | null;
  materials: string[];
  dimensions: string;
  finishes: string[];
  images: string[];
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItemT {
  _id: string;
  image: string;
  caption: string;
  alt: string;
  category: Pick<CategoryT, "_id" | "name" | "slug"> | null;
  order: number;
}

export interface InquiryT {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  product: Pick<ProductT, "_id" | "name" | "slug"> | null;
  productName: string;
  status: "new" | "read" | "resolved";
  createdAt: string;
}

export type ActionResult<T = undefined> = { ok: true; data?: T; message?: string } | { ok: false; error: string };

export const PRODUCT_SORTS = {
  featured: "Featured",
  newest: "Newest",
  "name-asc": "Name: A to Z",
  "name-desc": "Name: Z to A",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;
export type ProductSort = keyof typeof PRODUCT_SORTS;
