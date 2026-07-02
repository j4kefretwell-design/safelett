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
      className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-raspberry transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-8 pt-12 pb-10">
        <BrandWordmark onClick={onClose} variant="sidebar" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`group relative flex items-center gap-3.5 border-l-[3px] py-3.5 pl-6 pr-4 text-sm font-light tracking-[0.1em] transition-all duration-200 ${
                isActive
                  ? "border-gold bg-[#ffffff08] text-dusty-cream"
                  : "border-transparent text-dusty-cream/50 hover:bg-[#ffffff05] hover:text-dusty-cream/80"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-dusty-cream/70" : "text-dusty-cream/35"}`}
                strokeWidth={1.25}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-dusty-cream/[0.08]">
        <SidebarUser />
      </div>
    </aside>
  );
}
