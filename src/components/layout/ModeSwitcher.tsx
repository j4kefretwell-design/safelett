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
            className={`relative pb-1.5 text-[12px] font-normal uppercase tracking-[0.16em] transition ${
              isActive
                ? "text-dusty-cream"
                : "text-dusty-cream/55 hover:text-dusty-cream/85"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="inline items-center sm:hidden">
              <span
                className={`mr-1.5 inline-block h-1.5 w-1.5 align-middle ring-1 ring-dusty-cream/40 ${tab.markClass} ${
                  isActive ? "opacity-100" : "opacity-50"
                }`}
                aria-hidden
              />
              {tab.short}
            </span>
            {isActive && (
              <>
                {/* Cream hairline for contrast on matching dark headers */}
                <span
                  className="absolute inset-x-0 bottom-0 hidden h-[2px] bg-dusty-cream/35 sm:block"
                  aria-hidden
                />
                <span
                  className={`absolute inset-x-0 bottom-0 hidden h-[2px] sm:block ${tab.markClass}`}
                  aria-hidden
                />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
