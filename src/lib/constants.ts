// Client-safe option lists shared by models, validation and forms.

export const INQUIRY_INTERESTS = [
  "Buying a property",
  "Selling a property",
  "Renting / leasing",
  "Condominium inquiry",
  "Relocation services",
  "Mortgage information",
  "Home evaluation",
  "Other",
] as const;
export type InquiryInterest = (typeof INQUIRY_INTERESTS)[number];

export const POST_CATEGORIES = [
  "Market Commentary",
  "Market Statistics",
  "Seller Advice",
  "Buyer Advice",
  "Mortgage & Finance",
  "News",
] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];
