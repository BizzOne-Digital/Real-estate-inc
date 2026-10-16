import Link from "next/link";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon, PinterestIcon, YoutubeIcon } from "@/components/ui/Icons";
import type { SiteSettingsData } from "@/lib/content-types";
import { safeHref } from "@/lib/utils";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/featured-properties", label: "Properties" },
  { href: "/condos", label: "Condos" },
  { href: "/relocation", label: "Relocation" },
  { href: "/market-insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

const RESOURCE_LINKS = [
  { href: "/mortgage", label: "Mortgage Information" },
  { href: "/land-transfer-tax", label: "Land Transfer Tax Calculator" },
  { href: "/testimonials", label: "Client Reviews" },
];

const tel = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

export function Footer({ settings }: { settings: SiteSettingsData }) {
  const socials = [
    { key: "instagram", label: "Instagram", Icon: InstagramIcon, href: safeHref(settings.social.instagram) },
    { key: "pinterest", label: "Pinterest", Icon: PinterestIcon, href: safeHref(settings.social.pinterest) },
    { key: "facebook", label: "Facebook", Icon: FacebookIcon, href: safeHref(settings.social.facebook) },
    { key: "youtube", label: "YouTube", Icon: YoutubeIcon, href: safeHref(settings.social.youtube) },
  ].filter((s) => s.href);

  const phones = [
    settings.contactPhone && { label: settings.contactPhone, number: settings.contactPhone },
    ...(settings.extraPhones ?? []).map((p) => ({ label: `${p.label ? `${p.label}: ` : ""}${p.number}`, number: p.number })),
  ].filter(Boolean) as { label: string; number: string }[];

  return (
    <footer className="bg-offwhite">
      <div className="container-site grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr] lg:gap-12">
        <div>
          <Logo src={settings.logo} alt={settings.logoAlt} className="h-[78px] w-[220px] mix-blend-multiply" />
          {(settings.agentName || settings.brokerageName) && (
            <p className="mt-5 text-[15px] leading-relaxed text-ink/80">
              {settings.agentName && (
                <span className="block font-display text-[1.35rem] text-navy">
                  {settings.agentName}
                  {settings.agentTitle && <span className="text-ink/70">, {settings.agentTitle}</span>}
                </span>
              )}
              {settings.brokerageName}
            </p>
          )}
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2">
            {FOOTER_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[15px] text-navy transition-opacity hover:opacity-70">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">Resources</p>
          <ul className="space-y-2">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[15px] text-navy transition-opacity hover:opacity-70">
                  {l.label}
                </Link>
              </li>
            ))}
            {settings.propertySearchUrl && (
              <li>
                <a href={settings.propertySearchUrl} target="_blank" rel="noopener noreferrer" className="text-[15px] text-navy transition-opacity hover:opacity-70">
                  Search Properties
                </a>
              </li>
            )}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-2 text-[15px]">
            {phones.map((p) => (
              <li key={p.label}>
                <a href={tel(p.number)} className="text-navy hover:underline">
                  {p.label}
                </a>
              </li>
            ))}
            {settings.contactEmail && (
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="break-words text-navy hover:underline">
                  {settings.contactEmail}
                </a>
              </li>
            )}
            {settings.contactAddress && <li className="whitespace-pre-line pt-1 text-ink/80">{settings.contactAddress}</li>}
          </ul>
          {socials.length > 0 && (
            <ul className="mt-5 flex items-center gap-5" aria-label="Social media">
              {socials.map(({ key, label, Icon, href }) => (
                <li key={key}>
                  <a href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className="block text-navy transition-opacity hover:opacity-70">
                    <Icon className="h-[21px] w-[21px]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-site flex flex-col items-center gap-2 py-5 text-center font-sans text-xs text-muted md:flex-row md:justify-between md:text-left">
          <p>{settings.footerText}</p>
          <p>
            &copy; {new Date().getFullYear()} {settings.brokerageName || settings.logoAlt}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
