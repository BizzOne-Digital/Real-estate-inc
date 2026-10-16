import { z } from "zod";
import { BENEFIT_ICONS } from "./content-types";
import { INQUIRY_INTERESTS, POST_CATEGORIES } from "./constants";

const UNSPLASH_RE = /^https:\/\/images\.unsplash\.com\/[A-Za-z0-9_\-./]+(\?[A-Za-z0-9_\-=&.%]*)?$/;
const OWNED_UPLOAD_RE = /^\/api\/uploads\/(condos|posts|pages|misc|products|gallery)\/\d{10,16}-[a-f0-9]{16}\.(jpg|png|webp|gif)$/;
const BUNDLED_RE = /^\/images\/(?:re\/)?[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;
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
  .refine(isAllowedImageUrl, "Images must be uploaded or use an images.unsplash.com URL.");
const slug = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Slug is required.")
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain lowercase letters, numbers and hyphens.");
const linkHref = z
  .string()
  .trim()
  .max(300)
  .refine(
    (v) => v === "" || /^\/(?!\/)/.test(v) || /^https?:\/\//.test(v),
    "Use a site path like /contact or a full https:// URL.",
  );
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/.test(v), "Enter a full URL starting with https://");
const list = (max: number, itemMax = 200) =>
  z
    .array(z.string().trim().min(1).max(itemMax))
    .max(max)
    .transform((a) => [...new Set(a)]);

export const inquirySchema = z.object({
  name: required("Name", 120),
  email: z.string().trim().toLowerCase().max(200).email("Enter a valid email address."),
  phone: text(40).refine((v) => v === "" || /^[+()\d\s.-]{7,40}$/.test(v), "Enter a valid phone number."),
  interest: z.enum(INQUIRY_INTERESTS, { message: "Choose what you need help with." }),
  reference: text(200),
  condo: text(160),
  message: z.string().trim().min(10, "Please write a message of at least 10 characters.").max(5000),
});

export const condoSchema = z.object({
  name: required("Building name", 140),
  slug,
  address: text(300),
  city: text(80),
  neighbourhood: text(120),
  intersection: text(160),
  developer: text(120),
  summary: text(500),
  description: text(20000),
  details: z.array(z.object({ label: required("Detail label", 60), value: required("Detail value", 300) })).max(30),
  featureGroups: z.array(z.object({ heading: required("Feature group heading", 80), items: list(60, 300) })).max(12),
  images: z.array(imageUrl.refine((v) => v !== "", "Empty image.")).max(20),
  mapQuery: text(300),
  featured: z.boolean(),
  published: z.boolean(),
  order: z.number().int().min(0).max(9999),
});
export type CondoInput = z.infer<typeof condoSchema>;

export const postSchema = z.object({
  title: required("Title", 180),
  slug,
  category: z.enum(POST_CATEGORIES),
  excerpt: text(500),
  body: required("Article text", 50000),
  coverImage: imageUrl,
  publishedAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid publish date.")
    .transform((v) => new Date(v)),
  published: z.boolean(),
});
export type PostInput = z.input<typeof postSchema>;

const linkCard = z.object({
  title: required("Card title", 60),
  text: text(300),
  image: imageUrl,
  href: linkHref,
});
const testimonial = z.object({ quote: required("Testimonial quote", 1500), name: required("Client name", 80), location: text(80) });

export const homeSchema = z.object({
  heroHeadline: required("Headline", 120),
  heroText: required("Supporting copy", 500),
  heroButtonLabel: required("Button label", 40),
  heroSecondaryLabel: text(40),
  heroImage: imageUrl,
  heroImageAlt: text(200),
  benefits: z
    .array(z.object({ icon: z.enum(BENEFIT_ICONS), title: required("Benefit title", 60), subtitle: text(100) }))
    .max(3),
  servicesEyebrow: text(40),
  servicesHeading: required("Services heading", 120),
  servicesText: text(400),
  services: z.array(linkCard).max(6),
  showCondos: z.boolean(),
  condosEyebrow: text(40),
  condosHeading: required("Condos heading", 120),
  condosText: text(400),
  condosButtonLabel: required("Condos button label", 40),
  founderEyebrow: text(40),
  founderHeading: required("Founder heading", 120),
  founderText: text(600),
  founderLinkLabel: required("Link label", 40),
  founderImage: imageUrl,
  founderImageAlt: text(200),
  showProcess: z.boolean(),
  processEyebrow: text(40),
  processHeading: required("Process heading", 120),
  processText: text(400),
  processSteps: z.array(z.object({ title: required("Step title", 60), text: text(300) })).max(6),
  showTools: z.boolean(),
  toolsEyebrow: text(40),
  toolsHeading: required("Tools heading", 120),
  toolsText: text(400),
  tools: z.array(linkCard).max(6),
  showInsights: z.boolean(),
  insightsEyebrow: text(40),
  insightsHeading: required("Insights heading", 120),
  insightsText: text(400),
  showTestimonials: z.boolean(),
  testimonialsEyebrow: text(40),
  testimonialsHeading: required("Testimonials heading", 120),
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
  ctaHeading: required("CTA heading", 120),
  ctaButtonLabel: required("CTA button label", 40),
  ctaButtonHref: linkHref,
});

export const aboutSchema = z.object({
  heroEyebrow: text(40),
  heroHeading: required("Heading", 140),
  heroText: text(800),
  founderName: text(120),
  founderRole: text(120),
  founderBio: text(8000),
  founderImage: imageUrl,
  storyHeading: required("Story heading", 120),
  storyText: text(8000),
  storyImage: imageUrl,
  servicesHeading: text(120),
  services: list(20),
  approachHeading: required("Network heading", 120),
  approachText: text(5000),
  membershipsHeading: text(120),
  memberships: list(20),
  valuesHeading: text(120),
  values: z.array(z.object({ title: required("Value title", 80), text: text(400) })).max(6),
});

export const infoPageSchema = z.object({
  eyebrow: text(40),
  heading: required("Heading", 160),
  intro: text(1500),
  image: imageUrl,
  imageAlt: text(200),
  sections: z
    .array(z.object({ heading: required("Section heading", 160), body: text(8000), bullets: list(40, 600) }))
    .max(20),
  ctaHeading: required("CTA heading", 160),
  ctaText: text(600),
  ctaButtonLabel: required("CTA button label", 40),
  ctaButtonHref: linkHref,
});

export const testimonialsPageSchema = z.object({
  eyebrow: text(40),
  heading: required("Heading", 140),
  intro: text(800),
  testimonials: z.array(testimonial).max(60),
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
  agentName: text(120),
  agentTitle: text(120),
  brokerageName: text(160),
  contactEmail: z
    .string()
    .trim()
    .max(200)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address."),
  contactPhone: text(40),
  extraPhones: z.array(z.object({ label: text(40), number: required("Phone number", 40) })).max(5),
  contactAddress: text(300),
  contactHours: text(200),
  propertySearchUrl: optionalUrl,
  featuredListingsUrl: optionalUrl,
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
});

export function firstError(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Invalid input.";
  const path = issue.path.filter((p) => typeof p === "string").join(" › ");
  return path && !issue.message.toLowerCase().includes("required") ? `${path}: ${issue.message}` : issue.message;
}
