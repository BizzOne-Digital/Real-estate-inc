"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThinArrow } from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/collections" && pathname.startsWith("/products"));
}

export function Header({ logo, logoAlt }: { logo: string; logoAlt: string }) {
  const pathname = usePathname();
  // On the homepage the desktop header floats over the split hero, as in the reference design.
  const overlay = pathname === "/";
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
  }, []);


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

  return (
    <header className={cn("z-30 w-full", overlay ? "lg:absolute lg:inset-x-0 lg:top-0" : "relative bg-mist")}>
      {/* Desktop */}
      <div className="hidden lg:flex lg:items-start">
        <div className="flex h-[92px] w-[32%] shrink-0 items-center justify-center bg-white">
          <Logo src={logo} alt={logoAlt} priority className="h-[76px] w-[220px] mix-blend-multiply xl:w-[236px]" />
        </div>
        <nav aria-label="Main" className="flex h-[68px] items-center gap-2 bg-white px-6 xl:px-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
              className={cn(
                "relative px-3 py-2 text-[15px] text-navy transition-colors hover:text-navy-deep",
                "after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-navy after:transition-transform after:duration-300 hover:after:scale-x-100",
                isActive(pathname, l.href) && "after:scale-x-100",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto pr-10 pt-[17px]">
          <Link href="/collections" className="btn-navy group py-2.5 text-[15px] shadow-sm">
            Explore Collection <ThinArrow className="btn-arrow" />
          </Link>
        </div>
      </div>

      {/* Mobile / tablet */}
      <div className="flex h-[72px] items-center justify-between border-b border-line bg-white px-4 sm:px-6 lg:hidden">
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

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none invisible",
        )}
        aria-hidden={!open}
      >
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
            "absolute inset-y-0 right-0 flex w-[min(86vw,360px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
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
          <nav aria-label="Mobile" className="flex flex-col px-5 py-4">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(pathname, l.href) ? "page" : undefined}
                className={cn(
                  "border-b border-line py-4 font-display text-[28px] leading-none text-navy",
                  isActive(pathname, l.href) && "italic",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/gallery"
              onClick={() => setOpen(false)}
              className="border-b border-line py-4 font-display text-[28px] leading-none text-navy"
            >
              Inspiration
            </Link>
          </nav>
          <div className="mt-auto p-5">
            <Link href="/collections" onClick={() => setOpen(false)} className="btn-navy group w-full justify-center">
              Explore Collection <ThinArrow className="btn-arrow" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
