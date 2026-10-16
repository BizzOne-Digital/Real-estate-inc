// Shared content shapes and defaults. Safe to import from client and server code.
// Default copy is adapted from Nadeem Khan's existing site (propertylimit.com) and can be edited in the admin panel.

const R = (name: string) => `/images/re/${name}.webp`;

/** Bundled real estate photography in public/images/re. */
export const SITE_IMAGES = {
  heroHouse: R("hero-house"),
  serviceBuying: R("service-buying"),
  serviceSelling: R("service-selling"),
  torontoSkyline: R("toronto-skyline"),
  aboutStory: R("about-story"),
  featuredHome: R("featured-home"),
  condoTowers1: R("condo-towers-1"),
  condoTowers2: R("condo-towers-2"),
  condoMidrise1: R("condo-midrise-1"),
  condoMidrise2: R("condo-midrise-2"),
  mortgage: R("mortgage"),
  landTransferTax: R("land-transfer-tax"),
  insights: R("insights"),
  articlePrepareHome: R("article-prepare-home"),
  articleClosingCosts: R("article-closing-costs"),
  articleWhyAgent: R("article-why-agent"),
} as const;

export const BENEFIT_ICONS = [
  "shield",
  "map",
  "key",
  "handshake",
  "building",
  "plane",
  "calculator",
  "home",
  "leaf",
  "gem",
  "sparkles",
  "sun",
] as const;
export type BenefitIcon = (typeof BENEFIT_ICONS)[number];

export interface Benefit {
  icon: BenefitIcon;
  title: string;
  subtitle: string;
}

/** Image card with a link (services, tools). */
export interface LinkCard {
  title: string;
  text: string;
  image: string;
  href: string;
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
  heroSecondaryLabel: string;
  heroImage: string;
  heroImageAlt: string;
  benefits: Benefit[];
  servicesEyebrow: string;
  servicesHeading: string;
  servicesText: string;
  services: LinkCard[];
  showCondos: boolean;
  condosEyebrow: string;
  condosHeading: string;
  condosText: string;
  condosButtonLabel: string;
  founderEyebrow: string;
  founderHeading: string;
  founderText: string;
  founderLinkLabel: string;
  founderImage: string;
  founderImageAlt: string;
  showProcess: boolean;
  processEyebrow: string;
  processHeading: string;
  processText: string;
  processSteps: HomeStep[];
  showTools: boolean;
  toolsEyebrow: string;
  toolsHeading: string;
  toolsText: string;
  tools: LinkCard[];
  showInsights: boolean;
  insightsEyebrow: string;
  insightsHeading: string;
  insightsText: string;
  showTestimonials: boolean;
  testimonialsEyebrow: string;
  testimonialsHeading: string;
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
  ctaHeading: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
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
  servicesHeading: string;
  services: string[];
  approachHeading: string;
  approachText: string;
  membershipsHeading: string;
  memberships: string[];
  valuesHeading: string;
  values: AboutValue[];
}

export interface InfoSection {
  heading: string;
  body: string;
  bullets: string[];
}

/** Generic content page: hero, a list of sections and a closing call to action. */
export interface InfoPageContent {
  eyebrow: string;
  heading: string;
  intro: string;
  image: string;
  imageAlt: string;
  sections: InfoSection[];
  ctaHeading: string;
  ctaText: string;
  ctaButtonLabel: string;
  ctaButtonHref: string;
}

export interface TestimonialsContent {
  eyebrow: string;
  heading: string;
  intro: string;
  testimonials: Testimonial[];
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
  agentName: string;
  agentTitle: string;
  brokerageName: string;
  contactEmail: string;
  contactPhone: string;
  /** Additional labelled numbers, e.g. USA / Office. */
  extraPhones: { label: string; number: string }[];
  contactAddress: string;
  contactHours: string;
  propertySearchUrl: string;
  featuredListingsUrl: string;
  social: SocialLinks;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
}

export const DEFAULT_HOME: HomeContent = {
  heroHeadline: "Find your place.\nMove with confidence.",
  heroText:
    "Buying, selling or renting in Mississauga, Toronto and across the GTA? Work with Nadeem Khan, Broker with Discover Real Estate Inc., for honest advice and personal service from first search to closing.",
  heroButtonLabel: "Search Properties",
  heroSecondaryLabel: "Contact Nadeem",
  heroImage: SITE_IMAGES.heroHouse,
  heroImageAlt: "Brick detached home with a double garage in a quiet residential neighbourhood",
  benefits: [
    { icon: "shield", title: "Licensed Broker", subtitle: "Honest, professional representation" },
    { icon: "map", title: "Local Knowledge", subtitle: "Mississauga, Brampton, Milton & GTA" },
    { icon: "key", title: "Full-Service Support", subtitle: "Buy, sell, rent and relocate" },
  ],
  servicesEyebrow: "How I Can Help",
  servicesHeading: "Real estate services for every move",
  servicesText: "Residential, commercial and rental properties across Ontario, with personal guidance at every step.",
  services: [
    {
      title: "Buying",
      text: "Find the right home or investment with market insight and patient guidance.",
      image: SITE_IMAGES.serviceBuying,
      href: "/featured-properties",
    },
    {
      title: "Selling",
      text: "Price, prepare and market your property to sell with confidence.",
      image: SITE_IMAGES.serviceSelling,
      href: "/contact?interest=Selling%20a%20property",
    },
    {
      title: "Relocation",
      text: "Moving to Ontario? Short and long term housing and settlement support.",
      image: SITE_IMAGES.torontoSkyline,
      href: "/relocation",
    },
  ],
  showCondos: true,
  condosEyebrow: "Condominiums",
  condosHeading: "Featured condo buildings",
  condosText: "Building details, amenities and neighbourhood information for popular condominiums across the GTA.",
  condosButtonLabel: "View all condos",
  founderEyebrow: "Meet Your Broker",
  founderHeading: "Personal service you can trust.",
  founderText:
    "Nadeem Khan helps buyers, sellers, landlords and tenants across Mississauga and the GTA, bringing honesty, patience and a good sense of humour to every transaction.",
  founderLinkLabel: "About Nadeem",
  founderImage: "/brand/founder.jpg",
  founderImageAlt: "Portrait of Nadeem Khan, Broker",
  showProcess: true,
  processEyebrow: "How It Works",
  processHeading: "A clear path from first call to closing",
  processText: "A simple, personal process built around your goals, timeline and budget.",
  processSteps: [
    { title: "Talk it through", text: "We discuss what you are looking for, your timeline and your budget." },
    { title: "Plan & prepare", text: "Get market information, mortgage guidance and a clear plan for your search or sale." },
    { title: "Search or list", text: "View suitable properties, or prepare and market your home to the right buyers." },
    { title: "Negotiate & close", text: "Careful negotiation and support right through closing day and beyond." },
  ],
  showTools: true,
  toolsEyebrow: "Buyer Resources",
  toolsHeading: "Tools to plan your purchase",
  toolsText: "Estimate your costs before you buy, then talk to Nadeem about the details.",
  tools: [
    {
      title: "Mortgage Calculator",
      text: "Estimate your payments and learn about mortgage options in Canada.",
      image: SITE_IMAGES.mortgage,
      href: "/mortgage",
    },
    {
      title: "Land Transfer Tax",
      text: "Calculate Ontario and Toronto land transfer tax, including first-time buyer refunds.",
      image: SITE_IMAGES.landTransferTax,
      href: "/land-transfer-tax",
    },
    {
      title: "Market Insights",
      text: "Market commentary, local statistics and advice for buyers and sellers.",
      image: SITE_IMAGES.insights,
      href: "/market-insights",
    },
  ],
  showInsights: true,
  insightsEyebrow: "Market Insights",
  insightsHeading: "Latest from the market",
  insightsText: "Commentary, statistics and practical advice for GTA buyers and sellers.",
  showTestimonials: true,
  testimonialsEyebrow: "Client Reviews",
  testimonialsHeading: "What clients say",
  showFaq: true,
  faqEyebrow: "Questions",
  faqHeading: "Good to know",
  faqText: "Answers to common questions. If yours is not here, send a message.",
  faqs: [
    {
      question: "How do I search for properties?",
      answer:
        "Use the Search Properties button to browse current listings for sale and for rent. If you find something you like, contact Nadeem and he will arrange more information or a viewing.",
    },
    {
      question: "Do you help buyers from outside Ontario or Canada?",
      answer:
        "Yes. Many clients start the process from out of province or overseas. Nadeem can help with information, viewings, relocation and short term housing before you arrive.",
    },
    {
      question: "What does land transfer tax cost in Ontario?",
      answer:
        "It depends on the purchase price and location. Toronto purchases also pay a municipal land transfer tax. Use the Land Transfer Tax calculator for an estimate, including first-time buyer refunds.",
    },
    {
      question: "Can you help me find out what my home is worth?",
      answer:
        "Yes. Contact Nadeem for a market evaluation based on recent comparable sales in your area and the current market.",
    },
  ],
  showVisit: true,
  visitEyebrow: "Get in Touch",
  visitHeading: "Ready to talk about your next move?",
  visitText: "Call, email or send a message. Nadeem is happy to answer questions about buying, selling, renting or relocating.",
  visitButtonLabel: "Contact Nadeem",
  ctaHeading: "Make your next move with confidence.",
  ctaButtonLabel: "Search Properties",
  ctaButtonHref: "",
};

export const DEFAULT_ABOUT: AboutContent = {
  heroEyebrow: "About",
  heroHeading: "Honest advice. Personal service.",
  heroText:
    "Helping clients buy, sell and rent residential, commercial and industrial properties across Mississauga, Toronto and the Greater Toronto Area.",
  founderName: "Nadeem Khan",
  founderRole: "Broker, Discover Real Estate Inc.",
  founderBio:
    "Nadeem Khan is a licensed Real Estate Broker in Ontario. Over the years he has assisted a large number of clients with buying, selling and renting residential and commercial properties across the GTA.\n\nBefore entering real estate, Nadeem built a background in banking, finance and technology, and owned and operated a number of retail businesses in Ontario. Working with thousands of customers taught him the value of patience, clear communication and genuine service.\n\nBuying or selling a home or a business can be stressful. With a positive attitude and a good sense of humour, Nadeem works to make the experience as smooth and stress-free as possible. Count on him to be a genuine professional: always candid, always honest.",
  founderImage: "/brand/founder.jpg",
  storyHeading: "Real estate is personal",
  storyText:
    "Nadeem discovered early that he had a passion for real estate, both for his own home and as an investment. He owns income and investment properties himself and manages privately owned properties, from finding tenants to rent collection and maintenance.\n\nThat first-hand experience as a buyer, seller, landlord and investor means he understands what clients are going through, and what matters most to them.",
  storyImage: SITE_IMAGES.aboutStory,
  servicesHeading: "Services",
  services: [
    "Home and business purchasing and selling",
    "Property management",
    "Renting and leasing",
    "Relocation services to Ontario, Canada",
    "Financing, refinancing and mortgage guidance",
    "Market evaluations",
  ],
  approachHeading: "A trusted network",
  approachText:
    "Over the years Nadeem has built working relationships with professionals clients often need, including lawyers, home inspectors, appraisers, builders, movers and mortgage consultants, so you are never left searching on your own.",
  membershipsHeading: "Professional memberships",
  memberships: [
    "Real Estate Council of Ontario (RECO)",
    "Toronto Regional Real Estate Board (TRREB)",
    "Ontario Real Estate Association (OREA)",
    "Multiple Listing Service (MLS®)",
  ],
  valuesHeading: "What clients can expect",
  values: [
    { title: "Integrity", text: "Candid, honest advice, with your interests put first at every step." },
    { title: "Local knowledge", text: "Deep familiarity with Mississauga, Brampton, Milton, Oakville and the GTA." },
    { title: "Follow-through", text: "Preparation, punctuality and follow-up from the first call to after closing." },
  ],
};

export const DEFAULT_FEATURED: InfoPageContent = {
  eyebrow: "Properties",
  heading: "Featured properties",
  intro:
    "Browse current homes, condos and rental properties for sale and lease across the GTA, including Mississauga, Toronto, Brampton, Milton, Oakville and surrounding areas.",
  image: SITE_IMAGES.featuredHome,
  imageAlt: "Family home with a landscaped front lawn",
  sections: [
    {
      heading: "Search current listings",
      body: "Use the property search to view up-to-date listings for sale and for rent. You can filter by area, price, property type and more.",
      bullets: [],
    },
    {
      heading: "Found something you like?",
      body: "Contact Nadeem with the address or listing details. He will send you more information, answer your questions and arrange a viewing.",
      bullets: [],
    },
  ],
  ctaHeading: "Looking for something specific?",
  ctaText: "Tell Nadeem what you are looking for and he will keep an eye out for properties that match.",
  ctaButtonLabel: "Contact Nadeem",
  ctaButtonHref: "/contact?interest=Buying%20a%20property",
};

export const DEFAULT_RELOCATION: InfoPageContent = {
  eyebrow: "Relocation Services",
  heading: "Moving to Toronto, Mississauga or the GTA",
  intro:
    "Moving to a new city is an exciting adventure, but the process can be overwhelming. We help individuals and families relocate smoothly to Ontario, so they are well prepared, settle quickly and make the most of their new life here.",
  image: SITE_IMAGES.torontoSkyline,
  imageAlt: "Toronto skyline at sunset seen across Lake Ontario",
  sections: [
    {
      heading: "Relocation support",
      body: "We have assisted transferees for many years with selling an existing home and finding a new one. Services include:",
      bullets: [
        "Home marketing assistance: a market evaluation of your current home, then marketing to sell it faster and for the best possible price.",
        "Home finding assistance: information about the area, housing and schools, and support through every step of your move.",
        "Rental assistance: help finding a short or long term rental if you are not buying right away.",
        "Mortgage assistance: introductions to lenders for competitive home financing.",
        "School information: details on school systems in the areas you are considering.",
        "Elder and child care: referrals to care providers in the area.",
        "Moving help: movers, boxes and supplies.",
      ],
    },
    {
      heading: "Services for newcomers to Canada",
      body: "Coming to Canada is an exciting opportunity and a big challenge. Much of the information and many of the services we offer newcomers are complimentary or available for a minimal charge. Please contact us for details.",
      bullets: [
        "Airport pick-up and drop-off",
        "Arranging temporary accommodation",
        "Social Insurance Number (SIN) guidance",
        "Help opening a bank account and building credit",
        "Advice on obtaining a driver's licence and health card",
        "Locating schools, colleges and universities",
        "Finding long term accommodation and obtaining a mortgage",
        "Legal referrals, orientation and translation referrals",
      ],
    },
    {
      heading: "Short term rentals",
      body: "Take the stress out of relocating with a furnished apartment, condo or home while you get to know the area. Living locally first lets you learn the market and make a confident buying decision. Month-to-month arrangements are available, and many suites include furnished kitchens, linens and in-suite laundry. Options vary by suite.",
      bullets: [],
    },
    {
      heading: "Long term rentals",
      body: "If you plan to rent for a longer period, we can help you find a suitable apartment, condo, townhouse or house in the neighbourhood that fits your work, schools and lifestyle.",
      bullets: [],
    },
  ],
  ctaHeading: "Planning a move to Ontario?",
  ctaText: "Tell us about your plans and timeline, and we will help you prepare for a smooth arrival.",
  ctaButtonLabel: "Ask About Relocation",
  ctaButtonHref: "/contact?interest=Relocation%20services",
};

export const DEFAULT_MORTGAGE: InfoPageContent = {
  eyebrow: "Mortgage Information",
  heading: "Understand your mortgage options",
  intro:
    "Getting the right mortgage can save you a significant amount of money. Learn the basics, estimate your payments and ask as many questions as you need before you buy.",
  image: SITE_IMAGES.mortgage,
  imageAlt: "Calculator and financial documents on a desk",
  sections: [
    {
      heading: "What is a mortgage?",
      body: "A mortgage is a loan secured against your home. The mortgage amount is typically the purchase price minus your down payment. In Canada, a down payment of less than 20% usually requires mortgage default insurance.",
      bullets: [],
    },
    {
      heading: "Get pre-approved",
      body: "A mortgage pre-approval tells you how much you can borrow and holds an interest rate for a period of time. It helps you shop with confidence and makes your offer stronger.",
      bullets: [],
    },
    {
      heading: "Common mortgage types",
      body: "",
      bullets: [
        "Fixed rate: the interest rate and payments stay the same for the term.",
        "Variable rate: the rate moves with the lender's prime rate.",
        "Open mortgage: can be paid off at any time without penalty, usually at a higher rate.",
        "Closed mortgage: lower rates, with limits on prepayments during the term.",
        "Home equity line of credit (HELOC): borrow against the equity in your home.",
        "Bridge financing: short term financing between buying and selling.",
      ],
    },
  ],
  ctaHeading: "Have questions about financing?",
  ctaText: "Nadeem can introduce you to trusted mortgage professionals and help you plan your purchase.",
  ctaButtonLabel: "Ask About Mortgages",
  ctaButtonHref: "/contact?interest=Mortgage%20information",
};

export const DEFAULT_LTT: InfoPageContent = {
  eyebrow: "Land Transfer Tax",
  heading: "Ontario land transfer tax calculator",
  intro:
    "Land transfer tax is paid by the buyer when a property changes hands. In Ontario it is calculated in tiers based on the purchase price, and properties in the City of Toronto pay an additional municipal land transfer tax.",
  image: SITE_IMAGES.landTransferTax,
  imageAlt: "Signing real estate documents",
  sections: [
    {
      heading: "First-time homebuyer refunds",
      body: "Eligible first-time buyers can receive a refund of up to $4,000 of Ontario land transfer tax. In Toronto, eligible first-time buyers can also receive a rebate of up to $4,475 of municipal land transfer tax.",
      bullets: [
        "You must be at least 18 years old.",
        "You must occupy the home as your principal residence within 9 months of closing.",
        "You cannot have owned a home, or had an ownership interest in a home, anywhere in the world.",
        "Your spouse cannot have owned a home anywhere in the world while they were your spouse.",
        "Refunds are reduced proportionately when a co-owner is not eligible.",
      ],
    },
    {
      heading: "Important",
      body: "The calculator provides an estimate only. Rates, refunds and eligibility rules can change. Confirm the exact amount with your real estate lawyer before closing.",
      bullets: [],
    },
  ],
  ctaHeading: "Planning your purchase?",
  ctaText: "Nadeem can walk you through closing costs and help you budget for your new home.",
  ctaButtonLabel: "Contact Nadeem",
  ctaButtonHref: "/contact?interest=Buying%20a%20property",
};

export const DEFAULT_TESTIMONIALS: TestimonialsContent = {
  eyebrow: "Client Reviews",
  heading: "What clients say",
  intro: "Feedback from buyers, sellers, landlords and investors Nadeem has worked with over the years.",
  testimonials: [
    {
      quote:
        "We had specific real estate requirements but knew little of the GTA, especially the Mississauga market. Nadeem met with us well prepared with information to review our needs and market availability. His efforts culminated in a money-saving purchase of a detached house in Mississauga. We wholeheartedly recommend Nadeem, particularly if you are an out of province or out of country purchaser.",
      name: "Mark and Lorraine Brown",
      location: "Mississauga, Ontario",
    },
    {
      quote:
        "I have purchased five personal residences in my life. Nadeem Khan was the most thoughtful, helpful and thorough realtor to ever help my wife and me through such an important and complex transaction. He carefully listened to our many needs and patiently returned us to our top choice homes until we were sure of our selection.",
      name: "Agib Magid",
      location: "",
    },
    {
      quote:
        "Working with Nadeem was a very easy and reassuring experience. It was always clear that we were dealing with someone with years of experience in Mississauga real estate, but more than that, his integrity was most reassuring.",
      name: "Jennifer McLaughlin",
      location: "",
    },
    {
      quote:
        "We had chosen you as our agent in a number of our Ontario real estate transactions. Your detailed and most informative market analysis and evaluations proved to be correct.",
      name: "Aline and Joe Flower",
      location: "California, USA",
    },
    {
      quote:
        "I chose Nadeem because his website provided a tremendous amount of information that helped me make an educated and confident decision. On arrival, he personally took me to properties suited to my requirements and saved me time. I am proud to recommend Nadeem to anyone thinking of purchasing a property in Canada.",
      name: "Roger Eddings",
      location: "",
    },
    {
      quote:
        "Lots of efficiency without high pressure, and a very friendly atmosphere. Great connections in the field. Very knowledgeable. Honesty, and this is a big one! Just a pleasure to work with, with a willingness to go the extra mile.",
      name: "Linda J.",
      location: "",
    },
    {
      quote:
        "Thank you and your office for helping me for so many years. You have always been relentless whenever I asked you to help me rent one of my properties. I will continue to refer you to my colleagues, friends and relatives.",
      name: "Diane S.",
      location: "",
    },
    {
      quote:
        "Most impressed with your professional behaviour, both in terms of punctuality and knowledge. You gave me professional advice when it came to deciding on the location, mortgage and features. My family and I wholeheartedly thank you.",
      name: "Patric K.",
      location: "",
    },
    {
      quote:
        "I was extremely pleased with the time and attentiveness given to me. There was genuine interest in my wants and needs, and I appreciated that service.",
      name: "Ahmed T.",
      location: "",
    },
  ],
};

export const DEFAULT_CONTACT: ContactContent = {
  eyebrow: "Contact",
  heading: "Let's talk about your next move",
  intro:
    "Whether you are buying, selling, renting or relocating, send a message and Nadeem will get back to you. You can also call or email directly.",
  formHeading: "Send a message",
  successMessage: "Thank you. Your message has been received and Nadeem will be in touch soon.",
};

export const DEFAULT_SETTINGS: SiteSettingsData = {
  siteTitle: "Discover Real Estate Inc. | Nadeem Khan, Broker",
  logo: "/brand/logo.png",
  logoAlt: "Discover Real Estate Inc. Brokerage",
  agentName: "Nadeem Khan",
  agentTitle: "Broker",
  brokerageName: "Discover Real Estate Inc., Brokerage",
  contactEmail: "",
  contactPhone: "",
  extraPhones: [],
  contactAddress: "",
  contactHours: "",
  propertySearchUrl: "https://www.a1housi.com/property_find_form_common",
  featuredListingsUrl: "https://propertylimit.com/Relocation.html",
  social: { instagram: "", pinterest: "", facebook: "", youtube: "" },
  footerText: "Buy, sell and rent real estate in Mississauga, Toronto and the GTA.",
  seoTitle: "Nadeem Khan, Broker | Mississauga & GTA Real Estate",
  seoDescription:
    "Buy, sell, rent or relocate in Mississauga, Toronto and the GTA with Nadeem Khan, Broker with Discover Real Estate Inc. Condo guides, market insights, mortgage and land transfer tax calculators.",
  ogImage: "",
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
