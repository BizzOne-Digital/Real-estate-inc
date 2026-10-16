// Generated furniture photos bundled with the application.
// Maps only the original sample Unsplash photos; custom admin uploads remain unchanged.
export const GENERATED_IMAGE_MAP: Readonly<Record<string, string>> = {
  "1616486338812-3dadae4b4ace": "/images/hero-living-room.webp",
  "1618221195710-dd6b41faaea6": "/images/living-room.webp",
  "1617325247661-675ab4b64ae2": "/images/bedroom.webp",
  "1604578762246-41134e37f9cc": "/images/dining-room.webp",
  "1555041469-a586c61ea9bc": "/images/arden-sofa.webp",
  "1493663284031-b7e3aefcae8e": "/images/arden-sofa-detail.webp",
  "1586023492125-27b2c045efd7": "/images/linden-lounge-chair.webp",
  "1567538096630-e0c55bd6374c": "/images/cove-tufted-chair.webp",
  "1616627547584-bf28cee262db": "/images/haven-slipper-chair.webp",
  "1611486212557-88be5ff6f941": "/images/walnut-side-table.webp",
  "1616046229478-9901c5536a45": "/images/oslo-sideboard.webp",
  "1616594039964-ae9021a400a0": "/images/harbor-upholstered-bed.webp",
  "1522771739844-6a9f6d5f14af": "/images/nordic-nightstand.webp",
  "1505693416388-ac5ce068fe85": "/images/tufted-bed-bench.webp",
  "1617806118233-18e1de247200": "/images/walnut-dining-table-detail.webp",
  "1592078615290-033ee584e267": "/images/shell-dining-chair.webp",
  "1549497538-303791108f95": "/images/heritage-dining-chair.webp",
  "1503602642458-232111445657": "/images/counter-stool.webp",
  "1616047006789-b7af5afb8c20": "/images/warm-textures.webp",
  "1615874959474-d609969a20ed": "/images/layered-bedroom.webp",
  "1600210492486-724fe5c67fb0": "/images/gallery-wall.webp",
  "1540518614846-7eded433c457": "/images/colour-accents.webp"
};

export function resolveImageSrc(src: string): string {
  const match = /^https:\/\/images\.unsplash\.com\/photo-([A-Za-z0-9-]+)(?:\?[^#]*)?$/.exec(src);
  return match ? GENERATED_IMAGE_MAP[match[1]] ?? src : src;
}

/** Resolve legacy sample images without mutating saved content or admin uploads. */
export function resolveBundledImages<T>(value: T): T {
  if (typeof value === "string") return resolveImageSrc(value) as T;
  if (Array.isArray(value)) return value.map((item) => resolveBundledImages(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveBundledImages(item)])) as T;
  }
  return value;
}
