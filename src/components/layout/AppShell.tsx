"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { AppModeProvider, useAppMode } from "@/lib/app-mode";
import AppSidebar from "./AppSidebar";
import TopNav from "./TopNav";
import TrialBanner from "./TrialBanner";

const TRIAL_BANNER_DISMISSED_KEY = "safelett-trial-banner-dismissed";

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
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(44);
  const bannerRef = useRef<HTMLDivElement>(null);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const { mode } = useAppMode();
  const isAssistant = mode === "assistant";
  const isOverview = mode === "overview";
  const hideMenu = isAssistant || isOverview;

  useEffect(() => {
    try {
      if (sessionStorage.getItem(TRIAL_BANNER_DISMISSED_KEY) === "1") {
        setBannerDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const dismissBanner = useCallback(() => {
    try {
      sessionStorage.setItem(TRIAL_BANNER_DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
    setBannerDismissed(true);
  }, []);

  const showBanner =
    showTrialBanner &&
    trialDaysRemaining != null &&
    trialDaysRemaining > 0 &&
    !bannerDismissed;

  useEffect(() => {
    if (!showBanner || !bannerRef.current) return;

    const banner = bannerRef.current;
    const updateHeight = () =>
      setBannerHeight(Math.ceil(banner.getBoundingClientRect().height));
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(banner);
    return () => observer.disconnect();
  }, [showBanner]);

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
          "--app-top-offset": showBanner
            ? `${64 + bannerHeight}px`
            : "4rem",
        } as React.CSSProperties
      }
    >
      {/* Fixed top chrome — overlays page content; no layout gap below */}
      <div className="fixed inset-x-0 top-0 z-50">
        {showBanner && trialDaysRemaining != null ? (
          <div ref={bannerRef}>
            <TrialBanner
              daysRemaining={trialDaysRemaining}
              onDismiss={dismissBanner}
            />
          </div>
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
