"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMonogram from "@/components/BrandMonogram";
import { useAppMode, type AppMode } from "@/lib/app-mode";
import { createClient } from "@/lib/supabase/client";

const complianceNavItems = [
  { href: "/compliance", label: "Dashboard" },
  { href: "/reminders", label: "Reminders" },
  { href: "/properties/new", label: "Add Property" },
  { href: "/contractors", label: "Contractors" },
  { href: "/news", label: "News" },
  { href: "/properties/import", label: "Bulk Import" },
] as const;

const tenancyNavItems = [
  { href: "/tenancy/dashboard", label: "Tenancy Dashboard" },
  { href: "/tenancy/new", label: "Add Tenancy" },
  { href: "/tenancy/tenants", label: "Tenants" },
  { href: "/reminders", label: "Reminders" },
  { href: "/tenancy/notices", label: "Notices" },
  { href: "/tenancy/import", label: "Bulk Import" },
] as const;

const assistantNavItems = [
  { href: "/assistant", label: "Property Management Assistant" },
] as const;

const utilityNavItems = [
  { href: "/settings", label: "Settings", kind: "link" as const },
  { href: "/help", label: "Help", kind: "link" as const },
  { href: "/subscription", label: "Subscription", kind: "subscription" as const },
  { href: null, label: "Sign Out", kind: "signout" as const },
] as const;

function isComplianceNavActive(pathname: string, href: string): boolean {
  if (href === "/compliance") {
    return (
      pathname === "/compliance" ||
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

  if (href === "/settings") {
    return pathname === "/settings" || pathname.startsWith("/settings/");
  }

  if (href === "/help") {
    return pathname === "/help" || pathname.startsWith("/help/");
  }

  if (href === "/subscription") {
    return pathname === "/subscription";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isTenancyNavActive(pathname: string, href: string): boolean {
  if (href === "/subscription") {
    return pathname === "/subscription";
  }

  if (href === "/settings") {
    return pathname === "/settings" || pathname.startsWith("/settings/");
  }

  if (href === "/help") {
    return pathname === "/help" || pathname.startsWith("/help/");
  }

  if (href === "/tenancy/notices") {
    return (
      pathname === "/tenancy/notices" || pathname.includes("/draft-notice")
    );
  }

  if (href === "/tenancy/tenants") {
    return (
      pathname === "/tenancy/tenants" || pathname.startsWith("/tenancy/tenants/")
    );
  }

  if (href === "/tenancy/dashboard") {
    return (
      pathname === "/tenancy/dashboard" ||
      (pathname.startsWith("/tenancy/") &&
        pathname !== "/tenancy/new" &&
        pathname !== "/tenancy/notices" &&
        pathname !== "/tenancy/import" &&
        !pathname.startsWith("/tenancy/tenants") &&
        !pathname.match(/^\/tenancy\/[^/]+\/edit$/))
    );
  }

  if (href === "/tenancy/new") {
    return pathname === "/tenancy/new";
  }

  if (href === "/tenancy/import") {
    return pathname === "/tenancy/import";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function isAssistantNavActive(pathname: string, href: string): boolean {
  if (href === "/subscription") {
    return pathname === "/subscription";
  }

  if (href === "/settings") {
    return pathname === "/settings" || pathname.startsWith("/settings/");
  }

  if (href === "/help") {
    return pathname === "/help" || pathname.startsWith("/help/");
  }

  if (href === "/assistant") {
    return pathname === "/assistant";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function sidebarBgClass(mode: AppMode) {
  if (mode === "tenancy") return "bg-navy";
  if (mode === "assistant") return "bg-study";
  return "bg-raspberry";
}

function modeHome(mode: AppMode) {
  if (mode === "tenancy") return "/tenancy/dashboard";
  if (mode === "assistant") return "/assistant";
  if (mode === "overview") return "/dashboard";
  return "/compliance";
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

  const navItems =
    mode === "tenancy"
      ? tenancyNavItems
      : mode === "assistant"
        ? assistantNavItems
        : complianceNavItems;

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

  function isNavActive(href: string) {
    if (mode === "tenancy") return isTenancyNavActive(pathname, href);
    if (mode === "assistant") return isAssistantNavActive(pathname, href);
    return isComplianceNavActive(pathname, href);
  }

  function utilityLinkClass(
    isActive: boolean,
    kind: "link" | "subscription" | "signout"
  ) {
    const base =
      "block min-h-11 border-l-2 py-3 pl-4 pr-2 text-[11px] font-normal uppercase tracking-[0.14em] leading-relaxed transition-colors duration-200";

    if (kind === "subscription") {
      return `${base} ${
        isActive
          ? "border-gold text-gold"
          : "border-transparent text-gold hover:border-gold/40 hover:text-gold-readable"
      }`;
    }

    return `${base} ${
      isActive
        ? "border-gold text-dusty-cream"
        : "border-transparent text-dusty-cream/80 hover:border-gold/40 hover:text-dusty-cream"
    }`;
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] max-w-full flex-col transition-all duration-500 ease-out ${sidebarBgClass(
          mode
        )} ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex justify-center px-6 pt-10 pb-8">
          <BrandMonogram href={modeHome(mode)} onClick={onClose} />
        </div>

        <nav
          className="flex-1 overflow-y-auto py-4 pb-10"
          aria-label="Main navigation"
        >
          <ul className="space-y-1 px-5">
            {navItems.map((item) => {
              const isActive = isNavActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    prefetch
                    onClick={onClose}
                    className={`block min-h-11 border-l-2 py-3 pl-4 pr-2 text-sm font-normal uppercase tracking-[0.14em] leading-relaxed transition-colors duration-200 ${
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

            {mode !== "assistant" && (
              <li>
                <Link
                  href="/assistant"
                  onClick={onClose}
                  className="mt-2 block min-h-11 border-l-2 border-transparent py-3 pl-4 pr-2 text-sm font-normal uppercase tracking-[0.14em] leading-relaxed text-[#9BB89B] transition-colors duration-200 hover:border-[#9BB89B]/50 hover:text-[#C5D6C5]"
                >
                  Assistant
                </Link>
              </li>
            )}

            {email && (
              <li className="mt-8 pt-6">
                <p className="truncate pl-4 text-xs font-light leading-relaxed tracking-wide text-dusty-cream/70">
                  {email}
                </p>
              </li>
            )}

            <li className={email ? "mt-2" : "mt-8 pt-6"} aria-hidden="true">
              <div className="h-px bg-white/10" />
            </li>

            {utilityNavItems.map((item) => {
              const isActive =
                item.href !== null && isNavActive(item.href);

              if (item.kind === "signout") {
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className={utilityLinkClass(false, "signout")}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={utilityLinkClass(isActive, item.kind)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
