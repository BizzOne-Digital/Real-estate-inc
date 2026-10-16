"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length > 0 ? images : [""];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-mist-deep sm:aspect-[5/4] lg:aspect-[4/5]">
        <SafeImage
          key={list[active]}
          src={list[active]}
          alt={`${name} — image ${active + 1} of ${list.length}`}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="animate-fade object-cover"
        />
      </div>
      {list.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5" aria-label="Product images">
          {list.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === active}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden bg-mist-deep ring-offset-2 transition",
                  i === active ? "ring-1 ring-navy" : "opacity-75 hover:opacity-100",
                )}
              >
                <SafeImage src={src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
