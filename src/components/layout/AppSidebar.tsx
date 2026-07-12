"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMonogram from "@/components/BrandMonogram";
import { useAppMode } from "@/lib/app-mode";
import { createClient } from "@/lib/supabase/client";

const complianceNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reminders", label: "Reminders" },
  { href: "/properties/new", label: "Add Property" },
  { href: "/contractors", label: "Contractors" },
  { href: "/news", label: "News" },
  { href: "/properties/import", label: "Bulk Import" },
  { href: "/settings", label: "Settings" },
  { href: "/help", label: "Help" },
] as const;

const tenancyNavItems = [
  { href: "/tenancy/dashboard", label: "Dashboard" },
  { href: "/reminders", label: "Reminders" },
  { href: "/tenancy/new", label: "Add Tenancy" },
  { href: "/settings", label: "Settings" },
  { href: "/help", label: "Help" },
] as const;

function isComplianceNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      (pathname.startsWith("/properties/") &&
        pathname !== "/properties/new" &&
        pathname !== "/properties/import")
    );
  }

  if (href === "/news") {
    return pathname === "/news" || pathname.startsWith("/news/");
  }

  if (href === "/contractors") {
    return pathname === "/contractors" || pathname.startsWith("/contractors/");
  }

  if (href === "/help") {
    return pathname === "/help" || pathname.startsWith("/help/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isTenancyNavActive(pathname: string, href: string): boolean {
  if (href === "/tenancy/dashboard") {
    return (
      pathname === "/tenancy/dashboard" ||
      (pathname.startsWith("/tenancy/") &&
        pathname !== "/tenancy/new" &&
        !pathname.match(/^\/tenancy\/[^/]+\/edit$/))
    );
  }

  if (href === "/tenancy/new") {
    return pathname === "/tenancy/new";
  }

  if (href === "/help") {
    return pathname === "/help" || pathname.startsWith("/help/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode } = useAppMode();
  const [email, setEmail] = useState<string | null>(null);

  const navItems = mode === "tenancy" ? tenancyNavItems : complianceNavItems;
  const isTenancy = mode === "tenancy";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close when route changes only
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-[#1A0A0C]/60 transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] max-w-full flex-col transition-all duration-500 ease-out ${
          isTenancy ? "bg-navy" : "bg-raspberry"
        } ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex justify-center px-6 pt-10 pb-8">
          <BrandMonogram
            href={isTenancy ? "/tenancy/dashboard" : "/dashboard"}
            onClick={onClose}
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Main navigation">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = isTenancy
                ? isTenancyNavActive(pathname, item.href)
                : isComplianceNavActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`block min-h-11 border-l-2 py-3 pl-5 pr-3 text-sm font-normal uppercase tracking-[0.14em] leading-relaxed transition-colors duration-200 ${
                      isActive
                        ? "border-gold text-dusty-cream"
                        : "border-transparent text-dusty-cream/85 hover:border-gold/40 hover:text-dusty-cream"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 px-6 py-8">
          {email && (
            <p className="truncate text-xs font-light leading-relaxed tracking-wide text-dusty-cream/80">
              {email}
            </p>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className={`${email ? "mt-4" : ""} min-h-11 text-sm font-normal uppercase tracking-[0.1em] text-dusty-cream/90 underline-offset-4 transition hover:text-dusty-cream hover:underline`}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
