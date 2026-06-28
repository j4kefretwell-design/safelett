"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

const navItems = [
  { href: "/dashboard", label: "Dashboard", match: "dashboard" as const },
  { href: "/properties/new", label: "Add Property", match: "add" as const },
];

function isNavActive(
  pathname: string,
  match: "dashboard" | "add"
): boolean {
  if (match === "add") {
    return pathname === "/properties/new";
  }

  if (pathname === "/dashboard") {
    return true;
  }

  return (
    pathname.startsWith("/properties/") && pathname !== "/properties/new"
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-navy-950 text-white">
      <div className="border-b border-white/10 px-6 py-7">
        <Link href="/dashboard" className="group block">
          <span className="text-2xl font-bold tracking-tight">
            Safe<span className="text-emerald-400">Lett</span>
          </span>
          <span className="mt-1 block text-xs font-medium uppercase tracking-widest text-slate-400">
            Compliance Platform
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => {
          const isActive = isNavActive(pathname, item.match);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-5">
        <SignOutButton />
      </div>
    </aside>
  );
}
