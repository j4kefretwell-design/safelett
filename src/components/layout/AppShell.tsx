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
    <div className="min-h-screen bg-off-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-charcoal/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-off-white/95 px-4 py-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className={btnSecondaryClassName}
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <span className="font-serif text-lg font-medium text-burgundy">
            {BRAND_NAME}
          </span>
          <div className="w-14" />
        </header>

        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-12 lg:py-14">
          {children}
        </main>
      </div>
    </div>
  );
}
