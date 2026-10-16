import { BenefitIcon } from "@/components/ui/Icons";
import type { Benefit } from "@/lib/content-types";

export function Benefits({ items }: { items: Benefit[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Why choose us" className="border-t border-white bg-mist">
      <ul className="container-site grid gap-8 py-9 sm:grid-cols-3 sm:gap-0 sm:py-8">
        {items.map((b, i) => (
          <li
            key={i}
            className="flex items-center justify-start gap-5 sm:justify-center sm:px-4 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-divider/70"
          >
            <BenefitIcon name={b.icon} className="h-9 w-9 shrink-0 text-navy" />
            <div>
              <p className="text-[16px] leading-tight text-navy">{b.title}</p>
              <p className="mt-1 text-[14px] leading-snug text-muted">{b.subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
