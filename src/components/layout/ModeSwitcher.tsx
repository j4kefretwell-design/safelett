"use client";

import { useAppMode, type AppMode } from "@/lib/app-mode";

const MODE_TABS: Array<{
  id: AppMode;
  label: string;
  short: string;
  markClass: string;
}> = [
  {
    id: "compliance",
    label: "Compliance",
    short: "C",
    markClass: "bg-raspberry",
  },
  {
    id: "tenancy",
    label: "Tenancy",
    short: "T",
    markClass: "bg-navy",
  },
  {
    id: "assistant",
    label: "Assistant",
    short: "A",
    markClass: "bg-study",
  },
];

export default function ModeSwitcher() {
  const { mode, switchMode } = useAppMode();

  return (
    <div
      className="flex items-center gap-3 sm:gap-5"
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
            className={`relative flex items-center gap-1.5 pb-1.5 text-[12px] font-normal uppercase tracking-[0.16em] transition ${
              isActive
                ? "text-dusty-cream"
                : "text-dusty-cream/55 hover:text-dusty-cream/85"
            }`}
          >
            <span
              className={`hidden h-1.5 w-1.5 shrink-0 ring-1 ring-dusty-cream/50 sm:inline-block ${tab.markClass} ${
                isActive ? "opacity-100" : "opacity-40"
              }`}
              aria-hidden
            />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="inline sm:hidden">
              <span
                className={`mr-1.5 inline-block h-1.5 w-1.5 align-middle ring-1 ring-dusty-cream/50 ${tab.markClass} ${
                  isActive ? "opacity-100" : "opacity-40"
                }`}
                aria-hidden
              />
              {tab.short}
            </span>
            {isActive && (
              <span
                className={`absolute inset-x-0 bottom-0 h-[2px] ${tab.markClass} ring-1 ring-dusty-cream/40`}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
