"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThinArrow } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

type NavLink = { href: string; label: string; external?: boolean };
type NavItem = NavLink | { label: string; children: NavLink[] };

function buildNav(searchUrl: string): NavItem[] {
  return [
    { href: "/about", label: "About" },
    {
      label: "Properties",
      children: [
        { href: "/featured-properties", label: "Featured Properties" },
        { href: "/condos", label: "Condominiums" },
        ...(searchUrl ? [{ href: searchUrl, label: "Search MLS® Listings", external: true }] : []),
      ],
    },
    {
      label: "Services",
      children: [
        { href: "/relocation", label: "Relocation Services" },
        { href: "/mortgage", label: "Mortgage Information" },
        { href: "/land-transfer-tax", label: "Land Transfer Tax" },
      ],
    },
    { href: "/market-insights", label: "Insights" },
    { href: "/testimonials", label: "Reviews" },
    { href: "/contact", label: "Contact" },
  ];
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Dropdown({ label, items, pathname }: { label: string; items: NavLink[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = items.some((i) => !i.external && isActive(pathname, i.href));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        // Hover already opens the menu on desktop, so a click only ever opens it (Escape/outside click closes).
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1 px-3 py-2 text-[15px] text-navy transition-colors hover:text-navy-deep",
          active && "underline decoration-1 underline-offset-[10px]",
        )}
      >
        {label}
        <ChevronDown aria-hidden strokeWidth={1.5} className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      <div
        className={cn(
          "absolute left-0 top-full z-40 min-w-[230px] pt-2 transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <ul className="border border-line bg-white py-2 shadow-xl">
          {items.map((i) => (
            <li key={i.href}>
              {i.external ? (
                <a
                  href={i.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-5 py-2.5 text-[15px] text-navy hover:bg-mist"
                >
                  {i.label}
                  <ExternalLink aria-hidden strokeWidth={1.5} className="h-3.5 w-3.5 opacity-70" />
                </a>
              ) : (
                <Link
                  href={i.href}
                  aria-current={isActive(pathname, i.href) ? "page" : undefined}
                  className={cn("block px-5 py-2.5 text-[15px] text-navy hover:bg-mist", isActive(pathname, i.href) && "bg-mist")}
                >
                  {i.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Header({ logo, logoAlt, searchUrl }: { logo: string; logoAlt: string; searchUrl: string }) {
  const pathname = usePathname();
  // On the homepage the desktop header floats over the split hero, as in the reference design.
  const overlay = pathname === "/";
  const nav = buildNav(searchUrl);
  const [open, setOpen] = useState(false);
  // Close the drawer whenever navigation happens.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab" && panelRef.current) {
        // Keep keyboard focus inside the drawer.
        const items = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const searchButton = searchUrl ? (
    <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="btn-navy group py-3 text-[15.5px] font-medium shadow-md ring-1 ring-white/40">
      <Search aria-hidden strokeWidth={2} className="h-4 w-4" /> Search Properties <ThinArrow className="btn-arrow" />
    </a>
  ) : (
    <Link href="/featured-properties" className="btn-navy group py-2.5 text-[15px] shadow-sm">
      View Properties <ThinArrow className="btn-arrow" />
    </Link>
  );

  return (
    <header className={cn("z-30 w-full", overlay ? "xl:absolute xl:inset-x-0 xl:top-0" : "relative bg-mist")}>
      {/* Desktop */}
      <div className="hidden xl:flex xl:items-start">
        <div className="flex h-[92px] w-[32%] shrink-0 items-center justify-center bg-white">
          <Logo src={logo} alt={logoAlt} priority className="h-[72px] w-[200px] mix-blend-multiply 2xl:w-[220px]" />
        </div>
        <nav aria-label="Main" className="flex h-[68px] items-center gap-0.5 bg-white px-5 2xl:px-7">
          {nav.map((item) =>
            "children" in item ? (
              <Dropdown key={item.label} label={item.label} items={item.children} pathname={pathname} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "relative px-3 py-2 text-[15px] text-navy transition-colors hover:text-navy-deep",
                  "after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-navy after:transition-transform after:duration-300 hover:after:scale-x-100",
                  isActive(pathname, item.href) && "after:scale-x-100",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="ml-auto pr-8 pt-[17px] 2xl:pr-10">{searchButton}</div>
      </div>

      {/* Mobile / tablet */}
      <div className="flex h-[72px] items-center justify-between border-b border-line bg-white px-4 sm:px-6 xl:hidden">
        <Logo src={logo} alt={logoAlt} priority className="h-[56px] w-[160px] mix-blend-multiply" />
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Open menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-navy hover:bg-mist"
        >
          <Menu strokeWidth={1.25} className="h-7 w-7" aria-hidden />
        </button>
      </div>

      <div className={cn("fixed inset-0 z-50 xl:hidden", open ? "pointer-events-auto" : "pointer-events-none invisible")} aria-hidden={!open}>
        <div
          className={cn("absolute inset-0 bg-navy-deep/40 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
          onClick={close}
        />
        <div
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-line px-5">
            <span className="eyebrow">Menu</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-navy hover:bg-mist"
            >
              <X strokeWidth={1.25} className="h-7 w-7" aria-hidden />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col px-5 py-3">
            {[{ href: "/", label: "Home" } as NavItem, ...nav].map((item) =>
              "children" in item ? (
                <div key={item.label} className="border-b border-line py-3">
                  <p className="eyebrow mb-1 text-muted">{item.label}</p>
                  {item.children.map((c) =>
                    c.external ? (
                      <a
                        key={c.href}
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 py-2 font-display text-[22px] leading-tight text-navy"
                      >
                        {c.label} <ExternalLink aria-hidden strokeWidth={1.5} className="h-4 w-4" />
                      </a>
                    ) : (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive(pathname, c.href) ? "page" : undefined}
                        className={cn("block py-2 font-display text-[22px] leading-tight text-navy", isActive(pathname, c.href) && "italic")}
                      >
                        {c.label}
                      </Link>
                    ),
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "border-b border-line py-3.5 font-display text-[26px] leading-none text-navy",
                    isActive(pathname, item.href) && "italic",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
          <div className="mt-auto p-5">
            {searchUrl ? (
              <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="btn-navy group w-full justify-center">
                Search Properties <ThinArrow className="btn-arrow" />
              </a>
            ) : (
              <Link href="/contact" onClick={() => setOpen(false)} className="btn-navy group w-full justify-center">
                Contact Nadeem <ThinArrow className="btn-arrow" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
