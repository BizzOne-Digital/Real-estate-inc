import Link from "next/link";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon, PinterestIcon, YoutubeIcon } from "@/components/ui/Icons";
import type { SiteSettingsData } from "@/lib/content-types";
import { safeHref } from "@/lib/utils";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ settings }: { settings: SiteSettingsData }) {
  const socials = [
    { key: "instagram", label: "Instagram", Icon: InstagramIcon, href: safeHref(settings.social.instagram) },
    { key: "pinterest", label: "Pinterest", Icon: PinterestIcon, href: safeHref(settings.social.pinterest) },
    { key: "facebook", label: "Facebook", Icon: FacebookIcon, href: safeHref(settings.social.facebook) },
    { key: "youtube", label: "YouTube", Icon: YoutubeIcon, href: safeHref(settings.social.youtube) },
  ].filter((s) => s.href);

  const contact = [
    settings.contactEmail && { label: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    settings.contactPhone && { label: settings.contactPhone, href: `tel:${settings.contactPhone.replace(/[^\d+]/g, "")}` },
    ...(settings.extraPhones ?? []).map((p) => ({ label: `${p.label ? p.label + ": " : ""}${p.number}`, href: `tel:${p.number.replace(/[^\d+]/g, "")}` })),
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer className="bg-offwhite">
      <div className="container-site flex flex-col items-center gap-8 py-10 md:flex-row md:gap-0 md:py-6">
        <Logo src={settings.logo} alt={settings.logoAlt} className="h-[78px] w-[220px] mix-blend-multiply" />
        <span aria-hidden className="mx-14 hidden h-12 w-px bg-divider md:block" />
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-9 gap-y-3">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[15px] text-navy transition-opacity hover:opacity-70">
              {l.label}
            </Link>
          ))}
        </nav>
        {socials.length > 0 && (
          <ul className="flex items-center gap-5 md:ml-auto" aria-label="Social media">
            {socials.map(({ key, label, Icon, href }) => (
              <li key={key}>
                <a
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="block text-navy transition-opacity hover:opacity-70"
                >
                  <Icon className="h-[21px] w-[21px]" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-t border-line">
        <div className="container-site flex flex-col items-center gap-2 py-5 text-center font-sans text-xs text-muted md:flex-row md:justify-between md:text-left">
          <p>{settings.footerText}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {contact.map((c) => (
              <a key={c.href} href={c.href} className="hover:text-navy">
                {c.label}
              </a>
            ))}
            <span>
              &copy; {new Date().getFullYear()} {settings.logoAlt}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
