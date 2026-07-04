"use client";

import { useCallback, useState } from "react";
import AppSidebar from "./AppSidebar";
import TopNav from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-dusty-cream pt-16">
      <TopNav
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((open) => !open)}
      />
      <AppSidebar open={sidebarOpen} onClose={closeSidebar} />
      <main className="w-full">{children}</main>
    </div>
  );
}
