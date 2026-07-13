"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppMode, type AppMode } from "@/lib/app-mode";
import { createClient } from "@/lib/supabase/client";

interface TopNavProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
  hideMenu?: boolean;
}

const MODE_TABS: Array<{ id: AppMode; label: string }> = [
  { id: "compliance", label: "Compliance" },
  { id: "tenancy", label: "Tenancy" },
  { id: "assistant", label: "Assistant" },
];

function headerBgClass(mode: AppMode) {
  if (mode === "tenancy") return "bg-navy";
  if (mode === "assistant") return "bg-forest";
  return "bg-raspberry";
}

function activePillClass(mode: AppMode) {
  if (mode === "tenancy") return "bg-navy-dark text-dusty-cream shadow-sm ring-1 ring-gold/50";
  if (mode === "assistant") {
    return "bg-forest-dark text-dusty-cream shadow-sm ring-1 ring-gold/50";
  }
  return "bg-raspberry-dark text-dusty-cream shadow-sm ring-1 ring-gold/50";
}

export default function TopNav({
  sidebarOpen,
  onMenuClick,
  hideMenu = false,
}: TopNavProps) {
  const router = useRouter();
  const { mode, switchMode } = useAppMode();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const modeLabel =
    MODE_TABS.find((tab) => tab.id === mode)?.label ?? "Compliance";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 h-16 transition-colors duration-500 ease-out ${headerBgClass(mode)}`}
    >
      <div className="relative grid h-full grid-cols-[1fr_auto_1fr] items-center border-b border-gold px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3 sm:gap-4">
          {!hideMenu && (
            <button
              type="button"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              onClick={onMenuClick}
              className="touch-target shrink-0 text-dusty-cream transition hover:text-white"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" strokeWidth={1.25} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={1.25} />
              )}
            </button>
          )}

          <div
            className={`${hideMenu ? "flex" : "hidden sm:flex"} items-center rounded-full border border-gold/30 bg-black/10 p-0.5`}
            role="tablist"
            aria-label="Application mode"
          >
            {MODE_TABS.map((tab) => {
              const isActive = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => switchMode(tab.id)}
                  className={`rounded-full px-2 py-1 text-[9px] font-normal uppercase tracking-[0.12em] transition duration-300 sm:px-2.5 sm:text-[10px] sm:tracking-[0.14em] ${
                    isActive
                      ? activePillClass(tab.id)
                      : "text-dusty-cream/75 hover:text-dusty-cream"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {!hideMenu && (
            <span className="text-[10px] font-normal uppercase tracking-[0.2em] text-gold sm:hidden">
              {modeLabel}
            </span>
          )}
        </div>

        <p className="font-serif text-sm uppercase tracking-[0.28em] text-gold sm:text-base sm:tracking-[0.32em]">
          Fretwell <span className="italic">&amp;</span> Co
        </p>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSignOut}
            className="touch-target shrink-0 text-[11px] font-normal uppercase tracking-[0.18em] text-dusty-cream transition hover:text-gold sm:text-xs sm:tracking-[0.22em]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
