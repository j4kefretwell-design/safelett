"use client";

import { useCallback, useEffect, useState } from "react";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { AppModeProvider, useAppMode } from "@/lib/app-mode";
import AppSidebar from "./AppSidebar";
import TopNav from "./TopNav";
import TrialBanner from "./TrialBanner";

interface AppShellProps {
  children: React.ReactNode;
  trialDaysRemaining?: number | null;
  showTrialBanner?: boolean;
}

function AppShellInner({
  children,
  trialDaysRemaining = null,
  showTrialBanner = false,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(showTrialBanner);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const dismissBanner = useCallback(() => setBannerVisible(false), []);
  const { mode } = useAppMode();
  const isAssistant = mode === "assistant";
  const isOverview = mode === "overview";
  const hideMenu = isAssistant || isOverview;

  useEffect(() => {
    setBannerVisible(showTrialBanner);
  }, [showTrialBanner]);

  const showBanner =
    bannerVisible &&
    showTrialBanner &&
    trialDaysRemaining != null &&
    trialDaysRemaining > 0;

  const pageBg = isOverview
    ? "bg-greige"
    : isAssistant
      ? "bg-study"
      : mode === "tenancy"
        ? "bg-tenancy-bg"
        : "bg-dusty-cream";

  return (
    <div
      className={`app-mode-fade min-h-screen overflow-x-hidden transition-[background-color,opacity] duration-200 ease-out ${pageBg}`}
      style={
        {
          "--app-top-offset": showBanner ? "6.75rem" : "4rem",
        } as React.CSSProperties
      }
    >
      {/* Fixed top chrome — overlays page content; no layout gap below */}
      <div className="fixed inset-x-0 top-0 z-50">
        {showBanner ? (
          <TrialBanner
            daysRemaining={trialDaysRemaining}
            onDismiss={dismissBanner}
          />
        ) : null}
        <TopNav
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((open) => !open)}
          hideMenu={hideMenu}
        />
      </div>

      {!hideMenu && <AppSidebar open={sidebarOpen} onClose={closeSidebar} />}

      <main className="w-full min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}

export default function AppShell({
  children,
  trialDaysRemaining,
  showTrialBanner,
}: AppShellProps) {
  return (
    <AppModeProvider>
      <ToastProvider>
        <AppShellInner
          trialDaysRemaining={trialDaysRemaining}
          showTrialBanner={showTrialBanner}
        >
          {children}
        </AppShellInner>
      </ToastProvider>
    </AppModeProvider>
  );
}
