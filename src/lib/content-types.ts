// Shared content shapes and defaults. Safe to import from client and server code.

export const BENEFIT_ICONS = ["leaf", "gem", "home", "sofa", "ruler", "sparkles", "hammer", "sun"] as const;
export type BenefitIcon = (typeof BENEFIT_ICONS)[number];

export interface Benefit {
  icon: BenefitIcon;
  title: string;
  subtitle: string;
}

export interface HomeStep {
  title: string;
  text: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HomeContent {
  heroHeadline: string;
  heroText: string;
  heroButtonLabel: string;
  heroImage: string;
  heroImageAlt: string;
  benefits: Benefit[];
  collectionsHeading: string;
  collectionsText: string;
  founderEyebrow: string;
  founderHeading: string;
  founderText: string;
  founderLinkLabel: string;
  founderImage: string;
  founderImageAlt: string;
  ctaHeading: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
  showFeatured: boolean;
  featuredEyebrow: string;
  featuredHeading: string;
  featuredText: string;
  featuredButtonLabel: string;
  showProcess: boolean;
  processEyebrow: string;
  processHeading: string;
  processText: string;
  processSteps: HomeStep[];
  showGallery: boolean;
  galleryEyebrow: string;
  galleryHeading: string;
  galleryText: string;
  galleryButtonLabel: string;
  showTestimonials: boolean;
  testimonialsEyebrow: string;
  testimonialsHeading: string;
  testimonials: Testimonial[];
  showFaq: boolean;
  faqEyebrow: string;
  faqHeading: string;
  faqText: string;
  faqs: FaqItem[];
  showVisit: boolean;
  visitEyebrow: string;
  visitHeading: string;
  visitText: string;
  visitButtonLabel: string;
}

export interface AboutValue {
  title: string;
  text: string;
}

export interface AboutContent {
  heroEyebrow: string;
  heroHeading: string;
  heroText: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderImage: string;
  storyHeading: string;
  storyText: string;
  storyImage: string;
  approachHeading: string;
  approachText: string;
  valuesHeading: string;
  values: AboutValue[];
}

export interface CollectionsContent {
  eyebrow: string;
  heading: string;
  intro: string;
  emptyHeading: string;
  emptyText: string;
  detailProductsHeading: string;
  detailCtaHeading: string;
  detailCtaButtonLabel: string;
  detailCtaButtonHref: string;
  productInquiryLabel: string;
  relatedHeading: string;
}

export interface GalleryContent {
  eyebrow: string;
  heading: string;
  intro: string;
  ctaHeading: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
}

export interface ContactContent {
  eyebrow: string;
  heading: string;
  intro: string;
  formHeading: string;
  successMessage: string;
}

export interface SocialLinks {
  instagram: string;
  pinterest: string;
  facebook: string;
  youtube: string;
}

export interface SiteSettingsData {
  siteTitle: string;
  logo: string;
  logoAlt: string;
  contactEmail: string;
  contactPhone: string;
  /** Additional labelled numbers, e.g. USA / Office. */
  extraPhones: { label: string; number: string }[];
  contactAddress: string;
  contactHours: string;
  social: SocialLinks;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  currency: string;
}

export const DEFAULT_HOME: HomeContent = {
  heroHeadline: "Beautiful furniture.\nBetter living.",
  heroText:
    "Timeless furniture and home interiors for modern life. Thoughtfully designed, beautifully made, for a more comfortable everyday.",
  heroButtonLabel: "Discover Collection",
  heroImage: "/images/hero-living-room.webp",
  heroImageAlt: "Bright living room with a cream sofa, round coffee table and natural daylight",
  benefits: [
    { icon: "leaf", title: "Thoughtful Design", subtitle: "Furniture with intention" },
    { icon: "gem", title: "Quality Materials", subtitle: "Built to last" },
    { icon: "home", title: "Made for Everyday", subtitle: "Homes lived in, not just styled" },
  ],
  collectionsHeading: "Find your kind of comfort",
  collectionsText: "Explore our collections, thoughtfully curated for every space in your home.",
  founderEyebrow: "Meet the Founder",
  founderHeading: "Designed to feel like home.",
  founderText:
    "A thoughtful approach to comfortable living, beautiful spaces and the details that make a house feel like home.",
  founderLinkLabel: "Our Story",
  founderImage: "/brand/founder.jpg",
  founderImageAlt: "Portrait of the founder",
  ctaHeading: "Make space for better living.",
  ctaButtonLabel: "Explore Collection",
  ctaButtonHref: "/collections",
  showFeatured: true,
  featuredEyebrow: "Featured Pieces",
  featuredHeading: "Chosen for everyday comfort",
  featuredText: "A few favourite pieces from our collections, selected for their form, materials and how they feel to live with.",
  featuredButtonLabel: "View all pieces",
  showProcess: true,
  processEyebrow: "How It Works",
  processHeading: "From first look to finished room",
  processText: "A simple, personal process designed around your space and your routine.",
  processSteps: [
    { title: "Explore", text: "Browse our collections by room and save the pieces that suit your space." },
    { title: "Ask us", text: "Send an inquiry about any piece. We will answer questions on sizing, materials and availability." },
    { title: "Choose your finish", text: "Select the fabric, wood or finish that works best with the rest of your home." },
    { title: "Bring it home", text: "We confirm the details and next steps with you so everything arrives as planned." },
  ],
  showGallery: true,
  galleryEyebrow: "Inspiration",
  galleryHeading: "Rooms that feel like home",
  galleryText: "Calm, lived-in interiors to help you picture what is possible in your own space.",
  galleryButtonLabel: "View the gallery",
  showTestimonials: true,
  testimonialsEyebrow: "Client Stories",
  testimonialsHeading: "What our clients say",
  testimonials: [],
  showFaq: true,
  faqEyebrow: "Questions",
  faqHeading: "Good to know",
  faqText: "Answers to common questions. If you do not see yours here, send us a message.",
  faqs: [
    { question: "How do I ask about a piece?", answer: "Open any product and select the inquiry button, or use the contact page. The product is attached to your message so we know exactly what you are asking about." },
    { question: "Are prices shown online?", answer: "Some pieces show a price and others are quoted on request, depending on size, fabric and finish. Send an inquiry and we will share the details." },
    { question: "Can I choose a different fabric or finish?", answer: "Many pieces are available in more than one finish. The options are listed on each product page, and we are happy to talk through what will work in your room." },
    { question: "Can you help me furnish a whole room?", answer: "Yes. Tell us about the room, its size and the feel you are after, and we will suggest pieces from our collections that work well together." },
  ],
  showVisit: true,
  visitEyebrow: "Get in Touch",
  visitHeading: "Let us help you plan your space",
  visitText: "Call, email or visit us. We are happy to answer questions about any piece in our collection.",
  visitButtonLabel: "Contact Us",
};

export const DEFAULT_ABOUT: AboutContent = {
  heroEyebrow: "About Us",
  heroHeading: "Designed to feel like home.",
  heroText:
    "We believe a home should be comfortable, personal and made to be lived in. Our collections bring together calm design, honest materials and pieces that age well.",
  founderName: "",
  founderRole: "Founder",
  founderBio: "",
  founderImage: "/brand/founder.jpg",
  storyHeading: "Our story",
  storyText:
    "Every collection starts with a simple question: how will this piece feel to live with every day? From that starting point we select forms, fabrics and finishes that bring warmth to a room without overwhelming it.",
  storyImage: "/images/living-room.webp",
  approachHeading: "Our design approach",
  approachText:
    "We favour clean lines, natural textures and quiet colour palettes. Each piece is chosen to work across rooms and seasons, so your home can evolve without starting over.",
  valuesHeading: "What we value",
  values: [
    { title: "Intention", text: "Every piece earns its place through comfort, function and form." },
    { title: "Materials", text: "Natural woods, durable fabrics and finishes chosen to last." },
    { title: "Everyday living", text: "Furniture made for real homes, real routines and real people." },
  ],
};

export const DEFAULT_COLLECTIONS: CollectionsContent = {
  eyebrow: "Collections",
  heading: "The furniture collection",
  intro:
    "Explore pieces thoughtfully curated for every space in your home. Filter by room, search by material and send an inquiry about anything you love.",
  emptyHeading: "No pieces found",
  emptyText: "Try a different search term or category, or browse the full collection.",
  detailProductsHeading: "Pieces in this collection",
  detailCtaHeading: "Planning a room? Let's talk.",
  detailCtaButtonLabel: "Send an Inquiry",
  detailCtaButtonHref: "/contact",
  productInquiryLabel: "Inquire about this piece",
  relatedHeading: "You may also like",
};

export const DEFAULT_GALLERY: GalleryContent = {
  eyebrow: "Inspiration",
  heading: "Rooms that feel like home",
  intro: "A collection of calm, lived-in interiors to help you imagine what is possible in your own space.",
  ctaHeading: "Make space for better living.",
  ctaButtonLabel: "Explore Collection",
  ctaButtonHref: "/collections",
};

export const DEFAULT_CONTACT: ContactContent = {
  eyebrow: "Contact",
  heading: "Let's talk about your space",
  intro:
    "Have a question about a piece, a finish or a room you are planning? Send us a message and our team will get back to you.",
  formHeading: "Send an inquiry",
  successMessage: "Thank you. Your message has been received and our team will be in touch soon.",
};

export const DEFAULT_SETTINGS: SiteSettingsData = {
  siteTitle: "Discover Real Estate Inc. | Furniture & Home Interiors",
  logo: "/brand/logo.png",
  logoAlt: "Discover Real Estate Inc. Brokerage",
  contactEmail: "",
  contactPhone: "",
  extraPhones: [],
  contactAddress: "",
  contactHours: "",
  social: { instagram: "", pinterest: "", facebook: "", youtube: "" },
  footerText: "Timeless furniture and home interiors for modern life.",
  seoTitle: "Beautiful furniture. Better living.",
  seoDescription:
    "Timeless furniture and home interiors for modern life. Explore living room, bedroom and dining collections.",
  ogImage: "",
  currency: "CAD",
};

/** Deep-merge stored data over defaults so new fields always have a value. */
export function withDefaults<T extends object>(defaults: T, stored: unknown): T {
  if (!stored || typeof stored !== "object") return structuredClone(defaults);
  const out: Record<string, unknown> = structuredClone(defaults) as Record<string, unknown>;
  for (const [k, v] of Object.entries(stored as Record<string, unknown>)) {
    if (!(k in out) || v === undefined || v === null) continue;
    const d = out[k];
    if (d && typeof d === "object" && !Array.isArray(d) && typeof v === "object" && !Array.isArray(v)) {
      out[k] = withDefaults(d as object, v);
    } else if (typeof d === typeof v || (Array.isArray(d) && Array.isArray(v))) {
      out[k] = v;
    }
  }
  return out as T;
}
