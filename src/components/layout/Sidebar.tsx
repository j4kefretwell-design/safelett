"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reminders", label: "Reminders" },
  { href: "/properties/new", label: "Add Property" },
  { href: "/settings", label: "Settings" },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      (pathname.startsWith("/properties/") && pathname !== "/properties/new")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-forest-950 text-ivory">
      <div className="border-b border-gold/20 px-6 py-7">
        <Link href="/dashboard" className="group block">
          <span className="font-serif text-2xl font-semibold tracking-tight text-ivory">
            Safe<span className="text-gold-light">Lett</span>
          </span>
          <span className="mt-1 block text-[11px] font-medium uppercase tracking-[0.2em] text-gold-light/70">
            Compliance Platform
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-gold/15 text-gold-light"
                  : "text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gold/20 px-4 py-5">
        <SignOutButton />
      </div>
    </aside>
  );
}
