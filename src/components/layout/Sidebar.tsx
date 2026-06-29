"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import { BRAND_NAME } from "@/lib/brand";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reminders", label: "Reminders" },
  { href: "/properties/new", label: "Add Property" },
  { href: "/properties/import", label: "Bulk Import" },
  { href: "/settings", label: "Settings" },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      (pathname.startsWith("/properties/") &&
        pathname !== "/properties/new" &&
        pathname !== "/properties/import")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-burgundy transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-gold/15 px-8 py-12">
        <Link href="/dashboard" className="block" onClick={onClose}>
          <span className="font-serif text-[1.65rem] font-medium tracking-tight text-gold">
            {BRAND_NAME}
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-10">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group relative block border-l-2 py-3 pl-5 pr-4 text-sm tracking-[0.08em] transition-all duration-200 ${
                isActive
                  ? "border-gold bg-[rgba(255,255,255,0.06)] text-gold shadow-[inset_0_0_20px_rgba(92,26,46,0.15)]"
                  : "border-transparent text-cream/60 hover:border-gold/50 hover:bg-[rgba(255,255,255,0.03)] hover:pl-6 hover:text-cream"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gold/15 px-3 py-8">
        <SignOutButton />
      </div>
    </aside>
  );
}
