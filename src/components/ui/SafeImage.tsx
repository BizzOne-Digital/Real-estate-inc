"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import { useState } from "react";
import { resolveImageSrc } from "@/lib/generated-images";

export const PLACEHOLDER_SRC = "/placeholder.svg";

const UNSPLASH_RE = /^https:\/\/images\.unsplash\.com\/[A-Za-z0-9_\-./]+(\?.*)?$/;
const OWNED_UPLOAD_RE = /^\/api\/uploads\/(products|gallery|pages|misc)\/[A-Za-z0-9.\-]+$/;
const BUNDLED_RE = /^\/images\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;
const STATIC_RE = /^\/(brand\/[A-Za-z0-9.\-_]+|placeholder\.svg)$/;

/** Only Unsplash, owned uploads and bundled assets are valid. Legacy /uploads/... paths are not. */
export function isRenderableSrc(src: unknown): src is string {
  return typeof src === "string" && (UNSPLASH_RE.test(src) || OWNED_UPLOAD_RE.test(src) || STATIC_RE.test(src) || BUNDLED_RE.test(src));
}

function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
}

type Props = Omit<ImageProps, "src" | "alt"> & { src?: string | null; alt: string };

/** next/image wrapper with a single, loop-safe fallback to a neutral placeholder. */
export function SafeImage({ src, alt, unoptimized, ...rest }: Props) {
  const resolvedSrc = typeof src === "string" ? resolveImageSrc(src) : src;
  // Remember which source failed so a new src gets a fresh attempt, and the placeholder never loops.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const current = isRenderableSrc(resolvedSrc) && failedSrc !== resolvedSrc ? resolvedSrc : PLACEHOLDER_SRC;

  const isPlaceholder = current === PLACEHOLDER_SRC;
  const isUnsplash = current.startsWith("https://images.unsplash.com/");
  const isGif = /\.gif$/i.test(current);

  return (
    <Image
      {...rest}
      src={current}
      alt={isPlaceholder ? "" : alt}
      loader={isUnsplash ? unsplashLoader : undefined}
      // GIFs keep their animation, and the SVG placeholder is served as-is.
      unoptimized={unoptimized || isGif || isPlaceholder}
      onError={() => {
        if (current !== PLACEHOLDER_SRC) setFailedSrc(current);
      }}
    />
  );
}
