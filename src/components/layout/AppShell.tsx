"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import BrandWordmark from "@/components/BrandWordmark";
import { btnSecondaryClassName } from "@/lib/ui";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dusty-cream">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-raspberry/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-cocoa/15 bg-dusty-cream/95 px-4 py-4 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            className={btnSecondaryClassName}
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </button>
          <BrandWordmark href="/dashboard" variant="light" />
          <div className="w-14" />
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
          {children}
        </main>
      </div>
    </div>
  );
}
