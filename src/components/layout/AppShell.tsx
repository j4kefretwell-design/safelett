"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { BRAND_NAME } from "@/lib/brand";
import { btnSecondaryClassName } from "@/lib/ui";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ivory">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-burgundy/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gold-light bg-ivory/95 px-4 py-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className={btnSecondaryClassName}
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <span className="font-serif text-lg font-medium text-gold">
            {BRAND_NAME}
          </span>
          <div className="w-14" />
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
          {children}
        </main>
      </div>
    </div>
  );
}
