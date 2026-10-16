/**
 * SAMPLE CATALOG DATA — for demonstration only.
 * Product names, descriptions, materials and dimensions below are illustrative placeholders,
 * not claims about real inventory. Replace them in the admin panel with actual products.
 * Prices are intentionally omitted. Photos are generated and bundled locally in public/images.
 */


export const SAMPLE_CATEGORIES = [
  {
    slug: "living-room",
    name: "Living Room",
    description: "Sofas, lounge chairs and tables for the room where everyday life happens.",
    image: "/images/living-room.webp",
    order: 1,
  },
  {
    slug: "bedroom",
    name: "Bedroom",
    description: "Calm, restful pieces for the most personal room in your home.",
    image: "/images/bedroom.webp",
    order: 2,
  },
  {
    slug: "dining-room",
    name: "Dining Room",
    description: "Tables and seating made for long dinners and everyday gatherings.",
    image: "/images/dining-room.webp",
    order: 3,
  },
];

type SampleProduct = {
  slug: string;
  name: string;
  category: string;
  description: string;
  materials: string[];
  dimensions: string;
  finishes: string[];
  images: string[];
  featured?: boolean;
};

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    slug: "arden-sofa",
    name: "Arden Sofa",
    category: "living-room",
    description:
      "A clean-lined three-seat sofa with tapered legs and generous, supportive cushions.\n\nSample listing — update details in the admin panel.",
    materials: ["Velvet upholstery", "Hardwood frame", "Solid wood legs"],
    dimensions: "W 84 in × D 36 in × H 33 in",
    finishes: ["Forest green", "Ivory", "Slate"],
    images: ["/images/arden-sofa.webp", "/images/arden-sofa-detail.webp"],
    featured: true,
  },
  {
    slug: "linden-lounge-chair",
    name: "Linden Lounge Chair",
    category: "living-room",
    description: "A compact lounge chair with a softly sculpted back, sized for reading corners and smaller rooms.\n\nSample listing.",
    materials: ["Woven fabric", "Oak legs"],
    dimensions: "W 28 in × D 30 in × H 32 in",
    finishes: ["Mustard", "Oatmeal"],
    images: ["/images/linden-lounge-chair.webp"],
  },
  {
    slug: "cove-tufted-chair",
    name: "Cove Tufted Chair",
    category: "living-room",
    description: "Button-tufted accent chair with turned legs and a gently curved back.\n\nSample listing.",
    materials: ["Linen blend", "Painted hardwood"],
    dimensions: "W 26 in × D 28 in × H 34 in",
    finishes: ["Cream", "Stone grey"],
    images: ["/images/cove-tufted-chair.webp"],
    featured: true,
  },
  {
    slug: "haven-slipper-chair",
    name: "Haven Slipper Chair",
    category: "living-room",
    description: "An armless slipper chair with a deep seat — easy to place beside a sofa or at the end of a bed.\n\nSample listing.",
    materials: ["Velvet upholstery", "Hardwood frame"],
    dimensions: "W 27 in × D 30 in × H 33 in",
    finishes: ["Ochre", "Sand"],
    images: ["/images/haven-slipper-chair.webp"],
  },
  {
    slug: "walnut-side-table",
    name: "Walnut Side Table",
    category: "living-room",
    description: "A cantilevered side table with an open shelf for books and magazines.\n\nSample listing.",
    materials: ["Walnut veneer", "Solid walnut"],
    dimensions: "W 18 in × D 14 in × H 22 in",
    finishes: ["Natural walnut"],
    images: ["/images/walnut-side-table.webp"],
  },
  {
    slug: "oslo-sideboard",
    name: "Oslo Sideboard",
    category: "living-room",
    description: "A low sideboard with cane-front doors and adjustable interior shelving.\n\nSample listing.",
    materials: ["Oak veneer", "Natural cane"],
    dimensions: "W 63 in × D 18 in × H 30 in",
    finishes: ["Natural oak", "Smoked oak"],
    images: ["/images/oslo-sideboard.webp"],
  },
  {
    slug: "harbor-upholstered-bed",
    name: "Harbor Upholstered Bed",
    category: "bedroom",
    description: "A channel-tufted upholstered bed with a padded headboard for comfortable reading.\n\nSample listing.",
    materials: ["Performance fabric", "Engineered wood frame"],
    dimensions: "Queen: W 66 in × L 88 in × H 52 in",
    finishes: ["Ivory", "Mist grey"],
    images: ["/images/harbor-upholstered-bed.webp"],
    featured: true,
  },
  {
    slug: "linen-platform-bed",
    name: "Linen Platform Bed",
    category: "bedroom",
    description: "A low platform bed in solid wood, designed to be dressed simply in natural linens.\n\nSample listing.",
    materials: ["Solid pine", "Natural oil finish"],
    dimensions: "Queen: W 64 in × L 86 in × H 14 in",
    finishes: ["Natural", "Honey"],
    images: ["/images/bedroom.webp"],
  },
  {
    slug: "nordic-nightstand",
    name: "Nordic Nightstand",
    category: "bedroom",
    description: "A compact nightstand with one drawer and an open shelf.\n\nSample listing.",
    materials: ["Lacquered MDF", "Solid ash legs"],
    dimensions: "W 18 in × D 16 in × H 22 in",
    finishes: ["White", "Ash"],
    images: ["/images/nordic-nightstand.webp"],
  },
  {
    slug: "tufted-bed-bench",
    name: "Tufted Bed Bench",
    category: "bedroom",
    description: "An upholstered bench for the foot of the bed with a button-tufted seat.\n\nSample listing.",
    materials: ["Linen blend", "Painted hardwood legs"],
    dimensions: "W 52 in × D 18 in × H 19 in",
    finishes: ["Ivory", "Taupe"],
    images: ["/images/tufted-bed-bench.webp"],
  },
  {
    slug: "walnut-dining-table",
    name: "Walnut Dining Table",
    category: "dining-room",
    description: "A generous rectangular dining table with a warm walnut finish that seats six comfortably.\n\nSample listing.",
    materials: ["Walnut veneer", "Solid hardwood base"],
    dimensions: "W 84 in × D 40 in × H 30 in",
    finishes: ["Natural walnut", "Dark walnut"],
    images: ["/images/dining-room.webp", "/images/walnut-dining-table-detail.webp"],
    featured: true,
  },
  {
    slug: "shell-dining-chair",
    name: "Shell Dining Chair",
    category: "dining-room",
    description: "A moulded shell chair with a cushioned seat pad and slim wooden legs.\n\nSample listing.",
    materials: ["Moulded polypropylene", "Beech legs"],
    dimensions: "W 19 in × D 21 in × H 32 in",
    finishes: ["Black", "White"],
    images: ["/images/shell-dining-chair.webp"],
  },
  {
    slug: "heritage-dining-chair",
    name: "Heritage Dining Chair",
    category: "dining-room",
    description: "A classic wooden dining chair with a gently angled back.\n\nSample listing.",
    materials: ["Solid hardwood"],
    dimensions: "W 18 in × D 20 in × H 33 in",
    finishes: ["Chestnut", "Natural"],
    images: ["/images/heritage-dining-chair.webp"],
  },
  {
    slug: "counter-stool",
    name: "Counter Stool",
    category: "dining-room",
    description: "A simple counter-height stool with a footrest stretcher.\n\nSample listing.",
    materials: ["Solid birch"],
    dimensions: "W 15 in × D 15 in × H 26 in",
    finishes: ["White wash", "Natural birch"],
    images: ["/images/counter-stool.webp"],
  },
];

export const SAMPLE_GALLERY: { image: string; caption: string; alt: string; category: string | null }[] = [
  { image: "/images/hero-living-room.webp", caption: "Soft neutrals", alt: "Living room with cream sofa and woven accents", category: "living-room" },
  { image: "/images/living-room.webp", caption: "Afternoon light", alt: "Sunlit living room with wooden coffee tables", category: "living-room" },
  { image: "/images/bedroom.webp", caption: "Simple rest", alt: "Low wooden platform bed with white linens", category: "bedroom" },
  { image: "/images/dining-room.webp", caption: "Garden dining", alt: "Walnut dining table beside garden doors", category: "dining-room" },
  { image: "/images/warm-textures.webp", caption: "Warm textures", alt: "Living room with tan sectional and plants", category: "living-room" },
  { image: "/images/layered-bedroom.webp", caption: "Layered bedroom", alt: "Bedroom with layered bedding and pendant light", category: "bedroom" },
  { image: "/images/walnut-dining-table-detail.webp", caption: "Gathering place", alt: "Dining room with green upholstered chairs", category: "dining-room" },
  { image: "/images/gallery-wall.webp", caption: "Gallery wall", alt: "Living room with a gallery wall and leather sofa", category: "living-room" },
  { image: "/images/colour-accents.webp", caption: "Colour accents", alt: "Bedroom with orange bench and colourful pillows", category: "bedroom" },
];
