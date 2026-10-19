"use client";

import { useId, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Map centres for the location dropdown (used to frame the results map on the search site). */
const AREAS = [
  { name: "All GTA", lat: 43.7, lng: -79.5, span: [0.32, 0.55], zoom: 10 },
  { name: "Mississauga", lat: 43.589, lng: -79.6441, span: [0.09, 0.14], zoom: 12 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, span: [0.14, 0.25], zoom: 11 },
  { name: "Brampton", lat: 43.7315, lng: -79.7624, span: [0.09, 0.14], zoom: 12 },
  { name: "Oakville", lat: 43.4675, lng: -79.6877, span: [0.08, 0.12], zoom: 12 },
  { name: "Milton", lat: 43.5183, lng: -79.8774, span: [0.08, 0.12], zoom: 12 },
  { name: "Etobicoke", lat: 43.6205, lng: -79.5132, span: [0.07, 0.1], zoom: 12 },
  { name: "Vaughan", lat: 43.8361, lng: -79.4983, span: [0.09, 0.13], zoom: 12 },
  { name: "Markham", lat: 43.8561, lng: -79.337, span: [0.08, 0.12], zoom: 12 },
  { name: "Burlington", lat: 43.3255, lng: -79.799, span: [0.08, 0.12], zoom: 12 },
  { name: "Hamilton", lat: 43.2557, lng: -79.8711, span: [0.1, 0.16], zoom: 12 },
] as const;

const HOME_TYPES = [
  { label: "Any home type", value: "" },
  { label: "Detached", value: "Detached" },
  { label: "Semi-Detached", value: "Semi-Detached" },
  { label: "Townhouse", value: "Attached/Townhouse" },
  { label: "Condo / Apartment", value: "Apartment/Condo" },
  { label: "Bungalow", value: "Bungalow" },
];

const PRICES = [0, 300_000, 400_000, 500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000, 1_250_000, 1_500_000, 2_000_000, 3_000_000];
const RENTS = [0, 1_500, 2_000, 2_500, 3_000, 3_500, 4_000, 5_000, 7_500];
const COUNTS = [0, 1, 2, 3, 4, 5];

const money = (n: number) => (n >= 1_000_000 ? `$${n / 1_000_000}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}K` : `$${n}`);

/**
 * Builds a results link for the a1housi.com map search. Its results page reads the search
 * filters from a base64-encoded JSON segment in the URL.
 */
function buildSearchUrl(
  origin: string,
  f: { area: string; type: "Sale" | "Rent"; style: string; min: number; max: number; beds: number; baths: number },
) {
  const a = AREAS.find((x) => x.name === f.area) ?? AREAS[0];
  const allGta = a.name === "All GTA";
  const payload = {
    search: {
      searchType: "residential",
      listingType: [f.type],
      openHouse: { from: 0, to: 0 },
      bed: f.beds,
      marketdays: 0,
      bath: f.baths,
      searchBy: "searchall",
      searchByText: allGta ? "" : `${a.name}, Ontario, Canada`,
      priceRange: { min: f.min, max: f.max },
      feetRange: { min: 0, max: 0 },
      showOnly: [],
      priceDrop: false,
      powerOfSale: false,
      powerOfSaleLabel: "",
      sortby: "newest",
      condoType: "",
      condoOccupancy: "",
      condoStatus: "",
      condoBuilder: "",
      keywords: [],
      PostalCode: false,
      Province: false,
      City: false,
      ...(allGta ? {} : { cityName: a.name }),
      propertyStyle: f.style ? [f.style] : [],
    },
    location: {
      Longitude: a.lng,
      Latitude: a.lat,
      Zoom: a.zoom,
      mapViewType: "roadmap",
      mapInfoType: [],
      selectedPathID: "",
      Bounds: { south: a.lat - a.span[0], west: a.lng - a.span[1], north: a.lat + a.span[0], east: a.lng + a.span[1] },
    },
    controlSpecial: {},
  };
  const json = JSON.stringify(payload);
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return `${origin}/mapsearchapp/search/${b64}`;
}

function SelectField({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="mb-1.5 block font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full appearance-none rounded-[2px] border border-white/20 bg-white pl-3.5 pr-9 font-sans text-[15px] text-ink focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        {children}
      </select>
      <ChevronDown aria-hidden strokeWidth={1.75} className="pointer-events-none absolute bottom-3.5 right-3 h-5 w-5 text-navy" />
    </div>
  );
}

export function PropertySearch({ searchUrl, heading, text }: { searchUrl: string; heading: string; text: string }) {
  const [area, setArea] = useState<string>("Mississauga");
  const [type, setType] = useState<"Sale" | "Rent">("Sale");
  const [style, setStyle] = useState("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);

  let origin = "";
  try {
    const u = new URL(searchUrl);
    if (/(^|\.)a1housi\.com$/i.test(u.hostname)) origin = u.origin;
  } catch {
    /* invalid or empty URL */
  }
  const prices = type === "Rent" ? RENTS : PRICES;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const href = origin
      ? buildSearchUrl(origin, { area, type, style, min, max: max && max < min ? 0 : max, beds, baths })
      : searchUrl;
    if (href) window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <section aria-labelledby="property-search-heading" className="relative z-10 bg-navy text-white shadow-[0_24px_50px_-30px_rgba(32,42,80,0.9)]">
      <form onSubmit={submit} className="px-5 py-6 sm:px-8 lg:px-10 lg:py-7">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="property-search-heading" className="flex items-center gap-3 font-display text-[clamp(1.6rem,2.4vw,2.1rem)] leading-tight text-white">
            <Search aria-hidden strokeWidth={1.5} className="h-6 w-6 shrink-0" />
            {heading}
          </h2>
          {text && <p className="font-sans text-[13px] text-white/70">{text}</p>}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-[1.3fr_1fr_1.2fr_1fr_1fr_0.75fr_0.75fr_auto]">
          <SelectField label="Location" value={area} onChange={setArea} className="col-span-2 md:col-span-1">
            {AREAS.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="For"
            value={type}
            onChange={(v) => {
              setType(v as "Sale" | "Rent");
              setMin(0);
              setMax(0);
            }}
          >
            <option value="Sale">Sale</option>
            <option value="Rent">Rent</option>
          </SelectField>
          <SelectField label="Home type" value={style} onChange={setStyle}>
            {HOME_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectField>
          <SelectField label="Min price" value={min} onChange={(v) => setMin(Number(v))}>
            {prices.map((p) => (
              <option key={p} value={p}>
                {p ? money(p) : "No min"}
              </option>
            ))}
          </SelectField>
          <SelectField label="Max price" value={max} onChange={(v) => setMax(Number(v))}>
            {prices.map((p) => (
              <option key={p} value={p}>
                {p ? money(p) : "No max"}
              </option>
            ))}
          </SelectField>
          <SelectField label="Beds" value={beds} onChange={(v) => setBeds(Number(v))}>
            {COUNTS.map((c) => (
              <option key={c} value={c}>
                {c ? `${c}+` : "Any"}
              </option>
            ))}
          </SelectField>
          <SelectField label="Baths" value={baths} onChange={(v) => setBaths(Number(v))}>
            {COUNTS.map((c) => (
              <option key={c} value={c}>
                {c ? `${c}+` : "Any"}
              </option>
            ))}
          </SelectField>
          <div className="col-span-2 flex items-end md:col-span-1">
            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[2px] bg-white px-7 font-sans text-[15px] font-semibold uppercase tracking-[0.08em] text-navy shadow-sm transition-colors hover:bg-mist focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              <Search aria-hidden strokeWidth={2} className="h-5 w-5" />
              Search
            </button>
          </div>
        </div>
        {searchUrl && (
          <p className="mt-4 font-sans text-[13px] text-white/70">
            Prefer the full search with maps and more filters?{" "}
            <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4 hover:no-underline">
              Open advanced property search
            </a>
          </p>
        )}
      </form>
    </section>
  );
}
