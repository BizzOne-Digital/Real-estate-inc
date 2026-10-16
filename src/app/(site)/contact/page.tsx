import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { getPage, getProductOptions, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send us a question about a piece, a finish or a room you are planning.",
  alternates: { canonical: "/contact" },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function ContactPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const requested = (Array.isArray(sp.product) ? sp.product[0] : sp.product) ?? "";
  const [content, settings, products] = await Promise.all([getPage("contact"), getSettings(), getProductOptions()]);
  const defaultProduct = products.some((p) => p.slug === requested) ? requested : "";

  const details = [
    settings.contactEmail && { Icon: Mail, label: "Email", value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    settings.contactPhone && {
      Icon: Phone,
      label: "Phone",
      value: settings.contactPhone,
      href: `tel:${settings.contactPhone.replace(/[^\d+]/g, "")}`,
    },
    ...(settings.extraPhones ?? []).map((p) => ({
      Icon: Phone,
      label: p.label || "Phone",
      value: p.number,
      href: `tel:${p.number.replace(/[^\d+]/g, "")}`,
    })),
    settings.contactAddress && { Icon: MapPin, label: "Visit", value: settings.contactAddress },
    settings.contactHours && { Icon: Clock, label: "Hours", value: settings.contactHours },
  ].filter(Boolean) as { Icon: typeof Mail; label: string; value: string; href?: string }[];

  return (
    <section className="bg-offwhite">
      <div className="grid lg:grid-cols-[40%_60%]">
        <div className="border-b border-line bg-mist px-6 py-14 sm:px-10 lg:border-b-0 lg:px-[clamp(2.5rem,5vw,4.5rem)] lg:py-20">
          <p className="eyebrow flex items-center gap-4">
            {content.eyebrow}
            <span aria-hidden className="h-px w-12 bg-navy/70" />
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,4.8vw,4rem)] font-medium leading-[0.98] tracking-[-0.02em] text-navy">
            {content.heading}
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink/80">{content.intro}</p>

          {details.length > 0 && (
            <ul className="mt-10 space-y-5 border-t border-line pt-8">
              {details.map(({ Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <Icon aria-hidden strokeWidth={1.25} className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
                  <div>
                    <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-muted">{label}</p>
                    {href ? (
                      <a href={href} className="mt-1 block text-[16px] text-navy hover:underline">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 whitespace-pre-line text-[16px] text-ink">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
          {content.formHeading && (
            <h2 className="mb-8 font-display text-[clamp(1.9rem,3vw,2.5rem)] text-navy">{content.formHeading}</h2>
          )}
          <ContactForm
            products={products.map((p) => ({ name: p.name, slug: p.slug }))}
            defaultProduct={defaultProduct}
            successMessage={content.successMessage}
          />
        </div>
      </div>
    </section>
  );
}
