"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";
import BrandWordmark from "@/components/BrandWordmark";
import { NAV_ICONS } from "@/lib/icons";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: NAV_ICONS.dashboard },
  { href: "/reminders", label: "Reminders", icon: NAV_ICONS.reminders },
  { href: "/properties/new", label: "Add Property", icon: NAV_ICONS.addProperty },
  { href: "/properties/import", label: "Bulk Import", icon: NAV_ICONS.bulkImport },
  { href: "/settings", label: "Settings", icon: NAV_ICONS.settings },
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
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-raspberry transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-dusty-cream/10 px-7 py-10">
        <BrandWordmark onClick={onClose} />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-10">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group relative flex items-center gap-3 border-l py-3 pl-5 pr-4 text-sm font-light tracking-[0.06em] transition-all duration-200 ${
                isActive
                  ? "border-l border-gold bg-dusty-cream/[0.06] text-dusty-cream"
                  : "border-transparent text-dusty-cream/55 hover:border-dusty-cream/20 hover:bg-dusty-cream/[0.03] hover:text-dusty-cream/85"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-dusty-cream/10 px-3 py-8">
        <SignOutButton />
      </div>
    </aside>
  );
}
