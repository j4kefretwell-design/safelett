"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandMonogram from "@/components/BrandMonogram";
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
      className={`sidebar-editorial fixed inset-y-0 left-0 z-50 flex w-[15.5rem] flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="relative z-10 flex justify-center px-6 pt-12 pb-10">
        <BrandMonogram onClick={onClose} />
      </div>

      <div className="relative z-10 mx-8 h-px bg-gold/40" aria-hidden="true" />

      <nav className="relative z-10 flex-1 overflow-y-auto px-4 py-10">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = isNavActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 border-l-2 py-3.5 pl-5 pr-3 text-[11px] font-light uppercase tracking-[0.16em] transition-all duration-200 ${
                    isActive
                      ? "border-gold bg-[#ffffff08] text-dusty-cream"
                      : "border-transparent text-dusty-cream/40 hover:border-gold/30 hover:text-dusty-cream/70"
                  }`}
                >
                  <Icon
                    className={`h-3 w-3 shrink-0 ${isActive ? "text-gold/70" : "text-dusty-cream/25"}`}
                    strokeWidth={1.25}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative z-10 mx-8 h-px bg-gold/40" aria-hidden="true" />

      <div className="relative z-10 mt-auto">
        <SidebarUser />
      </div>
    </aside>
  );
}
