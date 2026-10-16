import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

/** Renders the supplied logo unaltered (object-contain keeps its original proportions and colors). */
export function Logo({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/" aria-label={`${alt} — home`} className={cn("relative block", className)}>
      <SafeImage src={src} alt={alt} fill priority={priority} sizes="240px" className="object-contain" />
    </Link>
  );
}
