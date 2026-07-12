"use client";

import { useCallback, useState } from "react";
import { AppModeProvider, useAppMode } from "@/lib/app-mode";
import AppSidebar from "./AppSidebar";
import TopNav from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellInner({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const { mode, isTransitioning } = useAppMode();

  return (
    <div
      className={`min-h-screen overflow-x-hidden pt-16 transition-colors duration-500 ease-out ${
        mode === "tenancy" ? "bg-tenancy-bg" : "bg-dusty-cream"
      }`}
    >
      <TopNav
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((open) => !open)}
      />
      <AppSidebar open={sidebarOpen} onClose={closeSidebar} />
      <main
        className={`app-mode-fade w-full min-w-0 overflow-x-hidden ${
          isTransitioning ? "app-mode-fade--hidden" : "app-mode-fade--visible"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <AppModeProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppModeProvider>
  );
}
