"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAppMode, type AppMode } from "@/lib/app-mode";
import { MODE_HOME, MODE_PREFETCH_PATHS } from "@/lib/app-mode-routes";

const MODE_TABS: Array<{
  id: AppMode;
  label: string;
  underlineClass: string;
}> = [
  {
    id: "overview",
    label: "Overview",
    underlineClass: "bg-gold",
  },
  {
    id: "assistant",
    label: "Assistant",
    underlineClass: "bg-study",
  },
  {
    id: "compliance",
    label: "Compliance",
    underlineClass: "bg-raspberry",
  },
  {
    id: "tenancy",
    label: "Tenancy",
    underlineClass: "bg-navy",
  },
];

export default function ModeSwitcher() {
  const router = useRouter();
  const { mode, setMode } = useAppMode();
  const isOverview = mode === "overview";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const activeTab = MODE_TABS.find((tab) => tab.id === mode) ?? MODE_TABS[0];

  useEffect(() => {
    for (const path of MODE_PREFETCH_PATHS) {
      router.prefetch(path);
    }
  }, [router]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
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

  return (
    <div ref={rootRef} className="relative min-w-0">
      {/* Mobile: active mode + chevron dropdown */}
      <div className="md:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label="Switch application mode"
          onClick={() => setOpen((value) => !value)}
          className={`touch-target flex min-h-11 max-w-[9.5rem] items-center gap-1.5 text-[11px] font-normal uppercase tracking-[0.14em] ${
            isOverview ? "text-umber" : "text-dusty-cream"
          }`}
        >
          <span className="truncate">{activeTab.label}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>

        {open ? (
          <div
            role="listbox"
            aria-label="Application modes"
            className={`absolute left-0 top-full z-50 mt-2 min-w-[11rem] border py-1 shadow-[0_12px_32px_rgba(0,0,0,0.18)] ${
              isOverview
                ? "border-sand bg-greige"
                : mode === "assistant"
                  ? "border-moss bg-study"
                  : mode === "tenancy"
                    ? "border-gold/40 bg-navy"
                    : "border-gold/40 bg-raspberry"
            }`}
          >
            {MODE_TABS.map((tab) => {
              const isActive = mode === tab.id;
              const href = MODE_HOME[tab.id];
              return (
                <Link
                  key={tab.id}
                  href={href}
                  prefetch
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setMode(tab.id);
                    setOpen(false);
                  }}
                  className={`flex min-h-11 items-center px-4 text-[11px] font-normal uppercase tracking-[0.14em] transition ${
                    isOverview
                      ? isActive
                        ? "bg-umber/10 text-umber"
                        : "text-umber/70 hover:bg-umber/5 hover:text-umber"
                      : isActive
                        ? "bg-white/10 text-dusty-cream"
                        : "text-dusty-cream/70 hover:bg-white/5 hover:text-dusty-cream"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Desktop: full tab row */}
      <div
        className="hidden items-center gap-4 md:flex"
        role="tablist"
        aria-label="Application mode"
      >
        {MODE_TABS.map((tab) => {
          const isActive = mode === tab.id;
          const href = MODE_HOME[tab.id];

          return (
            <Link
              key={tab.id}
              href={href}
              prefetch
              role="tab"
              aria-selected={isActive}
              onMouseEnter={() => router.prefetch(href)}
              onFocus={() => router.prefetch(href)}
              onClick={() => setMode(tab.id)}
              className={`relative pb-1.5 text-[12px] font-normal uppercase tracking-[0.16em] transition-opacity duration-200 ease-out ${
                isOverview
                  ? isActive
                    ? "text-umber"
                    : "text-umber/50 hover:text-umber/80"
                  : isActive
                    ? "text-dusty-cream"
                    : "text-dusty-cream/55 hover:text-dusty-cream/85"
              }`}
            >
              {tab.label}
              {isActive ? (
                <span
                  className={`absolute inset-x-0 bottom-0 h-[2px] ${tab.underlineClass}`}
                  aria-hidden
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
