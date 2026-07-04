"use client";

import TopNav from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-dusty-cream pt-16">
      <TopNav />
      <main className="w-full">{children}</main>
    </div>
  );
}
