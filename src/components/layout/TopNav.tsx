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

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 h-16 transition-colors duration-500 ease-out ${headerBgClass(mode)}`}
    >
      <div
        className={`relative grid h-full grid-cols-[1fr_auto_1fr] items-center border-b px-4 sm:px-6 lg:px-10 ${
          isAssistant ? "border-moss" : "border-gold"
        }`}
      >
        <div className="flex items-center">
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
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAssistant ? (
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-dusty-cream sm:text-base sm:tracking-[0.32em]">
              Fretwell <span className="italic text-moss">&amp;</span> Co
            </p>
          ) : (
            <p className="font-serif text-sm uppercase tracking-[0.28em] text-gold sm:text-base sm:tracking-[0.32em]">
              Fretwell <span className="italic">&amp;</span> Co
            </p>
          )}
          <ModeSwitcher />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSignOut}
            className={`touch-target shrink-0 text-[11px] font-normal uppercase tracking-[0.18em] text-dusty-cream transition sm:text-xs sm:tracking-[0.22em] ${
              isAssistant ? "hover:text-moss" : "hover:text-gold"
            }`}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
