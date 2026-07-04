"use client";

import { Menu, X } from "lucide-react";

interface TopNavProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function TopNav({ sidebarOpen, onMenuClick }: TopNavProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 h-16 bg-raspberry">
      <div className="relative flex h-full items-center border-b border-gold px-6 lg:px-10">
        <button
          type="button"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          onClick={onMenuClick}
          className="relative z-10 shrink-0 text-dusty-cream transition hover:text-white"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" strokeWidth={1.25} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.25} />
          )}
        </button>

        <p className="pointer-events-none absolute inset-x-0 text-center font-serif text-sm uppercase tracking-[0.32em] text-dusty-cream sm:text-base">
          Fretwell <span className="text-gold">&amp;</span> Co
        </p>

        <div className="ml-auto w-5 shrink-0 lg:w-5" aria-hidden="true" />
      </div>
    </header>
  );
}
