"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMonogram from "@/components/BrandMonogram";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reminders", label: "Reminders" },
  { href: "/news", label: "News" },
  { href: "/contractors", label: "Contractors" },
  { href: "/properties/new", label: "Add Property" },
  { href: "/properties/import", label: "Bulk Import" },
  { href: "/settings", label: "Settings" },
] as const;

function isNavActive(pathname: string, href: string): boolean {
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

  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100vw,18rem)] max-w-full flex-col bg-raspberry transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex justify-center px-6 pt-10 pb-8">
          <BrandMonogram href="/dashboard" onClick={onClose} />
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Main navigation">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = isNavActive(pathname, item.href);
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
          <Link
            href="/help"
            onClick={onClose}
            className={`mt-4 block min-h-11 text-sm font-normal uppercase tracking-[0.1em] transition ${
              pathname === "/help" || pathname.startsWith("/help/")
                ? "text-dusty-cream"
                : "text-dusty-cream/90 hover:text-dusty-cream"
            }`}
          >
            Help
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 min-h-11 text-sm font-normal uppercase tracking-[0.1em] text-dusty-cream/90 underline-offset-4 transition hover:text-dusty-cream hover:underline"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
