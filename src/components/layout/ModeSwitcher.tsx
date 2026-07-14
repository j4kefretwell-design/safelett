"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useAppMode, type AppMode } from "@/lib/app-mode";

const MODE_OPTIONS: Array<{
  id: AppMode;
  label: string;
  dotClass: string;
}> = [
  { id: "compliance", label: "Compliance", dotClass: "bg-raspberry" },
  { id: "tenancy", label: "Tenancy", dotClass: "bg-navy" },
  { id: "assistant", label: "Assistant", dotClass: "bg-study" },
];

export default function ModeSwitcher() {
  const { mode, switchMode } = useAppMode();
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || isDesktop) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isDesktop]);

  function selectMode(next: AppMode) {
    setOpen(false);
    switchMode(next);
  }

  const menu = (
    <div
      id={menuId}
      role="menu"
      aria-label="Application mode"
      className={
        isDesktop
          ? "absolute left-1/2 top-full z-50 mt-3 w-52 -translate-x-1/2 border border-gold/30 bg-[#FAF7F0] px-1 py-2 shadow-[0_16px_40px_rgba(26,10,12,0.22)]"
          : "relative z-50 mx-auto w-full max-w-md rounded-t-2xl border border-gold/30 bg-[#FAF7F0] px-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(26,10,12,0.25)]"
      }
    >
      {!isDesktop && (
        <div className="mb-2 flex justify-center">
          <span className="h-1 w-10 rounded-full bg-cocoa/25" aria-hidden />
        </div>
      )}
      {MODE_OPTIONS.map((option) => {
        const isActive = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="menuitem"
            onClick={() => selectMode(option.id)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-black/[0.03]"
          >
            <span
              className={`h-2 w-2 shrink-0 ${option.dotClass}`}
              aria-hidden
            />
            <span className="flex-1">
              <span className="block text-[13px] tracking-wide text-[#1A0A0C]">
                {option.label}
              </span>
              {isActive && (
                <span className="mt-1.5 block h-px w-full bg-gold" aria-hidden />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className="relative flex items-center justify-center gap-2">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Switch application mode"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 text-dusty-cream/80 transition hover:text-dusty-cream"
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
        <ChevronDown
          className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>

      {open && isDesktop && menu}

      {open && !isDesktop && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Close mode menu"
            className="absolute inset-0 bg-study/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0">{menu}</div>
        </div>
      )}
    </div>
  );
}
