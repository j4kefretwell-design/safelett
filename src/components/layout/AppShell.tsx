import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <div className="pl-64">
        <main className="mx-auto max-w-6xl px-8 py-10">{children}</main>
      </div>
    </div>
  );
}
