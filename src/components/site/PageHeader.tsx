import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  text,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cn("border-b border-line bg-mist", className)}>
      <div className="container-site py-14 sm:py-16 lg:py-20">
        {eyebrow && (
          <p className="eyebrow flex items-center gap-4">
            {eyebrow}
            <span aria-hidden className="h-px w-12 bg-navy/70" />
          </p>
        )}
        <h1 className="mt-5 max-w-3xl font-display text-[clamp(2.6rem,5vw,4.2rem)] font-medium leading-[0.98] tracking-[-0.02em] text-navy">
          {title}
        </h1>
        {text && <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink/80">{text}</p>}
        {children}
      </div>
    </section>
  );
}
