"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppMode } from "@/lib/app-mode";
import { createClient } from "@/lib/supabase/client";

interface TopNavProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
}

export default function TopNav({ sidebarOpen, onMenuClick }: TopNavProps) {
  const router = useRouter();
  const { mode, switchMode } = useAppMode();
  const isTenancy = mode === "tenancy";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 h-16 transition-colors duration-500 ease-out ${
        isTenancy ? "bg-navy" : "bg-raspberry"
      }`}
    >
      <div className="relative flex h-full items-center border-b border-gold px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          onClick={onMenuClick}
          className="touch-target relative z-10 shrink-0 text-dusty-cream transition hover:text-white"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" strokeWidth={1.25} />
          ) : (
            <Menu className="h-6 w-6" strokeWidth={1.25} />
          )}
        </button>

        <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center gap-2 sm:gap-3">
          <span className="hidden text-[9px] font-normal uppercase tracking-[0.2em] text-gold sm:inline sm:text-[10px]">
            {isTenancy ? "Tenancy" : "Compliance"}
          </span>
          <p className="font-serif text-sm uppercase tracking-[0.28em] text-gold sm:text-base sm:tracking-[0.32em]">
            Fretwell <span className="italic">&amp;</span> Co
          </p>
        </div>

        <div className="relative z-10 ml-auto flex items-center gap-2 sm:gap-4">
          <div
            className="flex items-center rounded-full border border-gold/30 bg-black/10 p-0.5"
            role="tablist"
            aria-label="Application mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!isTenancy}
              onClick={() => switchMode("compliance")}
              className={`rounded-full px-3 py-1.5 text-[10px] font-normal uppercase tracking-[0.14em] transition duration-300 sm:px-4 sm:text-[11px] ${
                !isTenancy
                  ? "bg-raspberry-dark text-dusty-cream shadow-sm ring-1 ring-gold/50"
                  : "border border-dusty-cream/30 text-dusty-cream/80 hover:text-dusty-cream"
              }`}
            >
              Compliance
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isTenancy}
              onClick={() => switchMode("tenancy")}
              className={`rounded-full px-3 py-1.5 text-[10px] font-normal uppercase tracking-[0.14em] transition duration-300 sm:px-4 sm:text-[11px] ${
                isTenancy
                  ? "bg-navy-dark text-dusty-cream shadow-sm ring-1 ring-gold/50"
                  : "border border-dusty-cream/30 text-dusty-cream/80 hover:text-dusty-cream"
              }`}
            >
              Tenancy
            </button>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="touch-target shrink-0 px-2 text-xs font-normal uppercase tracking-[0.18em] text-dusty-cream transition hover:text-gold sm:text-sm sm:tracking-[0.22em]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
