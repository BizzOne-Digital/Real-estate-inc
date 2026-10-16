"use client";

import { useState } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

export function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length > 0 ? images : [""];
  const [active, setActive] = useState(0);
  const current = Math.min(active, list.length - 1);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-mist-deep">
        <SafeImage
          key={list[current]}
          src={list[current]}
          alt={`${name}: image ${current + 1} of ${list.length}`}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="animate-fade object-cover"
        />
      </div>
      {list.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6" aria-label="Building images">
          {list.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === current}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden bg-mist-deep ring-offset-2 transition",
                  i === current ? "ring-1 ring-navy" : "opacity-75 hover:opacity-100",
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
