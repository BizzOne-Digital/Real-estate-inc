import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { ThinArrow } from "@/components/ui/Icons";
import type { ProductT } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product, currency }: { product: ProductT; currency: string }) {
  const price = formatPrice(product.price, currency);
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist-deep">
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
          {product.featured && (
            <span className="absolute left-3 top-3 bg-white/90 px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.2em] text-navy">
              Featured
            </span>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            {product.category && (
              <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted">{product.category.name}</p>
            )}
            <h3 className="mt-1.5 font-display text-[1.6rem] leading-tight text-navy">{product.name}</h3>
            {price && <p className="mt-1 text-[15px] text-ink/80">{price}</p>}
          </div>
          <ThinArrow className="mt-8 shrink-0 text-navy transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </Link>
    </article>
  );
}
