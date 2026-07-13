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
  const isAssistant = mode === "assistant";

  const pageBg = isAssistant
    ? "bg-ink-green"
    : mode === "tenancy"
      ? "bg-tenancy-bg pt-16"
      : "bg-dusty-cream pt-16";

  return (
    <div
      className={`min-h-screen overflow-x-hidden transition-colors duration-500 ease-out ${pageBg}`}
    >
      <TopNav
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((open) => !open)}
        hideMenu={isAssistant}
      />
      {!isAssistant && (
        <AppSidebar open={sidebarOpen} onClose={closeSidebar} />
      )}
      <main
        className={`app-mode-fade w-full min-w-0 overflow-x-hidden ${
          isAssistant ? "pt-16" : ""
        } ${
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
