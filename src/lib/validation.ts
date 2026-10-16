import { z } from "zod";
import { BENEFIT_ICONS } from "./content-types";

const UNSPLASH_RE = /^https:\/\/images\.unsplash\.com\/[A-Za-z0-9_\-./]+(\?[A-Za-z0-9_\-=&.%]*)?$/;
const OWNED_UPLOAD_RE = /^\/api\/uploads\/(products|gallery|pages|misc)\/\d{10,16}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/;
const BUNDLED_RE = /^\/images\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;
const BRAND_RE = /^\/brand\/[A-Za-z0-9._-]+$/;

/** Content documents only store URL strings: owned uploads, Unsplash photos or bundled brand assets. */
export function isAllowedImageUrl(v: string): boolean {
  return v === "" || UNSPLASH_RE.test(v) || OWNED_UPLOAD_RE.test(v) || BRAND_RE.test(v) || BUNDLED_RE.test(v);
}

const text = (max: number) => z.string().trim().max(max);
const required = (label: string, max: number) => z.string().trim().min(1, `${label} is required.`).max(max);
export const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine(isAllowedImageUrl, "Images must be uploaded, bundled image assets, or use an images.unsplash.com URL.");
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(90)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens.");
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid id.");
const linkHref = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v), "Use a site path like /collections or a full https:// URL.");
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/.test(v), "Enter a full URL starting with https://");
const list = (max: number) =>
  z
    .array(z.string().trim().min(1).max(120))
    .max(max)
    .transform((a) => [...new Set(a)]);

export const inquirySchema = z.object({
  name: required("Name", 120),
  email: z.string().trim().toLowerCase().max(200).email("Enter a valid email address."),
  phone: text(40).refine((v) => v === "" || /^[+()\d\s.-]{7,40}$/.test(v), "Enter a valid phone number."),
  subject: required("Subject", 200),
  product: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(10, "Please write a message of at least 10 characters.").max(5000),
});

export const productSchema = z.object({
  name: required("Name", 140),
  slug,
  category: objectId,
  description: text(5000),
  price: z.number().min(0).max(10_000_000).nullable(),
  materials: list(20),
  dimensions: text(300),
  finishes: list(20),
  images: z.array(imageUrl.refine((v) => v !== "", "Empty image.")).max(12),
  featured: z.boolean(),
  published: z.boolean(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: required("Name", 80),
  slug,
  description: text(2000),
  image: imageUrl,
  order: z.number().int().min(0).max(9999),
  showOnHome: z.boolean(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const galleryItemSchema = z.object({
  image: imageUrl.refine((v) => v !== "", "An image is required."),
  caption: text(200),
  alt: text(200),
  category: objectId.nullable(),
});
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

export const homeSchema = z.object({
  heroHeadline: required("Headline", 120),
  heroText: required("Supporting copy", 400),
  heroButtonLabel: required("Button label", 40),
  heroImage: imageUrl,
  heroImageAlt: text(200),
  benefits: z
    .array(z.object({ icon: z.enum(BENEFIT_ICONS), title: required("Benefit title", 60), subtitle: text(100) }))
    .max(3),
  collectionsHeading: required("Collections heading", 120),
  collectionsText: text(300),
  founderEyebrow: text(40),
  founderHeading: required("Founder heading", 120),
  founderText: text(600),
  founderLinkLabel: required("Link label", 40),
  founderImage: imageUrl,
  founderImageAlt: text(200),
  ctaHeading: required("CTA heading", 120),
  ctaButtonLabel: required("CTA button label", 40),
  ctaButtonHref: linkHref,
  showFeatured: z.boolean(),
  featuredEyebrow: text(40),
  featuredHeading: required("Featured heading", 120),
  featuredText: text(400),
  featuredButtonLabel: required("Featured button label", 40),
  showProcess: z.boolean(),
  processEyebrow: text(40),
  processHeading: required("Process heading", 120),
  processText: text(400),
  processSteps: z.array(z.object({ title: required("Step title", 60), text: text(300) })).max(6),
  showGallery: z.boolean(),
  galleryEyebrow: text(40),
  galleryHeading: required("Gallery heading", 120),
  galleryText: text(400),
  galleryButtonLabel: required("Gallery button label", 40),
  showTestimonials: z.boolean(),
  testimonialsEyebrow: text(40),
  testimonialsHeading: required("Testimonials heading", 120),
  testimonials: z.array(z.object({ quote: required("Testimonial quote", 800), name: required("Client name", 80), location: text(80) })).max(12),
  showFaq: z.boolean(),
  faqEyebrow: text(40),
  faqHeading: required("FAQ heading", 120),
  faqText: text(400),
  faqs: z.array(z.object({ question: required("Question", 200), answer: required("Answer", 1500) })).max(12),
  showVisit: z.boolean(),
  visitEyebrow: text(40),
  visitHeading: required("Contact section heading", 120),
  visitText: text(400),
  visitButtonLabel: required("Contact button label", 40),
});

export const aboutSchema = z.object({
  heroEyebrow: text(40),
  heroHeading: required("Heading", 140),
  heroText: text(800),
  founderName: text(120),
  founderRole: text(120),
  founderBio: text(5000),
  founderImage: imageUrl,
  storyHeading: required("Story heading", 120),
  storyText: text(5000),
  storyImage: imageUrl,
  approachHeading: required("Approach heading", 120),
  approachText: text(5000),
  valuesHeading: text(120),
  values: z.array(z.object({ title: required("Value title", 80), text: text(400) })).max(6),
});

export const collectionsPageSchema = z.object({
  eyebrow: text(40),
  heading: required("Heading", 140),
  intro: text(800),
  emptyHeading: required("Empty state heading", 120),
  emptyText: text(300),
  detailProductsHeading: required("Products heading", 120),
  detailCtaHeading: required("CTA heading", 120),
  detailCtaButtonLabel: required("CTA button label", 40),
  detailCtaButtonHref: linkHref,
  productInquiryLabel: required("Inquiry button label", 60),
  relatedHeading: required("Related heading", 120),
});

export const galleryPageSchema = z.object({
  eyebrow: text(40),
  heading: required("Heading", 140),
  intro: text(800),
  ctaHeading: required("CTA heading", 120),
  ctaButtonLabel: required("CTA button label", 40),
  ctaButtonHref: linkHref,
});

export const contactPageSchema = z.object({
  eyebrow: text(40),
  heading: required("Heading", 140),
  intro: text(800),
  formHeading: text(120),
  successMessage: required("Success message", 300),
});

export const settingsSchema = z.object({
  siteTitle: required("Site title", 120),
  logo: imageUrl,
  logoAlt: required("Logo alt text", 120),
  contactEmail: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address."),
  contactPhone: text(40),
  extraPhones: z.array(z.object({ label: text(40), number: required("Phone number", 40) })).max(5),
  contactAddress: text(300),
  contactHours: text(200),
  social: z.object({
    instagram: optionalUrl,
    pinterest: optionalUrl,
    facebook: optionalUrl,
    youtube: optionalUrl,
  }),
  footerText: text(300),
  seoTitle: text(120),
  seoDescription: text(300),
  ogImage: imageUrl,
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code such as CAD or USD."),
});

export function firstError(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Invalid input.";
  const path = issue.path.filter((p) => typeof p === "string").join(" › ");
  return path && !issue.message.toLowerCase().includes("required") ? `${path}: ${issue.message}` : issue.message;
}
