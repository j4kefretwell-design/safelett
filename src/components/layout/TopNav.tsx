"use client";

import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppMode, type AppMode } from "@/lib/app-mode";
import { createClient } from "@/lib/supabase/client";
import ModeSwitcher from "./ModeSwitcher";

interface TopNavProps {
  sidebarOpen: boolean;
  onMenuClick: () => void;
  hideMenu?: boolean;
}

function headerBgClass(mode: AppMode) {
  if (mode === "overview") return "bg-greige";
  if (mode === "tenancy") return "bg-navy";
  if (mode === "assistant") return "bg-study";
  return "bg-raspberry";
}

export default function TopNav({
  sidebarOpen,
  onMenuClick,
  hideMenu = false,
}: TopNavProps) {
  const router = useRouter();
  const { mode } = useAppMode();
  const isAssistant = mode === "assistant";
  const isOverview = mode === "overview";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 h-16 transition-colors duration-300 ease-out ${headerBgClass(mode)}`}
    >
      <div
        className={`relative grid h-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b px-4 sm:px-6 lg:px-12 ${
          isOverview
            ? "border-sand"
            : isAssistant
              ? "border-moss"
              : "border-gold"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          {!hideMenu && (
            <button
              type="button"
              aria-label={sidebarOpen ? "Close menu" : "Open menu"}
              onClick={onMenuClick}
              className={`touch-target flex h-11 w-11 shrink-0 items-center justify-center transition ${
                isOverview
                  ? "text-umber hover:text-umber/70"
                  : "text-dusty-cream hover:text-white"
              }`}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" strokeWidth={1.25} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={1.25} />
              )}
            </button>
          )}
          <ModeSwitcher />
        </div>

        <div className="flex items-center justify-center px-2">
          {isOverview ? (
            <p className="whitespace-nowrap font-serif text-base uppercase tracking-[0.28em] text-umber sm:text-lg sm:tracking-[0.32em]">
              Fretwell <span className="italic text-gold">&amp;</span> Co
            </p>
          ) : isAssistant ? (
            <p className="whitespace-nowrap font-serif text-base uppercase tracking-[0.28em] text-dusty-cream sm:text-lg sm:tracking-[0.32em]">
              Fretwell <span className="italic text-moss">&amp;</span> Co
            </p>
          ) : (
            <p className="whitespace-nowrap font-serif text-base uppercase tracking-[0.28em] text-gold sm:text-lg sm:tracking-[0.32em]">
              Fretwell <span className="italic">&amp;</span> Co
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleSignOut}
            className={`touch-target flex h-11 items-center text-[11px] font-normal uppercase tracking-[0.18em] transition sm:text-xs sm:tracking-[0.22em] ${
              isOverview
                ? "text-umber hover:text-gold"
                : isAssistant
                  ? "text-dusty-cream hover:text-moss"
                  : "text-dusty-cream hover:text-gold"
            }`}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
