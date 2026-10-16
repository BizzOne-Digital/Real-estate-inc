// Default content per editable page. Client- and script-safe (no server-only imports).
import {
  DEFAULT_ABOUT,
  DEFAULT_CONTACT,
  DEFAULT_FEATURED,
  DEFAULT_HOME,
  DEFAULT_LTT,
  DEFAULT_MORTGAGE,
  DEFAULT_RELOCATION,
  DEFAULT_TESTIMONIALS,
  type AboutContent,
  type ContactContent,
  type HomeContent,
  type InfoPageContent,
  type TestimonialsContent,
} from "./content-types";

export type PageMap = {
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
  featured: InfoPageContent;
  relocation: InfoPageContent;
  mortgage: InfoPageContent;
  "land-transfer-tax": InfoPageContent;
  testimonials: TestimonialsContent;
};

export const PAGE_DEFAULTS: PageMap = {
  home: DEFAULT_HOME,
  about: DEFAULT_ABOUT,
  contact: DEFAULT_CONTACT,
  featured: DEFAULT_FEATURED,
  relocation: DEFAULT_RELOCATION,
  mortgage: DEFAULT_MORTGAGE,
  "land-transfer-tax": DEFAULT_LTT,
  testimonials: DEFAULT_TESTIMONIALS,
};
