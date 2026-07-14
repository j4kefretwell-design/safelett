"use client";

import { useAppMode, type AppMode } from "@/lib/app-mode";

const MODE_TABS: Array<{
  id: AppMode;
  label: string;
  short: string;
  underlineClass: string;
}> = [
  {
    id: "overview",
    label: "Overview",
    short: "O",
    underlineClass: "bg-gold",
  },
  {
    id: "compliance",
    label: "Compliance",
    short: "C",
    underlineClass: "bg-raspberry",
  },
  {
    id: "tenancy",
    label: "Tenancy",
    short: "T",
    underlineClass: "bg-navy",
  },
  {
    id: "assistant",
    label: "Assistant",
    short: "A",
    underlineClass: "bg-study",
  },
];

export default function ModeSwitcher() {
  const { mode, switchMode } = useAppMode();
  const isOverview = mode === "overview";

  return (
    <div
      className="flex items-center gap-2.5 sm:gap-4"
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
            className={`relative pb-1.5 text-[11px] font-normal uppercase tracking-[0.14em] transition sm:text-[12px] sm:tracking-[0.16em] ${
              isOverview
                ? isActive
                  ? "text-umber"
                  : "text-umber/50 hover:text-umber/80"
                : isActive
                  ? "text-dusty-cream"
                  : "text-dusty-cream/55 hover:text-dusty-cream/85"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="inline sm:hidden">{tab.short}</span>
            {isActive && (
              <span
                className={`absolute inset-x-0 bottom-0 h-[2px] ${tab.underlineClass}`}
                aria-hidden
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
