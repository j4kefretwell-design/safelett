"use client";

import { useCallback, useState } from "react";
import { ToastProvider } from "@/components/toast/ToastProvider";
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
  const isOverview = mode === "overview";
  const hideMenu = isAssistant || isOverview;

  const pageBg = isOverview
    ? "bg-greige pt-16"
    : isAssistant
      ? "bg-study"
      : mode === "tenancy"
        ? "bg-tenancy-bg pt-16"
        : "bg-dusty-cream pt-16";

  return (
    <div
      className={`app-mode-fade min-h-screen overflow-x-hidden transition-colors duration-500 ease-out ${pageBg} ${
        isTransitioning ? "app-mode-fade--hidden" : "app-mode-fade--visible"
      }`}
    >
      <TopNav
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((open) => !open)}
        hideMenu={hideMenu}
      />
      {!hideMenu && <AppSidebar open={sidebarOpen} onClose={closeSidebar} />}
      <main
        className={`w-full min-w-0 overflow-x-hidden ${
          isAssistant ? "pt-16" : ""
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
      <ToastProvider>
        <AppShellInner>{children}</AppShellInner>
      </ToastProvider>
    </AppModeProvider>
  );
}
