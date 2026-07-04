"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reminders", label: "Reminders" },
  { href: "/dashboard", label: "Properties" },
  { href: "/settings", label: "Settings" },
] as const;

function isNavActive(pathname: string, href: string, label: string): boolean {
  if (label === "Properties") {
    return (
      pathname.startsWith("/properties/") &&
      pathname !== "/properties/new" &&
      pathname !== "/properties/import"
    );
  }

  if (label === "Dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavBrand({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/dashboard"
      onClick={onClick}
      className="flex shrink-0 items-center gap-3"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/60">
        <span className="font-serif text-[11px] leading-none text-dusty-cream">
          F<span className="italic text-gold">&amp;</span>Co
        </span>
      </div>
      <span className="hidden font-serif text-[10px] uppercase tracking-[0.32em] text-dusty-cream sm:block">
        Fretwell &amp; Co
      </span>
    </Link>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-white/5 bg-raspberry">
        <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-between px-6 lg:px-10">
          <NavBrand />

          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-10 lg:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const isActive = isNavActive(pathname, item.href, item.label);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative pb-0.5 text-[10px] font-normal uppercase tracking-[0.22em] text-dusty-cream transition hover:text-white ${
                    isActive
                      ? "after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:bg-gold"
                      : "text-dusty-cream/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            {email && (
              <span className="max-w-[180px] truncate text-[10px] font-light tracking-wide text-dusty-cream/60">
                {email}
              </span>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="border border-dusty-cream/35 px-4 py-1.5 text-[10px] font-normal uppercase tracking-[0.14em] text-dusty-cream transition hover:border-dusty-cream/60 hover:text-white"
            >
              Sign Out
            </button>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="text-dusty-cream lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={1.25} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.25} />
            )}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-raspberry lg:hidden">
          <div className="flex h-full flex-col px-8 pt-24">
            <nav className="flex flex-col gap-8">
              {navItems.map((item) => {
                const isActive = isNavActive(pathname, item.href, item.label);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-normal uppercase tracking-[0.22em] ${
                      isActive ? "text-dusty-cream" : "text-dusty-cream/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/10 pb-12 pt-8">
              {email && (
                <p className="mb-4 truncate text-xs font-light text-dusty-cream/50">
                  {email}
                </p>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="border border-dusty-cream/35 px-6 py-2.5 text-[10px] font-normal uppercase tracking-[0.14em] text-dusty-cream"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
