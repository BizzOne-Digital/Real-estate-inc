"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SafeImage } from "@/components/ui/SafeImage";
import type { GalleryItemT } from "@/lib/types";
import { cn } from "@/lib/utils";

export function GalleryGrid({ items }: { items: GalleryItemT[] }) {
  const filters = useMemo(() => {
    const seen = new Map<string, string>();
    items.forEach((i) => i.category && seen.set(i.category.slug, i.category.name));
    return [...seen.entries()].map(([slug, name]) => ({ slug, name }));
  }, [items]);

  const [filter, setFilter] = useState("");
  const visible = filter ? items.filter((i) => i.category?.slug === filter) : items;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }, []);
  const step = useCallback(
    (d: number) => setOpenIndex((i) => (i === null ? i : (i + d + visible.length) % visible.length)),
    [visible.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "Tab") {
        // Only three controls exist in the dialog; keep focus among them.
        const dialog = document.getElementById("gallery-lightbox");
        const els = dialog ? [...dialog.querySelectorAll<HTMLElement>("button")] : [];
        if (els.length === 0) return;
        const idx = els.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        els[(idx + (e.shiftKey ? -1 : 1) + els.length) % els.length].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, step]);

  const current = openIndex !== null ? visible[openIndex] : null;

  return (
    <>
      {filters.length > 0 && (
        <div role="group" aria-label="Filter inspiration" className="mb-8 flex flex-wrap gap-2">
          {[{ slug: "", name: "All" }, ...filters].map((f) => (
            <button
              key={f.slug || "all"}
              type="button"
              aria-pressed={filter === f.slug}
              onClick={() => setFilter(f.slug)}
              className={cn(
                "border px-4 py-2 font-sans text-[13px] tracking-wide transition-colors",
                filter === f.slug ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-navy",
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="border border-line bg-white px-6 py-14 text-center text-ink/75">No images in this category yet.</p>
      ) : (
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
          {visible.map((item, i) => (
            <li key={item._id} className="break-inside-avoid">
              <button
                type="button"
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setOpenIndex(i);
                }}
                className="group relative block w-full overflow-hidden bg-mist-deep text-left"
                aria-label={`Open image: ${item.caption || item.alt || "interior inspiration"}`}
              >
                <div className={cn("relative", i % 3 === 1 ? "aspect-[4/5]" : i % 3 === 2 ? "aspect-square" : "aspect-[4/3]")}>
                  <SafeImage
                    src={item.image}
                    alt={item.alt || item.caption || "Interior inspiration"}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                {item.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 font-display text-xl text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                    {item.caption}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {current && (
        <div
          id="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || "Image viewer"}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-deep/95 p-4"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center text-white hover:bg-white/10"
          >
            <X aria-hidden strokeWidth={1.25} className="h-7 w-7" />
          </button>
          {visible.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white hover:bg-white/10 sm:left-6"
              >
                <ChevronLeft aria-hidden strokeWidth={1.25} className="h-8 w-8" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center text-white hover:bg-white/10 sm:right-6"
              >
                <ChevronRight aria-hidden strokeWidth={1.25} className="h-8 w-8" />
              </button>
            </>
          )}
          <figure className="flex max-h-full w-full max-w-5xl flex-col items-center">
            <div className="relative h-[75vh] w-full">
              <SafeImage
                key={current._id}
                src={current.image}
                alt={current.alt || current.caption || "Interior inspiration"}
                fill
                sizes="100vw"
                className="animate-fade object-contain"
              />
            </div>
            <figcaption className="mt-4 text-center text-white/90">
              {current.caption && <span className="font-display text-2xl">{current.caption}</span>}
              <span className="ml-3 font-sans text-xs tracking-widest text-white/60">
                {openIndex! + 1} / {visible.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
