import { cn } from "@/lib/utils";

/** Eyebrow + serif heading + optional text, matching the reference typography. */
export function SectionIntro({
  eyebrow,
  heading,
  text,
  id,
  align = "left",
  light = false,
  action,
}: {
  eyebrow?: string;
  heading: string;
  text?: string;
  id?: string;
  align?: "left" | "center";
  light?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-5 lg:mb-12",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className={cn("eyebrow flex items-center gap-4", align === "center" && "justify-center", light && "text-white/80")}>
            {eyebrow}
            <span aria-hidden className={cn("h-px w-12", light ? "bg-white/50" : "bg-navy/70")} />
          </p>
        )}
        <h2
          id={id}
          className={cn(
            "mt-4 font-display text-[clamp(2.3rem,4vw,3.3rem)] font-medium leading-[1] tracking-[-0.015em]",
            light ? "text-white" : "text-navy",
          )}
        >
          {heading}
        </h2>
        {text && <p className={cn("mt-4 text-[16px] leading-relaxed", light ? "text-white/80" : "text-ink/80")}>{text}</p>}
      </div>
      {action}
    </div>
  );
}
