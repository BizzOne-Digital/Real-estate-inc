"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, ExternalLink, FileText, LayoutDashboard, LogOut, Mail, Menu, Newspaper, Settings, X } from "lucide-react";
import { logout } from "@/app/admin/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Mail },
  { href: "/admin/condos", label: "Condos", Icon: Building2 },
  { href: "/admin/insights", label: "Market Insights", Icon: Newspaper },
  { href: "/admin/pages", label: "Page Content", Icon: FileText },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export function AdminShell({
  children,
  adminEmail,
  newInquiries,
}: {
  children: React.ReactNode;
  adminEmail: string;
  newInquiries: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            isActive(href) ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white",
          )}
        >
          <Icon aria-hidden className="h-4 w-4" />
          <span className="flex-1">{label}</span>
          {href === "/admin/inquiries" && newInquiries > 0 && (
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-navy">{newInquiries}</span>
          )}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-white/75 hover:bg-white/10 hover:text-white">
          <ExternalLink aria-hidden className="h-4 w-4" /> View website
        </Link>
        <form action={logout}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut aria-hidden className="h-4 w-4" /> Sign out
          </button>
        </form>
        <p className="truncate px-3 pt-2 text-xs text-white/50" title={adminEmail}>
          {adminEmail}
        </p>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-navy-deep lg:flex">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="font-display text-2xl text-white">Website Admin</p>
          <p className="text-xs text-white/60">Discover Real Estate Inc.</p>
        </div>
        {nav}
      </aside>

      <div className="flex items-center justify-between bg-navy-deep px-4 py-3 lg:hidden">
        <p className="font-display text-xl text-white">Website Admin</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={open}
          className="rounded p-2 text-white hover:bg-white/10"
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-deep shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="font-display text-xl text-white">Website Admin</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="rounded p-2 text-white hover:bg-white/10" autoFocus>
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}

export function AdminPageTitle({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
