"use client";

import { Menu, X, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    setAccountOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const accountMenuClass = isOverview
    ? "border-sand bg-greige text-umber"
    : mode === "assistant"
      ? "border-moss bg-study text-dusty-cream"
      : mode === "tenancy"
        ? "border-gold/40 bg-navy text-dusty-cream"
        : "border-gold/40 bg-raspberry text-dusty-cream";

  return (
    <header
      className={`sticky top-0 z-50 h-16 w-full shrink-0 transition-colors duration-200 ease-out ${headerBgClass(mode)}`}
    >
      <div
        className="relative grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center border-b border-gold px-3 sm:px-6 lg:px-12"
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center">
            {!hideMenu ? (
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
            ) : null}
          </div>
          <ModeSwitcher />
        </div>

        <div className="flex min-w-0 items-center justify-center px-1">
          {isOverview ? (
            <p className="whitespace-nowrap font-serif text-[0.8125rem] uppercase tracking-[0.16em] text-umber sm:text-base sm:tracking-[0.28em] md:text-lg md:tracking-[0.32em]">
              Fretwell <span className="italic text-gold">&amp;</span> Co
            </p>
          ) : isAssistant ? (
            <p className="whitespace-nowrap font-serif text-[0.8125rem] uppercase tracking-[0.16em] text-dusty-cream sm:text-base sm:tracking-[0.28em] md:text-lg md:tracking-[0.32em]">
              Fretwell <span className="italic text-moss">&amp;</span> Co
            </p>
          ) : (
            <p className="whitespace-nowrap font-serif text-[0.8125rem] uppercase tracking-[0.16em] text-gold sm:text-base sm:tracking-[0.28em] md:text-lg md:tracking-[0.32em]">
              Fretwell <span className="italic">&amp;</span> Co
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          {/* Desktop links */}
          <div className="hidden items-center gap-4 md:flex md:gap-5">
            <Link
              href="/subscription"
              prefetch
              className="touch-target flex h-11 items-center text-xs font-normal uppercase tracking-[0.22em] text-[#C4A35A] transition hover:opacity-80"
            >
              Subscription
            </Link>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className={`touch-target flex h-11 items-center text-xs font-normal uppercase tracking-[0.22em] transition ${
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

          {/* Mobile account menu */}
          <div ref={accountRef} className="relative md:hidden">
            <button
              type="button"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              onClick={() => setAccountOpen((value) => !value)}
              className={`touch-target flex h-11 w-11 items-center justify-center transition ${
                isOverview
                  ? "text-umber hover:text-umber/70"
                  : "text-dusty-cream hover:text-white"
              }`}
            >
              <MoreVertical className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {accountOpen ? (
              <div
                role="menu"
                className={`absolute right-0 top-full z-50 mt-2 min-w-[12rem] border py-1 shadow-[0_12px_32px_rgba(0,0,0,0.18)] ${accountMenuClass}`}
              >
                <Link
                  href="/subscription"
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                  className="flex min-h-11 items-center px-4 text-[11px] font-normal uppercase tracking-[0.16em] text-[#C4A35A] transition hover:bg-white/5"
                >
                  Subscription
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void handleSignOut()}
                  className={`flex min-h-11 w-full items-center px-4 text-left text-[11px] font-normal uppercase tracking-[0.16em] transition hover:bg-white/5 ${
                    isOverview ? "text-umber" : "text-dusty-cream"
                  }`}
                >
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
