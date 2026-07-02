"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandWordmark from "@/components/BrandWordmark";
import SidebarUser from "@/components/layout/SidebarUser";
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
      className={`sidebar-editorial fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="relative z-10 px-8 pt-14 pb-8">
        <BrandWordmark onClick={onClose} variant="sidebar" />
      </div>

      <div className="relative z-10 mx-6 h-px bg-gold/35" aria-hidden="true" />

      <nav className="relative z-10 flex-1 space-y-0.5 overflow-y-auto px-3 py-8">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group relative flex items-center gap-4 border-l-[3px] py-4 pl-7 pr-5 text-sm font-light tracking-[0.14em] transition-all duration-200 ${
                isActive
                  ? "border-gold bg-[#ffffff08] text-dusty-cream"
                  : "border-transparent text-dusty-cream/45 hover:bg-[#ffffff05] hover:text-dusty-cream/75"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-dusty-cream/65" : "text-dusty-cream/30"}`}
                strokeWidth={1.25}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 mx-6 h-px bg-gold/35" aria-hidden="true" />

      <div className="relative z-10 mt-auto">
        <SidebarUser />
      </div>
    </aside>
  );
}
