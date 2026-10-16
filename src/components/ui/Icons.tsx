import { Feather, Gem, Hammer, Home, Leaf, Ruler, Sofa, Sparkles, Sun, type LucideProps } from "lucide-react";
import type { BenefitIcon as BenefitIconName } from "@/lib/content-types";

const MAP = { leaf: Leaf, gem: Gem, home: Home, sofa: Sofa, ruler: Ruler, sparkles: Sparkles, hammer: Hammer, sun: Sun };

export function BenefitIcon({ name, ...props }: { name: BenefitIconName } & LucideProps) {
  const Icon = MAP[name] ?? Feather;
  return <Icon aria-hidden strokeWidth={1} {...props} />;
}

/** Thin long arrow used throughout the reference design. */
export function ThinArrow({ className = "", size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size * 0.6}
      viewBox="0 0 20 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 6h17M13 1l5 5-5 5" />
    </svg>
  );
}

type SocialProps = { className?: string };

export function InstagramIcon({ className }: SocialProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PinterestIcon({ className }: SocialProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.64 19.31c-.09-.79-.17-2 .03-2.86l1.2-5.08s-.3-.62-.3-1.53c0-1.43.83-2.5 1.87-2.5.88 0 1.3.66 1.3 1.45 0 .88-.56 2.2-.85 3.43-.24 1.02.52 1.86 1.53 1.86 1.84 0 3.25-1.94 3.25-4.73 0-2.47-1.78-4.2-4.31-4.2-2.94 0-4.66 2.2-4.66 4.48 0 .89.34 1.84.77 2.36.08.1.1.19.07.3l-.29 1.17c-.04.19-.15.23-.35.14-1.29-.6-2.1-2.5-2.1-4.02 0-3.27 2.38-6.28 6.86-6.28 3.6 0 6.4 2.57 6.4 6 0 3.58-2.26 6.46-5.39 6.46-1.05 0-2.04-.55-2.38-1.2l-.65 2.47c-.23.9-.86 2.03-1.29 2.72A10 10 0 1 0 12 2z" />
    </svg>
  );
}

export function FacebookIcon({ className }: SocialProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.55V4.47A20.6 20.6 0 0 0 14.3 4.3c-2.24 0-3.8 1.37-3.8 3.9v2.3H8v3h2.5V21h3z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: SocialProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.77-1.77C18.27 5 12 5 12 5s-6.27 0-7.83.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.77 1.77C5.73 19 12 19 12 19s6.27 0 7.83-.43a2.5 2.5 0 0 0 1.77-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3L10 15z" />
    </svg>
  );
}
