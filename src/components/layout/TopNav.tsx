"use client";

import { Menu, X } from "lucide-react";

interface TopNavProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function TopNav({ sidebarOpen, onMenuClick }: TopNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 border-b border-white/5 bg-raspberry">
      <div className="flex h-full items-center gap-5 px-6 lg:px-10">
        <button
          type="button"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          onClick={onMenuClick}
          className="shrink-0 text-dusty-cream transition hover:text-white"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" strokeWidth={1.25} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.25} />
          )}
        </button>

        <p className="font-serif text-sm uppercase tracking-[0.32em] text-dusty-cream sm:text-base">
          Fretwell &amp; Co
        </p>
      </div>
    </header>
  );
}
